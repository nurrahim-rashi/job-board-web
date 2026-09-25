import { axiosInstance } from "../lib/axios";
import type { ApiResponse } from "../types/api";

export type SavedJobSummary = {
  id: number;
  slug: string;
  title: string;
  cityLocation: string;
  provinceLocation: string | null;
  countryLocation: string;
  category: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  deadline: string;
  isPublished: boolean;
  company: { id: number; companyName: string; logo: string | null };
};

export type SavedJob = {
  id: number;
  jobId: number;
  createdAt: string;
  job: SavedJobSummary;
};

export type SavedJobsPage = {
  items: SavedJob[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export async function saveJob(slug: string) {
  const response = await axiosInstance.post<
    ApiResponse<{ id: number; jobId: number; createdAt: string }>
  >(`/jobs/${slug}/save`);
  if (!response.data.data) throw new Error(response.data.message ?? "Unable to save job");
  return response.data.data;
}

export async function unsaveJob(slug: string) {
  await axiosInstance.delete(`/jobs/${slug}/save`);
}

export async function getMySavedJobsPage(page = 1, limit = 8) {
  const response = await axiosInstance.get<ApiResponse<SavedJobsPage>>("/saved-jobs", {
    params: { page, limit },
  });
  if (!response.data.data) throw new Error(response.data.message ?? "Unable to load saved jobs");
  return response.data.data;
}

export async function getMySavedJobIds() {
  const response = await axiosInstance.get<ApiResponse<number[]>>("/saved-jobs/ids");
  return response.data.data ?? [];
}
