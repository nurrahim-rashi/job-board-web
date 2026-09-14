import { useEffect, useState } from "react";
import { AuthModal } from "./site/AuthModal";
import { logout } from "../services/auth.service";
import { useAuth } from "../stores/useAuth";

const links = [
  { label: "Jobs", href: "/jobs" },
  { label: "Companies", href: "/companies" },
  { label: "Stories", href: "/stories" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const loggedIn = useAuth((state) => Boolean(state.token));
  const isAdmin = useAuth((state) => state.user?.role === "COMPANY_ADMIN");
  const companyId = useAuth((state) => state.user?.company?.id);
  const userId = useAuth((state) => state.user?.id);
  const companyAdminLinks = [
    { label: "Dashboard", href: "/admin" },
    { label: "My Company", href: companyId ? `/companies/${companyId}` : "/profile" },
    { label: "My Profile", href: userId ? `/profile/${userId}` : "/profile" },
  ];
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
    // Company profiles are public, so signing out must not take visitors away
    // from the company they are currently viewing.
    if (!/^\/companies\/[^/]+\/?$/.test(window.location.pathname)) {
      window.location.assign("/");
    }
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
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
        {loggedIn ? (
          <>
            {!isAdmin && (
              <a className="nav-profile" href={userId ? `/profile/${userId}` : "/profile"}>
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
