import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AdminShell } from "../components/Admin/AdminShell";
import { ConfirmDialog } from "../components/Admin/ConfirmDialog";
import { daysLeft, formatDate, formatSalary, questionCount } from "../components/Admin/adminData";
import { useApplicants } from "../components/Admin/adminStore";
import { useJobPosting } from "../hooks/api/job-posting/useJobPosting";
import { useDeleteJobPosting } from "../hooks/api/job-posting/useDeleteJobPosting";
import { useTogglePublishJobPosting } from "../hooks/api/job-posting/useTogglePublishJobPosting";
import { categoryLabel } from "../types/job-posting";
import { ArrowLeft, ArrowRight, Clipboard, FileText } from "../components/site/Icons";

type ApplicantSort = "newest" | "score" | "salary";

export default function AdminJobDetailPage() {
  const { slug = "" } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { data: job, isPending, isError, error } = useJobPosting(slug);
  const applicants = useApplicants(slug);
  const togglePublish = useTogglePublishJobPosting();
  const deleteJob = useDeleteJobPosting();
  const [sort, setSort] = useState<ApplicantSort>("newest");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const ranked = useMemo(
    () =>
      [...applicants].sort((left, right) => {
        if (sort === "score") return (right.testScore ?? -1) - (left.testScore ?? -1);
        if (sort === "salary") return Number(left.expectedSalary) - Number(right.expectedSalary);
        return +new Date(right.appliedAt) - +new Date(left.appliedAt);
      }),
    [applicants, sort],
  );

  if (isPending) {
    return (
      <AdminShell eyebrow="Job posting" title="Loading posting…">
        <div className="admin-empty">
          <h2>Fetching this posting from your dashboard.</h2>
        </div>
      </AdminShell>
    );
  }

  if (isError || !job) {
    return (
      <AdminShell eyebrow="Job postings" title="Posting not found">
        <div className="admin-empty">
          <h2>{error?.message ?? "That posting is no longer in your dashboard."}</h2>
          <Link className="admin-btn ghost" to={{ pathname: "/admin", search }}>
            Back to job postings
          </Link>
        </div>
      </AdminShell>
    );
  }

  const written = job.totalQuestionPreSelectionTest;
  const scored = applicants.filter((applicant) => applicant.testScore != null);
  const average = scored.length ? Math.round(scored.reduce((sum, applicant) => sum + (applicant.testScore ?? 0), 0) / scored.length) : null;

  return (
    <AdminShell
      eyebrow="Job posting"
      title={job.title}
      lead={`${job.cityLocation} · ${formatSalary(job)}`}
      actions={
        <>
          <Link className="admin-btn ghost" to={{ pathname: "/admin", search }}>
            <ArrowLeft /> Back
          </Link>
          <Link className="admin-btn ghost" to={{ pathname: `/admin/jobs/${job.slug}/edit`, search }}>
            Edit
          </Link>
          <button type="button" className="admin-btn danger" onClick={() => setConfirmDelete(true)}>
            Delete
          </button>
        </>
      }
    >
      <div className="admin-detail-grid">
        <section className="admin-card">
          <div className="admin-detail-head">
            <div>
              <p className="eyebrow">Status</p>
              <h2>{job.isPublished ? "Published" : "Draft"}</h2>
              <p className="admin-note">
                {daysLeft(job.deadline) < 0 ? "Applications closed" : `Closes ${formatDate(job.deadline)} · ${daysLeft(job.deadline)} days left`}
              </p>
            </div>
            <button
              type="button"
              className={`admin-switch ${job.isPublished ? "on" : ""}`}
              disabled={togglePublish.isPending}
              onClick={() => togglePublish.mutate({ slug: job.slug, isPublished: !job.isPublished })}
              aria-label={job.isPublished ? "Unpublish posting" : "Publish posting"}
            >
              <i />
            </button>
          </div>
          <p className="admin-description">{job.description}</p>
          <div className="admin-tags">
            <span className="plain">{categoryLabel(job.category)}</span>
            {(job.tags ?? []).map((item) => (
              <span key={item} className="plain">
                {item}
              </span>
            ))}
          </div>
          <dl className="admin-meta">
            <div>
              <dt>Posted</dt>
              <dd>{formatDate(job.createdAt)}</dd>
            </div>
            <div>
              <dt>Applicants</dt>
              <dd>{job.totalApplicant}</dd>
            </div>
            <div>
              <dt>Banner</dt>
              <dd>{job.banner ? "Uploaded" : "None"}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-card">
          <p className="eyebrow">Pre-selection test</p>
          <h2>{job.hasPreSelectionTest ? "Required" : "Not required"}</h2>
          <p className="admin-note">
            {job.hasPreSelectionTest ? `${written} of ${questionCount} questions written · ${job.testDurationMinutes ?? 30} minute limit` : "Build the 25 questions, then switch the test on from the test builder to screen applicants before they apply."}
          </p>
          <div className="admin-progress">
            <i style={{ width: `${(written / questionCount) * 100}%` }} />
          </div>
          {average != null ? <p className="admin-note">Average score so far: {average}/{questionCount}</p> : null}
          <Link className="admin-btn primary block" to={{ pathname: `/admin/jobs/${job.slug}/test`, search }}>
            <Clipboard /> {written ? "Edit test questions" : "Build the test"}
          </Link>
        </section>
      </div>

      <section className="admin-card">
        <div className="admin-detail-head">
          <div>
            <p className="eyebrow">Applicants</p>
            <h2>{job.totalApplicant} people applied</h2>
          </div>
          <div className="admin-sort">
            <label htmlFor="applicant-sort">Sort</label>
            <select id="applicant-sort" value={sort} onChange={(event) => setSort(event.target.value as ApplicantSort)}>
              <option value="newest">Newest first</option>
              <option value="score">Highest test score</option>
              <option value="salary">Lowest expected salary</option>
            </select>
          </div>
        </div>
        {ranked.length ? (
          <div className="admin-table applicants">
            <div className="admin-row admin-row-head">
              <span>Applicant</span>
              <span>Expected salary</span>
              <span>Applied</span>
              <span>Test score</span>
              <span>Status</span>
              <span />
            </div>
            {ranked.map((applicant) => (
              <div key={applicant.id} className="admin-row">
                <span className="admin-role">
                  <b>{applicant.name}</b>
                  <small>{applicant.education}</small>
                </span>
                <span>Rp {Number(applicant.expectedSalary).toLocaleString("id-ID")}</span>
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
                  <a href="#cv">
                    <FileText /> CV
                  </a>
                  <a href="#profile">
                    Profile <ArrowRight />
                  </a>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-empty">
            <h2>No applications yet.</h2>
            <p className="admin-note">Publish the posting and share the link to start receiving applicants.</p>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this posting?"
        body={`${job.title} and its applicant history will be removed from your dashboard.`}
        confirmLabel="Delete posting"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteJob.mutateAsync(job.slug).catch(() => null);
          navigate({ pathname: "/admin", search });
        }}
      />
    </AdminShell>
  );
}
