import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BadgeCheck,
  Bookmark,
  Briefcase,
  Calendar,
  Clipboard,
  FileText,
  Gauge,
} from "../site/Icons";

const menu = [
  { label: "Overview", to: "/dashboard", icon: Briefcase },
  {
    label: "All jobs applied",
    to: "/dashboard/applications",
    icon: FileText,
  },
  { label: "Saved jobs", to: "/dashboard/saved-jobs", icon: Bookmark },
  { label: "Interviews", to: "/dashboard/interviews", icon: Calendar },
  {
    label: "Pre-selection tests",
    to: "/dashboard/tests",
    icon: Clipboard,
  },
  {
    label: "Skill assessments",
    to: "/dashboard/assessments",
    icon: Gauge,
  },
  {
    label: "Assessment results",
    to: "/dashboard/assessments/results",
    icon: BadgeCheck,
  },
  {
    label: "Closed jobs",
    to: "/dashboard/closed-jobs",
    icon: FileText,
  },
];

export function SeekerDashboardShell({ children }: { children: ReactNode }) {
  const path = useLocation().pathname;

  return (
    <div className="seeker-dashboard-shell">
      <aside className="seeker-dashboard-side">
        <p className="eyebrow">Job seeker</p>

        <nav>
          {menu.map(({ label, to, icon: Icon }) => {
            const isActive =
              path === to ||
              (to === "/dashboard/assessments" &&
                path.startsWith("/dashboard/assessments/") &&
                !path.startsWith("/dashboard/assessments/results")) ||
              (to === "/dashboard/assessments/results" &&
                path.startsWith("/dashboard/assessments/results/"));

            return (
              <Link key={to} to={to} className={isActive ? "active" : ""}>
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="seeker-dashboard-main">{children}</main>
    </div>
  );
}
