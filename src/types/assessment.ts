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

export interface AssessmentResultSummary {
  resultId: number;
  assessmentId: number;
  skillName: string;
  title: string;
  score: number;
  isPassed: boolean;
  badgeName: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface AssessmentResultsResponse {
  message: string;
  data: AssessmentResultSummary[];
}

export interface AssessmentResultAnswer {
  questionId: number;
  question: string;
  questionOrder: number;
  answer: AnswerOption;
  isCorrect: boolean;
}

export interface AssessmentResultDetail {
  resultId: number;
  assessmentId: number;
  skillName: string;
  title: string;
  score: number;
  isPassed: boolean;
  badgeName: string | null;
  startedAt: string;
  completedAt: string | null;
  answers: AssessmentResultAnswer[];
}

export interface AssessmentResultDetailResponse {
  message: string;
  data: AssessmentResultDetail;
}

export interface AssessmentBadge {
  resultId: number;
  assessmentId: number;
  skillName: string;
  assessmentTitle: string;
  badgeName: string;
  score: number;
  earnedAt: string;
}

export interface AssessmentBadgesResponse {
  message: string;
  data: AssessmentBadge[];
}

export interface DeveloperAssessment extends Assessment {
  createdAt: string;
  updatedAt: string;
  _count: {
    questions: number;
  };
}

export interface DeveloperAssessmentsResponse {
  message: string;
  data: DeveloperAssessment[];
}

export interface CreateAssessmentInput {
  skillName: string;
  title: string;
  description?: string;
}

export interface CreateAssessmentResponse {
  message: string;
  data: Assessment;
}

export interface DeveloperAssessmentQuestion {
  id: number;
  assessmentId: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: AnswerOption;
  questionOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentQuestionsResponse {
  message: string;
  data: DeveloperAssessmentQuestion[];
}

export interface AssessmentQuestionResponse {
  message: string;
  data: DeveloperAssessmentQuestion;
}

export interface CreateAssessmentQuestionInput {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: AnswerOption;
  questionOrder: number;
}

export type UpdateAssessmentQuestionInput =
  Partial<CreateAssessmentQuestionInput>;

export interface CertificateVerificationData {
  valid: true;
  certificateCode: string;
  recipientName: string;
  assessmentTitle: string;
  skillName: string;
  score: number;
  issuedAt: string;
}

export interface CertificateVerificationResponse {
  message: string;
  data: CertificateVerificationData;
}
