import { NextRequest, NextResponse } from 'next/server';
import {
  GameLevel,
  GAME_LEVELS,
  GenerateGameSuccessResponse,
  GenerateGameSuiteResponse,
  GameObjective,
} from '@/types/game';
import {
  getGeminiClient,
  getPrimaryModel,
  generateContentResiliently,
} from '@/lib/gemini';
import { analyzeDocumentsAndPlanGames, DocumentInput } from '@/lib/document-analyzer';
import {
  MASTER_SYSTEM_PROMPT,
  buildStage2CodePrompt,
  GAME_RESPONSE_SCHEMA,
} from '@/lib/prompts';
import { parseGameOutput } from '@/lib/sanitizer';
import { verifyGameCode } from '@/lib/verifier';
import { repairGameHtml } from '@/lib/repair';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_DOC_COUNT = 10;
const MAX_TOTAL_SIZE_BYTES = 40 * 1024 * 1024; // 40MB total

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

const SAMPLE_DOCUMENTS: Record<string, string> = {
  'Cell_Biology_Lecture_4.pptx': `
Cell Biology & Mitosis (Lecture 4)
Slide 1: Introduction to Cell Theory & Organelles
- All living organisms are composed of one or more basic units called cells.
- Key organelles: Nucleus (DNA control center), Mitochondria (ATP production via aerobic respiration), Ribosomes (protein translation).
- Phospholipid bilayer controls selective permeability and chemical signaling.

Slide 2: The Phases of Mitosis: Prophase to Telophase
- Prophase: Chromatin condenses into visible chromosomes; mitotic spindle fibers assemble from centrosomes.
- Metaphase: Sister chromatids align along the metaphase equatorial plate.
- Anaphase: Centromeres cleave, and sister chromatids separate toward opposite poles.
- Telophase & Cytokinesis: Nuclear envelope re-forms; cell furrow pinches to yield two identical diploid cells.

Slide 3: Mitosis vs Meiosis: Diploid vs Haploid
- Mitosis produces 2 genetically identical diploid (2n) daughter cells for tissue repair and growth.
- Meiosis involves two sequential rounds of division resulting in 4 genetically distinct haploid (n) gametes.
- Homologous recombination (crossing over) in Prophase I introduces vital genetic diversity.
`.trim(),

  'World_History_Syllabus.pdf': `
World History — Revolutions & Global Systems
Section 1: The Enlightenment & Philosophical Precedents
- John Locke: Inalienable rights of life, liberty, and property; governance through consent.
- Montesquieu: Institutional separation of powers (executive, legislative, judiciary).
- Voltaire & Rousseau: Defense of civil liberties, freedom of conscience, and the General Will.

Section 2: The Atlantic Revolutions (1775–1825)
- American Revolution (1775): Constitutional republicanism and rejection of colonial subjugation.
- French Revolution (1789): Collapse of the Ancien Regime; Declaration of the Rights of Man.
- Haitian Revolution (1791): Toussaint Louverture leads the first successful enslaved uprising.

Section 3: Industrial Revolution & Socio-Economic Shift
- Steam power, mechanical spinning jennies, and rapid urban demographic shifts.
- Development of modern market economies alongside the birth of early labor movements.
`.trim(),
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateGameSuiteResponse>> {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Expected multipart/form-data containing curriculum documents.',
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Extract files (support 'files', 'file', or 'document')
    let fileEntries = (formData.getAll('files') as File[]).concat(
      formData.getAll('file') as File[],
      formData.getAll('document') as File[]
    );
    // Filter out strings or empty entries
    fileEntries = fileEntries.filter((f) => typeof f !== 'string' && f.name && f.size > 0);

    const levelRaw = (formData.get('level') as string) || 'high_school';
    const userPrompt = (formData.get('prompt') as string) || '';
    const sampleDocName = (formData.get('sampleDocumentName') as string) || (formData.get('name') as string) || '';

    // Normalize level
    const level: GameLevel =
      levelRaw === 'elementary'
        ? 'elementary'
        : levelRaw === 'university'
        ? 'university'
        : 'high_school';

    const validDocuments: DocumentInput[] = [];
    let totalBytes = 0;

    if (fileEntries.length > 0) {
      if (fileEntries.length > MAX_DOC_COUNT) {
        return NextResponse.json(
          {
            status: 'error',
            message: `Too many documents uploaded. You can upload a maximum of ${MAX_DOC_COUNT} documents at a time.`,
          },
          { status: 400, headers: CORS_HEADERS }
        );
      }

      for (const file of fileEntries) {
        const lowerName = file.name.toLowerCase();
        const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
        const isPptx =
          lowerName.endsWith('.pptx') ||
          lowerName.endsWith('.ppt') ||
          file.type.includes('presentation') ||
          file.type.includes('powerpoint');

        if (!isPdf && !isPptx) {
          return NextResponse.json(
            {
              status: 'error',
              message: `File "${file.name}" is not supported. Please upload PDF or PowerPoint (.ppt, .pptx) files.`,
            },
            { status: 400, headers: CORS_HEADERS }
          );
        }

        totalBytes += file.size;
        if (totalBytes > MAX_TOTAL_SIZE_BYTES) {
          return NextResponse.json(
            {
              status: 'error',
              message: `Total size of uploaded documents exceeds 40MB limit. Please upload smaller or fewer files.`,
            },
            { status: 400, headers: CORS_HEADERS }
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        validDocuments.push({
          name: file.name,
          type: isPptx ? 'pptx' : 'pdf',
          buffer,
          base64: buffer.toString('base64'),
        });
      }
    } else if (sampleDocName) {
      // Use sample document content if requested
      const sampleContent = SAMPLE_DOCUMENTS[sampleDocName] || SAMPLE_DOCUMENTS['Cell_Biology_Lecture_4.pptx'];
      validDocuments.push({
        name: sampleDocName,
        type: sampleDocName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'pptx',
        text: sampleContent,
      });
    }

    if (validDocuments.length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Please provide at least 1 PDF or PowerPoint presentation to analyze (up to 10 allowed).',
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // 1. Initialize Clients
    const plannerClient = getGeminiClient('planner');
    const coderClient = getGeminiClient('coder');
    const primaryModel = getPrimaryModel();

    // 2. Stage 1: Document & Curriculum Analyzer Agent
    const analysis = await analyzeDocumentsAndPlanGames(
      plannerClient,
      validDocuments,
      level,
      userPrompt
    );

    const generatedGames: GenerateGameSuccessResponse[] = [];

    // 3. Synthesize games for each blueprint
    for (let i = 0; i < analysis.blueprints.length; i++) {
      const blueprint = analysis.blueprints[i];
      console.log(`Synthesizing game ${i + 1}/${analysis.blueprints.length}: "${blueprint.title}"...`);

      const codePrompt = buildStage2CodePrompt(blueprint, level);

      let rawAiText = '';
      try {
        const result = await generateContentResiliently(coderClient, {
          model: primaryModel,
          contents: codePrompt,
          systemInstruction: MASTER_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: GAME_RESPONSE_SCHEMA,
          temperature: 0.7,
        });
        rawAiText = result.text;
      } catch (genErr) {
        console.error(`AI Coder failed on blueprint "${blueprint.title}":`, genErr);
        continue;
      }

      if (!rawAiText) continue;

      const structuredOutput = parseGameOutput(rawAiText, blueprint.title);

      // QA Verification
      let qaReport = verifyGameCode(structuredOutput.html);
      let finalHtml = qaReport.sanitizedHtml;

      // Self-Healing Repair Loop if needed
      if (!qaReport.passed) {
        const errorSummary = qaReport.errors.join('; ');
        console.warn(`QA issue on "${blueprint.title}": ${errorSummary}. Invoking repair...`);
        const repairResult = await repairGameHtml(coderClient, structuredOutput.html, errorSummary);
        if (repairResult.success) {
          finalHtml = repairResult.html;
        }
      }

      // Format takeaways
      let finalTakeaways = structuredOutput.takeaways.filter(
        (item) => typeof item === 'string' && item.trim().length > 0
      );
      if (finalTakeaways.length < 2 && blueprint.takeaways.length >= 2) {
        finalTakeaways = [...blueprint.takeaways];
      }
      if (finalTakeaways.length < 2) {
        finalTakeaways = [`Core principles of ${blueprint.title}`, 'Experimental cause-and-effect relationship'];
      }

      const objectives: GameObjective[] =
        blueprint.objectives && blueprint.objectives.length > 0
          ? blueprint.objectives
          : blueprint.stages.map((s) => ({
              label: `${s.title}: ${s.learningGoal}`,
              done: false,
            }));

      generatedGames.push({
        status: 'success',
        title: structuredOutput.title || blueprint.title,
        html: finalHtml,
        takeaways: finalTakeaways.slice(0, 4),
        objectives,
      });
    }

    if (generatedGames.length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'The AI engine was unable to synthesize working games from the provided documents. Please try again with clearer curriculum materials.',
        },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        status: 'success',
        mode: 'suite',
        density: analysis.density,
        summary: analysis.summary,
        games: generatedGames,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('Unhandled error in /api/generate-from-docs:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: `Document processing failed: ${errMessage}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
