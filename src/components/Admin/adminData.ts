export const questionCount = 25;

export const goodScore = 72;

export function formatSalary(job: { salaryMin: number | null; salaryMax: number | null; salaryCurrency: string }) {
  return formatCurrencyRange(job.salaryMin, job.salaryMax, job.salaryCurrency, true);
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function daysLeft(deadline: string) {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
}
import { formatCurrencyRange } from "../../lib/currency";
