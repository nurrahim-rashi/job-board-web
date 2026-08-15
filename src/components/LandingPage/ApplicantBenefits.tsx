import {
  BadgeCheck,
  BellRing,
  FileText,
  MapPin,
  ShieldCheck,
  Timer,
  Wallet,
} from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";

const benefits = [
  {
    icon: MapPin,
    title: "Location-based jobs",
    body: "Allow location once and your feed reorders by city radius — no more scrolling past roles three islands away.",
  },
  {
    icon: Wallet,
    title: "Salary shown up front",
    body: "Every listing carries a real range and benchmarks from people in the same role, so you negotiate with numbers.",
  },
  {
    icon: Timer,
    title: "No black-hole applications",
    body: "Track every application through screening, test, interview and offer — with a reason attached when it's a no.",
  },
  {
    icon: FileText,
    title: "Small numbers, curated lists",
    body: "We only show applications from companies that meet our quality standards, ensuring quality over quantity.",
  },
  {
    icon: BadgeCheck,
    title: "Skills you can prove",
    body: "Pass a 25-question assessment and wear a verified badge plus a shareable certificate on your profile.",
  },
  {
    icon: ShieldCheck,
    title: "High integrity communities",
    body: "All reviews, ratings, and everything in the hiring process are verified to ensure trustworthiness and maintain a high standard of quality.",
  },
];

export function ApplicantBenefits() {
  return (
    <section id="why" className="applicant-benefits">
      <i className="benefits-glow" />
      <div className="applicant-benefits-content">
        <Reveal className="applicant-benefits-heading">
          <h2>Built for the person applying, not just the company posting</h2>
          <p>Here's why Polaris is different, in the best way.</p>
        </Reveal>
        <div className="benefits-grid">
          {benefits.map(({ icon: Icon, title, body }, index) => (
            <Reveal key={title} delay={(index % 3) * 90}>
              <article>
                <header>
                  <span>
                    <Icon />
                  </span>
                </header>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal className="benefits-cta" delay={120}>
          <a className="button button-primary" href="/jobs">
            Browse jobs
          </a>
          <span>
            <BellRing />
            Free forever to search and apply
          </span>
        </Reveal>
      </div>
    </section>
  );
}
