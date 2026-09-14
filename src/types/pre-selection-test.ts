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

export interface TestPrompt {
  id: number;
  question: string;
  options: string[];
}

export interface SavedAnswer {
  questionId: number;
  selectedAnswer: AnswerOption;
}

export interface TestSession {
  testResultId: number;
  startedAt: string;
  durationMinutes: number;
  remainingSeconds: number;
  questions: TestPrompt[];
  savedAnswers: SavedAnswer[];
}

export interface AnswerReceipt extends SavedAnswer {
  remainingSeconds: number;
}

export interface TestScore {
  score: number;
  correctAnswer?: number;
  totalQuestions?: number;
  submittedAt?: string;
}

export const maxAssignPerRequest = 50;

export interface AssignTestResult {
  assignedCount: number;
  skippedCount: number;
}

export interface TestAnswerDetail {
  number: number;
  questionId: number;
  question: string;
  options: string[];
  correctAnswer: AnswerOption;
  selectedAnswer: AnswerOption | null;
  isCorrect: boolean;
}

export interface TestResultDetail {
  applicant: { id: number; name: string; avatar: string | null };
  score: number;
  startedAt: string | null;
  submittedAt: string | null;
  correctCount: number;
  totalQuestions: number;
  details: TestAnswerDetail[];
}
