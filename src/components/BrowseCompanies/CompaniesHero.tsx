import { Stars } from "../site/Stars";
export function CompaniesHero() {
  return (
    <section className="companies-hero">
      <Stars />
      <div>
        <p className="eyebrow light">All companies</p>
        <h1>
          Verified companies hiring
          <br />
          <span>across the globe right now.</span>
        </h1>
      </div>
    </section>
  );
}
