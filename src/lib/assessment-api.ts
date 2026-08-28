import { getToken } from "./auth";
import type {
  SubmitAssessmentAnswer,
  SubmitAssessmentResponse,
} from "../types/assessment";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const fetchAssessments = async () => {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/assessment/discovery`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.message || "Failed to fetch assessments",
    );
  }

  return payload;
};

export const fetchAssessmentDetail = async (
  assessmentId: number,
) => {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/assessment/discovery/${assessmentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.message || "Failed to fetch assessment",
    );
  }

  return payload;
};

export const startAssessment = async (
  assessmentId: number,
) => {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/assessment/${assessmentId}/start`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.message || "Failed to start assessment",
    );
  }

  return payload;
};

export const submitAssessment = async (
  assessmentId: number,
  resultId: number,
  answers: SubmitAssessmentAnswer[],
): Promise<SubmitAssessmentResponse> => {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/assessment/${assessmentId}/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resultId,
        answers,
      }),
    },
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.message || "Failed to submit assessment",
    );
  }

  return payload;
};