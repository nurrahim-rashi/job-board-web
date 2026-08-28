import { seedApplicants } from "./adminData";

export function useApplicants(slug?: string) {
  return slug ? seedApplicants.filter((applicant) => applicant.jobId === slug) : seedApplicants;
}
