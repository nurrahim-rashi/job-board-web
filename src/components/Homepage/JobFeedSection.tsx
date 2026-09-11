import { useEffect, useState } from "react";
import { getPublicJobs, type PublicJob } from "../../services/job.service";
import type { HomepageData } from "../../types/auth";
import { Reveal } from "../../hooks/useReveal";
import { ArrowRight, Bookmark, MapPin, Sparkles } from "../site/Icons";

function salary(job: PublicJob) {
  if (job.salaryMin === null && job.salaryMax === null) return "Salary not listed";
  const format = (amount: number | null) =>
    amount === null ? "" : `Rp ${(amount / 1_000_000).toLocaleString("id-ID")} jt`;
  return [format(job.salaryMin), format(job.salaryMax)].filter(Boolean).join("–");
}

export function JobFeedSection({
  recommendations,
}: {
  recommendations: HomepageData["recommendations"];
}) {
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [location, setLocation] = useState("latest roles");
  const [manualCity, setManualCity] = useState("");
  const [locating, setLocating] = useState(false);
  const [granted, setGranted] = useState(false);

  const loadJobs = (
    options: { latitude?: number; longitude?: number; city?: string } = {},
  ) =>
    getPublicJobs({ ...options, limit: 4 })
      .then(setJobs)
      .catch(() => setJobs([]));

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
      () => setLocating(false),
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
              <p className="eyebrow">{granted ? "Near you" : "Discover roles"}</p>
              <h2>{granted ? "Jobs around you" : `Latest jobs in ${location}`}</h2>
            </div>
            <button onClick={useLocation}>
              <MapPin />
              {locating ? "Locating…" : granted ? "Refresh location" : "Use my location"}
            </button>
          </div>
          {!granted && (
            <div className="location-note">
              <span>Location access is off. Choose a city or browse the newest roles.</span>
              <div className="location-manual">
                <input value={manualCity} onChange={(event) => setManualCity(event.target.value)} placeholder="Choose a city" />
                <button type="button" onClick={useManualCity}>Show jobs</button>
              </div>
            </div>
          )}
        </Reveal>

        <div className="nearby-grid">
          {jobs.map((job, index) => (
            <Reveal key={job.id} delay={index * 80}>
              <article className="nearby-card">
                <div><b>{job.company.companyName[0]}</b><button aria-label={`Save ${job.title}`}><Bookmark /></button></div>
                <h3>{job.title}</h3>
                <p>{job.company.companyName} · {job.cityLocation}{job.distance !== null && job.distance !== undefined ? ` · ${job.distance.toFixed(1)} km` : ""}</p>
                <aside><span>{job.category.replaceAll("_", " ")}</span><span>{salary(job)}</span></aside>
                <a href={`/jobs/${job.slug}`}>View role <ArrowRight /></a>
              </article>
            </Reveal>
          ))}
        </div>
        {!jobs.length && <p className="location-note">No published jobs found for this location.</p>}

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
                  <span><b>{job.title} · <em>{job.company.companyName}</em></b><small>{job.reason}</small></span>
                  <strong>{job.score}%</strong>
                </a>
              </li>
            </Reveal>
          ))}
        </ul>
        {!recommendations.length && <p className="location-note">Complete your profile to find better matches.</p>}
      </div>
    </section>
  );
}
