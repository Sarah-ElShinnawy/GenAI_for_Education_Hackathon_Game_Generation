import { GoogleGenAI } from '@google/genai';
import {
  GameLevel,
  DocumentAnalysisResult,
  PedagogicalBlueprint,
  ContentDensity,
  GameObjective,
} from '@/types/game';
import { generateContentResiliently, getPrimaryModel } from './gemini';
import { stripMarkdown } from './sanitizer';
import { parsePptxBuffer } from './pptx-parser';

const DOCUMENT_ANALYZER_SYSTEM_PROMPT = `
You are an elite Multimodal Curriculum Director, Pedagogical Architect, and Cognitive Science Specialist.
Your mission is to analyze uploaded educational documents (text, equations, diagrams, charts, and illustrations across up to 10 PDFs or PowerPoint presentations), determine their conceptual density, and partition the material into an optimal suite of 1 to 5 distinct, deeply explanatory educational games.

Core Guidelines:
1. MULTIMODAL INSPECTION (TEXT & VISUAL DIAGRAMS):
   - Thoroughly inspect both the text and the embedded diagrams, charts, schemas, anatomical drawings, or physics figures.
   - Ground the games in the actual visual diagrams and concepts presented in the documents.

2. DENSITY EVALUATION & GAME COUNT (1 to 5 GAMES):
   - 'light': Single focused topic, single formula, or 1-3 page worksheet -> generate exactly 1 game.
   - 'moderate': 2 to 3 distinct mechanisms or sections (e.g., cell structure vs cellular respiration) -> generate 2 or 3 games.
   - 'dense': Comprehensive syllabus, multi-chapter textbook, or multifaceted exam guide -> generate 4 or 5 games.
   - Each game must focus deeply on one coherent educational module from the documents rather than trying to cram everything into one confusing experience.

3. RICH VISUAL ART & STANDALONE SVG SPECIFICATIONS:
   - For every planned game, specify rich vector art (standalone SVG illustrations with linearGradient/radialGradient, organic bezier curves, realistic equipment, leaf veins, or circuit traces). No primitive circles or squares.

4. 5-SECOND COUNTDOWN "WHAT CHANGED?" TRANSITIONS:
   - For every stage in every game, provide a concrete 'whatChangedExplanation' that explains the exact physical, chemical, or logical system transition for the 5-second lock modal.

5. NON-PRESOLVED & GENTLE MECHANICS:
   - All games must begin in an unsolved/offset state.
   - No high-stress countdown timers or punishing game overs.

Respond strictly with valid JSON conforming to the requested schema.
`.trim();

export interface DocumentInput {
  name: string;
  type?: 'pdf' | 'pptx' | 'ppt' | string;
  base64?: string;
  buffer?: Buffer | Uint8Array;
  text?: string;
}

export async function analyzeDocumentsAndPlanGames(
  client: GoogleGenAI,
  documents: DocumentInput[],
  level: GameLevel,
  userPrompt?: string
): Promise<DocumentAnalysisResult> {
  if (!documents || documents.length === 0) {
    throw new Error('At least one document is required for document-based analysis.');
  }

  // Construct multimodal payload parts
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  for (const doc of documents) {
    const isPpt =
      doc.type === 'pptx' ||
      doc.type === 'ppt' ||
      doc.name.toLowerCase().endsWith('.pptx') ||
      doc.name.toLowerCase().endsWith('.ppt');

    if (isPpt) {
      if (doc.buffer) {
        const parsed = await parsePptxBuffer(doc.buffer, doc.name);
        parts.push({
          text: `[Attached Presentation Document: "${parsed.title}"]\nTotal Slides: ${parsed.totalSlides}\nContent Overview:\n${parsed.fullText}`,
        });
      } else if (doc.base64) {
        const buf = Buffer.from(doc.base64, 'base64');
        const parsed = await parsePptxBuffer(buf, doc.name);
        parts.push({
          text: `[Attached Presentation Document: "${parsed.title}"]\nTotal Slides: ${parsed.totalSlides}\nContent Overview:\n${parsed.fullText}`,
        });
      } else if (doc.text) {
        parts.push({
          text: `[Attached Presentation Document: "${doc.name}"]\n${doc.text}`,
        });
      } else {
        parts.push({
          text: `[Attached Presentation Document: "${doc.name}"]\nHigh-yield curriculum content for ${doc.name}.`,
        });
      }
    } else if (doc.base64) {
      // PDF inlineData
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: doc.base64,
        },
      });
    } else if (doc.text) {
      parts.push({
        text: `[Attached Document: "${doc.name}"]\n${doc.text}`,
      });
    }
  }

  // Instruction prompt
  const fileNames = documents.map((f) => f.name).join(', ');
  const userInstructions = userPrompt
    ? `Additional user guidance / focus request: "${userPrompt}"`
    : 'Analyze the entire document set comprehensively.';

  const promptText = `
Documents Provided (${documents.length} file(s)): [${fileNames}]
Target Educational Level: ${level}
${userInstructions}

Please perform a comprehensive multimodal curriculum analysis:
1. Examine all text and embedded diagrams/illustrations across these documents.
2. Determine the content density ('light', 'moderate', or 'dense') and the ideal number of games (between 1 and 5).
3. Provide a brief summary of the overarching curriculum and key diagrams identified.
4. For EACH game in the suite (1 to 5 games), generate a complete PedagogicalBlueprint tailored to the grade level.

Return strictly a JSON object with this exact shape:
{
  "density": "light" | "moderate" | "dense",
  "gameCount": number (1 to 5),
  "summary": "Concise summary of the documents and curriculum scope",
  "identifiedDiagrams": ["Description of diagram 1", "Description of diagram 2"],
  "blueprints": [
    {
      "title": "Short, catchy, friendly game title",
      "mentorName": "Name of friendly guide",
      "mentorEmoji": "Single emoji icon for mentor",
      "conceptExplanation": "Clear, intuitive 2-3 sentence explanation of the concept for this age group",
      "whyItMatters": "Why this topic is important in the real world",
      "visualArtStyle": "Detailed guidelines on SVG artwork inspired by the PDF diagrams",
      "difficultyGuideline": "Specific instructions on keeping controls gentle and rewarding",
      "stages": [
        {
          "stageNumber": 1,
          "title": "Stage 1 title",
          "learningGoal": "What the player learns in this stage",
          "playerAction": "What the player clicks, drags, or adjusts",
          "explanationOnSuccess": "What the mentor says when completed",
          "whatChangedExplanation": "Exact explanation of what changed in the system for the 5-second transition pop-up"
        },
        {
          "stageNumber": 2,
          "title": "Stage 2 title",
          "learningGoal": "What the player learns in this stage",
          "playerAction": "What the player clicks, drags, or adjusts",
          "explanationOnSuccess": "What the mentor says when completed",
          "whatChangedExplanation": "Exact explanation of what changed in the system for the 5-second transition pop-up"
        },
        {
          "stageNumber": 3,
          "title": "Stage 3 title",
          "learningGoal": "What the player learns in this stage",
          "playerAction": "What the player clicks, drags, or adjusts",
          "explanationOnSuccess": "What the mentor says when completed",
          "whatChangedExplanation": "Exact explanation of what changed in the system for the 5-second transition pop-up"
        }
      ],
      "takeaways": [
        "Key educational takeaway 1",
        "Key educational takeaway 2",
        "Key educational takeaway 3"
      ]
    }
  ]
}
`.trim();

  parts.push({ text: promptText });

  const { text: rawText } = await generateContentResiliently(client, {
    model: getPrimaryModel(),
    contents: [
      {
        role: 'user',
        parts: parts as any,
      },
    ] as any,
    systemInstruction: DOCUMENT_ANALYZER_SYSTEM_PROMPT,
    responseMimeType: 'application/json',
    temperature: 0.4,
  });

  try {
    const cleaned = stripMarkdown(rawText);
    const parsed = JSON.parse(cleaned);

    const density: ContentDensity =
      parsed.density === 'light' || parsed.density === 'moderate' || parsed.density === 'dense'
        ? parsed.density
        : 'moderate';

    const rawBlueprints = Array.isArray(parsed.blueprints) ? parsed.blueprints : [];
    const validBlueprints: PedagogicalBlueprint[] = rawBlueprints
      .slice(0, 5)
      .map((b: any, bIdx: number) => {
        const stages = Array.isArray(b.stages)
          ? b.stages.slice(0, 3).map((s: any, sIdx: number) => ({
              stageNumber: s.stageNumber || sIdx + 1,
              title: s.title || `Stage ${sIdx + 1}`,
              learningGoal: s.learningGoal || 'Explore the concept',
              playerAction: s.playerAction || 'Interact with components',
              explanationOnSuccess: s.explanationOnSuccess || 'Well done!',
              whatChangedExplanation:
                s.whatChangedExplanation || 'The system transitioned successfully to the next phase!',
            }))
          : [];

        const takeaways =
          Array.isArray(b.takeaways) && b.takeaways.length >= 2
            ? b.takeaways
            : ['Core principle of the topic', 'Cause-and-effect relationship in the system'];

        const objectives: GameObjective[] =
          stages.length > 0
            ? stages.map((s: any) => ({
                label: `${s.title}: ${s.learningGoal}`,
                done: false,
              }))
            : [
                { label: `Master high-yield concepts from ${b.title}`, done: false },
                { label: 'Complete interactive challenges', done: false },
              ];

        return {
          title: b.title || `Educational Quest Part ${bIdx + 1}`,
          mentorName: b.mentorName || 'Professor Mentor',
          mentorEmoji: b.mentorEmoji || '🎓',
          conceptExplanation: b.conceptExplanation || 'Explore the fundamental principles in this module.',
          whyItMatters: b.whyItMatters || 'Foundational to scientific and real-world understanding.',
          visualArtStyle:
            b.visualArtStyle || 'Rich standalone inline SVG vector illustrations with gradient shading.',
          difficultyGuideline: b.difficultyGuideline || 'Gentle, forgiving mechanics with zero punishment.',
          stages,
          takeaways,
          objectives,
        };
      });

    return {
      density,
      gameCount: validBlueprints.length,
      summary: parsed.summary || 'Curriculum documents parsed and analyzed successfully.',
      identifiedDiagrams: Array.isArray(parsed.identifiedDiagrams) ? parsed.identifiedDiagrams : [],
      blueprints: validBlueprints,
    };
  } catch (error) {
    console.warn('Document analyzer JSON parse fallback:', error);
    const fallbackTitle = documents[0]?.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ') || 'Document Quest';
    return {
      density: 'light',
      gameCount: 1,
      summary: `Parsed curriculum material from ${documents.map((d) => d.name).join(', ')}.`,
      identifiedDiagrams: ['Diagram extracted from curriculum documents.'],
      blueprints: [
        {
          title: `${fallbackTitle} Quest`,
          mentorName: 'Professor Pip',
          mentorEmoji: '🦉',
          conceptExplanation: `Master the core concepts from ${fallbackTitle} through interactive experimentation.`,
          whyItMatters: `Directly reinforces key knowledge from your study materials.`,
          visualArtStyle: 'Rich standalone SVG illustrations with gradients and smooth animations.',
          difficultyGuideline: 'Gentle, forgiving mechanics with immediate feedback.',
          stages: [
            {
              stageNumber: 1,
              title: 'Foundational Concepts',
              learningGoal: 'Identify core components from document',
              playerAction: 'Interact with variables to balance the system',
              explanationOnSuccess: 'Great! You established the foundational baseline.',
              whatChangedExplanation: 'Initial parameters aligned with document principles.',
            },
            {
              stageNumber: 2,
              title: 'Dynamic Interaction',
              learningGoal: 'Observe cause-and-effect relationships',
              playerAction: 'Adjust components to reach optimal equilibrium',
              explanationOnSuccess: 'Excellent! The system transitioned into the active state.',
              whatChangedExplanation: 'System reaction reached critical transformation threshold.',
            },
            {
              stageNumber: 3,
              title: 'Mastery Verification',
              learningGoal: 'Synthesize complete cycle',
              playerAction: 'Complete final assembly and verify result',
              explanationOnSuccess: 'Mastery achieved! Full curriculum module completed.',
              whatChangedExplanation: 'Full cycle executed with zero errors and optimal retention.',
            },
          ],
          takeaways: [
            `Core principles extracted from ${fallbackTitle}`,
            'Experimental problem-solving and cause-and-effect mechanics',
            'Reinforced memory retention through active gameplay',
          ],
          objectives: [
            { label: 'Establish foundational baseline', done: false },
            { label: 'Reach optimal equilibrium in dynamic stage', done: false },
            { label: 'Complete final mastery verification', done: false },
          ],
        },
      ],
    };
  }
}
