import { axiosInstance } from "../lib/axios";
import type { ApiResponse } from "../types/api";

export type PublicSeekerProfile = {
  id: number;
  name: string;
  role: "JOB_SEEKER" | "COMPANY_ADMIN" | "DEVELOPER";
  avatar: string | null;
  lastEducation: string | null;
  city: string | null;
  province: string | null;
  professionalRole: string;
  availability: string;
  profileIntro: string;
  salaryExpectation: string;
  profileStory: string;
  lookingFor: string[];
  skills: string[];
  profileLinks: { label: string; url: string }[] | null;
  experiences: { title: string; company: string; period: string; note: string }[] | null;
  selectedWork: { name: string; note: string }[] | null;
  company: { id: number; companyName: string } | null;
};

export async function getPublicProfile(userId: string) {
  const response = await axiosInstance.get<ApiResponse<PublicSeekerProfile>>(
    `/profiles/${userId}`,
  );
  if (!response.data.data) throw new Error(response.data.message ?? "Profile not found");
  return response.data.data;
}
