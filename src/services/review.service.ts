import { axiosInstance } from "../lib/axios";
import type { ApiResponse } from "../types/api";

export type CompanyReview = {
  id: number;
  jobTitleHeld: string;
  salaryEstimate: number | null;
  ratingCulture: number;
  ratingWorkLife: number;
  ratingFacility: number;
  ratingCareer: number;
  reviewText: string;
  createdAt: string;
};

export type CompanyReviewViewer = {
  canReview: boolean;
  hasReviewed: boolean;
  jobTitleHeld: string | null;
};

export type CompanyReviewsData = {
  reviews: CompanyReview[];
  viewer: CompanyReviewViewer;
};

export type CreateCompanyReviewData = {
  salaryEstimate?: number;
  ratingCulture: number;
  ratingWorkLife: number;
  ratingFacility: number;
  ratingCareer: number;
  reviewText: string;
};

export async function getCompanyReviews(companyId: string) {
  const response = await axiosInstance.get<ApiResponse<CompanyReviewsData>>(
    `/reviews/${companyId}`,
  );

  if (!response.data.data) {
    throw new Error(response.data.message ?? "Unable to load company reviews");
  }

  return response.data.data;
}

export async function createCompanyReview(
  companyId: string,
  data: CreateCompanyReviewData,
) {
  const response = await axiosInstance.post<ApiResponse<CompanyReview>>(
    `/reviews/${companyId}`,
    data,
  );

  if (!response.data.data) {
    throw new Error(response.data.message ?? "Unable to submit company review");
  }

  return response.data.data;
}
