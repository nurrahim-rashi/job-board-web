import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AdminShell } from "../components/Admin/AdminShell";
import { formatDate, questionCount } from "../components/Admin/adminData";
import { useApplicants } from "../components/Admin/adminStore";
import { useJobPostings } from "../hooks/api/job-posting/useJobPostings";
import { ArrowRight, Search } from "../components/site/Icons";

export default function AdminApplicantsPage() {
  const { search } = useLocation();
  const jobs = useJobPostings({ limit: 50 }).data?.jobs ?? [];
  const applicants = useApplicants();
  const [query, setQuery] = useState("");
  const [jobId, setJobId] = useState("all");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return applicants.filter((applicant) => {
      if (term && !applicant.name.toLowerCase().includes(term)) return false;
      if (jobId !== "all" && applicant.jobId !== jobId) return false;
      return true;
    });
  }, [applicants, jobId, query]);

  const titleOf = (slug: string) => jobs.find((job) => job.slug === slug)?.title ?? "Deleted posting";

  return (
    <AdminShell eyebrow="Applicants" title="Everyone who applied" lead="Test scores come from the pre-selection test attached to each posting.">
      <section className="admin-filters">
        <label className="admin-search">
          <Search />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name" />
        </label>
        <select value={jobId} onChange={(event) => setJobId(event.target.value)}>
          <option value="all">All postings</option>
          {jobs.map((job) => (
            <option key={job.slug} value={job.slug}>
              {job.title}
            </option>
          ))}
        </select>
      </section>

      {results.length ? (
        <div className="admin-table applicants">
          <div className="admin-row admin-row-head">
            <span>Applicant</span>
            <span>Applied for</span>
            <span>Applied</span>
            <span>Test score</span>
            <span>Status</span>
            <span />
          </div>
          {results.map((applicant) => (
            <div key={applicant.id} className="admin-row">
              <span className="admin-role">
                <b>{applicant.name}</b>
                <small>{applicant.education}</small>
              </span>
              <span>{titleOf(applicant.jobId)}</span>
              <span>{formatDate(applicant.appliedAt)}</span>
              <span>
                {applicant.testScore == null ? (
                  <em className="admin-chip">No test</em>
                ) : (
                  <em className={`admin-chip ${applicant.testScore >= 18 ? "good" : "wait"}`}>
                    {applicant.testScore}/{questionCount}
                  </em>
                )}
              </span>
              <span>{applicant.status}</span>
              <span className="admin-row-actions">
                <Link to={{ pathname: `/admin/jobs/${applicant.jobId}`, search }}>
                  Posting <ArrowRight />
                </Link>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-empty">
          <h2>{applicants.length ? "No applicants match that search." : "No applicants yet."}</h2>
          {applicants.length ? null : <p className="admin-note">Publish a posting and share the link to start receiving applicants.</p>}
        </div>
      )}
    </AdminShell>
  );
}
