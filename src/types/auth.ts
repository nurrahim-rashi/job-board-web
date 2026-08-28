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
  authProvider: "EMAIL" | "GOOGLE";
  company: {
    id: number;
    companyName: string;
    phone: string;
    profileContent: string;
    logo: string | null;
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
};

export type DashboardOverview = {
  name: string;
  city: string | null;
  newJobs: number;
  stats: { label: string; value: string; note: string }[];
};
