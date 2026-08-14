import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  Bookmark,
  Briefcase,
  Building,
  ChevronDown,
  FileText,
  MapPin,
  Search,
  Sparkles,
} from "../components/site/Icons";
import { Stars } from "../components/site/Stars";
import { Reveal } from "../hooks/useReveal";

const user = { name: "Rashifa", initials: "RA", role: "Product Designer" };
const stats = [
  ["Applications", "7", "3 in review"],
  ["Saved roles", "12", "2 closing soon"],
  ["Profile strength", "80%", "Add your CV"],
  ["Invites", "2", "From verified teams"],
];
const jobs = [
  {
    role: "Senior Product Designer",
    company: "Fieldnote",
    city: "Jakarta Selatan",
    distance: "4 km",
    pay: "Rp 22–30 jt",
    type: "Hybrid",
  },
  {
    role: "Frontend Engineer",
    company: "Halden Labs",
    city: "Jakarta Pusat",
    distance: "7 km",
    pay: "Rp 18–26 jt",
    type: "On-site",
  },
  {
    role: "Product Manager",
    company: "Kessel",
    city: "Tangerang Selatan",
    distance: "12 km",
    pay: "Rp 25–35 jt",
    type: "Hybrid",
  },
  {
    role: "UX Researcher",
    company: "Wren",
    city: "Depok",
    distance: "16 km",
    pay: "Rp 15–21 jt",
    type: "Remote ID",
  },
];
const matches = [
  ["Design Lead", "Tidewell", "Matches design systems + 0→1 experience", "94%"],
  [
    "Senior UI Designer",
    "Bright Harbor",
    "Same stack as your last two roles",
    "88%",
  ],
  [
    "Product Designer, Growth",
    "Nusantara Pay",
    "Salary above your stated range",
    "85%",
  ],
];
const applications = [
  ["Senior Product Designer", "Fieldnote", "Interview", "good"],
  ["Design Lead", "Tidewell", "In review", "wait"],
  ["UI Designer", "Kessel", "CV screening", "wait"],
  ["Product Designer", "Wren", "Not selected", "bad"],
];
const companies = [
  ["Fieldnote", "Fintech", "4"],
  ["Halden Labs", "Healthtech", "6"],
  ["Kessel", "Logistics", "3"],
  ["Wren", "Design studio", "2"],
];

export default function Homepage() {
  const [location, setLocation] = useState("Jakarta, Indonesia");
  const [locating, setLocating] = useState(false);
  const [granted, setGranted] = useState(false);
  useEffect(() => {
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((permission) => setGranted(permission.state === "granted"))
      .catch(() => undefined);
  }, []);
  const useLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(
          `Near ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`,
        );
        setGranted(true);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  };

  return (
    <div id="top" className="dashboard-page">
      <header className="dashboard-nav">
        <div>
          <a className="dashboard-brand" href="#top">
            <span>✦</span>Polaris
          </a>
          <nav>
            <a href="#feed">Jobs</a>
            <a href="#companies">Companies</a>
            <a href="#applications">Applications</a>
            <a href="#saved">Saved</a>
          </nav>
          <aside>
            <button aria-label="Notifications">
              <Bell />
              <i />
            </button>
            <button className="user-menu">
              <b>{user.initials}</b>
              <span>{user.name}</span>
              <ChevronDown />
            </button>
          </aside>
        </div>
      </header>
      <main>
        <section className="dashboard-hero">
          <div className="night-sky" />
          <div className="night-overlay" />
          <Stars />
          <div className="dashboard-wrap">
            <p className="eyebrow light">Welcome back</p>
            <h1>
              Good to see you, {user.name}.<br />
              <span>9 new roles since Tuesday.</span>
            </h1>
            <div className="dashboard-search">
              <label>
                <Search />
                <input placeholder="Job title or keyword" />
              </label>
              <label>
                <Briefcase />
                <input placeholder="Company field" />
              </label>
              <label>
                <MapPin />
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </label>
              <a href="#feed">
                Search <ArrowRight />
              </a>
            </div>
            <dl>
              {stats.map(([label, value, note]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                  <small>{note}</small>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <section id="feed" className="dashboard-feed">
          <div className="dashboard-layout">
            <div>
              <Reveal>
                <div className="feed-heading">
                  <div>
                    <p className="eyebrow">Near you</p>
                    <h2>Jobs around {location.split(",")[0]}</h2>
                  </div>
                  <button onClick={useLocation}>
                    <MapPin />
                    {locating
                      ? "Locating…"
                      : granted
                        ? "Refresh location"
                        : "Use my location"}
                  </button>
                </div>
                {!granted && (
                  <p className="location-note">
                    Location access is off, so we&rsquo;re showing roles for
                    your saved city. Turn it on for a closer feed.
                  </p>
                )}
              </Reveal>
              <div className="nearby-grid">
                {jobs.map((job, index) => (
                  <Reveal key={job.role} delay={index * 80}>
                    <article className="nearby-card">
                      <div>
                        <b>{job.company[0]}</b>
                        <button aria-label={`Save ${job.role}`}>
                          <Bookmark />
                        </button>
                      </div>
                      <h3>{job.role}</h3>
                      <p>
                        {job.company} · {job.city} · {job.distance}
                      </p>
                      <aside>
                        <span>{job.type}</span>
                        <span>{job.pay}</span>
                      </aside>
                      <a href="#feed">
                        View role <ArrowRight />
                      </a>
                    </article>
                  </Reveal>
                ))}
              </div>
              <Reveal className="matches-title">
                <p className="eyebrow">Picked for you</p>
                <h2>Based on your profile</h2>
              </Reveal>
              <ul className="match-list">
                {matches.map(([role, company, why, score], index) => (
                  <Reveal key={role} delay={index * 70}>
                    <li>
                      <a href="#feed">
                        <Sparkles />
                        <span>
                          <b>
                            {role} · <em>{company}</em>
                          </b>
                          <small>{why}</small>
                        </span>
                        <strong>{score}</strong>
                      </a>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
            <aside className="dashboard-side">
              <Reveal>
                <article id="applications">
                  <p className="eyebrow">Your applications</p>
                  <ul>
                    {applications.map(([role, company, status, tone]) => (
                      <li key={role}>
                        <FileText />
                        <span>
                          <b>{role}</b>
                          <small>{company}</small>
                        </span>
                        <em className={tone}>{status}</em>
                      </li>
                    ))}
                  </ul>
                  <a href="#feed">
                    Open dashboard <ArrowRight />
                  </a>
                </article>
              </Reveal>
              <Reveal delay={80}>
                <article>
                  <p className="eyebrow">Profile</p>
                  <p>Add your latest CV to apply in one click.</p>
                  <div className="profile-progress">
                    <i />
                  </div>
                  <small>80% complete</small>
                  <a className="fill-action" href="#feed">
                    Complete profile
                  </a>
                </article>
              </Reveal>
              <Reveal delay={140}>
                <article id="companies">
                  <p className="eyebrow">Companies you follow</p>
                  <ul className="company-list">
                    {companies.map(([name, industry, count]) => (
                      <li key={name}>
                        <b>
                          <Building />
                        </b>
                        <span>
                          <strong>{name}</strong>
                          <small>{industry}</small>
                        </span>
                        <em>{count} jobs</em>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            </aside>
          </div>
        </section>
      </main>
      <footer className="dashboard-footer">
        <Stars />
        <div>
          <section>
            <article>
              <h3>Polaris</h3>
              <p>Work you&rsquo;re proud of.</p>
            </article>
            {[
              ["For you", "All jobs", "Saved roles", "Applications"],
              ["Companies", "All companies", "Post a job", "Pricing"],
              ["Account", "Profile", "Notifications", "Sign out"],
            ].map(([heading, ...links]) => (
              <article key={heading}>
                <b>{heading}</b>
                {links.map((link) => (
                  <a href="#top" key={link}>
                    {link}
                  </a>
                ))}
              </article>
            ))}
          </section>
          <small>
            © 2026–{new Date().getFullYear()} Polaris. Signed in as {user.name}{" "}
            · {user.role}
          </small>
        </div>
      </footer>
    </div>
  );
}
