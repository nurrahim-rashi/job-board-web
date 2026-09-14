import { axiosInstance } from "./axios";
import type {
  StartAssessmentResponse,
  SubmitAssessmentAnswer,
  SubmitAssessmentResponse,
  AssessmentResultsResponse,
  AssessmentResultDetailResponse,
  AssessmentBadgesResponse,
  DeveloperAssessmentsResponse,
  CreateAssessmentResponse,
  CreateAssessmentInput,
  AssessmentQuestionResponse,
  UpdateAssessmentQuestionInput,
  AssessmentQuestionsResponse,
  CreateAssessmentQuestionInput,
  CertificateVerificationResponse,
} from "../types/assessment";

export const fetchSkillNames = async () => {
  const response = await axiosInstance.get<{ data: { skillName: string }[] }>(
    "/assessment/skills",
  );
  return response.data.data.map((item) => item.skillName);
};

export const fetchAssessments = async () => {
  const response = await axiosInstance.get("/assessment/discovery");

  return response.data;
};

export const fetchAssessmentDetail = async (assessmentId: number) => {
  const response = await axiosInstance.get(
    `/assessment/discovery/${assessmentId}`,
  );

  return response.data;
};

export const fetchAssessmentResultDetail = async (
  resultId: number,
): Promise<AssessmentResultDetailResponse> => {
  const response = await axiosInstance.get<AssessmentResultDetailResponse>(
    `/assessment/results/${resultId}`,
  );

  return response.data;
};

export const startAssessment = async (
  assessmentId: number,
): Promise<StartAssessmentResponse> => {
  const response = await axiosInstance.post<StartAssessmentResponse>(
    `/assessment/${assessmentId}/start`,
  );

  return response.data;
};

export const submitAssessment = async (
  assessmentId: number,
  resultId: number,
  answers: SubmitAssessmentAnswer[],
): Promise<SubmitAssessmentResponse> => {
  const response = await axiosInstance.post<SubmitAssessmentResponse>(
    `/assessment/${assessmentId}/submit`,
    {
      resultId,
      answers,
    },
  );

  return response.data;
};

export const generateAssessmentCertificate = async (resultId: number) => {
  const response = await axiosInstance.post(
    `/assessment/results/${resultId}/certificate`,
  );

  return response.data;
};

export const downloadAssessmentCertificate = async (resultId: number) => {
  const response = await axiosInstance.get(
    `/assessment/results/${resultId}/certificate/pdf`,
    {
      responseType: "blob",
    },
  );

  return response.data as Blob;
};

export const verifyAssessmentCertificate = async (
  certificateCode: string,
): Promise<CertificateVerificationResponse> => {
  const response = await axiosInstance.get<CertificateVerificationResponse>(
    `/assessment/certificates/verify/${encodeURIComponent(certificateCode)}`,
  );

  return response.data;
};

export const fetchAssessmentResults =
  async (): Promise<AssessmentResultsResponse> => {
    const response = await axiosInstance.get<AssessmentResultsResponse>(
      "/assessment/results",
    );

    return response.data;
  };

export const fetchAssessmentBadges =
  async (): Promise<AssessmentBadgesResponse> => {
    const response =
      await axiosInstance.get<AssessmentBadgesResponse>("/assessment/badges");

    return response.data;
  };

export const fetchDeveloperAssessments =
  async (): Promise<DeveloperAssessmentsResponse> => {
    const response =
      await axiosInstance.get<DeveloperAssessmentsResponse>(
        "/assessment/manage",
      );

    return response.data;
  };

export const createAssessment = async (
  data: CreateAssessmentInput,
): Promise<CreateAssessmentResponse> => {
  const response = await axiosInstance.post<CreateAssessmentResponse>(
    "/assessment",
    data,
  );

  return response.data;
};

export const fetchAssessmentQuestions = async (
  assessmentId: number,
): Promise<AssessmentQuestionsResponse> => {
  const response = await axiosInstance.get<AssessmentQuestionsResponse>(
    `/assessment/${assessmentId}/questions`,
  );

  return response.data;
};

export const createAssessmentQuestion = async (
  assessmentId: number,
  data: CreateAssessmentQuestionInput,
): Promise<AssessmentQuestionResponse> => {
  const response = await axiosInstance.post<AssessmentQuestionResponse>(
    `/assessment/${assessmentId}/questions`,
    data,
  );

  return response.data;
};

export const updateAssessmentQuestion = async (
  assessmentId: number,
  questionId: number,
  data: UpdateAssessmentQuestionInput,
): Promise<AssessmentQuestionResponse> => {
  const response = await axiosInstance.patch<AssessmentQuestionResponse>(
    `/assessment/${assessmentId}/questions/${questionId}`,
    data,
  );

  return response.data;
};

export const deleteAssessmentQuestion = async (
  assessmentId: number,
  questionId: number,
) => {
  const response = await axiosInstance.delete(
    `/assessment/${assessmentId}/questions/${questionId}`,
  );

  return response.data;
};
