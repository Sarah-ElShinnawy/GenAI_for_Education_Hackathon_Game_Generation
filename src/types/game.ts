import { z } from 'zod';

export const GAME_LEVELS = ['elementary', 'high_school', 'university'] as const;
export type GameLevel = (typeof GAME_LEVELS)[number];

export interface GameObjective {
  label: string;
  done: boolean;
}

export const GenerateGameRequestSchema = z.object({
  topic: z
    .string({
      required_error: 'Topic is required',
      invalid_type_error: 'Topic must be a string',
    })
    .trim()
    .min(1, 'Topic cannot be empty')
    .max(150, 'Topic must be 150 characters or fewer'),
  level: z.preprocess((val) => {
    if (val === 'highschool') return 'high_school';
    return val;
  }, z.enum(GAME_LEVELS, {
    errorMap: () => ({
      message: "Level must be strictly one of: 'elementary', 'high_school', 'university'",
    }),
  })),
  userIntent: z.string().trim().max(300).optional(),
});

export type GenerateGameRequest = z.infer<typeof GenerateGameRequestSchema>;

export interface GenerateGameSuccessResponse {
  status: 'success';
  title: string;
  html: string;
  takeaways: string[];
  objectives?: GameObjective[];
}

export interface GenerateGameErrorResponse {
  status: 'error';
  title?: string;
  html?: string;
  takeaways?: string[];
  objectives?: GameObjective[];
  message: string;
}

export type GenerateGameResponse = GenerateGameSuccessResponse | GenerateGameErrorResponse;

export interface RawAiGameOutput {
  title: string;
  takeaways: string[];
  objectives?: GameObjective[];
  html: string;
}

export interface PedagogicalStage {
  stageNumber: number;
  title: string;
  learningGoal: string;
  playerAction: string;
  explanationOnSuccess: string;
  whatChangedExplanation: string;
}

export interface PedagogicalBlueprint {
  title: string;
  mentorName: string;
  mentorEmoji: string;
  conceptExplanation: string;
  whyItMatters: string;
  visualArtStyle: string;
  difficultyGuideline: string;
  stages: PedagogicalStage[];
  takeaways: string[];
  objectives?: GameObjective[];
}

export type ContentDensity = 'light' | 'moderate' | 'dense';

export interface DocumentAnalysisResult {
  density: ContentDensity;
  gameCount: number;
  summary: string;
  identifiedDiagrams: string[];
  blueprints: PedagogicalBlueprint[];
}

export interface GenerateGameSuiteSuccessResponse {
  status: 'success';
  mode: 'suite';
  density: ContentDensity;
  summary: string;
  games: GenerateGameSuccessResponse[];
}

export interface GenerateGameSuiteErrorResponse {
  status: 'error';
  message: string;
  games?: GenerateGameSuccessResponse[];
}

export type GenerateGameSuiteResponse =
  | GenerateGameSuiteSuccessResponse
  | GenerateGameSuiteErrorResponse;

export interface ExtractedSlide {
  num: number;
  title: string;
  summary: string;
  bullets: string[];
  tags: string[];
}

export interface ExtractedDocumentDetails {
  title: string;
  format: 'PDF' | 'PPTX' | 'PPT';
  totalSlides: number;
  size: string;
  extractedTerms: number;
  slides: ExtractedSlide[];
}
