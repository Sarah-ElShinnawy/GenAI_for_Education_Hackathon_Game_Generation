import * as vm from 'vm';
import { stripMarkdown } from './sanitizer';

export interface VerificationReport {
  passed: boolean;
  errors: string[];
  warnings: string[];
  testedFunctions: string[];
  sanitizedHtml: string;
}

/**
 * Headless Automated QA & Code Verifier Agent.
 * Thoroughly verifies the generated HTML5 game code:
 * 1. Structural HTML integrity
 * 2. JavaScript Syntax Compilation via Node V8 VM
 * 3. DOM Element ID & Binding Integrity (all getElementById targets exist)
 * 4. Simulated Runtime Dry-Run in a headless DOM context
 * 5. Zero-External-Dependencies enforcement
 */
export function verifyGameCode(rawHtml: string): VerificationReport {
  const sanitizedHtml = stripMarkdown(rawHtml);
  const errors: string[] = [];
  const warnings: string[] = [];
  const testedFunctions: string[] = [];

  // 1. Structural HTML Checks
  if (!sanitizedHtml || sanitizedHtml.length < 100) {
    errors.push('Game HTML is empty or excessively truncated.');
    return { passed: false, errors, warnings, testedFunctions, sanitizedHtml };
  }

  if (!/^<!DOCTYPE\s+html/i.test(sanitizedHtml) && !/^<html[\s>]/i.test(sanitizedHtml)) {
    errors.push('HTML must begin with <!DOCTYPE html> or <html>.');
  }

  if (!/<\/html>/i.test(sanitizedHtml)) {
    errors.push('HTML is missing closing </html> tag.');
  }

  if (!/<body[\s>]/i.test(sanitizedHtml) || !/<\/body>/i.test(sanitizedHtml)) {
    errors.push('HTML is missing <body> or </body> tags.');
  }

  // 2. Zero External Assets Check
  const remoteMatches = [
    ...sanitizedHtml.matchAll(/<(?:script|link|img|audio|video|source|iframe)[^>]*(?:src|href)=["'](?:https?:)?\/\/[^"']+["']/gi),
  ];
  if (remoteMatches.length > 0) {
    for (const match of remoteMatches) {
      errors.push(`Disallowed remote external asset detected: ${match[0]}`);
    }
  }

  // 3. Extract and Verify Script Tags
  const scriptMatches = [...sanitizedHtml.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
  if (scriptMatches.length === 0) {
    errors.push('No <script>...</script> block found in game HTML.');
    return { passed: errors.length === 0, errors, warnings, testedFunctions, sanitizedHtml };
  }

  const combinedScript = scriptMatches.map((m) => m[1]).join('\n;\n');
  if (combinedScript.trim().length < 30) {
    errors.push('Game JavaScript script block is empty or missing executable logic.');
    return { passed: errors.length === 0, errors, warnings, testedFunctions, sanitizedHtml };
  }

  // 4. V8 JavaScript Syntax Compilation Test
  let compiledScript: vm.Script | null = null;
  try {
    compiledScript = new vm.Script(combinedScript, { filename: 'game_script.js' });
    testedFunctions.push('V8 JavaScript Syntax Compilation');
  } catch (syntaxErr: unknown) {
    const msg = syntaxErr instanceof Error ? syntaxErr.message : String(syntaxErr);
    errors.push(`JavaScript Syntax Error: ${msg}`);
  }

  // 5. DOM Element ID Integrity Check
  // Scans all document.getElementById('...') calls in JS and ensures that id exists in HTML
  const getElementByIdMatches = [
    ...combinedScript.matchAll(/document\.getElementById\(\s*['"`]([a-zA-Z0-9_-]+)['"`]\s*\)/g),
  ];
  const missingIds = new Set<string>();

  for (const match of getElementByIdMatches) {
    const id = match[1];
    const idPattern = new RegExp(`id=["']${id}["']`, 'i');
    if (!idPattern.test(sanitizedHtml)) {
      missingIds.add(id);
    }
  }

  if (missingIds.size > 0) {
    errors.push(
      `DOM Element ID mismatch: The JavaScript code tries to access elements with IDs [${Array.from(missingIds).join(', ')}] but these IDs do not exist in the HTML body!`
    );
  } else if (getElementByIdMatches.length > 0) {
    testedFunctions.push(`DOM ID Integrity Verified (${getElementByIdMatches.length} element bindings valid)`);
  }

  // 6. Interactive Start & Restart Button Integrity
  const hasStartButton =
    /id=["'](?:start[-_]?btn|startBtn|btn[-_]?start)["']/i.test(sanitizedHtml) ||
    /class=["'][^"']*start-btn[^"']*["']/i.test(sanitizedHtml) ||
    /<button[^>]*>[\s\S]*?(?:start|play)[\s\S]*?<\/button>/i.test(sanitizedHtml);

  if (!hasStartButton) {
    warnings.push('Could not find an obvious "Start Game" button or overlay.');
  }

  const hasRestartButton =
    /id=["'](?:restart[-_]?btn|restartBtn|resetBtn)["']/i.test(sanitizedHtml) ||
    /<button[^>]*>[\s\S]*?(?:restart|reset)[\s\S]*?<\/button>/i.test(sanitizedHtml);

  if (!hasRestartButton) {
    warnings.push('Could not find a distinct "Restart" button in the HUD.');
  }

  // 7. Educational "What Changed?" Transition Modal Check
  const hasWhatChangedModal =
    /what[-_]?changed/i.test(sanitizedHtml) ||
    /transition[-_]?modal/i.test(sanitizedHtml) ||
    /explanation[-_]?modal/i.test(sanitizedHtml);

  if (hasWhatChangedModal) {
    testedFunctions.push('Educational "What Changed?" Transition Modal Verified');
  } else {
    warnings.push('Could not find a dedicated "What Changed?" transition modal in the HTML structure.');
  }

  // 8. Standalone SVG Illustrations Enforcement
  const svgMatches = sanitizedHtml.match(/<svg[\s>]/gi) || [];
  if (svgMatches.length === 0) {
    errors.push(
      'Game must contain rich standalone <svg> vector illustrations for characters, items, and environment (found 0 <svg> tags). Bare canvas primitive circles/arcs are strictly forbidden!'
    );
  } else {
    testedFunctions.push(`Rich Standalone SVG Assets Verified (${svgMatches.length} <svg> illustrations present)`);
  }

  // 7. Headless Runtime Dry-Run Simulation (Mocking browser environment to test execution)
  if (compiledScript) {
    try {
      const mockElements: Record<string, unknown> = {};

      const createMockElement = (tag: string, id: string = '') => ({
        id,
        tagName: tag.toUpperCase(),
        style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        addEventListener: () => {},
        removeEventListener: () => {},
        setAttribute: () => {},
        getAttribute: () => '',
        appendChild: () => {},
        removeChild: () => {},
        innerHTML: '',
        innerText: '',
        textContent: '',
        value: '50',
        getContext: () => ({
          clearRect: () => {},
          fillRect: () => {},
          strokeRect: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          stroke: () => {},
          fill: () => {},
          arc: () => {},
          fillText: () => {},
          measureText: () => ({ width: 50 }),
          save: () => {},
          restore: () => {},
          translate: () => {},
          rotate: () => {},
          scale: () => {},
        }),
        getBoundingClientRect: () => ({ width: 800, height: 480, top: 0, left: 0 }),
      });

      const mockDocument = {
        getElementById: (id: string) => {
          if (!mockElements[id]) mockElements[id] = createMockElement('div', id);
          return mockElements[id];
        },
        querySelector: () => createMockElement('div'),
        querySelectorAll: () => [],
        createElement: (tag: string) => createMockElement(tag),
        addEventListener: (event: string, cb: () => void) => {
          if (event === 'DOMContentLoaded') setTimeout(cb, 0);
        },
        body: createMockElement('body'),
        head: createMockElement('head'),
      };

      class MockAudioContext {
        state = 'running';
        currentTime = 0;
        destination = {};
        createOscillator() {
          return {
            type: 'sine',
            frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
            connect: () => {},
            start: () => {},
            stop: () => {},
          };
        }
        createGain() {
          return {
            gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
            connect: () => {},
          };
        }
        resume() {
          return Promise.resolve();
        }
      }

      const mockWindow = {
        AudioContext: MockAudioContext,
        webkitAudioContext: MockAudioContext,
        addEventListener: () => {},
        removeEventListener: () => {},
        requestAnimationFrame: () => 1,
        cancelAnimationFrame: () => {},
        setInterval: () => 1,
        clearInterval: () => {},
        setTimeout: () => 1,
        clearTimeout: () => {},
        innerWidth: 1024,
        innerHeight: 768,
        devicePixelRatio: 1,
      };

      const sandbox = {
        window: mockWindow,
        document: mockDocument,
        AudioContext: MockAudioContext,
        webkitAudioContext: MockAudioContext,
        console: { log: () => {}, warn: () => {}, error: () => {} },
        requestAnimationFrame: mockWindow.requestAnimationFrame,
        setInterval: mockWindow.setInterval,
        clearInterval: mockWindow.clearInterval,
        setTimeout: mockWindow.setTimeout,
        clearTimeout: mockWindow.clearTimeout,
        Math,
        Date,
        Array,
        Object,
        String,
        Number,
        Boolean,
        RegExp,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
      };

      const context = vm.createContext(sandbox);
      // Run the script with a 1000ms timeout
      compiledScript.runInContext(context, { timeout: 1000 });
      testedFunctions.push('Headless DOM Simulation Runtime (Zero uncaught startup exceptions)');
    } catch (runtimeErr: unknown) {
      const msg = runtimeErr instanceof Error ? runtimeErr.message : String(runtimeErr);
      errors.push(`Headless Runtime Simulation Error: ${msg}`);
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    testedFunctions,
    sanitizedHtml,
  };
}
