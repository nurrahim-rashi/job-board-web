export type DashboardRole = "applicant" | "admin" | "developer";

export const dashboardRoles = [
  {
    id: "applicant" as const,
    label: "Applicant",
    icon: "◉",
    who: "Rashifa Amara",
    sub: "Product Designer · Polaris Pro plan",
    blurb: "Track every application, assessment and interview in one place.",
  },
  {
    id: "admin" as const,
    label: "Company admin",
    icon: "▦",
    who: "Fieldnote",
    sub: "Company admin · verified",
    blurb: "Publish roles, review applicants and schedule interviews.",
  },
  {
    id: "developer" as const,
    label: "Developer",
    icon: "⌘",
    who: "Polaris Core",
    sub: "Developer account",
    blurb: "Curate assessments, plans and manual payment approvals.",
  },
];
