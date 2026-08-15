import type { ReactNode } from "react";

export function JobsBoardHero({ children }: { children: ReactNode }) {
  return <section className="jobs-board-hero"><div className="jobs-board-grid" aria-hidden="true" /><div className="jobs-board-content">{children}</div><div className="jobs-board-waves" aria-hidden="true"><Wave className="wave-back" duration="26s" /><Wave className="wave-middle" duration="18s" /><Wave className="wave-front" duration="12s" /><div /></div></section>;
}

function Wave({ className, duration }: { className: string; duration: string }) {
  return <svg viewBox="0 0 2880 160" preserveAspectRatio="none" style={{ animationDuration: duration }} className={`wave-layer ${className}`}><path fill="currentColor" d="M0,80 C120,30 240,130 360,80 C480,30 600,130 720,80 C840,30 960,130 1080,80 C1200,30 1320,130 1440,80 L1440,160 L0,160 Z" /><path fill="currentColor" transform="translate(1440,0)" d="M0,80 C120,30 240,130 360,80 C480,30 600,130 720,80 C840,30 960,130 1080,80 C1200,30 1320,130 1440,80 L1440,160 L0,160 Z" /></svg>;
}
