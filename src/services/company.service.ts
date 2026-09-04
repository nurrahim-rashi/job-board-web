import { axiosInstance } from "../lib/axios";
import type { ApiResponse } from "../types/api";

export type PublicCompany = { id: number; companyName: string; city: string; logo: string | null; profileContent: string; createdAt: string; _count: { jobPostings: number } };
export async function getPublicCompanies(params: { search?: string; city?: string; sort?: "asc" | "desc" } = {}) { const response = await axiosInstance.get<ApiResponse<PublicCompany[]>>("/companies", { params }); return response.data.data ?? []; }
export type PublicCompanyDetail = Omit<PublicCompany, "_count"> & { phone: string; jobPostings: { slug: string; title: string; cityLocation: string; category: string; salaryMin: number | null; salaryMax: number | null; deadline: string }[] };
export async function getPublicCompany(id: string) { const response = await axiosInstance.get<ApiResponse<PublicCompanyDetail>>(`/companies/${id}`); if (!response.data.data) throw new Error(response.data.message ?? "Unable to load company"); return response.data.data; }
