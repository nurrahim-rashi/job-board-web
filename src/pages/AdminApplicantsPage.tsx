import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AdminShell } from "../components/Admin/AdminShell";
import { ApplicantSection } from "../components/Admin/Applicants/ApplicantSection";
import { useJobPostings } from "../hooks/api/job-posting/useJobPostings";
import { ArrowRight } from "../components/site/Icons";

export default function AdminApplicantsPage() {
  const [params, setParams] = useSearchParams();
  const { data, isPending, isError, error } = useJobPostings({ limit: 50 });
  const jobs = data?.jobs ?? [];
  const [slug, setSlug] = useState(params.get("job") ?? "");

  useEffect(() => {
    if (!slug && jobs.length) setSlug(jobs[0].slug);
  }, [jobs, slug]);

  const selected = jobs.find((job) => job.slug === slug);

  function pick(next: string) {
    setSlug(next);
    setParams(next ? { job: next } : {}, { replace: true });
  }

  return (
    <AdminShell
      eyebrow="Applicants"
      title="Everyone who applied"
      lead="Pick a posting to review its applicants, preview their CV and decide who moves forward."
      actions={
        selected ? (
          <Link className="admin-btn ghost" to={`/admin/jobs/${selected.slug}`}>
            Open posting <ArrowRight />
          </Link>
        ) : null
      }
    >
      {isPending ? (
        <div className="admin-empty">
          <h2>Loading your postings…</h2>
        </div>
      ) : isError ? (
        <div className="admin-empty">
          <h2>{error.message}</h2>
        </div>
      ) : jobs.length ? (
        <>
          <section className="admin-filters">
            <label className="admin-sort">
              <span>Job posting</span>
              <select value={slug} onChange={(event) => pick(event.target.value)}>
                {jobs.map((job) => (
                  <option key={job.slug} value={job.slug}>
                    {job.title} · {job.applicantCount} applied
                  </option>
                ))}
              </select>
            </label>
          </section>
          {slug ? <ApplicantSection key={slug} slug={slug} /> : null}
        </>
      ) : (
        <div className="admin-empty">
          <h2>No postings yet.</h2>
          <p className="admin-note">Create a job posting first — applicants show up here once people apply.</p>
          <Link className="admin-btn primary" to="/admin/jobs/new">
            New job posting
          </Link>
        </div>
      )}
    </AdminShell>
  );
}
