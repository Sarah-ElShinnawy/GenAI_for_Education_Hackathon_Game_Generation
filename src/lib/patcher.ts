/**
 * Zero-cost Button Patcher
 *
 * Scans generated HTML for missing or broken button handler functions and injects
 * minimal-but-working stubs directly into the <script> block.
 *
 * This runs BEFORE the AI repair loop (and for University level where the AI repair
 * loop is skipped). It costs 0 API calls and adds ~0ms to generation time.
 *
 * Fixes the most common silent broken-button patterns:
 *   - onclick="startGame()" with no matching function startGame() {}
 *   - onclick="showInstructions()" with no matching function showInstructions() {}
 *   - #instructions-modal referenced by showInstructions() but missing from HTML
 *   - onclick="restartGame()" or onclick="resetGame()" with no matching function
 */

/**
 * Injects a code block just before the closing </script> tag of the first script block.
 */
function injectIntoScript(html: string, code: string): string {
  // Try to insert before the last </script>
  const lastScriptClose = html.lastIndexOf('</script>');
  if (lastScriptClose === -1) return html;
  return html.slice(0, lastScriptClose) + '\n' + code + '\n' + html.slice(lastScriptClose);
}

/**
 * Checks if a function name is defined anywhere in the script blocks.
 */
function isFunctionDefined(scriptContent: string, fnName: string): boolean {
  const pattern = new RegExp(
    `(?:function\\s+${fnName}\\s*\\(|(?:const|let|var)\\s+${fnName}\\s*=\\s*(?:function|\\())`
  );
  return pattern.test(scriptContent);
}

/**
 * Extracts all combined JS from script tags.
 */
function extractScriptContent(html: string): string {
  const matches = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
  return matches.map((m) => m[1]).join('\n');
}

/**
 * Main patcher entry point.
 * Returns the (possibly patched) HTML string.
 */
export function patchGameButtons(html: string): string {
  let patched = html;
  const scriptContent = extractScriptContent(html);
  const injections: string[] = [];

  // ── 1. startGame() ────────────────────────────────────────────────────────
  const needsStartGame =
    /onclick\s*=\s*['"]startGame\s*\(\s*\)['"]/i.test(html) &&
    !isFunctionDefined(scriptContent, 'startGame');

  if (needsStartGame) {
    console.warn('[ButtonPatcher] Injecting missing startGame() stub.');
    injections.push(`
// [Auto-patched] startGame was referenced in onclick but not defined
function startGame() {
  try {
    if (window._audioCtx && window._audioCtx.state === 'suspended') {
      window._audioCtx.resume();
    }
  } catch(e) {}
  var overlay = document.getElementById('start-overlay');
  if (overlay) overlay.style.display = 'none';
  if (typeof loadStage === 'function') { loadStage(1); }
  else if (typeof initGame === 'function') { initGame(); }
  else if (typeof startLevel === 'function') { startLevel(1); }
}
window.startGame = startGame;`);
  }

  // ── 2. showInstructions() ─────────────────────────────────────────────────
  const needsShowInstructions =
    /onclick\s*=\s*['"]showInstructions\s*\(\s*\)['"]/i.test(html) &&
    !isFunctionDefined(scriptContent, 'showInstructions');

  if (needsShowInstructions) {
    console.warn('[ButtonPatcher] Injecting missing showInstructions() stub.');

    // Also inject the modal HTML if it's missing
    const hasInstructionsModal = /id\s*=\s*['"]instructions-modal['"]/i.test(html);
    if (!hasInstructionsModal) {
      // Inject modal just before </body>
      const bodyClose = patched.lastIndexOf('</body>');
      if (bodyClose !== -1) {
        const modalHtml = `
<div id="instructions-modal" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,0.92);backdrop-filter:blur(8px);z-index:1000;align-items:center;justify-content:center;">
  <div style="background:#1e293b;border:2px solid #38bdf8;border-radius:16px;padding:32px;max-width:480px;width:90%;text-align:left;">
    <h2 style="color:#f8fafc;margin:0 0 16px;font-size:1.4rem;">📖 How to Play</h2>
    <div id="instructions-content" style="color:#cbd5e1;font-size:1rem;line-height:1.6;margin-bottom:24px;">
      <ul style="padding-left:1.2em;margin:0;">
        <li>Read each stage objective carefully before interacting.</li>
        <li>Adjust the controls to match the target state — the game starts in an unsolved position.</li>
        <li>After each correct stage, read the "What Changed?" explanation before continuing.</li>
      </ul>
    </div>
    <button onclick="document.getElementById('instructions-modal').style.display='none'" style="background:#3b82f6;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-weight:bold;font-size:1rem;cursor:pointer;">Got it! ✓</button>
  </div>
</div>`;
        patched = patched.slice(0, bodyClose) + modalHtml + '\n' + patched.slice(bodyClose);
        console.warn('[ButtonPatcher] Injected missing #instructions-modal into HTML.');
      }
    }

    // Re-read scriptContent since html may have changed (modal injection doesn't affect script)
    injections.push(`
// [Auto-patched] showInstructions was referenced in onclick but not defined
function showInstructions() {
  var modal = document.getElementById('instructions-modal');
  if (modal) { modal.style.display = 'flex'; }
}
window.showInstructions = showInstructions;`);
  }

  // ── 3. hideInstructions() / closeInstructions() ───────────────────────────
  for (const fnName of ['hideInstructions', 'closeInstructions', 'closeHelp']) {
    const needsFn =
      new RegExp(`onclick\\s*=\\s*['"]${fnName}\\s*\\(\\s*\\)['"]`, 'i').test(html) &&
      !isFunctionDefined(scriptContent, fnName);
    if (needsFn) {
      injections.push(`
// [Auto-patched] ${fnName} was referenced in onclick but not defined
function ${fnName}() {
  var modal = document.getElementById('instructions-modal');
  if (modal) modal.style.display = 'none';
}
window.${fnName} = ${fnName};`);
    }
  }

  // ── 4. restartGame() / resetGame() / restartLevel() ──────────────────────
  for (const fnName of ['restartGame', 'resetGame', 'restartLevel', 'resetLevel']) {
    const needsFn =
      new RegExp(`onclick\\s*=\\s*['"]${fnName}\\s*\\(\\s*\\)['"]`, 'i').test(html) &&
      !isFunctionDefined(scriptContent, fnName);
    if (needsFn) {
      injections.push(`
// [Auto-patched] ${fnName} was referenced in onclick but not defined
function ${fnName}() {
  if (typeof loadStage === 'function') { loadStage(1); }
  else if (typeof initGame === 'function') { initGame(); }
  else { window.location.reload(); }
}
window.${fnName} = ${fnName};`);
    }
  }

  // ── 5. showModal() / hideModal() ─────────────────────────────────────────
  if (
    /onclick\s*=\s*['"]showModal\s*\(\s*\)['"]/i.test(html) &&
    !isFunctionDefined(scriptContent, 'showModal')
  ) {
    injections.push(`
// [Auto-patched] showModal was referenced in onclick but not defined
function showModal(id) {
  var el = document.getElementById(id || 'what-changed-modal');
  if (el) el.style.display = 'flex';
}
window.showModal = showModal;`);
  }

  if (
    /onclick\s*=\s*['"]hideModal\s*\(\s*\)['"]/i.test(html) &&
    !isFunctionDefined(scriptContent, 'hideModal')
  ) {
    injections.push(`
// [Auto-patched] hideModal was referenced in onclick but not defined
function hideModal(id) {
  var el = document.getElementById(id || 'what-changed-modal');
  if (el) el.style.display = 'none';
}
window.hideModal = hideModal;`);
  }

  // ── Apply all injections ──────────────────────────────────────────────────
  if (injections.length > 0) {
    patched = injectIntoScript(patched, injections.join('\n'));
    console.log(`[ButtonPatcher] Injected ${injections.length} missing function stub(s).`);
  }

  return patched;
}
