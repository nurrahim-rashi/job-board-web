import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
  CheckCircle,
  Clipboard,
  Clock,
  MapPin,
  Share,
  Upload,
  Wallet,
  Close,
} from "../components/site/Icons";
import { Stars } from "../components/site/Stars";
import { Reveal } from "../hooks/useReveal";

const job = {
  title: "Senior Product Designer",
  company: "Fieldnote",
  industry: "Fintech",
  city: "Jakarta Selatan, Indonesia",
  type: "Hybrid",
  salary: "Rp 22.000.000 – 30.000.000 / month",
  posted: "Posted 3 days ago",
  deadline: "Applications close 30 Aug 2026",
  applicants: 48,
  tags: ["Design systems", "Fintech", "Figma", "0→1", "Research"],
};
const sections: Array<[string, string[]]> = [
  [
    "What you’ll do",
    [
      "Own discovery, concept and delivery for the merchant app squad.",
      "Grow and maintain the Fieldnote design system alongside two engineers.",
      "Run monthly research sessions with merchants across Jabodetabek.",
      "Partner with product and data to define success metrics before build.",
    ],
  ],
  [
    "What we’re looking for",
    [
      "5+ years designing consumer or B2B product interfaces.",
      "A portfolio showing shipped work, not concepts.",
      "Comfortable writing specs and prototyping in Figma.",
      "Working proficiency in Bahasa Indonesia and English.",
    ],
  ],
  [
    "Benefits",
    [
      "BPJS + private health for you and dependants",
      "Hybrid: 2 days in the Senopati studio",
      "Annual learning budget of Rp 15 jt",
      "16 weeks parental leave",
    ],
  ],
];
const process = [
  ["Pre-selection test", "25 multiple choice · 30 minutes"],
  ["CV screening", "2–4 working days"],
  ["Portfolio interview", "60 minutes with the design lead"],
  ["Team session", "Product + engineering"],
  ["Offer", "Reference check, then paperwork"],
];

export default function JobDetailPage() {
  const [saved, setSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [fileName, setFileName] = useState("");
  return (
    <div className="job-detail-page">
      <header className="job-nav">
        <a href="/" className="dashboard-brand">
          <span>✦</span>Polaris
        </a>
        <a href="/" className="back-link">
          <ArrowLeft /> Back to jobs
        </a>
      </header>
      <main>
        <section className="job-hero">
          <div className="night-sky" />
          <Stars />
          <div>
            <p className="eyebrow light">Design · Senior · {job.type}</p>
            <section>
              <b>{job.company[0]}</b>
              <span>
                <h1>{job.title}</h1>
                <p>
                  {job.company} · {job.industry} · {job.city}
                </p>
              </span>
            </section>
            <aside>
              <button
                className="button button-light"
                disabled={applied}
                onClick={() => setApplyOpen(true)}
              >
                {applied ? "Application submitted" : "Apply now"}
                <ArrowRight />
              </button>
              <button onClick={() => setSaved(!saved)}>
                <Bookmark />
                {saved ? "Saved" : "Save role"}
              </button>
              <button
                onClick={() =>
                  navigator.share?.({
                    title: job.title,
                    text: `${job.title} at ${job.company}`,
                    url: location.href,
                  })
                }
              >
                <Share />
                Share
              </button>
            </aside>
            <dl>
              <div>
                <dt>
                  <Wallet />
                  Salary
                </dt>
                <dd>{job.salary}</dd>
              </div>
              <div>
                <dt>
                  <MapPin />
                  Location
                </dt>
                <dd>{job.city}</dd>
              </div>
              <div>
                <dt>
                  <Clock />
                  Posted
                </dt>
                <dd>{job.posted}</dd>
              </div>
              <div>
                <dt>
                  <Calendar />
                  Deadline
                </dt>
                <dd>{job.deadline}</dd>
              </div>
            </dl>
          </div>
        </section>
        <section className="job-body">
          <div className="job-layout">
            <article>
              <Reveal>
                <p className="eyebrow">About the role</p>
                <p className="job-intro">
                  Fieldnote is building payment tooling for Indonesian field
                  teams. We are looking for a senior designer to own the
                  end-to-end experience of our merchant products, from research
                  through shipped interface.
                </p>
                <div className="job-tags">
                  {job.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </Reveal>
              {sections.map(([heading, points]) => (
                <Reveal key={heading} className="job-copy">
                  <h2>{heading}</h2>
                  <ul>
                    {points.map((point) => (
                      <li key={point}>
                        <CheckCircle />
                        {point}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
              <Reveal className="test-card">
                <Clipboard />
                <span>
                  <b>Pre-selection test required</b>
                  <p>
                    Fieldnote asks every applicant to complete a 25-question
                    multiple choice test before the application continues. You
                    get 30 minutes and one attempt.
                  </p>
                </span>
              </Reveal>
              <Reveal className="job-copy">
                <h2>Hiring process</h2>
                <ol className="process-list">
                  {process.map(([step, note], index) => (
                    <li key={step}>
                      <b>{index + 1}</b>
                      <span>
                        <strong>{step}</strong>
                        <small>{note}</small>
                      </span>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </article>
            <aside className="job-rail">
              <Reveal>
                <section>
                  <p className="eyebrow">Apply</p>
                  <p>
                    {job.applicants} people have applied so far. {job.deadline}.
                  </p>
                  <button
                    className="rail-apply"
                    onClick={() => setApplyOpen(true)}
                    disabled={applied}
                  >
                    {applied ? "Application submitted" : "Apply with CV"}
                  </button>
                  <button
                    className="rail-save"
                    onClick={() => setSaved(!saved)}
                  >
                    {saved ? "Saved to your list" : "Save for later"}
                  </button>
                </section>
              </Reveal>
              <Reveal delay={80}>
                <section>
                  <p className="eyebrow">About {job.company}</p>
                  <div className="company-row">
                    <b>{job.company[0]}</b>
                    <span>
                      <strong>{job.company}</strong>
                      <small>{job.industry} · 120–200 people</small>
                    </span>
                  </div>
                  <p>
                    Payment tooling for field sales teams across Indonesia.
                    Verified employer on Polaris since 2023.
                  </p>
                  <a href="#top">
                    View company profile <ArrowRight />
                  </a>
                </section>
              </Reveal>
            </aside>
          </div>
        </section>
      </main>
      {applyOpen && (
        <div className="apply-modal">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setApplied(true);
              setApplyOpen(false);
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setApplyOpen(false)}
            >
              <Close />
            </button>
            <h2>Apply — {job.title}</h2>
            <label htmlFor="cv">Upload CV (PDF, max 1MB)</label>
            <label className="file-input" htmlFor="cv">
              <Upload />
              {fileName || "Choose a file"}
            </label>
            <input
              id="cv"
              type="file"
              accept="application/pdf"
              required
              onChange={(event) =>
                setFileName(event.target.files?.[0]?.name ?? "")
              }
            />
            <label htmlFor="salary">Expected salary (IDR / month)</label>
            <input
              id="salary"
              required
              inputMode="numeric"
              placeholder="25.000.000"
            />
            <p>
              After submitting you&rsquo;ll start the 25-question pre-selection
              test.
            </p>
            <button type="submit">Submit application</button>
          </form>
        </div>
      )}
    </div>
  );
}
