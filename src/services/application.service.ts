import { axiosInstance } from "../lib/axios";
import type { ApiResponse } from "../types/api";

export type Application = { id: number; status: string; cvFile: string; expectedSalary: number | null; expectedSalaryRequestedAt: string | null; rejectionReason: string | null; createdAt: string; updatedAt: string; job: { slug: string; title: string; cityLocation: string; category: string; salaryMin: number | null; salaryMax: number | null; deadline: string; company: { id: number; companyName: string; logo: string | null } }; interview: { interviewDate: string; locationOrLink: string; notes: string | null; status: string } | null };

export async function submitApplication(slug: string, cv: File, expectedSalary?: number) {
  if (cv.type !== "application/pdf") throw new Error("CV must be a PDF file.");
  if (cv.size > 1024 * 1024) throw new Error("CV must be 1MB or smaller.");
  const data = new FormData(); data.set("cv", cv); if (expectedSalary) data.set("expectedSalary", String(expectedSalary));
  const response = await axiosInstance.post<ApiResponse<Application>>(`/jobs/${slug}/applications`, data, { headers: { "Content-Type": "multipart/form-data" } });
  if (!response.data.data) throw new Error(response.data.message ?? "Unable to submit application");
  return response.data.data;
}

export async function getMyApplications() {
  const response = await axiosInstance.get<ApiResponse<Application[]>>("/applications/me");
  return response.data.data ?? [];
}

export async function getMyApplicationDetail(applicationId: number) {
  const response = await axiosInstance.get<ApiResponse<Application>>(`/applications/me/${applicationId}`);
  if (!response.data.data) throw new Error(response.data.message ?? "Unable to load application");
  return response.data.data;
}

export async function submitExpectedSalary(applicationId: number, expectedSalary: number) {
  const response = await axiosInstance.patch<ApiResponse<{ id: number; expectedSalary: number }>>(`/applications/me/${applicationId}/expected-salary`, { expectedSalary });
  if (!response.data.data) throw new Error(response.data.message ?? "Unable to submit expected salary");
  return response.data.data;
}

export type JobApplicationStatus = {
  id: number;
  status: string;
  createdAt: string;
  rejectionReason: string | null;
};

export async function getMyJobApplication(slug: string) {
  const response = await axiosInstance.get<ApiResponse<JobApplicationStatus | null>>(
    `/jobs/${slug}/application`,
  );
  return response.data.data ?? null;
}
