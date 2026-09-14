import type { ApplicationStatus } from "./applicant";

export const interviewStatuses = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const;

export type InterviewStatus = (typeof interviewStatuses)[number];

export const interviewStatusLabels: Record<InterviewStatus, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/** Maps to the .admin-chip modifiers in index.css. */
export const interviewStatusTones: Record<InterviewStatus, string> = {
  SCHEDULED: "info",
  COMPLETED: "good",
  CANCELLED: "bad",
};

export interface Interview {
  id: number;
  applicationId: number;
  interviewDate: string;
  locationOrLink: string;
  notes: string | null;
  proposedDate: string | null;
  proposalNote: string | null;
  alternativeSlots: string[];
  status: InterviewStatus;
  reminderSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  applicant: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    applicationStatus: ApplicationStatus;
  };
}

export interface InterviewQuery {
  page?: number;
  limit?: number;
  status?: InterviewStatus;
  dateFrom?: string;
  dateTo?: string;
  sortOrder?: "asc" | "desc";
}

/** One row of the bulk scheduler; the backend takes up to 20 per request. */
export interface ScheduleInput {
  applicationId: number;
  interviewDate: string;
  locationOrLink: string;
  notes?: string | null;
}

export interface CreateInterviewsInput {
  schedules: ScheduleInput[];
}

export interface UpdateInterviewInput {
  interviewDate?: string;
  locationOrLink?: string;
  notes?: string | null;
  status?: InterviewStatus;
  alternativeSlots?: string[];
}

export const MAX_SCHEDULES_PER_REQUEST = 20;
