import { useEffect, useState } from "react";
import { AuthModal } from "./site/AuthModal";
import { getToken, logout } from "../lib/auth";

const links = [
  { label: "Jobs", href: "/jobs" },
  { label: "Companies", href: "/companies" },
  { label: "Stories", href: "/stories" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getToken()));
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    const updateAuth = () => setLoggedIn(Boolean(getToken()));
    window.addEventListener("authchange", updateAuth);
    window.addEventListener("storage", updateAuth);
    return () => { window.removeEventListener("authchange", updateAuth); window.removeEventListener("storage", updateAuth); };
  }, []);
  async function handleLogout() { await logout(); window.location.assign("/"); }
  return (
    <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
      <nav>
        <a href="/" className="nav-mark" aria-label="Polaris home">
          ✦ Polaris
        </a>
        <ul>
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
        {loggedIn ? <><a className="nav-profile" href="/profile">Profile</a><button type="button" className="nav-cta" onClick={handleLogout}>Sign out</button></> : <button type="button" className="nav-cta" onClick={() => setAuthOpen(true)}>Sign in</button>}
      </nav>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
