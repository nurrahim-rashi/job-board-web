import { CityscapeHero } from "../site/CityscapeHero";

export function CompaniesHero() {
  return (
    <CityscapeHero>
      <p className="eyebrow companies-hero-eyebrow">Company directory</p>
      <h1>
        Verified companies hiring
        <br />
        <span>across the globe right now.</span>
      </h1>
      <p className="companies-hero-description">
        From towers to studios — browse the skyline of employers and open their
        live roles.
      </p>
    </CityscapeHero>
  );
}
