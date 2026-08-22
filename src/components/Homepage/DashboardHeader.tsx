import { useState } from "react";
import { Bell, ChevronDown } from "../site/Icons";
import { getStoredUser, logout } from "../../lib/auth";

export function DashboardHeader() {
  const [user] = useState(getStoredUser);
  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";
  async function handleLogout() {
    await logout();
    window.location.assign("/");
  }
  return (
    <header className="dashboard-nav">
      <div>
        <a className="dashboard-brand" href="#top">
          <span>✦</span>Polaris
        </a>
        <nav>
          <a href="#feed">Jobs</a>
          <a href="#companies">Companies</a>
          <a href="#applications">Applications</a>
          <a href="#saved">Saved</a>
        </nav>
        <aside>
          <button aria-label="Notifications">
            <Bell />
            <i />
          </button>
          <a className="user-menu" href="/profile">
            <b>{initials}</b>
            <span>{user?.name ?? "Account"}</span>
            <ChevronDown />
          </a>
          <button
            type="button"
            className="dashboard-sign-out"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </aside>
      </div>
    </header>
  );
}
