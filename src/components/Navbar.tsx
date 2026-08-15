import { useEffect, useState } from "react";
import { AuthModal } from "./site/AuthModal";

const links = [
  { label: "Jobs" },
  { label: "Companies" },
  { label: "Stories" },
  { label: "About" },
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
          ✦ Polaris
        </a>
        <ul>
          {links.map((link) => (
            <li>
              <a>{link.label}</a>
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
