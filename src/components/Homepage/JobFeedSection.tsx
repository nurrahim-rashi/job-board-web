import { useEffect, useState } from "react";
import { getPublicJobs, type PublicJob } from "../../services/job.service";
import type { HomepageData } from "../../types/auth";
import { Reveal } from "../../hooks/useReveal";
import { ArrowRight, MapPin, Sparkles } from "../site/Icons";
import { isNewJob } from "../../lib/job-age";
import { categoryLabel } from "../../types/job-posting";

function salary(job: PublicJob) {
  if (job.salaryMin === null && job.salaryMax === null) return "Salary not listed";
  const format = (amount: number | null) =>
    amount === null ? "" : `Rp ${(amount / 1_000_000).toLocaleString("id-ID")} jt`;
  return [format(job.salaryMin), format(job.salaryMax)].filter(Boolean).join("–");
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
  const [manualCity, setManualCity] = useState("");
  const [locating, setLocating] = useState(false);
  const [granted, setGranted] = useState(false);

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
        window.alert("We could not access your location. Allow location permission or choose a city manually.");
      },
      { timeout: 8000 },
    );
  };

  const useManualCity = () => {
    const city = manualCity.trim();
    if (!city) return;
    setLocation(city);
    setGranted(false);
    loadJobs({ city });
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
            <button onClick={useLocation}>
              <MapPin />
              {locating ? "Locating…" : granted ? "Refresh location" : "Use my location"}
            </button>
          </div>
          <div className="location-note">
            <span>{granted ? "Showing jobs near your current location." : location ? `Showing the latest jobs in ${location}.` : "Choose a city, use your location, or browse the newest roles."}</span>
            <div className="location-manual">
              <input value={manualCity} onChange={(event) => setManualCity(event.target.value)} placeholder="Choose a city" />
              <button type="button" onClick={useManualCity}>Show jobs</button>
            </div>
          </div>
        </Reveal>

        <div className="nearby-grid">
          {!jobsLoading && jobs.map((job, index) => (
            <Reveal key={job.id} delay={index * 80}>
              <article className="nearby-card">
                {isNewJob(job.createdAt) && <span className="new-job-badge">NEW</span>}
                <div>{job.company.logo ? <img src={job.company.logo.startsWith("http") ? job.company.logo : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${job.company.logo}`} alt={`${job.company.companyName} logo`} /> : <b>{job.company.companyName[0]}</b>}</div>
                <h3>{job.title}</h3>
                <p>{job.company.companyName} · {job.cityLocation}{job.distance !== null && job.distance !== undefined ? ` · ${job.distance.toFixed(1)} km` : ""}</p>
                <aside><span>{categoryLabel(job.category)}</span><span>{salary(job)}</span></aside>
                <a href={`/jobs/${job.slug}`}>View role <ArrowRight /></a>
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
          {jobsLoading && Array.from({ length: 4 }, (_, index) => (
            <article className="nearby-card is-loading" aria-label="Loading jobs" key={index} />
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
                  <span><b>{job.title} {isNewJob(job.createdAt) && <i className="new-job-badge">NEW</i>} · <em>{job.company.companyName}</em></b><small>{job.reason}</small></span>
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
                <small>Complete your profile to receive tailored recommendations.</small>
              </span>
            </li>
          )}
          {recommendationsLoading && (
            <li className="dashboard-empty-row is-loading" aria-label="Loading recommendations" />
          )}
        </ul>
      </div>
    </section>
  );
}
