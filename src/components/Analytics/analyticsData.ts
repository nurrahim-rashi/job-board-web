import type { ApplicationStatus, MetricKey } from "../../types/analytics";

export const metricCards: Array<{ key: MetricKey; label: string; hint: string }> = [
  { key: "jobSeekers", label: "New job seekers", hint: "Accounts created" },
  { key: "companies", label: "New companies", hint: "Employers onboarded" },
  { key: "jobs", label: "Postings published", hint: "Live on the board" },
  { key: "applications", label: "Applications", hint: "Drafts excluded" },
  { key: "interviews", label: "Interviews booked", hint: "Scheduled by employers" },
  { key: "hires", label: "Candidates hired", hint: "Applications accepted" },
];

export const statusLabels: Record<ApplicationStatus, string> = {
  PENDING: "Waiting for review",
  TEST_ASSIGNED: "Pre-selection test sent",
  PROCESS: "In process",
  INTERVIEW: "Interview stage",
  ACCEPTED: "Hired",
  REJECTED: "Rejected",
};

export const genderLabels: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  UNDISCLOSED: "Not disclosed",
};

export const planLabels: Record<string, string> = {
  STANDARD: "Polaris Plus",
  PROFESSIONAL: "Polaris Pro",
};

export const interviewLabels: Record<string, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const oneDecimal = (value: number) => Math.round(value * 10) / 10;

export function formatNumber(value: number) {
  return value.toLocaleString("en-GB");
}

export function formatCompact(value: number) {
  if (value >= 1_000_000) return `${oneDecimal(value / 1_000_000)}M`;
  if (value >= 1_000) return `${oneDecimal(value / 1_000)}K`;
  return String(Math.round(value));
}

export function formatCurrency(value: number | null) {
  if (value === null) return "No data";
  if (value >= 1_000_000) return `Rp ${oneDecimal(value / 1_000_000)} jt`;
  if (value >= 1_000) return `Rp ${Math.round(value / 1_000)} rb`;
  return `Rp ${formatNumber(value)}`;
}

export function formatCurrencyAxis(value: number) {
  if (value >= 1_000_000) return `${oneDecimal(value / 1_000_000)} jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} rb`;
  return String(Math.round(value));
}

export function formatDelta(delta: number | null) {
  if (delta === null) return "No earlier data";
  if (delta === 0) return "Flat vs previous period";
  return `${delta > 0 ? "+" : ""}${delta}% vs previous period`;
}

export function samplesNote(samples: number, noun = "report") {
  return `${formatNumber(samples)} ${noun}${samples === 1 ? "" : "s"}`;
}
