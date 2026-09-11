import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar } from "../Navbar";
import { Briefcase, Building, Calendar, Clipboard, Gauge, Users } from "../site/Icons";
import { useAuth } from "../../stores/useAuth";

const menu = [
  { label: "Job postings", to: "/admin", icon: Briefcase },
  { label: "Applicants", to: "/admin/applicants", icon: Users },
  { label: "Interviews", to: "/admin/interviews", icon: Calendar },
  { label: "Pre-selection tests", to: "/admin/tests", icon: Clipboard },
<<<<<<< Updated upstream
  { label: "Website analytics", to: "/admin/analytics", icon: Gauge },
  { label: "Company profile", to: "/profile", icon: Building },
=======
  { label: "Company profile", to: "/company/profile/edit", icon: Building },
>>>>>>> Stashed changes
];

type AdminShellProps = { eyebrow: string; title: string; lead?: string; actions?: ReactNode; children: ReactNode };

export function AdminShell({ eyebrow, title, lead, actions, children }: AdminShellProps) {
  const { pathname } = useLocation();
  const company = useAuth((state) => state.user?.company);
  const isActive = (to: string) => (to === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/jobs") : pathname.startsWith(to));
  return (
    <div className="admin-console">
      <Navbar />
      <div className="admin-body">
        <aside className="admin-side">
          <p className="eyebrow">Company admin</p>
          <nav>
            {menu.map((item) => (
              <Link key={item.to} to={item.to} className={isActive(item.to) ? "active" : ""}>
                <item.icon />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="admin-side-note">
            <b>{company?.companyName ?? "Your company"}</b>
            <small>{["Verified company", company?.city].filter(Boolean).join(" · ")}</small>
          </div>
        </aside>
        <main className="admin-main">
          <header className="admin-head">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              {lead ? <p className="admin-lead">{lead}</p> : null}
            </div>
            {actions ? <div className="admin-head-actions">{actions}</div> : null}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
