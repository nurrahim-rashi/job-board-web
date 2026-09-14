export const applicationStatuses = [
  "PENDING",
  "TEST_ASSIGNED",
  "PROCESS",
  "INTERVIEW",
  "ACCEPTED",
  "REJECTED",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

/** Statuses an admin can move an applicant to, mirroring the backend transition map. */
export type DecisionStatus = "PROCESS" | "INTERVIEW" | "ACCEPTED" | "REJECTED";

export const nextStatuses: Record<ApplicationStatus, DecisionStatus[]> = {
  PENDING: ["PROCESS", "INTERVIEW", "REJECTED"],
  TEST_ASSIGNED: ["PROCESS", "REJECTED"],
  PROCESS: ["INTERVIEW", "ACCEPTED", "REJECTED"],
  INTERVIEW: ["ACCEPTED", "REJECTED"],
  ACCEPTED: [],
  REJECTED: [],
};

export const statusLabels: Record<ApplicationStatus, string> = {
  PENDING: applicationStatusLabel("PENDING"),
  TEST_ASSIGNED: applicationStatusLabel("TEST_ASSIGNED"),
  PROCESS: applicationStatusLabel("PROCESS"),
  INTERVIEW: applicationStatusLabel("INTERVIEW"),
  ACCEPTED: applicationStatusLabel("ACCEPTED"),
  REJECTED: applicationStatusLabel("REJECTED"),
};

/** Maps to the .admin-chip modifiers in index.css. */
export const statusTones: Record<ApplicationStatus, string> = {
  PENDING: "",
  TEST_ASSIGNED: "wait",
  PROCESS: "info",
  INTERVIEW: "wait",
  ACCEPTED: "good",
  REJECTED: "bad",
};

/**
 * `lastEducation` is free text, so the suggestion list shows a readable label and
 * searches on the shortest term that still matches every spelling an applicant
 * might have typed ("SMA" catches SMA_SMK, SMA/SMK and SMA alike).
 */
export const educationOptions = [
  { label: "Elementary School", query: "Elementary School" },
  { label: "Middle School", query: "Middle School" },
  { label: "High School", query: "High School" },
  { label: "Vocational High School", query: "Vocational High School" },
  { label: "Diploma", query: "Diploma" },
  { label: "Associate Degree", query: "Associate Degree" },
  { label: "Bachelor", query: "Bachelor" },
  { label: "Master", query: "Master" },
  { label: "Doctorate", query: "Doctorate" },
  { label: "Other", query: "Other" },
];

export interface ApplicantListItem {
  id: number;
  status: ApplicationStatus;
  expectedSalary: string | number | null;
  cvFile: string;
  appliedAt: string;
  priorityReview: boolean;
  applicant: {
    id: number;
    name: string;
    avatar: string | null;
    age: number | null;
    lastEducation: string | null;
  };
  testScore: number | null;
}

export interface ApplicantDetail {
  id: number;
  status: ApplicationStatus;
  expectedSalary: string | number | null;
  expectedSalaryRequestedAt: string | null;
  rejectionReason: string | null;
  appliedAt: string;
  cvFile: string;
  cvPreviewUrl: string;
  applicant: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    birthDate: string | null;
    gender: "MALE" | "FEMALE" | null;
    lastEducation: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    age: number | null;
  };
  testResult: { score: number; startedAt: string | null; submittedAt: string | null } | null;
  interview: {
    id: number;
    interviewDate: string;
    locationOrLink: string;
    notes: string | null;
    status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
    proposedDate?: string | null;
    proposalNote?: string | null;
  } | null;
}

export interface ApplicantQuery {
  page?: number;
  limit?: number;
  name?: string;
  minAge?: number;
  maxAge?: number;
  minSalary?: number;
  maxSalary?: number;
  education?: string;
  status?: ApplicationStatus;
  sortBy?: "createdAt" | "expectedSalary" | "name";
  sortOrder?: "asc" | "desc";
}

export interface UpdateStatusInput {
  status: DecisionStatus;
  rejectionReason?: string;
}
import { applicationStatusLabel } from "../lib/application-status";
