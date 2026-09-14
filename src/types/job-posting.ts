export const jobCategories = [
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "FINANCE", label: "Finance" },
  { value: "MARKETING", label: "Marketing" },
  { value: "SALES", label: "Sales" },
  { value: "DESIGN", label: "Design" },
  { value: "HUMAN_RESOURCES", label: "Human Resources" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "EDUCATION", label: "Education" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "OTHER", label: "Other" },
] as const;

export type JobCategory = (typeof jobCategories)[number]["value"];

export function categoryLabel(value: string) {
  return jobCategories.find((item) => item.value === value)?.label
    ?? value.replaceAll("_", " ").toLocaleLowerCase("en-US").replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("en-US"));
}

export interface CreateJobPayload {
  title: string;
  description: string;
  category: JobCategory;
  cityLocation: string;
  deadline: string;
  banner?: File | null;
  salaryMin?: number;
  salaryMax?: number;
  tags?: string[];
}

export type UpdateJobPayload = Partial<CreateJobPayload>;

export interface JobPosting {
  id: number;
  slug: string;
  companyId: number;
  title: string;
  description: string;
  category: JobCategory;
  cityLocation: string;
  banner: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  tags: string[] | null;
  deadline: string;
  isPublished: boolean;
  hasPreSelectionTest: boolean;
  testDurationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobPostingListItem extends JobPosting {
  applicantCount: number;
  questionCount: number;
}

export interface JobPostingDetail extends JobPosting {
  totalApplicant: number;
  totalQuestionPreSelectionTest: number;
}

export interface JobListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: JobCategory;
  sortBy?: "createdAt" | "deadline" | "title";
  sortOrder?: "asc" | "desc";
}
