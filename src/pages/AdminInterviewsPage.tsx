import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AdminShell } from "../components/Admin/AdminShell";
import { InterviewSection } from "../components/Admin/Interviews/InterviewSection";
import { AdminSelect } from "../components/Admin/AdminSelect";
import { useJobPostings } from "../hooks/api/job-posting/useJobPostings";
import { ArrowRight } from "../components/site/Icons";

export default function AdminInterviewsPage() {
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
      eyebrow="Interviews"
      title="Interview scheduling"
      lead="Book shortlisted applicants into their own slot, keep the schedule up to date, and let Polaris handle the invitation and H-1 reminder emails."
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
            <AdminSelect
              label="Job posting"
              value={slug}
              onChange={pick}
              options={jobs.map((job) => ({
                value: job.slug,
                label: job.title,
                meta: `${job.applicantCount} applied`,
              }))}
            />
          </section>
          {slug ? <InterviewSection key={slug} slug={slug} /> : null}
        </>
      ) : (
        <div className="admin-empty">
          <h2>No postings yet.</h2>
          <p className="admin-note">Create a job posting first — interviews are scheduled per posting.</p>
          <Link className="admin-btn primary" to="/admin/jobs/new">
            New job posting
          </Link>
        </div>
      )}
    </AdminShell>
  );
}
