import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bookmark, Briefcase, Calendar, Clipboard, FileText } from "../site/Icons";

const menu = [
  { label: "Overview", to: "/dashboard", icon: Briefcase },
  { label: "All jobs applied", to: "/dashboard/applications", icon: FileText },
  { label: "Saved jobs", to: "/dashboard/saved-jobs", icon: Bookmark },
  { label: "Interviews", to: "/dashboard/interviews", icon: Calendar },
  { label: "Pre-selection tests", to: "/dashboard/tests", icon: Clipboard },
  { label: "Closed jobs", to: "/dashboard/closed-jobs", icon: FileText },
];

export function SeekerDashboardShell({ children }: { children: ReactNode }) {
  const path = useLocation().pathname;
  return <div className="seeker-dashboard-shell"><aside className="seeker-dashboard-side">
    <p className="eyebrow">Job seeker</p>
    <nav>{menu.map(({ label, to, icon: Icon }) => <Link key={to} to={to} className={path === to ? "active" : ""}><Icon />{label}</Link>)}</nav>
  </aside><main className="seeker-dashboard-main">{children}</main></div>;
}
