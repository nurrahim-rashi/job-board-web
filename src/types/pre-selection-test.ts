export const answerOptions = ["A", "B", "C", "D"] as const;

export type AnswerOption = (typeof answerOptions)[number];

export interface TestQuestionInput {
  question: string;
  options: string[];
  correctAnswer: AnswerOption;
}

export interface TestQuestion extends TestQuestionInput {
  id: number;
}

export interface PreSelectionTest {
  questions: TestQuestion[];
  totalQuestions: number;
  requiredQuestions: number;
  hasPreSelectionTest: boolean;
  testDurationMinutes: number | null;
  isLocked: boolean;
}

export interface ActivationPayload {
  hasPreSelectionTest: boolean;
  testDurationMinutes?: number;
}
