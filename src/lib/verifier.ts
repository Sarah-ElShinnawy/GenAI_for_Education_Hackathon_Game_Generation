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
 * 4. onclick Handler Function Existence (broken silent buttons caught here)
 * 5. addEventListener Target ID cross-referencing
 * 6. "How to Play" button & handler verification
 * 7. "What Changed?" modal check
 * 8. Zero-External-Dependencies enforcement
 * 9. Simulated Runtime Dry-Run in a headless DOM context
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

  if (!/^<!DOCTYPE\s+html/i.test(sanitizedHtml) && /^<html[\s>]/i.test(sanitizedHtml) === false) {
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
    ...sanitizedHtml.matchAll(/<(?:script|link|img|audio|video|source|iframe)[^>]*(?:src|href)=['"](?:https?:)?\/\/[^'"]+['"]/gi),
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
    ...combinedScript.matchAll(/document\.getElementById\(\s*['"` ]([a-zA-Z0-9_-]+)['"` ]\s*\)/g),
  ];
  const missingIds = new Set<string>();

  for (const match of getElementByIdMatches) {
    const id = match[1];
    const idPattern = new RegExp(`id=['"]${id}['"]`, 'i');
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

  // 6. onclick Handler Function Existence Check
  // Every onclick="fnName()" in HTML must have a matching function definition in JS
  const onclickMatches = [...sanitizedHtml.matchAll(/\bonclick=['"]([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g)];
  const missingOnclickFns: string[] = [];
  for (const match of onclickMatches) {
    const fnName = match[1];
    const fnDefinedPattern = new RegExp(
      `(?:function\\s+${fnName}\\s*\\(|(?:const|let|var)\\s+${fnName}\\s*=\\s*(?:function|\\())`
    );
    if (!fnDefinedPattern.test(combinedScript)) {
      missingOnclickFns.push(fnName);
    }
  }
  if (missingOnclickFns.length > 0) {
    errors.push(
      `Broken onclick handlers: HTML calls [${missingOnclickFns.join(', ')}]() but these functions are NOT defined in the JavaScript. This causes silent button failures!`
    );
  } else if (onclickMatches.length > 0) {
    testedFunctions.push(`onclick Handler Functions Verified (${onclickMatches.length} bindings all defined)`);
  }

  // 7. addEventListener Target ID Cross-check
  // Finds getElementById('id').addEventListener(...) patterns and confirms the id exists in HTML
  const addEventTargets = [
    ...combinedScript.matchAll(
      /document\.getElementById\(\s*['"` ]([a-zA-Z0-9_-]+)['"` ]\s*\)\s*(?:\?)?\s*\.addEventListener/g
    ),
  ];
  const missingEventTargets: string[] = [];
  for (const match of addEventTargets) {
    const id = match[1];
    const idPattern = new RegExp(`id=['"]${id}['"]`, 'i');
    if (!idPattern.test(sanitizedHtml)) {
      missingEventTargets.push(id);
    }
  }
  if (missingEventTargets.length > 0) {
    errors.push(
      `Broken addEventListener targets: JS tries to bind events to missing element IDs [${missingEventTargets.join(', ')}]. These event listeners will silently never fire!`
    );
  } else if (addEventTargets.length > 0) {
    testedFunctions.push(`addEventListener Target IDs Verified (${addEventTargets.length} bindings valid)`);
  }

  // 8. Interactive Button Integrity — Start, Restart, How to Play
  const hasStartButton =
    /id=['"](?:start[-_]?btn|startBtn|btn[-_]?start)['"]/i.test(sanitizedHtml) ||
    /class=['"][^'"]*start-btn[^'"]*['"]/i.test(sanitizedHtml) ||
    /<button[^>]*>[\s\S]*?(?:start|play)[\s\S]*?<\/button>/i.test(sanitizedHtml);

  if (!hasStartButton) {
    errors.push(
      'Missing "Start Game" / "Start Playing" button. The game MUST have a visible start overlay button.'
    );
  }

  const hasRestartButton =
    /id=['"](?:restart[-_]?btn|restartBtn|resetBtn)['"]/i.test(sanitizedHtml) ||
    /<button[^>]*>[\s\S]*?(?:restart|reset)[\s\S]*?<\/button>/i.test(sanitizedHtml);

  if (!hasRestartButton) {
    warnings.push('Could not find a distinct "Restart" button in the HUD.');
  }

  // 8b. "How to Play" button must exist AND have a handler wired to it
  const hasHowToPlayText = /how[\s-_]?to[\s-_]?play/i.test(sanitizedHtml);
  if (!hasHowToPlayText) {
    errors.push(
      'Missing "How to Play" button. Every game must include a "How to Play" button that opens an instructions modal.'
    );
  } else {
    // Check that a button element contains "How to Play" text
    const htpInButton = /<button[^>]*>[\s\S]{0,200}?how[\s-_]?to[\s-_]?play[\s\S]{0,200}?<\/button>/i.test(sanitizedHtml);
    if (!htpInButton) {
      warnings.push(
        '"How to Play" text found but not inside a <button> element. Ensure it is a clickable button, not just a label.'
      );
    }

    // Check that the handler function is defined — look for onclick or getElementById binding
    const htpOnclickMatch = sanitizedHtml.match(
      /how[\s-_]?to[\s-_]?play[\s\S]{0,300}?onclick=['"]([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/i
    ) || sanitizedHtml.match(
      /onclick=['"]([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([\s\S]{0,300}?how[\s-_]?to[\s-_]?play/i
    );

    const htpJsBinding = /(?:how[\s-_]?to[\s-_]?play|showInstructions|showHowToPlay|openHelp|toggleHelp)/i.test(combinedScript);

    if (!htpOnclickMatch && !htpJsBinding) {
      errors.push(
        '"How to Play" button has no wired JavaScript handler. Add onclick="showInstructions()" to the button AND define function showInstructions() in the script.'
      );
    } else {
      testedFunctions.push('"How to Play" button and handler verified');
    }
  }

  // 9. Educational "What Changed?" Transition Modal Check
  const hasWhatChangedModal =
    /what[-_]?changed/i.test(sanitizedHtml) ||
    /transition[-_]?modal/i.test(sanitizedHtml) ||
    /explanation[-_]?modal/i.test(sanitizedHtml);

  if (hasWhatChangedModal) {
    testedFunctions.push('Educational "What Changed?" Transition Modal Verified');
  } else {
    warnings.push('Could not find a dedicated "What Changed?" transition modal in the HTML structure.');
  }

  // 10. Standalone SVG / Canvas Rendering Check (warning only — canvas-based University games are valid)
  const svgMatches = sanitizedHtml.match(/<svg[\s>]/gi) || [];
  const hasCanvas = /<canvas[\s>]/i.test(sanitizedHtml);
  if (svgMatches.length === 0 && !hasCanvas) {
    warnings.push(
      'No <svg> or <canvas> rendering elements found. The game should use at least one for visual content.'
    );
  } else if (svgMatches.length > 0) {
    testedFunctions.push(`Rich Standalone SVG Assets Verified (${svgMatches.length} <svg> illustrations present)`);
  } else if (hasCanvas) {
    testedFunctions.push('Canvas-based rendering detected (valid for simulation/algorithm games)');
  }

  // 11. Headless Runtime Dry-Run Simulation (Mocking browser environment to test execution)
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
        checked: false,
        getContext: () => ({
          clearRect: () => {},
          fillRect: () => {},
          strokeRect: () => {},
          beginPath: () => {},
          closePath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          bezierCurveTo: () => {},
          quadraticCurveTo: () => {},
          stroke: () => {},
          fill: () => {},
          arc: () => {},
          ellipse: () => {},
          fillText: () => {},
          strokeText: () => {},
          measureText: () => ({ width: 50 }),
          save: () => {},
          restore: () => {},
          translate: () => {},
          rotate: () => {},
          scale: () => {},
          drawImage: () => {},
          createLinearGradient: () => ({
            addColorStop: () => {},
          }),
          createRadialGradient: () => ({
            addColorStop: () => {},
          }),
          setLineDash: () => {},
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
          globalAlpha: 1,
          font: '',
          textAlign: 'left',
          textBaseline: 'top',
        }),
        getBoundingClientRect: () => ({ width: 800, height: 480, top: 0, left: 0, right: 800, bottom: 480 }),
        width: 800,
        height: 480,
        offsetWidth: 800,
        offsetHeight: 480,
        children: [],
        childNodes: [],
        parentNode: null,
        dataset: {},
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
        documentElement: createMockElement('html'),
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
            onended: null,
          };
        }
        createGain() {
          return {
            gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, value: 1 },
            connect: () => {},
          };
        }
        resume() {
          return Promise.resolve();
        }
        close() {
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
        location: { href: '' },
        history: { pushState: () => {} },
        screen: { width: 1920, height: 1080 },
        performance: { now: () => Date.now() },
      };

      const sandbox = {
        window: mockWindow,
        document: mockDocument,
        AudioContext: MockAudioContext,
        webkitAudioContext: MockAudioContext,
        console: { log: () => {}, warn: () => {}, error: () => {} },
        requestAnimationFrame: mockWindow.requestAnimationFrame,
        cancelAnimationFrame: mockWindow.cancelAnimationFrame,
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
        JSON,
        Promise,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        structuredClone: (v: unknown) => JSON.parse(JSON.stringify(v)),
      };

      const context = vm.createContext(sandbox);
      // Run the script with a 1500ms timeout to catch infinite loops
      compiledScript.runInContext(context, { timeout: 1500 });
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
