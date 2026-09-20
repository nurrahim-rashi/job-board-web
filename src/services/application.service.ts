import { axiosInstance } from "../lib/axios";
import type { ApiResponse } from "../types/api";

export type Application = { id: number; status: string; cvFile: string; expectedSalary: number | null; expectedSalaryCurrency: string; expectedSalaryRequestedAt: string | null; rejectionReason: string | null; createdAt: string; updatedAt: string; job: { slug: string; title: string; cityLocation: string; provinceLocation: string | null; countryLocation: string; category: string; salaryMin: number | null; salaryMax: number | null; salaryCurrency: string; deadline: string; company: { id: number; companyName: string; logo: string | null } }; interview: { interviewDate: string; locationOrLink: string; notes: string | null; status: string } | null };

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

export type ApplicationPage = { items: Application[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
export async function getMyApplicationsPage(page: number, view?: "interviews" | "tests" | "closed", status?: string) {
  const response = await axiosInstance.get<ApiResponse<ApplicationPage>>("/applications/me/page", { params: { page, limit: 8, view, status } });
  if (!response.data.data) throw new Error(response.data.message ?? "Unable to load applications");
  return response.data.data;
}

export async function getMyApplicationDetail(applicationId: number) {
  const response = await axiosInstance.get<ApiResponse<Application>>(`/applications/me/${applicationId}`);
  if (!response.data.data) throw new Error(response.data.message ?? "Unable to load application");
  return response.data.data;
}

export async function submitExpectedSalary(applicationId: number, expectedSalary: number) {
  const response = await axiosInstance.patch<ApiResponse<{ id: number; expectedSalary: number; expectedSalaryCurrency: string }>>(`/applications/me/${applicationId}/expected-salary`, { expectedSalary });
  if (!response.data.data) throw new Error(response.data.message ?? "Unable to submit expected salary");
  return response.data.data;
}

export type JobApplicationStatus = {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason: string | null;
  job: { hasPreSelectionTest: boolean };
  testResult: { startedAt: string; submittedAt: string | null; score: number | null } | null;
  interview: { interviewDate: string; locationOrLink: string; status: string; createdAt: string } | null;
};

export async function getMyJobApplication(slug: string) {
  const response = await axiosInstance.get<ApiResponse<JobApplicationStatus | null>>(
    `/jobs/${slug}/application`,
  );
  return response.data.data ?? null;
}
