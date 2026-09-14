import { useEffect, useState } from "react";
import { getPublicJobs, type PublicJob } from "../../services/job.service";
import { ArrowRight } from "../site/Icons";
import { Stars } from "../site/Stars";
import { isNewJob } from "../../lib/job-age";

function salary(job: PublicJob) {
  if (job.salaryMin === null && job.salaryMax === null) return "Salary not listed";
  const format = (amount: number | null) => amount === null ? "" : `Rp ${(amount / 1_000_000).toLocaleString("id-ID")} jt`;
  return [format(job.salaryMin), format(job.salaryMax)].filter(Boolean).join("–");
}

export function HeroSection() {
  const [latestJobs, setLatestJobs] = useState<PublicJob[]>([]);
  useEffect(() => { getPublicJobs({ limit: 5 }).then(setLatestJobs).catch(() => setLatestJobs([])); }, []);
  return <section className="hero-night"><div className="night-sky" /><div className="night-overlay" /><Stars /><div className="hero-wrap"><div className="hero-copy"><h1>Five new roles.<br />Every Monday.</h1><p className="hero-lede">A curated job portal with hand-read listings, honest pay bands, and companies that actually answer.</p><div className="hero-actions"><a className="button button-light" href="/jobs">Browse jobs</a><a className="button button-outline" href="#services">I&rsquo;m hiring <ArrowRight /></a></div></div><div className="latest-drop float-slow"><div className="drop-title"><span>Latest drop</span></div><ul>{latestJobs.length ? latestJobs.map((job) => <li key={job.id}><a href={`/jobs/${job.slug}`}><span><b>{job.title} {isNewJob(job.createdAt) && <i className="new-job-badge">NEW</i>}</b><small>{job.company.companyName} · {job.cityLocation} · {salary(job)}</small></span><ArrowRight /></a></li>) : <li className="latest-empty">No published roles yet.</li>}</ul></div></div></section>;
}
