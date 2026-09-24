import { GoogleGenAI } from '@google/genai';
import { GameLevel, PedagogicalBlueprint, PedagogicalStage } from '@/types/game';
import { generateContentResiliently, getPrimaryModel } from './gemini';
import { stripMarkdown } from './sanitizer';

export type { PedagogicalBlueprint, PedagogicalStage };

/**
 * System prompt for Stage 1: The Pedagogical Architect & Learning Experience Designer.
 */
const PLANNER_SYSTEM_PROMPT = `
You are an expert educational psychologist, pedagogical architect, and creative game director.
Your goal is to transform any educational topic into an accessible, deeply explanatory, stress-free educational game blueprint with rich, delightful visual art.

Core Pedagogical Philosophy:
1. EXPLANATORY FIRST & "WHAT CHANGED" BREAKDOWN:
   The player must actually LEARN and UNDERSTAND the concept.
   When a stage is cleared, the game MUST show a "What Changed" educational pop-up that explains the exact scientific or algorithmic transition that just occurred before moving on.

2. 5-SECOND COUNTDOWN TRANSITION LOCK:
   After solving a stage, the explanation pop-up locks the "Continue" button for 5 seconds (with a live countdown timer) so the student actually pauses, reads, and absorbs the explanation.

3. RICH, BEAUTIFUL VISUAL ART (NO CRUDE SQUARES OR TRIANGLES):
   Assets must NEVER be plain colored squares, boxes, or triangles.
   Design rich inline SVG illustrations: beautiful plants with layered green leaves, leaf veins, cute expressive faces, glowing sunlight particles, detailed water droplets, polished physics cannons with wheels, or glowing circuit/data nodes.

4. ZERO FRUSTRATION & GENTLE DIFFICULTY:
   - For children ('elementary'): Extremely forgiving, no punishing timers, big friendly buttons, cheerful emojis, celebratory feedback.
   - For all ages ('high_school', 'university'): Engaging, exploratory, and intellectually stimulating WITHOUT twitchy, frustrating, or punishing mechanics. Never use brutal countdown timers or instant game-overs.

5. NO PRE-SOLVED DEFAULT ANSWERS:
   Initial values, sliders, and puzzle pieces must NEVER start pre-aligned to the solution. The game must begin in an unsolved or offset state so the player must actively think, experiment, and adjust parameters to succeed.

6. FULL-PAGE IMMERSIVE ENVIRONMENT:
   The game must be designed for full-page immersion (100vw x 100vh). No tiny 800px boxes or cramped borders.

Respond strictly with valid JSON conforming to the requested schema.
`.trim();

/**
 * Stage 1: Generates a comprehensive pedagogical game blueprint.
 */
export async function generatePedagogicalBlueprint(
  client: GoogleGenAI,
  topic: string,
  level: GameLevel,
  userIntent?: string
): Promise<PedagogicalBlueprint> {
  const prompt = `
Educational Subject: "${topic}"
Target Educational Level: ${level}
User Guidance/Context: "${userIntent || 'Make this intuitive, fun, highly explanatory, and stress-free for the learner with rich visual assets.'}"

Design a complete pedagogical game blueprint that:
1. Explains the core concept simply and memorably.
2. Defines a friendly on-screen mentor character to guide the player.
3. Specifies rich visual art (illustrated SVGs, gradients, expressive characters—no plain geometric blocks).
4. Breaks gameplay into 3 clear, gentle, progressive learning stages.
5. For EVERY stage, provide:
   - A clear player action.
   - "explanationOnSuccess": What happens scientifically/conceptually.
   - "whatChangedExplanation": A concrete 1-2 sentence explanation of what just changed in the system to be shown in the 5-second transition pop-up.
6. Provides 2 to 4 key educational takeaways.

Return strictly a JSON object with this exact shape:
{
  "title": "Short, catchy, friendly game title",
  "mentorName": "Name of friendly guide",
  "mentorEmoji": "Single emoji icon for mentor",
  "conceptExplanation": "Clear, intuitive 2-3 sentence explanation of the concept for this age group",
  "whyItMatters": "Why this topic is important in the real world",
  "visualArtStyle": "Detailed guidelines on SVG artwork and illustrations (e.g. cute layered plant SVG with veins, gradient water drops, radiant sunbeams)",
  "difficultyGuideline": "Specific instructions on keeping controls gentle, accessible, and rewarding",
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
`.trim();

  try {
    const { text } = await generateContentResiliently(client, {
      model: getPrimaryModel(),
      contents: prompt,
      systemInstruction: PLANNER_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0.5,
      timeoutMs: 15000,
    });

    const parsed = JSON.parse(stripMarkdown(text));
    return {
      title: parsed.title || `${topic} Discovery Adventure`,
      mentorName: parsed.mentorName || 'Professor Discovery',
      mentorEmoji: parsed.mentorEmoji || '🎓',
      conceptExplanation: parsed.conceptExplanation || `Explore how ${topic} works step-by-step.`,
      whyItMatters: parsed.whyItMatters || `${topic} is foundational to understanding the world.`,
      visualArtStyle:
        parsed.visualArtStyle || 'Rich inline SVG illustrations with gradients and expressive details.',
      difficultyGuideline:
        parsed.difficultyGuideline || 'Gentle, forgiving mechanics with zero punishment.',
      stages: Array.isArray(parsed.stages)
        ? parsed.stages.map((s: any, idx: number) => ({
            stageNumber: s.stageNumber || idx + 1,
            title: s.title || `Stage ${idx + 1}`,
            learningGoal: s.learningGoal || 'Explore the system',
            playerAction: s.playerAction || 'Interact with components',
            explanationOnSuccess: s.explanationOnSuccess || 'Well done!',
            whatChangedExplanation:
              s.whatChangedExplanation ||
              'You successfully triggered the next phase of the process!',
          }))
        : [],
      takeaways: Array.isArray(parsed.takeaways) && parsed.takeaways.length >= 2
        ? parsed.takeaways
        : [`Core principles of ${topic}`, 'Understanding cause and effect'],
    };
  } catch (error) {
    console.warn('Pedagogical blueprint generation had a parsing issue, using fallback blueprint:', error);
    return {
      title: `${topic} Interactive Learning Quest`,
      mentorName: 'Guide Spark',
      mentorEmoji: '🌟',
      conceptExplanation: `Discover and experiment with the core principles of ${topic} through interactive steps.`,
      whyItMatters: `Understanding ${topic} helps us make sense of natural and computational systems.`,
      visualArtStyle: 'Rich inline SVG illustrations with gradients and smooth animations.',
      difficultyGuideline: 'Gentle, accessible mechanics with clear on-screen explanations.',
      stages: [
        {
          stageNumber: 1,
          title: 'Introduction & Foundations',
          learningGoal: 'Observe the initial components',
          playerAction: 'Click or adjust the starting variables',
          explanationOnSuccess: `Great! You discovered the key ingredients of ${topic}.`,
          whatChangedExplanation: `The foundation for ${topic} is now active and ready for the next step.`,
        },
        {
          stageNumber: 2,
          title: 'Cause and Effect Experiment',
          learningGoal: 'See how changes trigger reactions',
          playerAction: 'Interact with the central elements',
          explanationOnSuccess: `Notice how each component directly impacts the outcome in ${topic}.`,
          whatChangedExplanation: `Energy and material transitioned into the active reaction phase!`,
        },
        {
          stageNumber: 3,
          title: 'Synthesis & Mastery',
          learningGoal: 'Combine all parts to achieve the result',
          playerAction: 'Complete the process and observe the finished state',
          explanationOnSuccess: `Wonderful! You mastered the complete cycle of ${topic}!`,
          whatChangedExplanation: `The complete transformation is finished and new outputs were produced!`,
        },
      ],
      takeaways: [
        `Understand the fundamental components of ${topic}`,
        'Observe dynamic cause-and-effect relationships',
        'Learn through guided, stress-free experimentation',
      ],
    };
  }
}
