import type { JobCategory } from "./job-posting";

export const analyticsRanges = [
  { value: 3, label: "Last 3 months" },
  { value: 6, label: "Last 6 months" },
  { value: 12, label: "Last 12 months" },
  { value: 24, label: "Last 24 months" },
] as const;

export interface AnalyticsQuery {
  months?: number;
  category?: JobCategory;
  limit?: number;
}

export interface AnalyticsMetric {
  value: number;
  previous: number;
  delta: number | null;
}

export type MetricKey =
  | "jobSeekers"
  | "companies"
  | "jobs"
  | "applications"
  | "interviews"
  | "hires";

export type ApplicationStatus =
  | "PENDING"
  | "TEST_ASSIGNED"
  | "PROCESS"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED";

export interface AnalyticsOverview {
  range: { months: number; from: string; category: JobCategory | null };
  community: { totalUsers: number; totalCompanies: number; totalJobs: number };
  metrics: Record<MetricKey, AnalyticsMetric>;
  trend: Array<{
    month: string;
    label: string;
    jobSeekers: number;
    applications: number;
  }>;
  pipeline: Array<{ status: ApplicationStatus; count: number; share: number }>;
  applicationsPerJob: number;
}

export interface LabelShare {
  label: string;
  count: number;
  share: number;
}

export interface UserDemographics {
  total: number;
  averageAge: number | null;
  ageGroups: LabelShare[];
  ageSamples: number;
  genders: Array<{ gender: "MALE" | "FEMALE" | "UNDISCLOSED"; count: number; share: number }>;
  cities: LabelShare[];
  provinces: LabelShare[];
  educations: LabelShare[];
  profileCompletion: { completed: number; total: number; rate: number };
}

export interface SalaryAverage {
  average: number | null;
  samples: number;
}

export interface SalaryTrends {
  expected: SalaryAverage;
  offered: SalaryAverage;
  reported: SalaryAverage;
  byCategory: Array<{
    category: JobCategory;
    expected: number | null;
    offered: number | null;
    expectedSamples: number;
    offeredSamples: number;
  }>;
  byPosition: Array<{ label: string; average: number; samples: number }>;
  byLocation: Array<{ label: string; average: number; samples: number }>;
}

export interface ApplicantInterests {
  totalApplications: number;
  activeApplicants: number;
  applicationsPerApplicant: number;
  categories: Array<{
    category: JobCategory;
    applications: number;
    jobs: number;
    share: number;
    perJob: number;
  }>;
  topJobs: Array<{
    slug: string;
    title: string;
    companyName: string;
    category: JobCategory;
    city: string;
    province: string | null;
    country: string;
    applications: number;
  }>;
  cities: LabelShare[];
}

export interface PlatformEngagement {
  topCompanies: Array<{
    id: number;
    companyName: string;
    city: string;
    province: string | null;
    country: string;
    jobs: number;
    applications: number;
    hires: number;
    hireRate: number;
  }>;
  subscriptions: Array<{
    plan: "STANDARD" | "PROFESSIONAL";
    price: number;
    active: number;
    pending: number;
    expired: number;
    revenue: number;
  }>;
  assessments: Array<{
    title: string;
    skillName: string;
    attempts: number;
    passRate: number;
    averageScore: number | null;
  }>;
  preSelection: {
    jobsWithTest: number;
    publishedJobs: number;
    adoptionRate: number;
    attempts: number;
    submitted: number;
    completionRate: number;
    averageScore: number | null;
  };
  interviews: Array<{
    status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
    count: number;
  }>;
  reviews: {
    total: number;
    overall: number | null;
    breakdown: Array<{ label: string; value: number | null }>;
  };
}
