import { axiosInstance } from "./axios";
import type {
  StartAssessmentResponse,
  SubmitAssessmentAnswer,
  SubmitAssessmentResponse,
} from "../types/assessment";

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

export const fetchAssessmentResultDetail = async (resultId: number) => {
  const response = await axiosInstance.get(`/assessment/results/${resultId}`);

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
