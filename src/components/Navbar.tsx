import { useEffect, useRef, useState } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
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
  const navLinks = isAdmin
    ? companyAdminLinks
    : [
        ...links.filter(
          (link) => !loggedIn || !["Stories", "About"].includes(link.label),
        ),
        ...(loggedIn && userId
          ? [{ label: "Dashboard", href: "/dashboard" }]
          : []),
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
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileMenuOpen]);
  async function handleLogout() {
    setMobileMenuOpen(false);
    await logout();
    navigateAfterLogout();
  }
  return (
    <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
      <nav ref={navRef}>
        <a href={isAdmin ? "/admin" : "/"} className="nav-mark" aria-label="Polaris home">
          ✦ Polaris
        </a>
        <ul className="desktop-nav-links">
          {navLinks.map((link) => (
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
                className={`nav-profile desktop-nav-action${isLinkActive("My Profile", userId ? "/profile/view" : "/profile") ? " active" : ""}`}
                aria-current={isLinkActive("My Profile", userId ? "/profile/view" : "/profile") ? "page" : undefined}
                href={userId ? "/profile/view" : "/profile"}
                onClick={() => userId && openProfile(userId)}
              >
                My Profile
              </a>
            )}
            <button type="button" className="nav-cta desktop-nav-action" onClick={handleLogout}>
              Sign out
            </button>
          </>
        ) : (
          <button
            type="button"
            className="nav-cta desktop-nav-action"
            onClick={() => setAuthOpen(true)}
          >
            Sign in
          </button>
        )}
        <button
          className={`mobile-nav-toggle${mobileMenuOpen ? " open" : ""}`}
          type="button"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-menu"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <div
          id="mobile-navigation-menu"
          className={`mobile-nav-menu${mobileMenuOpen ? " open" : ""}`}
        >
          {navLinks.map((link) => (
            <a
              key={`mobile-${link.label}`}
              href={link.href}
              className={isLinkActive(link.label, link.href) ? "active" : undefined}
              aria-current={isLinkActive(link.label, link.href) ? "page" : undefined}
              onClick={() => {
                if (link.label === "My Profile" && userId) openProfile(userId);
                setMobileMenuOpen(false);
              }}
            >
              {link.label}
            </a>
          ))}
          {loggedIn && !isAdmin ? (
            <a
              href={userId ? "/profile/view" : "/profile"}
              className={
                isLinkActive("My Profile", userId ? "/profile/view" : "/profile")
                  ? "active"
                  : undefined
              }
              aria-current={
                isLinkActive("My Profile", userId ? "/profile/view" : "/profile")
                  ? "page"
                  : undefined
              }
              onClick={() => {
                if (userId) openProfile(userId);
                setMobileMenuOpen(false);
              }}
            >
              My Profile
            </a>
          ) : null}
          {loggedIn ? (
            <button type="button" onClick={() => void handleLogout()}>
              Sign out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthOpen(true);
              }}
            >
              Sign in
            </button>
          )}
        </div>
      </nav>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
