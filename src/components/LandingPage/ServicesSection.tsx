import {
  Compass,
  FileText,
  Handshake,
  MessagesSquare,
  Search,
  Sparkles,
} from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";
import { SectionHead } from "./SectionHead";
const services = [
  {
    icon: Compass,
    title: "Role scoping",
    body: "Most job posts try to hire three people at once. We help you find the role inside the role.",
  },
  {
    icon: FileText,
    title: "Posting craft",
    body: "We rewrite your listing with real pay bands, real team context, and no ‘rockstar ninja’.",
  },
  {
    icon: Search,
    title: "Curated sourcing",
    body: "Small, deliberate shortlists from people vetted by us, not by a keyword filter.",
  },
  {
    icon: MessagesSquare,
    title: "Screening",
    body: "First conversations run by people who understand the craft, not a scorecard of buzzwords.",
  },
  {
    icon: Handshake,
    title: "Offer support",
    body: "Comp expectations, notice periods, competing offers—fewer surprises before signing.",
  },
  {
    icon: Sparkles,
    title: "Employer brand",
    body: "A careers page that sounds like your team rather than your legal department.",
  },
];
export function ServicesSection() {
  return (
    <section id="services" className="paper-section">
      <div className="content">
        <SectionHead
          eyebrow="For companies"
          title="We treat every company as a partner"
          body="We ensure scoping, writing, and screening from people who have hired for small teams themselves."
        />
        <Reveal className="center">
          <a className="button button-primary" href="#apply">
            Post a job
          </a>
        </Reveal>
        <div className="service-grid">
          {services.map(({ icon: Icon, title, body }, index) => (
            <Reveal key={title} delay={(index % 3) * 90}>
              <article>
                <span className="service-icon">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
