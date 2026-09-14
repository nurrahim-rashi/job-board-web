import { ArrowRight, MapPin } from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";
import type { PublicJob } from "../../services/job.service";
import { isNewJob } from "../../lib/job-age";
import { categoryLabel } from "../../types/job-posting";

const salary = (job: PublicJob) => job.salaryMin || job.salaryMax ? `Rp ${(job.salaryMin ?? 0).toLocaleString("id-ID")}–${(job.salaryMax ?? 0).toLocaleString("id-ID")}` : "Salary not disclosed";
const posted = (date: string) => { const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)); return days ? `Posted ${days} days ago` : "Posted today"; };
export function JobsResults({ jobs, loading, onReset }: { jobs: PublicJob[]; loading: boolean; onReset: () => void }) {
  if (loading) return <section className="browse-results"><div><p className="browse-count">Loading roles…</p></div></section>;
  return <section className="browse-results"><div><p className="browse-count">{jobs.length} role{jobs.length === 1 ? "" : "s"} found</p>{jobs.length ? <div className="browse-job-grid">{jobs.map((job, index) => <Reveal key={job.slug} delay={Math.min(index, 6) * 70}><article className="browse-job-card">{isNewJob(job.createdAt) && <span className="new-job-badge">NEW</span>}<div className="browse-card-top">{job.company.logo ? <img src={job.company.logo.startsWith("http") ? job.company.logo : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${job.company.logo}`} alt={`${job.company.companyName} logo`} /> : <span>{job.company.companyName[0]}</span>}</div><h2>{job.title}</h2><p className="browse-company">{job.company.companyName}</p><p className="browse-location"><MapPin />{job.cityLocation}{job.distance != null ? ` · ${job.distance.toFixed(0)} km` : ""}</p><div className="browse-tags"><span>{categoryLabel(job.category)}</span><span>{salary(job)}</span></div><small>{posted(job.createdAt)}</small><a href={`/jobs/${job.slug}`}>View role <ArrowRight /></a></article></Reveal>)}</div> : <div className="browse-empty"><h2>No roles match those filters.</h2><button type="button" className="button button-primary" onClick={onReset}>Clear filters</button></div>}</div></section>;
}
