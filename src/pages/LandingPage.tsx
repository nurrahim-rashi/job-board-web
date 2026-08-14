import {
  ArrowRight,
  Compass,
  FileText,
  Handshake,
  MessagesSquare,
  Play,
  Search,
  Sparkles,
} from "../components/site/Icons";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { Stars } from "../components/site/Stars";
import { Reveal } from "../hooks/useReveal";

const beliefs = [
  "We list work worth doing. Every role is read by a human before it goes live. If a posting is vague about pay, scope, or who you'd report to, it doesn't get published.",
  "Your search is yours. We don't sell your profile to recruiters, we don't blast your CV to fifty companies, and nobody gets your name until you say yes.",
  "We're against the black hole. Every application gets an answer within ten working days, or the company loses its listing.",
  "We optimize for fit, not volume. We'd rather send four candidates who genuinely want the job than four hundred who clicked apply out of habit.",
  "We stay small on purpose. Slow, careful, and honest about it.",
];
const featured = [
  {
    role: "Senior Product Designer",
    company: "Fieldnote",
    meta: "Berlin / Remote EU · €85–105k",
    tags: ["Design systems", "0→1", "8 people"],
  },
  {
    role: "Staff iOS Engineer",
    company: "Halden Labs",
    meta: "Remote worldwide · $170–200k",
    tags: ["Swift", "Health data", "12 people"],
  },
];
const reviews = [
  [
    "I applied to three roles here and heard back from all three within a week. After eight months of silence elsewhere, that alone was worth it.",
    "The role summaries actually tell you what the job is. Salary, team size, who you report to, what the first ninety days look like.",
    "Got hired at a nine-person studio I'd never have found otherwise. Two rounds, clear feedback, offer in eleven days.",
    "No recruiter spam. Not one. I still don't know how they manage it, but my inbox thanks them.",
  ],
  [
    "I used the salary ranges to renegotiate at my current job instead of leaving. Polaris was fine with that, which says a lot.",
    "As a hiring manager: fewer applicants, dramatically better ones. We filled a staff role in three weeks.",
    "The weekly drop is the only newsletter I open. Six roles, hand-written notes, no filler.",
    "Career-changer here. Their guidance on framing prior experience got me my first product job at 38.",
  ],
];
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

function SectionHead({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body: string;
}) {
  return (
    <Reveal className="section-head">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      <p>{body}</p>
    </Reveal>
  );
}

export default function Homepage() {
  return (
    <div id="top" className="polaris-page">
      <Navbar />
      <main>
        <section className="hero-night">
          <div className="night-sky" />
          <div className="night-overlay" />
          <Stars />
          <div className="hero-wrap">
            <div className="hero-copy">
              <h1>
                Five new roles.
                <br />
                Every Monday.
              </h1>
              <p className="hero-lede">
                A job portal with hand-read listings, honest pay bands, and
                companies that actually answer.
              </p>
              <div className="hero-actions">
                <a className="button button-light" href="#roles">
                  Browse roles
                </a>
                <a className="button button-outline" href="#services">
                  I&rsquo;m hiring <ArrowRight />
                </a>
              </div>
              <dl className="hero-stats">
                <div>
                  <dt>Reply guarantee</dt>
                  <dd>10 working days</dd>
                </div>
                <div>
                  <dt>Live listings</dt>
                  <dd>62</dd>
                </div>
                <div>
                  <dt>Pay bands shown</dt>
                  <dd>100%</dd>
                </div>
              </dl>
            </div>
            <div className="latest-drop float-slow">
              <div className="drop-title">
                <span>Latest drop</span>
                <span>13 Aug</span>
              </div>
              <ul>
                {[
                  [
                    "Senior Product Designer",
                    "Fieldnote · Berlin / Remote EU · €85–105k",
                  ],
                  ["Staff iOS Engineer", "Halden Labs · Remote · $170–200k"],
                  ["Backend Engineer", "Tidewell · Lisbon · €70–90k"],
                  ["Product Manager", "Kessel · Amsterdam · €80–95k"],
                  ["Head of Design", "Wren · Remote UK · £95–115k"],
                ].map(([role, detail]) => (
                  <li key={role}>
                    <a href="#roles">
                      <span>
                        <b>{role}</b>
                        <small>{detail}</small>
                      </span>
                      <ArrowRight />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section className="dawn-section">
          <Reveal className="manifesto">
            <h2>
              So simple, you can apply for quality jobs on your lunch break.
            </h2>
            <div>
              {beliefs.map((belief, index) => (
                <Reveal key={belief} delay={index * 70}>
                  <p>{belief}</p>
                </Reveal>
              ))}
            </div>
            <aside>
              {["Mira", "Jonas"].map((name, index) => (
                <div key={name}>
                  <span>{name[0]}</span>
                  <b>{name}</b>
                  <small>
                    {index ? "Answers every email" : "Reads every listing"}
                  </small>
                </div>
              ))}
            </aside>
          </Reveal>
        </section>
        <section id="roles" className="paper-section">
          <div className="content">
            <SectionHead
              eyebrow="This week’s drop"
              title="These are open now"
              body="Six roles a week, read end to end by a person before they go live. Pay bands included, always."
            />
            <div className="role-grid">
              {featured.map((job, index) => (
                <Reveal key={job.role} delay={index * 100}>
                  <a className="role-card" href="#apply">
                    <p className="eyebrow">{job.company}</p>
                    <h3>{job.role}</h3>
                    <small>{job.meta}</small>
                    <div>
                      {job.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <b>
                      View role <ArrowRight />
                    </b>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <section id="stories" className="testimonials">
          <SectionHead
            title="Trusted by thousands"
            body="We build for people who read the whole posting. Turns out, they write back too."
          />
          <div className="awards">
            <b>
              Best Job Boards 2026<small>The Hiring Report</small>
            </b>
            <b>
              Editor&rsquo;s Pick<small>Sidebar</small>
            </b>
            <b>
              Top 10 Career Tools<small>Product Hunt</small>
            </b>
          </div>
          <div className="marquees">
            {reviews.map((row, rowIndex) => (
              <div
                className={`marquee ${rowIndex ? "reverse" : ""}`}
                key={rowIndex}
              >
                {[...row, ...row, ...row].map((review, index) => (
                  <figure key={`${review}-${index}`}>
                    <i>★★★★★</i>
                    <blockquote>{review}</blockquote>
                    <figcaption>Hired through Polaris</figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </section>
        <section id="services" className="paper-section">
          <div className="content">
            <SectionHead
              eyebrow="For teams"
              title="From open headcount to signed offer"
              body="Scoping, writing, and screening from people who have hired for small teams themselves."
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
        <section className="paper-section">
          <div className="content">
            <SectionHead
              eyebrow="Recent work"
              title="What we’ve been closing"
              body="Small moments from searches we ran lately, and how long each one actually took."
            />
            <Reveal>
              <div className="reel">
                <div>
                  <Stars />
                  <button>
                    <Play /> hiring_reel_2026.mp4
                  </button>
                </div>
                <ul>
                  {[
                    ["Head of Design", "Wren", "22 people", "17 days"],
                    ["Backend Engineer", "Tidewell", "6 people", "9 days"],
                    ["Product Manager", "Kessel", "40 people", "24 days"],
                  ].map(([role, company, size, days]) => (
                    <li key={role}>
                      <b>{role}</b>
                      <span>{company}</span>
                      <span>{size}</span>
                      <em>filled in {days}</em>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>
        <section id="faq" className="paper-section">
          <div className="content narrow">
            <SectionHead
              eyebrow="Help Center"
              title="Questions we get a lot"
              body="Everything else is one email away, and a person answers it."
            />
            <dl className="faq">
              {[
                [
                  "Is Polaris free for candidates?",
                  "Always. Companies pay to list; you never pay to apply, and you never see an ad.",
                ],
                [
                  "How many roles go live each week?",
                  "Between four and eight. We publish what passes review, never a quota.",
                ],
                [
                  "Do recruiters get my details?",
                  "No. Your profile stays hidden until you apply, and then only that company sees it.",
                ],
              ].map(([question, answer], index) => (
                <Reveal key={question} delay={index * 80}>
                  <div>
                    <dt>{question}</dt>
                    <dd>{answer}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
