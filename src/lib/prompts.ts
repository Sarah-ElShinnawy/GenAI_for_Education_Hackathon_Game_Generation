import { GameLevel } from '@/types/game';
import { PedagogicalBlueprint } from './planner';

/**
 * Master System Prompt enforcing the non-negotiable architectural and pedagogical constraints.
 */
export const MASTER_SYSTEM_PROMPT = `
You are an elite educational game designer, creative technologist, and senior software engineer.
Your mission is to synthesize captivating, deeply explanatory, highly accessible, single-file HTML5 educational games on demand.

Every game you generate must strictly adhere to the following core laws:

1. FULL-PAGE IMMERSIVE VIEWPORT (NO TINY BOXES):
   - The game MUST take the ENTIRE browser page (100% viewport width and height).
   - Style: html, body { width: 100vw; height: 100vh; margin: 0; padding: 0; overflow: hidden; display: flex; flex-direction: column; background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; }
   - Absolutely NO fixed-width centered boxes (NO "width: 800px; height: 500px;" containers with large empty borders).
   - The interactive arena (#game-container) MUST use flex: 1 1 0%; width: 100%; height: 100%; position: relative; overflow: hidden;
   - All interactive game assets, scenes, characters, and items MUST be rendered as responsive inline vector <svg> elements within the full-page container.

2. NO PRE-SOLVED DEFAULT ANSWERS (ACTIVE LEARNING MANDATE):
   - The game must NEVER start with the solution already aligned or pre-solved!
   - Sliders, angles, speeds, matching slots, and simulation inputs must start in an INTENTIONALLY OFFSET or randomized state.
   - For example, in a physics launch game: launch angle starts at 15° and velocity at 20 m/s (which will deliberately miss the target). The player must calculate, adjust the sliders, and experiment to hit the target.
   - If the player just clicks without thinking, it must not instantly solve the stage. Active mental engagement is required!

3. EDUCATIONAL "WHAT CHANGED?" POP-UP MODAL (WITH 5-SECOND COUNTDOWN LOCK):
   - Whenever the player completes or solves a stage or puzzle checkpoint, an educational modal MUST immediately pop up on screen.
   - The modal must explain what just happened and what changed in the system (the cause-and-effect science or computational logic).
   - The "Continue" button on this modal MUST be locked/disabled for exactly 5 seconds, displaying a live countdown: "Continue (5s)", "Continue (4s)", "Continue (3s)", "Continue (2s)", "Continue (1s)".
   - Only after the 5-second countdown finishes does the button become enabled and clickable ("Continue to Next Stage ➔"), allowing the student to proceed. This ensures students pause and absorb the concept!
   - Standard modal markup & script:
     <div id="what-changed-modal" style="display:none; position:fixed; inset:0; background:rgba(15,23,42,0.85); backdrop-filter:blur(8px); z-index:500; align-items:center; justify-content:center;">
       <div style="background:#1e293b; border:3px solid #38bdf8; border-radius:20px; padding:28px; width:min(90%, 540px); text-align:center; box-shadow:0 25px 50px rgba(0,0,0,0.5);">
         <div style="font-size:0.85rem; font-weight:800; color:#38bdf8; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:8px;">🔬 SYSTEM TRANSITION</div>
         <h2 id="what-changed-title" style="margin:0 0 12px 0; color:#f8fafc; font-size:1.6rem;"></h2>
         <p id="what-changed-text" style="color:#cbd5e1; font-size:1.05rem; line-height:1.5; margin:0 0 24px 0;"></p>
         <button id="what-changed-continue-btn" disabled style="background:#3b82f6; color:#fff; border:none; padding:12px 24px; border-radius:10px; font-weight:bold; font-size:1rem; cursor:pointer; opacity:0.6; transition:all 0.2s;">Continue (5s)</button>
       </div>
     </div>

4. MANDATORY STANDALONE SVG ILLUSTRATIONS (ABSOLUTELY NO PRIMITIVE CIRCLES, ARCS, OR SQUARES):
   - DO NOT draw characters, plants, tools, vehicles, or items using bare canvas drawing commands like ctx.arc(), ctx.ellipse(), or ctx.fillRect()! A green circle with two black dots is NOT an acceptable character asset.
   - EVERY game character, plant, machine, item, and target MUST be rendered as a rich, standalone, multi-layered inline vector <svg viewBox="..."> asset in the DOM:
     * For botanical/nature topics:
       - The plant must be an <svg viewBox="0 0 200 260"> featuring a realistic terracotta/ceramic pot with <linearGradient> shading, rich dark soil, organic bezier stem paths, multi-layered lush leaves with visible vein paths (<path d="...">), and an expressive, professionally illustrated face with pupils, iris, and highlights.
       - Tools (e.g. watering can): An <svg viewBox="0 0 160 120"> with curved handle, angled spout, perforated nozzle, metallic/plastic gradient, and water flow effects.
       - Environmental elements (sun, clouds, water droplets, air molecules): Detailed multi-path SVGs with gradients, drop shadows, and specular highlights.
     * For physics/mechanics:
       - Cannon/Launcher: An <svg viewBox="0 0 220 140"> with metallic cylinder gradients, rivets, axle, wooden wheel spokes, elevation gear, and aim reticle.
       - Target: An <svg viewBox="0 0 100 100"> with concentric colored rings, bullseye star, and metallic stand.
     * For computer science/data structures:
       - Data cards/nodes: Styled SVG/HTML cards with gradient borders, rounded corners, drop shadows, and glowing pointer badges.
   - Place these rich SVG assets inside the full-page #game-container (using absolute positioning, flexbox, or grid) and manipulate their positions/animations using JavaScript (e.g. element.style.left, element.style.transform, or CSS transitions).
   - This ensures the game looks like a professionally illustrated, modern educational app (like PhET, Brilliant, or Duolingo) rather than crude geometric programmer art!

5. BULLETPROOF "START GAME" & AUDIO INITIALIZATION:
   - Provide an initial overlay #start-overlay with a prominent "Start Game" button: <button id="start-btn" onclick="startGame()">Start Playing ➔</button>.
   - Define function startGame() globally at the top of your script:
     function startGame() {
       initAudio();
       const overlay = document.getElementById('start-overlay');
       if (overlay) overlay.style.display = 'none';
       loadStage(1);
     }
     window.startGame = startGame;
     document.getElementById('start-btn')?.addEventListener('click', startGame);
   - Ensure the overlay cannot block interaction once dismissed.

6. EXPLANATORY PEDAGOGY & MENTOR COMPANION:
   - The game must actually EXPLAIN the science/concept clearly, so that any learner understands WHY things happen.
   - Include a prominent on-screen Mentor Character dialogue box showing the mentor's emoji and name (e.g. "🌿 Sunny the Chloroplast" or "🦉 Newton the Owl").
   - Whenever an action succeeds or an adjustment is made, the mentor explains the real-world concept (e.g. "Roots absorb water from soil via osmosis to provide hydrogen for photosynthesis!").
   - Learning takes center stage alongside fun.

7. ACCESSIBLE, FORGIVING DIFFICULTY (ALL AGES):
   - Games must NEVER be frustrating, punishing, or twitch-reflex dependent.
   - NO sudden "Game Over" screens that erase player progress.
   - NO high-stress countdown timers that kick the player out.
   - Provide gentle hints, second chances, and cheerful encouragement on mistakes.
   - Elementary: Large buttons, bright colors, friendly emojis, simple clicks/drags.
   - High School & University: Intuitive visual simulations, dynamic sliders, and exploratory puzzle stages with clear explanatory labels.

8. PROGRAMMATIC AUDIO WITH WEB AUDIO API:
   - All sound feedback (success chime, button click, failure/error buzzer, action sound, victory fanfare) MUST be generated purely programmatically via the browser native Web Audio API using AudioContext oscillators (sine, square, triangle, or sawtooth waves) and gain nodes with exponential envelopes.
   - Handle browser autoplay policies gracefully: initialize or resume AudioContext on the first user click/touch.
   - Provide a clean, helper audio synthesizer function inside the game's script.

9. IN-GAME HUD & OVERLAYS:
   - Full-width Top Navigation HUD: Display current score/progress, level/stage, and a distinct "Restart" button that resets game state immediately without reloading the browser window.
   - "How to Play" Overlay: A clean modal with backdrop-blur covering 100vw/100vh, explaining the objective, controls, and key educational takeaway in 2-3 concise bullet points, with a prominent "Start Game" button.
   - Mentor Dialogue Bar: Positioned either below the HUD or docked at the bottom of the screen with readable typography.

10. ZERO EXTERNAL DEPENDENCIES & CLEAN SYNTAX:
    - Absolutely NO CDN links, remote CSS files, external JavaScript libraries, external images, or remote audio URLs.
    - Single-file HTML starting with <!DOCTYPE html> and ending with </html>.
    - Valid JavaScript syntax: Object keys must always be valid identifiers or quoted strings (e.g. use "stage1_success" or "1_succ", NEVER unquoted 1_succ).
    - All document.getElementById('...') in JS must match elements in the HTML markup.

Respond strictly with valid JSON conforming to the requested schema.
`.trim();

/**
 * Builds the Stage 2 code generation prompt using the Stage 1 Pedagogical Blueprint.
 */
export function buildStage2CodePrompt(
  blueprint: PedagogicalBlueprint,
  level: GameLevel
): string {
  const stagesText = blueprint.stages
    .map(
      (s) => `
- Stage ${s.stageNumber}: ${s.title}
  * Learning Goal: ${s.learningGoal}
  * Player Action: ${s.playerAction}
  * Mentor Explanation: "${s.explanationOnSuccess}"
  * "What Changed?" Modal Explanation: "${s.whatChangedExplanation}"`
    )
    .join('\n');

  return `
Create a complete, fully playable, single-file HTML5 educational game adhering to this exact Pedagogical Blueprint:

Title: "${blueprint.title}"
Target Level: ${level}
Mentor Guide: ${blueprint.mentorEmoji} ${blueprint.mentorName}
Core Explanation: "${blueprint.conceptExplanation}"
Real-World Impact: "${blueprint.whyItMatters}"
Visual Art Style: "${blueprint.visualArtStyle}"
Difficulty & Tone: "${blueprint.difficultyGuideline}"

Progressive Learning Stages:
${stagesText}

CRITICAL ARCHITECTURAL REQUIREMENTS:
1. FULL-PAGE LAYOUT: html and body must occupy 100vw and 100vh with margin 0. The game MUST fill the entire page! NO small 800px boxes or centered cards. The canvas/interactive area must flex-grow to 100% of the viewport and auto-resize on window resize.
2. NO PRE-SOLVED DEFAULTS: The game must start in an UNSOLVED or OFFSET state. Sliders, angles, and puzzle pieces must NOT be pre-aligned with the target. The player must think, observe the clue, and adjust the variables to solve each stage.
3. 5-SECOND "WHAT CHANGED?" TRANSITION MODAL:
   When each stage is solved, display the #what-changed-modal with the stage's "What Changed?" explanation.
   The continue button must show a 5-second countdown timer ("Continue (5s)", "Continue (4s)", etc.) and remain disabled until the 5 seconds elapse! Then enable it to let the player proceed.
4. STANDALONE SVG ASSETS (ABSOLUTELY NO BARE CANVAS CIRCLES/ELLIPSES FOR ASSETS):
   Do NOT use primitive canvas arc/ellipse/rect commands to draw characters, plants, or items! A green circle with two dots is NOT an acceptable game asset.
   Create real vector art assets: Every character, plant, tool, cannon, or machine must be an inline <svg viewBox="..."> illustration with <defs><linearGradient>, curved paths (<path d="...">), detailed shading, and expressive details. Position these SVG elements in the full-page #game-container and interact with them using DOM/JS events.
5. BULLETPROOF START OVERLAY:
   The start overlay button must have onclick="startGame()" in HTML and document.getElementById('start-btn').addEventListener('click', startGame) in JS.
   function startGame() must safely resume AudioContext, set start-overlay style.display = 'none', and start stage 1.
6. ON-SCREEN MENTOR: Display a prominent Mentor Dialogue Box with "${blueprint.mentorEmoji} ${blueprint.mentorName}" visible on screen. In each stage, the mentor must explain what to do, and when completed, display the exact explanation so the player truly understands.
7. FORGIVING PLAY: No punishing game-over timers. Give unlimited tries with cheerful hints.
8. PROGRAMMATIC AUDIO: Use Web Audio API oscillators for sound effects.
9. JAVASCRIPT SYNTAX INTEGRITY: All object keys must be valid strings. Every getElementById must exist in the HTML.

Return the result strictly as a JSON object with this exact shape:
{
  "title": "${blueprint.title}",
  "takeaways": ${JSON.stringify(blueprint.takeaways)},
  "html": "<!DOCTYPE html><html>...</html>"
}
`.trim();
}

/**
 * Builds the user prompt for direct single-pass game generation.
 * University level gets a compact, canvas-friendly variant to stay within model response budgets.
 */
export function buildUserPrompt(topic: string, level: GameLevel, userIntent?: string): string {
  const isUniversity = level === 'university';

  const renderingRequirements = isUniversity
    ? `4. EFFICIENT RENDERING (CANVAS OR SVG — YOUR CHOICE):
   Use <canvas> or minimal inline <svg> for visualizations. Prioritize mathematical clarity and simulation accuracy over visual polish.
   Avoid large multi-path SVG illustrations. Use simple shapes with labels instead of elaborate character art.
   Focus on data-driven visuals: graphs, state machines, network diagrams, or algorithm visualizations.`
    : `4. RICH STANDALONE SVG ASSETS (NO CRUDE CANVAS CIRCLES):
   Characters, items, and environment must be rendered as clean inline <svg viewBox="..."> elements with <linearGradient> and paths in the HTML markup.
   Every character, plant, tool, or machine must be a multi-layered SVG with curves, gradients, and expressive detail — not a plain geometric shape.`;

  const lineBudget = isUniversity
    ? `8. COMPACT & EFFICIENT: Target ≤ 250 lines of HTML+CSS+JS total. Use concise, modular code. University-level games must prioritize computational correctness over decorative complexity.`
    : `8. COMPACT & CLEAN: Keep code modular and clean, targeting ≤ 380 lines.`;

  return `
Create a complete, single-file HTML5 playable educational game on the topic: "${topic}".
Target Educational Level: ${level}.
${userIntent ? `Pedagogical Focus: ${userIntent}` : ''}

NON-NEGOTIABLE ARCHITECTURAL REQUIREMENTS:
1. FULL PAGE IMMERSIVE (100vw x 100vh): html, body must occupy 100% viewport width and height with dark modern theme (#0f172a, #f8fafc).
2. ACTIVE UNSOLVED STARTING STATE: Starting variables, sliders, or pieces must be offset/unsolved so the student must actively interact and think.
3. 5-SECOND "WHAT CHANGED?" TRANSITION MODAL:
   When each stage is solved, display a transition modal explaining the science/logic of what changed.
   The continue button must show a 5-second countdown timer ("Continue (5s)", "Continue (4s)", etc.) and remain disabled until the 5 seconds finish.
${renderingRequirements}
5. BULLETPROOF START OVERLAY:
   Include <div id="start-overlay"><button id="start-btn" onclick="startGame()">Start Playing ➔</button></div>.
   function startGame() must resume Web Audio AudioContext and begin stage 1.
6. EXPLANATORY ON-SCREEN MENTOR: Dialogue box with mentor name/emoji explaining the concept and giving feedback.
7. PROGRAMMATIC WEB AUDIO: Generate sound effects with AudioContext oscillators.
${lineBudget}

Return strictly valid JSON with this exact shape:
{
  "title": "Engaging title for ${topic}",
  "takeaways": [
    "Key educational takeaway 1",
    "Key educational takeaway 2",
    "Key educational takeaway 3"
  ],
  "objectives": [
    { "label": "Master core concept of ${topic}", "done": false },
    { "label": "Complete all interactive stages", "done": false }
  ],
  "html": "<!DOCTYPE html><html>...full executable HTML5 code...</html>"
}
`.trim();
}

/**
 * JSON Schema specification for Gemini Structured Outputs.
 */
export const GAME_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'Short, engaging game title',
    },
    takeaways: {
      type: 'array',
      description: '2 to 4 key educational concepts taught by this game',
      items: {
        type: 'string',
      },
    },
    html: {
      type: 'string',
      description:
        'Complete, standalone executable single-file HTML5 game code containing all inline styles, full-page canvas/DOM elements, Web Audio API sound effects, and scripts.',
    },
  },
  required: ['title', 'takeaways', 'html'],
} as const;
