import { Reveal } from "../../hooks/useReveal";
import { SectionHead } from "./SectionHead";
const technologies = [
  {
    name: "MatchKit",
    body: "The ranking layer behind every drop. It weighs craft signals, scope, and stated preferences instead of keyword overlap.",
  },
  {
    name: "PayIndex",
    body: "Live compensation data from verified offers on the platform. Every range is checked before publishing.",
  },
  {
    name: "ReplyGuard",
    body: "Tracks response times and quietly delists companies that go silent.",
  },
  {
    name: "ProfileVault",
    body: "Your CV, work history, and preferences stay encrypted until you press apply.",
  },
  {
    name: "SignalKit",
    body: "Anonymous, privacy-first analytics that tell us which listings work.",
  },
];
export function TechnologiesSection() {
  return (
    <section className="plain-section">
      <div className="content">
        <SectionHead
          eyebrow="Technologies"
          title="What powers the matching"
          body="We'd rather own the stack than depend on someone else's."
        />
        <div className="tech-grid">
          {technologies.map((tech, index) => (
            <Reveal key={tech.name} delay={(index % 3) * 90}>
              <article>
                <h3>{tech.name}</h3>
                <p>{tech.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
