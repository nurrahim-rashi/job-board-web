export interface Assessment {
  id: number;
  skillName: string;
  title: string;
  description?: string;
  passingScore: number;
  durationMinutes: number;
  questionCount: number;
}

export interface AssessmentListResponse {
  message: string;
  data: Assessment[];
}

export interface AssessmentDetailResponse {
  message: string;
  data: Assessment;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  questionOrder: number;
}

export interface StartAssessmentData {
  resultId: number;
  startedAt: string;
  expiresAt: string;

  assessment: {
    id: number;
    skillName: string;
    title: string;
    durationMinutes: number;
    questionCount: number;
  };

  questions: AssessmentQuestion[];
}

export interface StartAssessmentResponse {
  message: string;
  data: StartAssessmentData;
}

export type AnswerOption = "A" | "B" | "C" | "D";

export interface SubmitAssessmentAnswer {
  questionId: number;
  answer: AnswerOption;
}

export interface SubmitAssessmentData {
  resultId: number;
  score: number;
  isPassed: boolean;
  badgeName: string | null;
  completedAt: string;
  correctAnswers: number;
  totalQuestions: number;
}

export interface SubmitAssessmentResponse {
  message: string;
  data: SubmitAssessmentData;
}