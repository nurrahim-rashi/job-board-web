import { useEffect, useState } from "react";
import { AuthModal } from "./site/AuthModal";
import { logout } from "../services/auth.service";
import { useAuth } from "../stores/useAuth";
import { useProfileView } from "../stores/useProfileView";
import { navigateAfterLogout } from "../lib/logout-navigation";
import { useLocation } from "react-router-dom";

const links = [
  { label: "Jobs", href: "/jobs" },
  { label: "Companies", href: "/companies" },
  { label: "Verify Certificate", href: "/verify-certificate" },
  { label: "Stories", href: "/stories" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const loggedIn = useAuth((state) => Boolean(state.token));
  const isAdmin = useAuth((state) => state.user?.role === "COMPANY_ADMIN");
  const companyId = useAuth((state) => state.user?.company?.id);
  const userId = useAuth((state) => state.user?.id);
  const openProfile = useProfileView((state) => state.openProfile);
  const companyAdminLinks = [
    { label: "Dashboard", href: "/admin" },
    { label: "My Company", href: companyId ? `/companies/${companyId}` : "/profile" },
    { label: "My Profile", href: userId ? "/profile/view" : "/profile" },
  ];
  const isLinkActive = (label: string, href: string) => {
    if (label === "My Profile") {
      return pathname === "/profile" || pathname.startsWith("/profile/view");
    }
    if (label === "Dashboard") {
      return isAdmin
        ? pathname === "/admin" || pathname.startsWith("/admin/")
        : pathname === "/dashboard" || pathname.startsWith("/dashboard/");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("auth") === "signin") {
      setAuthOpen(true);
    }
  }, []);
  async function handleLogout() {
    await logout();
    navigateAfterLogout();
  }
  return (
    <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
      <nav>
        <a href={isAdmin ? "/admin" : "/"} className="nav-mark" aria-label="Polaris home">
          ✦ Polaris
        </a>
        <ul>
          {(isAdmin
            ? companyAdminLinks
            : [
                ...links.filter(
                  (link) =>
                    !loggedIn || !["Stories", "About"].includes(link.label),
                ),
                ...(loggedIn && userId
                  ? [{ label: "Dashboard", href: "/dashboard" }]
                  : []),
              ]
          ).map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={isLinkActive(link.label, link.href) ? "active" : undefined}
                aria-current={isLinkActive(link.label, link.href) ? "page" : undefined}
                onClick={() => link.label === "My Profile" && userId && openProfile(userId)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {loggedIn ? (
          <>
            {!isAdmin && (
              <a
                className={`nav-profile${isLinkActive("My Profile", userId ? "/profile/view" : "/profile") ? " active" : ""}`}
                aria-current={isLinkActive("My Profile", userId ? "/profile/view" : "/profile") ? "page" : undefined}
                href={userId ? "/profile/view" : "/profile"}
                onClick={() => userId && openProfile(userId)}
              >
                My Profile
              </a>
            )}
            <button type="button" className="nav-cta" onClick={handleLogout}>
              Sign out
            </button>
          </>
        ) : (
          <button
            type="button"
            className="nav-cta"
            onClick={() => setAuthOpen(true)}
          >
            Sign in
          </button>
        )}
      </nav>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
