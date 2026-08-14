import type { Job } from "../../types/job";

export default function JobCard({ job }: { job: Job }) {
  return (
    <article className="job-card">
      <div className="job-topline"><div className="company-logo" style={{ background: job.accent }}>{job.logo}</div><span>{job.postedAt}</span></div>
      <h3>{job.title}</h3>
      <p className="company-name">{job.company}</p>
      <div className="job-meta"><span>⌖ {job.location}</span><span>◷ {job.type}</span></div>
      <div className="job-footer"><strong>{job.salary}</strong><button aria-label={`Simpan lowongan ${job.title}`}>♡</button></div>
    </article>
  );
}
