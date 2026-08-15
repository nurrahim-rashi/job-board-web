import { useEffect, useState } from "react";
import { AuthModal } from "./site/AuthModal";

const links = [
  { label: "Jobs", href: "/jobs" },
  { label: "Companies", href: "/companies" },
  { label: "Stories", href: "/stories" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
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
        <a className="nav-cta" onClick={() => setAuthOpen(true)}>
          Sign in
        </a>
      </nav>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
