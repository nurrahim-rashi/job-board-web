import { axiosInstance } from "../lib/axios";
import type { ApiResponse } from "../types/api";

export type PublicJob = {
  id: number;
  slug: string;
  title: string;
  category: string;
  cityLocation: string;
  latitude: string | null;
  longitude: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  tags: unknown;
  createdAt: string;
  distance?: number | null;
  company: { companyName: string; logo: string | null; city: string };
};

export type PublicJobDetail = PublicJob & {
  description: string;
  banner: string | null;
  deadline: string;
  hasPreSelectionTest: boolean;
  testDurationMinutes: number | null;
  applicantCount: number;
  company: PublicJob["company"] & { id: number; profileContent: string; createdAt: string };
  relatedJobs: PublicJob[];
};

export async function getPublicJobs(
  options: { latitude?: number; longitude?: number; city?: string; title?: string; category?: string; dateFrom?: string; dateTo?: string; sort?: "newest" | "oldest" | "nearest"; limit?: number } = {},
) {
  const response = await axiosInstance.get<ApiResponse<PublicJob[]>>("/jobs", { params: options });
  if (!response.data.data) throw new Error(response.data.message ?? "Unable to load jobs");
  return response.data.data;
}

export async function getPublicJob(slug: string) {
  const response = await axiosInstance.get<ApiResponse<PublicJobDetail>>(`/jobs/${slug}`);
  if (!response.data.data) throw new Error(response.data.message ?? "Unable to load job");
  return response.data.data;
}
