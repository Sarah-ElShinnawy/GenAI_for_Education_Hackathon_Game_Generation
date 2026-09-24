// ─── Mock HTML Game ──────────────────────────────────────────────────────────
export const MOCK_GAME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>EduPlay Demo</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    font-family:'Segoe UI',system-ui,sans-serif;
    background:linear-gradient(135deg,#f8faff 0%,#eef3ff 50%,#f5f0ff 100%);
    min-height:100vh;display:flex;align-items:center;justify-content:center;
    color:#1e2440;overflow:hidden;
  }
  .card{
    background:rgba(255,255,255,0.92);
    border:1.5px solid rgba(86,128,233,0.22);
    backdrop-filter:blur(14px);
    border-radius:20px;padding:26px 36px;text-align:center;
    max-width:440px;width:92%;
    box-shadow:0 14px 40px rgba(86,128,233,0.12), 0 2px 8px rgba(0,0,0,0.04);
  }
  h1{
    font-size:1.4rem;font-weight:800;margin-bottom:4px;
    background:linear-gradient(135deg,#5680E9 0%,#5AB9EA 50%,#8860D0 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  }
  p{color:#5e6b8c;margin-bottom:18px;font-size:0.85rem;font-weight:500}
  .score-ring{
    position:relative;width:115px;height:115px;margin:0 auto 16px;
  }
  .score-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
  .ring-bg{fill:none;stroke:rgba(86,128,233,0.12);stroke-width:10}
  .ring-fill{fill:none;stroke:url(#grad);stroke-width:10;stroke-linecap:round;
    stroke-dasharray:376;stroke-dashoffset:376;transition:stroke-dashoffset 0.6s ease}
  .score-text{
    position:absolute;inset:0;display:flex;flex-direction:column;
    align-items:center;justify-content:center;
  }
  .score-num{font-size:2.2rem;font-weight:800;line-height:1;color:#1e2440}
  .score-label{font-size:0.68rem;color:#7e8dae;text-transform:uppercase;letter-spacing:1px;font-weight:600}
  .btn{
    display:inline-flex;align-items:center;justify-content:center;gap:8px;
    padding:11px 28px;border-radius:12px;font-size:0.95rem;font-weight:700;
    border:none;cursor:pointer;transition:all 0.2s;
    background:linear-gradient(135deg,#5680E9,#8860D0);
    color:#fff;box-shadow:0 4px 16px rgba(86,128,233,0.35);
    margin-top:6px;
  }
  .btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(136,96,208,0.45)}
  .btn:active{transform:translateY(0)}
  .streak{display:flex;align-items:center;justify-content:center;gap:6px;
    margin-bottom:12px;font-size:0.825rem;font-weight:600;color:#5e6b8c}
  .streak-dot{width:8px;height:8px;border-radius:50%;background:#5680E9;
    box-shadow:0 0 10px rgba(86,128,233,0.7)}
  .hint{font-size:0.75rem;color:#7e8dae;margin-top:10px;font-weight:500}
</style>
</head>
<body>
<div class="card">
  <h1>Quick Counter Challenge</h1>
  <p>Click as fast as you can! Reach 20 to win.</p>
  <div class="score-ring">
    <svg viewBox="0 0 120 120">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#5680E9"/>
          <stop offset="50%" style="stop-color:#5AB9EA"/>
          <stop offset="100%" style="stop-color:#8860D0"/>
        </linearGradient>
      </defs>
      <circle class="ring-bg" cx="60" cy="60" r="52"/>
      <circle class="ring-fill" id="ring" cx="60" cy="60" r="52"/>
    </svg>
    <div class="score-text">
      <span class="score-num" id="count">0</span>
      <span class="score-label">score</span>
    </div>
  </div>
  <div class="streak"><span class="streak-dot"></span><span id="streakText">Streak: 0</span></div>
  <button class="btn" onclick="increment()" id="mainBtn">Click Me!</button>
  <p class="hint" id="hint">Build your streak — don't wait too long!</p>
</div>
<script>
  let count=0,streak=0,timer=null,won=false;
  const target=20;
  const ring=document.getElementById('ring');
  const circumference=376;
  function updateRing(){
    const pct=Math.min(count/target,1);
    ring.style.strokeDashoffset=circumference-(pct*circumference);
  }
  function resetStreak(){
    if(!won){streak=0;document.getElementById('streakText').textContent='Streak: '+streak}
  }
  function increment(){
    if(won)return;
    count++;
    streak++;
    document.getElementById('count').textContent=count;
    document.getElementById('streakText').textContent='Streak: '+streak;
    updateRing();
    clearTimeout(timer);
    if(count>=target){
      won=true;
      document.getElementById('mainBtn').textContent='You Won!';
      document.getElementById('hint').textContent='Well done! Refresh to play again.';
      document.getElementById('count').textContent=count;
    } else {
      timer=setTimeout(resetStreak,2000);
      const hints=['Keep going!','Nice streak!','Almost there!','Incredible speed!'];
      if(streak>3)document.getElementById('hint').textContent=hints[Math.min(streak-4,3)];
    }
  }
</script>
</body>
</html>`;

// ─── Loading Facts (no emojis) ────────────────────────────────────────────────
export const LOADING_FACTS = [
  "The human brain forms about 1 million new neural connections per second during childhood learning.",
  "Studies show game-based learning improves knowledge retention by up to 90% compared to passive reading.",
  "NASA uses simulations and interactive models to train astronauts — learning by doing works.",
  "The Socratic method, still used today, uses questions and dialogue to stimulate critical thinking.",
  "Finland's education system ranks #1 globally and emphasizes play-based learning even in high school.",
  "Interleaving — mixing different topics — boosts long-term memory more than blocked practice.",
  "The 'spacing effect' means reviewing concepts over time beats cramming every single time.",
  "Growth mindset students outperform fixed mindset peers — believing you can improve is half the battle.",
  "Asking 'why' instead of 'what' deepens understanding and builds transferable mental models.",
  "Gamification increases student engagement by 48% in classroom studies.",
];

// ─── Suggestion Topics (no emoji icons) ──────────────────────────────────────
export const SUGGESTION_TOPICS = [
  { label: "Solar System" },
  { label: "Photosynthesis" },
  { label: "Cell Mitosis" },
  { label: "Supply & Demand" },
  { label: "Sorting Algorithms" },
  { label: "Pythagorean Theorem" },
  { label: "French Revolution" },
  { label: "DNA & Genetics" },
];

// ─── Education Levels (Lucide icons handled in component) ────────────────────
export const LEVELS = [
  { id: "elementary", label: "Elementary", sub: "Ages 6–11" },
  { id: "highschool", label: "High School", sub: "Ages 12–18" },
  { id: "university", label: "University", sub: "Higher Ed" },
];

// ─── Mock HUD Data ────────────────────────────────────────────────────────────
export const MOCK_HUD = {
  takeaways: [
    "Interactive practice strengthens memory encoding and recall.",
    "Immediate feedback helps identify and correct misunderstandings.",
    "Repetition with variation builds robust, transferable knowledge.",
    "Motivation drives engagement, which amplifies learning outcomes.",
  ],
  objectives: [
    { label: "Score 20 points in the counter challenge", done: false },
    { label: "Maintain a streak of 5+ clicks", done: false },
    { label: "Complete the game without breaking your streak", done: false },
  ],
};

// ─── Mock Document Slide Knowledge Base (for AI Side Viewer) ─────────────────
export const MOCK_DOCUMENTS = {
  'Cell_Biology_Lecture_4.pptx': {
    title: 'Cell Biology & Mitosis (Lecture 4)',
    format: 'PPTX',
    totalSlides: 4,
    size: '2.71 MB',
    extractedTerms: 18,
    slides: [
      {
        num: 1,
        title: 'Introduction to Cell Theory & Organelles',
        summary: 'Fundamental biological principles defining cellular life and essential structural components.',
        bullets: [
          'All living organisms are composed of one or more basic units called cells.',
          'Key organelles: Nucleus (DNA control center), Mitochondria (ATP production via aerobic respiration), Ribosomes (protein translation).',
          'Phospholipid bilayer controls selective permeability and chemical signaling.'
        ],
        tags: ['Cell Theory', 'Organelles', 'Mitochondria', 'Membrane Transport'],
      },
      {
        num: 2,
        title: 'The Phases of Mitosis: Prophase to Telophase',
        summary: 'Nuclear division stages ensuring exact replication and distribution of chromosomes.',
        bullets: [
          'Prophase: Chromatin condenses into visible chromosomes; mitotic spindle fibers assemble from centrosomes.',
          'Metaphase: Sister chromatids align along the metaphase equatorial plate.',
          'Anaphase: Centromeres cleave, and sister chromatids separate toward opposite poles.',
          'Telophase & Cytokinesis: Nuclear envelope re-forms; cell furrow pinches to yield two identical diploid cells.'
        ],
        tags: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase', 'Cytokinesis'],
      },
      {
        num: 3,
        title: 'Mitosis vs Meiosis: Diploid vs Haploid',
        summary: 'Comparative analysis of somatic cell duplication versus gamete sexual reproduction.',
        bullets: [
          'Mitosis produces 2 genetically identical diploid (2n) daughter cells for tissue repair and growth.',
          'Meiosis involves two sequential rounds of division resulting in 4 genetically distinct haploid (n) gametes.',
          'Homologous recombination (crossing over) in Prophase I introduces vital genetic diversity.'
        ],
        tags: ['Meiosis', 'Diploid vs Haploid', 'Gametes', 'Recombination'],
      },
      {
        num: 4,
        title: 'Review Questions & Knowledge Check',
        summary: 'Critical review prompts synthesized directly from lecture slide checkpoints.',
        bullets: [
          'Question 1: In which specific phase do sister chromatids pull apart?',
          'Question 2: Explain why mitochondria possess their own distinct circular DNA.',
          'Question 3: Contrast cytokinesis mechanisms in plant vs animal cells.'
        ],
        tags: ['Self-Assessment', 'Active Recall', 'Exam Prep'],
      }
    ]
  },
  'World_History_Syllabus.pdf': {
    title: 'World History — Revolutions & Global Systems',
    format: 'PDF',
    totalSlides: 4,
    size: '1.42 MB',
    extractedTerms: 15,
    slides: [
      {
        num: 1,
        title: 'Course Syllabus & Historical Methodology',
        summary: 'Primary historical analysis standards and structural themes for the academic year.',
        bullets: [
          'Distinguishing primary sources (contemporary diaries, legal decrees) from secondary interpretations.',
          'Comparative historiography and thematic periodization across global regions.',
          'Core assessment benchmarks: Claim formulation, document-based questioning, and synthesis.'
        ],
        tags: ['Historiography', 'Primary Sources', 'Curriculum'],
      },
      {
        num: 2,
        title: 'The Enlightenment & Philosophical Precedents',
        summary: 'The intellectual revolution questioning divine monarchies and proposing rational governance.',
        bullets: [
          'John Locke: Inalienable rights of life, liberty, and property; governance through consent.',
          'Montesquieu: Institutional separation of powers (executive, legislative, judiciary).',
          'Voltaire & Rousseau: Defense of civil liberties, freedom of conscience, and the General Will.'
        ],
        tags: ['Enlightenment', 'Social Contract', 'Separation of Powers'],
      },
      {
        num: 3,
        title: 'The Atlantic Revolutions (1775–1825)',
        summary: 'The wave of political transformations that established democratic and republican precedents.',
        bullets: [
          'American Revolution (1775): Constitutional republicanism and rejection of colonial subjugation.',
          'French Revolution (1789): Collapse of the Ancien Régime; Declaration of the Rights of Man.',
          'Haitian Revolution (1791): Toussaint Louverture leads the first successful enslaved uprising.'
        ],
        tags: ['Atlantic Revolutions', 'Declaration of Rights', 'Sovereignty'],
      },
      {
        num: 4,
        title: 'Industrial Revolution & Socio-Economic Shift',
        summary: 'Transition from agrarian production to fossil-fueled industrial manufacturing.',
        bullets: [
          'Steam power, mechanical spinning jennies, and rapid urban demographic shifts.',
          'Development of modern market economies alongside the birth of early labor movements.',
          'Review Prompt: How did industrialization reshape class structures across 19th-century Europe?'
        ],
        tags: ['Industrialization', 'Urbanization', 'Labor Movements'],
      }
    ]
  }
};

export const CUSTOM_DOCUMENTS = {};

export function registerDocumentDetails(docName, details) {
  if (docName && details) {
    CUSTOM_DOCUMENTS[docName] = details;
  }
}

export function getDocumentDetails(docName, docType) {
  if (docName && CUSTOM_DOCUMENTS[docName]) {
    return CUSTOM_DOCUMENTS[docName];
  }
  if (docName && MOCK_DOCUMENTS[docName]) {
    return MOCK_DOCUMENTS[docName];
  }
  const cleanName = docName ? docName.replace(/\.[^/.]+$/, "") : "Uploaded Document";
  return {
    title: cleanName,
    format: docType || 'PDF',
    totalSlides: 4,
    size: '2.50 MB',
    extractedTerms: 12,
    slides: [
      {
        num: 1,
        title: `${cleanName} — Section 1: Core Fundamentals`,
        summary: 'AI extracted introductory principles, definitions, and thematic background.',
        bullets: [
          `Primary concept definitions extracted directly from ${cleanName}.`,
          'Structural overview of learning goals and curriculum alignment.',
          'Contextual framework ready for dynamic interactive gamification.'
        ],
        tags: ['Fundamentals', 'Curriculum', 'Core Terms'],
      },
      {
        num: 2,
        title: `${cleanName} — Section 2: Detailed Analysis`,
        summary: 'Deep-dive concepts, analytical breakdowns, and relationships between terms.',
        bullets: [
          'Detailed mechanisms and step-by-step sequential processes.',
          'Core formula, timeline, or structural interaction analysis.',
          'High-yield topics prioritized for educational game objectives.'
        ],
        tags: ['Mechanisms', 'Analysis', 'High Yield'],
      },
      {
        num: 3,
        title: `${cleanName} — Section 3: Applied Exercises`,
        summary: 'Problem-solving scenarios and applied questions identified by the AI agent.',
        bullets: [
          'Scenario-based challenge queries synthesized from document data.',
          'Comparative criteria to test critical discernment.',
          'Common conceptual pitfalls and how to avoid them.'
        ],
        tags: ['Applications', 'Problem Solving', 'Scenarios'],
      },
      {
        num: 4,
        title: `${cleanName} — Section 4: Mastery Checkpoints`,
        summary: 'Key review questions and takeaways for student self-testing.',
        bullets: [
          'Quick-check trivia prompts extracted from syllabus review points.',
          'Summary of key terms required for quiz mastery.',
          'Target scores calibrated for high-retention practice.'
        ],
        tags: ['Review', 'Mastery', 'Self-Check'],
      }
    ]
  };
}

