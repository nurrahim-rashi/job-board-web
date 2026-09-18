import { useEffect, useState } from "react";
import { getPublicJobs, type PublicJob } from "../../services/job.service";
import { isNewJob } from "../../lib/job-age";
import { ArrowRight } from "../site/Icons";
import { Stars } from "../site/Stars";
import { AuthModal } from "../site/AuthModal";
import { formatJobLocation } from "../../lib/location";

function salary(job: PublicJob) {
  if (job.salaryMin === null && job.salaryMax === null) return "Salary not listed";
  const format = (amount: number | null) => amount === null ? "" : `Rp ${(amount / 1_000_000).toLocaleString("id-ID")} jt`;
  return [format(job.salaryMin), format(job.salaryMax)].filter(Boolean).join("–");
}

export function HeroSection() {
  const [latestJobs, setLatestJobs] = useState<PublicJob[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  useEffect(() => { getPublicJobs({ limit: 5 }).then(setLatestJobs).catch(() => setLatestJobs([])); }, []);
  return <>
    <section className="hero-night"><div className="night-sky" /><div className="night-overlay" /><Stars /><div className="hero-wrap"><div className="hero-copy"><h1>Five new roles.<br />Every Monday.</h1><p className="hero-lede">A curated job portal with hand-read listings, honest pay bands, and companies that actually answer.</p><div className="hero-actions"><a className="button button-light" href="/jobs">Browse jobs</a><button className="button button-outline" type="button" onClick={() => setAuthOpen(true)}>I&rsquo;m hiring <ArrowRight /></button></div></div><div className="latest-drop float-slow"><div className="drop-title"><span>Latest drop</span></div><ul>{latestJobs.length ? latestJobs.map((job) => <li key={job.id}><a href={`/jobs/${job.slug}`}><span><b>{job.title} {isNewJob(job.createdAt) && <i className="new-job-badge">NEW</i>}</b><small>{job.company.companyName} · {formatJobLocation(job)} · {salary(job)}</small></span><ArrowRight /></a></li>) : <li className="latest-empty">No published roles yet.</li>}</ul></div></div></section>
    <AuthModal open={authOpen} initialMode="register" initialRole="COMPANY_ADMIN" onClose={() => setAuthOpen(false)} />
  </>;
}
