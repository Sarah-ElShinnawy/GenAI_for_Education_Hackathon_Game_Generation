import { RawAiGameOutput } from '@/types/game';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedHtml: string;
}

/**
 * Strips leading/trailing markdown fences, language specifiers, and conversational chatter.
 */
export function stripMarkdown(raw: string): string {
  if (!raw) return '';

  let cleaned = raw.trim();

  // Remove markdown code fences like ```html ... ``` or ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:html|htm|javascript|js|json|xml)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?```\s*$/i, '');
  cleaned = cleaned.trim();

  // If the model included conversational commentary before <!DOCTYPE html> or <html>, extract the HTML portion
  const htmlStartMatch = cleaned.match(/<!DOCTYPE\s+html/i) || cleaned.match(/<html/i);
  if (htmlStartMatch && htmlStartMatch.index !== undefined && htmlStartMatch.index > 0) {
    // Only slice if not JSON
    if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
      cleaned = cleaned.slice(htmlStartMatch.index);
    }
  }

  // If there is conversational text trailing after </html>, truncate to the closing </html>
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    const htmlEndMatch = cleaned.match(/<\/html>/i);
    if (htmlEndMatch && htmlEndMatch.index !== undefined) {
      cleaned = cleaned.slice(0, htmlEndMatch.index + '</html>'.length);
    }
  }

  return cleaned.trim();
}

/**
 * Robustly parses AI response into structured game data.
 * Gracefully handles:
 * 1. Strict structured JSON schema
 * 2. Markdown-wrapped JSON
 * 3. Direct raw HTML generation (extracting title from <title> tag)
 * 4. Partially broken JSON with embedded multiline HTML strings
 */
export function parseGameOutput(rawText: string, fallbackTopic: string = 'Educational Concept'): RawAiGameOutput {
  const cleaned = stripMarkdown(rawText);

  // Strategy 1: Attempt standard JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') {
      const title =
        typeof parsed.title === 'string' && parsed.title.trim().length > 0
          ? parsed.title.trim()
          : `${fallbackTopic} Interactive Lab`;

      let takeaways: string[] = [];
      if (Array.isArray(parsed.takeaways)) {
        takeaways = parsed.takeaways
          .map((item: unknown) => (typeof item === 'string' ? item.trim() : ''))
          .filter(Boolean);
      }
      if (takeaways.length < 2) {
        takeaways = [
          `Core mechanics and principles of ${fallbackTopic}`,
          'Interactive parameter exploration and feedback loop',
        ];
      }

      const html = typeof parsed.html === 'string' ? parsed.html : '';
      if (html.length > 0) {
        return { title, takeaways, html };
      }
    }
  } catch {
    // Fall through to regex or raw HTML parsing
  }

  // Strategy 2: Direct raw HTML output from model
  if (
    cleaned.startsWith('<!DOCTYPE') ||
    cleaned.startsWith('<html') ||
    (cleaned.includes('<html') && cleaned.includes('</html>'))
  ) {
    const titleMatch = cleaned.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch && titleMatch[1].trim()
      ? titleMatch[1].trim()
      : `${fallbackTopic} Interactive Lab`;

    return {
      title,
      takeaways: [
        `Exploration of foundational dynamics in ${fallbackTopic}`,
        'Experimental inquiry through real-time feedback',
      ],
      html: cleaned,
    };
  }

  // Strategy 3: Regex extraction for malformed/unescaped JSON fields
  const titleMatch = rawText.match(/"title"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
  const takeawaysMatch = rawText.match(/"takeaways"\s*:\s*\[([\s\S]*?)\]/i);
  const htmlMatch = rawText.match(/"html"\s*:\s*"([\s\S]*?)"\s*(?:,\s*"|\})/i);

  let extractedTitle = titleMatch ? titleMatch[1].replace(/\\"/g, '"') : `${fallbackTopic} Simulation`;
  let extractedTakeaways: string[] = [];

  if (takeawaysMatch && takeawaysMatch[1]) {
    const items = [...takeawaysMatch[1].matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g)];
    extractedTakeaways = items.map((m) => m[1].replace(/\\"/g, '"').trim()).filter(Boolean);
  }
  if (extractedTakeaways.length < 2) {
    extractedTakeaways = [
      `Hands-on principles of ${fallbackTopic}`,
      'Real-time simulation feedback and learning checkpoints',
    ];
  }

  let extractedHtml = '';
  if (htmlMatch && htmlMatch[1]) {
    extractedHtml = htmlMatch[1]
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t');
  } else {
    // If html wasn't matched in quotes, check if raw HTML is embedded anywhere in rawText
    const embeddedHtml = rawText.match(/<!DOCTYPE\s+html[\s\S]*?<\/html>/i) ||
      rawText.match(/<html[\s\S]*?<\/html>/i);
    if (embeddedHtml) {
      extractedHtml = embeddedHtml[0];
    }
  }

  if (extractedHtml.length > 50) {
    return {
      title: extractedTitle,
      takeaways: extractedTakeaways,
      html: extractedHtml,
    };
  }

  throw new Error('Unable to extract playable HTML game from AI generation output.');
}

/**
 * Validates the structural integrity and security constraints of the generated single-file game HTML.
 */
export function validateGameHtml(rawHtml: string): ValidationResult {
  const sanitizedHtml = stripMarkdown(rawHtml);

  if (!sanitizedHtml || sanitizedHtml.length < 50) {
    return {
      isValid: false,
      error: 'Generated HTML is empty or excessively truncated.',
      sanitizedHtml,
    };
  }

  // 1. Must begin with <!DOCTYPE html> or <html> (allowing for optional leading whitespace/BOM)
  const beginsWithHtml =
    /^<!DOCTYPE\s+html/i.test(sanitizedHtml) || /^<html[\s>]/i.test(sanitizedHtml);

  if (!beginsWithHtml) {
    return {
      isValid: false,
      error: 'HTML must begin with <!DOCTYPE html> or <html>.',
      sanitizedHtml,
    };
  }

  // 2. Must contain closing </html>
  if (!/<\/html>/i.test(sanitizedHtml)) {
    return {
      isValid: false,
      error: 'HTML is missing closing </html> tag.',
      sanitizedHtml,
    };
  }

  // 3. Must contain <head> and <body> structure
  if (!/<body[\s>]/i.test(sanitizedHtml) || !/<\/body>/i.test(sanitizedHtml)) {
    return {
      isValid: false,
      error: 'HTML is missing <body> or </body> tags.',
      sanitizedHtml,
    };
  }

  // 4. Zero external dependencies check: Ensure no external src or remote stylesheets/scripts/images
  const remoteDepMatch = sanitizedHtml.match(
    /<(?:script|link|img|audio|video|source|iframe)[^>]*(?:src|href)=["'](?:https?:)?\/\/[^"']+["']/i
  );
  if (remoteDepMatch) {
    return {
      isValid: false,
      error: `Violation of zero-external-dependencies rule: detected remote asset reference "${remoteDepMatch[0]}".`,
      sanitizedHtml,
    };
  }

  // 5. Must contain a valid <script> block with executable game logic
  const allScriptMatches = [...sanitizedHtml.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
  if (allScriptMatches.length === 0) {
    return {
      isValid: false,
      error: 'HTML is missing a <script> tag or corresponding </script> closing tag.',
      sanitizedHtml,
    };
  }

  const hasExecutableLogic = allScriptMatches.some((match) => match[1].trim().length >= 20);
  if (!hasExecutableLogic) {
    return {
      isValid: false,
      error: 'Game script block is empty or missing executable logic.',
      sanitizedHtml,
    };
  }

  return {
    isValid: true,
    sanitizedHtml,
  };
}
