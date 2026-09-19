import { axiosInstance } from "../lib/axios";
import type { ApiResponse } from "../types/api";

export type PublicCompany = {
  id: number;
  companyName: string;
  city: string;
  province: string | null;
  country: string;
  logo: string | null;
  profileContent: string;
  createdAt: string;
  verified: boolean;
  qualityScore: number;
  distance?: number | null;
  _count: { jobPostings: number };
};
export async function getPublicCompanies(
  params: {
    search?: string;
    province?: string;
    provinceName?: string;
    country?: string;
    city?: string;
    sort?: "asc" | "desc" | "nearest";
    latitude?: number;
    longitude?: number;
  } = {},
) {
  const response = await axiosInstance.get<ApiResponse<PublicCompany[]>>(
    "/companies",
    { params },
  );
  return response.data.data ?? [];
}
export type PublicCompanyDetail = Omit<
  PublicCompany,
  "_count" | "verified" | "qualityScore"
> & {
  phone: string;
  companyAdmin: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    professionalRole: string;
    emailVerifiedAt: string | null;
  };
  tagline: string;
  size: string;
  founded: number | null;
  website: string;
  banner?: string | null;
  products: { name: string; url: string; description: string }[] | null;
  values: string[];
  perks: string[];
  quality: {
    score: number;
    metrics: import("../components/Profile/QualityScoreCard").QualityMetric[];
    badges: import("../components/Profile/QualityScoreCard").QualityBadge[];
  };
  metrics: {
    responseRate: number;
    acceptanceRate: number;
    reliabilityRate: number;
    respondsWithinDays: number | null;
  };
  viewerApplications: { slug: string; title: string }[];
  jobPostings: {
    id: number;
    slug: string;
    title: string;
    cityLocation: string;
    provinceLocation: string | null;
    countryLocation: string;
    category: string;
    salaryMin: number | null;
    salaryMax: number | null;
    createdAt: string;
    deadline: string;
  }[];
};

export async function uploadCompanyMedia(field: "logo" | "banner", file: File) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new Error("Company media must be a JPG, PNG, or WEBP image.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Company media must be 5MB or smaller.");
  }
  const body = new FormData();
  body.append("media", file);
  const response = await axiosInstance.put<
    ApiResponse<import("../types/auth").AuthUser>
  >(`/auth/company-media/${field}`, body);
  if (!response.data.data)
    throw new Error(response.data.message ?? "Unable to upload company image");
  return response.data.data;
}

export async function removeCompanyMedia(field: "logo" | "banner") {
  const response = await axiosInstance.delete<
    ApiResponse<import("../types/auth").AuthUser>
  >(`/auth/company-media/${field}`);
  if (!response.data.data)
    throw new Error(response.data.message ?? "Unable to remove company image");
  return response.data.data;
}
export async function getPublicCompany(id: string) {
  const response = await axiosInstance.get<ApiResponse<PublicCompanyDetail>>(
    `/companies/${id}`,
  );
  if (!response.data.data)
    throw new Error(response.data.message ?? "Unable to load company");
  return response.data.data;
}
