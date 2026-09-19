import { useCallback, useEffect, useState } from "react";
import { getPublicJobs, type PublicJob } from "../../services/job.service";
import { isNewJob } from "../../lib/job-age";
import { ArrowRight } from "../site/Icons";
import { Stars } from "../site/Stars";
import { AuthModal } from "../site/AuthModal";
import { formatJobLocation } from "../../lib/location";
import { formatCurrencyRange } from "../../lib/currency";

function salary(job: PublicJob) {
  return formatCurrencyRange(job.salaryMin, job.salaryMax, job.salaryCurrency, true);
}

export function HeroSection() {
  const [latestJobs, setLatestJobs] = useState<PublicJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const loadLatestJobs = useCallback(() => {
    setJobsLoading(true);
    setJobsError(false);
    getPublicJobs({ limit: 5 })
      .then(setLatestJobs)
      .catch(() => {
        setLatestJobs([]);
        setJobsError(true);
      })
      .finally(() => setJobsLoading(false));
  }, []);

  useEffect(() => loadLatestJobs(), [loadLatestJobs]);

  return <>
    <section className="hero-night"><div className="night-sky" /><div className="night-overlay" /><Stars /><div className="hero-wrap"><div className="hero-copy"><h1>Five new roles.<br />Every Monday.</h1><p className="hero-lede">A curated job portal with hand-read listings, honest pay bands, and companies that actually answer.</p><div className="hero-actions"><a className="button button-light" href="/jobs">Browse jobs</a><button className="button button-outline" type="button" onClick={() => setAuthOpen(true)}>I&rsquo;m hiring <ArrowRight /></button></div></div><div className="latest-drop float-slow"><div className="drop-title"><span>Latest drop</span></div><ul>{jobsLoading ? Array.from({ length: 3 }, (_, index) => <li className="latest-drop-skeleton" key={index}><span /><small /></li>) : jobsError ? <li className="latest-empty latest-error"><span>Couldn&rsquo;t reach the latest job feed.</span><button type="button" onClick={loadLatestJobs}>Try again</button></li> : latestJobs.length ? latestJobs.map((job) => <li key={job.id}><a href={`/jobs/${job.slug}`}><span><b>{job.title} {isNewJob(job.createdAt) && <i className="new-job-badge">NEW</i>}</b><small>{job.company.companyName} · {formatJobLocation(job)} · {salary(job)}</small></span><ArrowRight /></a></li>) : <li className="latest-empty">No published roles yet.</li>}</ul></div></div></section>
    <AuthModal open={authOpen} initialMode="register" initialRole="COMPANY_ADMIN" onClose={() => setAuthOpen(false)} />
  </>;
}
