import { useEffect, useState } from "react";
import { AuthModal } from "./site/AuthModal";

const links = [
  ["Roles", "#roles"],
  ["For teams", "#services"],
  ["Stories", "#stories"],
  ["Help Center", "#faq"],
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
        <a href="#top" className="nav-mark" aria-label="Polaris home">
          ✦
        </a>
        <ul>
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="nav-sign-in"
          onClick={() => setAuthOpen(true)}
        >
          Sign in
        </button>
        <a className="nav-cta" href="#apply">
          Post a job
        </a>
      </nav>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
