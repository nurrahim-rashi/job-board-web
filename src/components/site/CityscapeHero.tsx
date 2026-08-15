import type { ReactNode } from "react";

export function CityscapeHero({ children }: { children: ReactNode }) {
  return (
    <section className="cityscape-hero">
      <i className="cityscape-sun" aria-hidden="true" />
      <div className="cityscape-content">{children}</div>
      <div className="cityscape-buildings" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    </section>
  );
}
