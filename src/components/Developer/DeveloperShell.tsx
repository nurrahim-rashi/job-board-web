import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import { Clipboard, Gauge, Users } from "../site/Icons";

import { logout } from "../../services/auth.service";
import { navigateAfterLogout } from "../../lib/logout-navigation";

const menu = [
  {
    label: "Skill assessments",
    to: "/dashboard/developer/assessments",
    icon: Clipboard,
  },
  {
    label: "Subscriptions",
    to: "/dashboard/developer/subscriptions",
    icon: Users,
  },
  {
    label: "Website analytics",
    to: "/dashboard/developer/analytics",
    icon: Gauge,
  },
  {
    label: "My profile",
    to: "/profile",
    icon: Users,
  },
];

type DeveloperShellProps = {
  eyebrow: string;
  title: string;
  lead?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function DeveloperShell({
  eyebrow,
  title,
  lead,
  actions,
  children,
}: DeveloperShellProps) {
  const { pathname } = useLocation();

  const isActive = (to: string) => pathname.startsWith(to);

  async function handleLogout() {
    await logout();
    navigateAfterLogout();
  }

  return (
    <div className="admin-console">
      <div className="admin-body">
        <aside className="admin-side">
          <Link className="admin-side-brand" to="/dashboard">
            ✦ Polaris
          </Link>

          <p className="eyebrow">Developer</p>

          <nav>
            {menu.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={isActive(item.to) ? "active" : ""}
              >
                <item.icon />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="admin-side-note">
            <b>Developer console</b>
            <small>Platform administration</small>
          </div>

          <button
            className="admin-side-signout"
            type="button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </aside>

        <main className="admin-main">
          <header className="admin-head">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h1>{title}</h1>

              {lead ? <p className="admin-lead">{lead}</p> : null}
            </div>

            {actions ? (
              <div className="admin-head-actions">{actions}</div>
            ) : null}
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
