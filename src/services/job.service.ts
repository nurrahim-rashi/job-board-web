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
  createdAt: string;
  distance?: number | null;
  company: { companyName: string; logo: string | null; city: string };
};

export async function getPublicJobs(
  options: { latitude?: number; longitude?: number; city?: string; limit?: number } = {},
) {
  const response = await axiosInstance.get<ApiResponse<PublicJob[]>>("/jobs", { params: options });
  if (!response.data.data) throw new Error(response.data.message ?? "Unable to load jobs");
  return response.data.data;
}
