import {
  Compass,
  Eye,
  Handshake,
  Shield,
  Sparkles,
  Target,
} from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";
const values = [
  {
    icon: Eye,
    title: "Clarity first",
    body: "Every listing shows salary, team size, reporting line, and the first ninety days. No vague briefs, no hidden stages.",
  },
  {
    icon: Shield,
    title: "Privacy by default",
    body: "Your profile stays invisible until you apply. We never sell data to recruiters and we never blast your CV around.",
  },
  {
    icon: Target,
    title: "Fit over volume",
    body: "We would rather send four right-fit candidates than four hundred keyword matches. Quality shortlists save everyone time.",
  },
  {
    icon: Handshake,
    title: "Ten-day promise",
    body: "Every applicant gets a response within ten working days. Companies that go silent lose their listing. No exceptions.",
  },
  {
    icon: Compass,
    title: "Local context",
    body: "Built for Indonesia: hybrid, remote and on-site roles, local pay bands, and location-aware discovery.",
  },
  {
    icon: Sparkles,
    title: "Human curation",
    body: "Two people still read every posting before it goes live. If it sounds like a copy-paste, it does not get published.",
  },
];
export function ValuesSection() {
  return (
    <section className="about-values">
      <Reveal className="about-section-head">
        <p className="eyebrow">How we work</p>
        <h2>What we believe</h2>
      </Reveal>
      <div className="about-values-grid">
        {values.map(({ icon: Icon, title, body }, index) => (
          <Reveal key={title} delay={(index % 3) * 90}>
            <article>
              <span>
                <Icon />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
