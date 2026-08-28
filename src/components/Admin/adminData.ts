export type AdminApplicant = {
  id: string;
  jobId: string;
  name: string;
  education: string;
  expectedSalary: string;
  appliedAt: string;
  status: "Pending" | "In review" | "Interview" | "Accepted" | "Rejected";
  testScore: number | null;
};

export const questionCount = 25;

export const seedApplicants: AdminApplicant[] = [];

export function formatSalary(job: { salaryMin: number | null; salaryMax: number | null }) {
  if (!job.salaryMin && !job.salaryMax) return "Not disclosed";
  const short = (value: number) => `${Math.round(value / 1_000_000)} jt`;
  if (!job.salaryMax) return `From Rp ${short(job.salaryMin!)}`;
  if (!job.salaryMin) return `Up to Rp ${short(job.salaryMax)}`;
  return `Rp ${short(job.salaryMin)}–${short(job.salaryMax)}`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function daysLeft(deadline: string) {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
}
