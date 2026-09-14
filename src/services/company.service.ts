import { axiosInstance } from "../lib/axios";
import type { ApiResponse } from "../types/api";

export type PublicCompany = { id: number; companyName: string; city: string; logo: string | null; profileContent: string; createdAt: string; distance?: number | null; _count: { jobPostings: number } };
export async function getPublicCompanies(params: { search?: string; city?: string; sort?: "asc" | "desc" | "nearest"; latitude?: number; longitude?: number } = {}) { const response = await axiosInstance.get<ApiResponse<PublicCompany[]>>("/companies", { params }); return response.data.data ?? []; }
export type PublicCompanyDetail = Omit<PublicCompany, "_count"> & { phone: string; tagline: string; size: string; founded: number | null; website: string; banner?: string | null; products: { name: string; url: string; description: string }[] | null; values: string[]; perks: string[]; jobPostings: { id: number; slug: string; title: string; cityLocation: string; category: string; salaryMin: number | null; salaryMax: number | null; createdAt: string; deadline: string }[] };

export async function uploadCompanyMedia(field: "logo" | "banner", file: File) {
  const response = await axiosInstance.put<ApiResponse<import("../types/auth").AuthUser>>(`/auth/company-media/${field}`, file, { headers: { "Content-Type": file.type } });
  if (!response.data.data) throw new Error(response.data.message ?? "Unable to upload company image");
  return response.data.data;
}

export async function removeCompanyMedia(field: "logo" | "banner") {
  const response = await axiosInstance.delete<ApiResponse<import("../types/auth").AuthUser>>(`/auth/company-media/${field}`);
  if (!response.data.data) throw new Error(response.data.message ?? "Unable to remove company image");
  return response.data.data;
}
export async function getPublicCompany(id: string) { const response = await axiosInstance.get<ApiResponse<PublicCompanyDetail>>(`/companies/${id}`); if (!response.data.data) throw new Error(response.data.message ?? "Unable to load company"); return response.data.data; }
export async function getFollowedCompanies() { const response = await axiosInstance.get<ApiResponse<PublicCompany[]>>("/companies/followed/me"); return response.data.data ?? []; }
export async function followCompany(id: string) { await axiosInstance.post(`/companies/${id}/follow`); }
export async function unfollowCompany(id: string) { await axiosInstance.delete(`/companies/${id}/follow`); }
