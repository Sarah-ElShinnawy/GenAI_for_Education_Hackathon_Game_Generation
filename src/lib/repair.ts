import { GoogleGenAI } from '@google/genai';
import { stripMarkdown } from './sanitizer';
import { verifyGameCode, VerificationReport } from './verifier';
import { getPrimaryModel, generateContentResiliently } from './gemini';

export interface RepairResult {
  success: boolean;
  html: string;
  error?: string;
  attempts: number;
  report?: VerificationReport;
}

/**
 * Secondary self-healing QA repair loop.
 * Automatically triggered when generated HTML fails structural, syntax, or headless DOM validation.
 * Feeds the broken code and precise QA diagnostic errors back to Gemini.
 */
export async function repairGameHtml(
  client: GoogleGenAI,
  brokenCode: string,
  errorDescription: string,
  modelName: string = getPrimaryModel(),
  maxAttempts: number = 2
): Promise<RepairResult> {
  let currentCode = brokenCode;
  let currentErrors = errorDescription;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const repairPrompt = `
You are an expert web developer and automated QA repair engineer.
Fix the syntax, DOM bindings, and structural errors in this HTML5 game and return only the working single-file HTML code without markdown formatting.

QA Diagnostic Errors Found:
${currentErrors}

Invalid Game Code:
${currentCode}

Critical Requirements:
1. Ensure the code begins with <!DOCTYPE html> and ends with </html>.
2. Fix all JavaScript syntax errors. Ensure ALL object keys are valid strings (e.g. use '1_succ' or stage1_succ, never unquoted identifiers starting with a number!).
3. Ensure every document.getElementById('...') in JavaScript has a matching element in the HTML with that exact ID.
4. Ensure all buttons have working handlers: ensure <button id="start-btn" onclick="startGame()"> exists in HTML and function startGame() is defined globally at the top of the script so it can be called safely without ReferenceError.
5. Ensure no external URLs or CDN links are used.
6. Ensure the game renders rich standalone <svg> vector illustrations with <linearGradient> and paths for characters, items, and environment (never bare canvas primitive circles or squares).
7. Output ONLY the raw executable HTML code without markdown code blocks, backticks, or explanatory chat.
`.trim();

    try {
      const { text: rawResponseText } = await generateContentResiliently(client, {
        model: modelName,
        contents: repairPrompt,
        systemInstruction:
          'Fix the syntax and structural errors in this HTML5 game and return only the working single-file HTML code without markdown formatting.',
        temperature: 0.2,
      });

      const cleanedHtml = stripMarkdown(rawResponseText);
      const verification = verifyGameCode(cleanedHtml);

      if (verification.passed) {
        return {
          success: true,
          html: verification.sanitizedHtml,
          attempts: attempt,
          report: verification,
        };
      }

      currentCode = cleanedHtml;
      currentErrors = verification.errors.join('\n');
      console.warn(`Repair attempt ${attempt} failed validation: ${currentErrors}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        html: brokenCode,
        error: `Repair loop API call failed on attempt ${attempt}: ${message}`,
        attempts: attempt,
      };
    }
  }

  return {
    success: false,
    html: currentCode,
    error: `Self-healing repair exhausted ${maxAttempts} attempts without resolving all errors: ${currentErrors}`,
    attempts: maxAttempts,
  };
}
