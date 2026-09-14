export type AuthRole = "JOB_SEEKER" | "COMPANY_ADMIN" | "DEVELOPER";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
  avatar: string | null;
  emailVerifiedAt: string | null;
  birthDate: string | null;
  gender: "MALE" | "FEMALE" | null;
  lastEducation: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  professionalRole: string;
  availability: string;
  profileIntro: string;
  salaryExpectation: string;
  profileStory: string;
  skills: string[];
  profileLinks: { label: string; url: string }[] | null;
  experiences: {
    title: string;
    company: string;
    companyId?: number;
    period: string;
    note: string;
  }[] | null;
  selectedWork: {
    name: string;
    note: string;
    url?: string;
    company?: string;
    date?: string;
  }[] | null;
  authProvider: "EMAIL" | "GOOGLE";
  isPublicProfile: boolean;
  company: {
    id: number;
    companyName: string;
    phone: string;
    profileContent: string;
    tagline: string;
    size: string;
    founded: number | null;
    website: string;
    products: { name: string; url: string; description: string }[] | null;
    values: string[];
    perks: string[];
    logo: string | null;
    banner?: string | null;
    city: string;
  } | null;
};

export type AuthSession = { token: string; user: AuthUser };

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: "JOB_SEEKER" | "COMPANY_ADMIN";
  companyName?: string;
  phone?: string;
  city?: string;
};

export type UpdateProfileInput = Partial<AuthUser> & {
  companyName?: string;
  phone?: string;
  companyCity?: string;
  profileContent?: string;
  companyTagline?: string;
  companySize?: string;
  companyFounded?: number;
  companyWebsite?: string;
  companyProducts?: { name: string; url: string; description: string }[];
  companyValues?: string[];
  companyPerks?: string[];
};

export type DashboardOverview = {
  name: string;
  city: string | null;
  newJobs: number;
  stats: { label: string; value: string; note: string }[];
};

export type HomepageData = {
  overview: DashboardOverview;
  profileCompletion: number;
  applications: {
    id: number;
    status: string;
    job: {
      slug: string;
      title: string;
      company: { companyName: string };
    };
  }[];
  recommendations: {
    id: number;
    slug: string;
    title: string;
    cityLocation: string;
    category: string;
    createdAt: string;
    score: number;
    reason: string;
    company: { companyName: string };
  }[];
  followedCompanies: {
    id: number;
    companyName: string;
    city: string;
    openJobs: number;
  }[];
};
