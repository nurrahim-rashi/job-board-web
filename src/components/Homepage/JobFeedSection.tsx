import { useEffect, useState } from "react";
import { getPublicJobs, type PublicJob } from "../../services/job.service";
import type { HomepageData } from "../../types/auth";
import { Reveal } from "../../hooks/useReveal";
import { ArrowRight, Bookmark, MapPin, Share, Sparkles } from "../site/Icons";
import { isNewJob } from "../../lib/job-age";
import { categoryLabel } from "../../types/job-posting";
import { useAuth } from "../../stores/useAuth";
import { ShareJobModal } from "../JobDetail/ShareJobModal";

function salary(job: PublicJob) {
  if (job.salaryMin === null && job.salaryMax === null)
    return "Salary not listed";
  const format = (amount: number | null) =>
    amount === null
      ? ""
      : `Rp ${(amount / 1_000_000).toLocaleString("id-ID")} jt`;
  return [format(job.salaryMin), format(job.salaryMax)]
    .filter(Boolean)
    .join("–");
}

export function JobFeedSection({
  recommendations,
  recommendationsLoading,
}: {
  recommendations: HomepageData["recommendations"];
  recommendationsLoading: boolean;
}) {
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [locating, setLocating] = useState(false);
  const [granted, setGranted] = useState(false);
  const user = useAuth((state) => state.user);
  const storageKey = `polaris-saved-jobs-${user?.id ?? "guest"}`;
  const [saved, setSaved] = useState<string[]>([]);
  const [sharing, setSharing] = useState<PublicJob | null>(null);

  useEffect(() => {
    if (user?.role === "JOB_SEEKER") setSaved(JSON.parse(localStorage.getItem(storageKey) ?? "[]") as string[]);
  }, [storageKey, user?.role]);

  const toggleSaved = (slug: string) => {
    const next = saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug];
    setSaved(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const loadJobs = (
    options: { latitude?: number; longitude?: number; city?: string } = {},
  ) => {
    setJobsLoading(true);
    return getPublicJobs({ ...options, limit: 4 })
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setJobsLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const useLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation("your area");
        setGranted(true);
        loadJobs({ latitude, longitude }).finally(() => setLocating(false));
      },
      () => {
        setLocating(false);
        window.alert(
          "We could not access your location. Allow location permission or choose a city manually.",
        );
      },
      { timeout: 8000 },
    );
  };

  const clearLocation = () => {
    setGranted(false);
    setLocation("");
    void loadJobs();
  };

  return (
    <section id="feed" className="dashboard-feed">
      <div className="feed-main">
        <Reveal>
          <div className="feed-heading">
            <div>
              <p className="eyebrow">Discover roles</p>
              <h2>Latest jobs</h2>
            </div>
            <button onClick={granted ? clearLocation : useLocation} disabled={locating}>
              <MapPin />
              {locating
                ? "Locating…"
                : granted
                  ? "Stop using my location"
                  : "Use my location"}
            </button>
          </div>
          <div className="location-note">
            <span>
              {granted
                ? "Showing jobs near your current location."
                : location
                  ? `Showing the latest jobs in ${location}.`
                  : "Choose a city, use your location, or browse the newest roles."}
            </span>
          </div>
        </Reveal>

        <div className="nearby-grid">
          {!jobsLoading &&
            jobs.map((job, index) => (
              <Reveal key={job.id} delay={index * 80}>
                <article className="nearby-card">
                  {isNewJob(job.createdAt) && (
                    <span className="new-job-badge">NEW</span>
                  )}
                  {user?.role === "JOB_SEEKER" && <div className="nearby-card-actions"><button type="button" className={saved.includes(job.slug) ? "saved" : ""} aria-label={`${saved.includes(job.slug) ? "Remove" : "Save"} ${job.title}`} onClick={() => toggleSaved(job.slug)}><Bookmark /></button><button type="button" aria-label={`Share ${job.title}`} onClick={() => setSharing(job)}><Share /></button></div>}
                  <div>
                    {job.company.logo ? (
                      <img
                        src={
                          job.company.logo.startsWith("http")
                            ? job.company.logo
                            : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${job.company.logo}`
                        }
                        alt={`${job.company.companyName} logo`}
                      />
                    ) : (
                      <b>{job.company.companyName[0]}</b>
                    )}
                  </div>
                  <h3>{job.title}</h3>
                  <p>
                    {job.company.companyName} · {job.cityLocation}
                    {job.distance !== null && job.distance !== undefined
                      ? ` · ${job.distance.toFixed(1)} km`
                      : ""}
                  </p>
                  <aside>
                    <span>{categoryLabel(job.category)}</span>
                    <span>{salary(job)}</span>
                  </aside>
                  <a href={`/jobs/${job.slug}`}>
                    View role <ArrowRight />
                  </a>
                </article>
              </Reveal>
            ))}
          {!jobsLoading && !jobs.length && (
            <article className="dashboard-empty-card">
              <MapPin />
              <h3>No jobs found</h3>
              <p>Try another city or browse the latest roles again later.</p>
            </article>
          )}
          {jobsLoading &&
            Array.from({ length: 4 }, (_, index) => (
              <article
                className="nearby-card is-loading"
                aria-label="Loading jobs"
                key={index}
              />
            ))}
        </div>

        <Reveal className="matches-title">
          <p className="eyebrow">Picked for you</p>
          <h2>Based on your profile</h2>
        </Reveal>
        <ul className="match-list">
          {recommendations.map((job, index) => (
            <Reveal key={job.id} delay={index * 70}>
              <li>
                <a href={`/jobs/${job.slug}`}>
                  <Sparkles />
                  <span>
                    <b>
                      {job.title}{" "}
                      {isNewJob(job.createdAt) && (
                        <i className="new-job-badge">NEW</i>
                      )}{" "}
                      · <em>{job.company.companyName}</em>
                    </b>
                    <small>{job.reason}</small>
                  </span>
                  <strong>{job.score}%</strong>
                </a>
              </li>
            </Reveal>
          ))}
          {!recommendationsLoading && !recommendations.length && (
            <li className="dashboard-empty-row">
              <Sparkles />
              <span>
                <b>No profile matches yet</b>
                <small>
                  Complete your profile to receive tailored recommendations.
                </small>
              </span>
            </li>
          )}
          {recommendationsLoading && (
            <li
              className="dashboard-empty-row is-loading"
              aria-label="Loading recommendations"
            />
          )}
        </ul>
      </div>
      {sharing && <ShareJobModal open title={sharing.title} company={sharing.company.companyName} url={`${window.location.origin}/jobs/${sharing.slug}`} onClose={() => setSharing(null)} />}
    </section>
  );
}
