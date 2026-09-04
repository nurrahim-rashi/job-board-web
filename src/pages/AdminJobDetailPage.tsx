import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminShell } from "../components/Admin/AdminShell";
import { ConfirmDialog } from "../components/Admin/ConfirmDialog";
import { ApplicantSection } from "../components/Admin/Applicants/ApplicantSection";
import { daysLeft, formatDate, formatSalary, questionCount } from "../components/Admin/adminData";
import { useJobPosting } from "../hooks/api/job-posting/useJobPosting";
import { useDeleteJobPosting } from "../hooks/api/job-posting/useDeleteJobPosting";
import { useTogglePublishJobPosting } from "../hooks/api/job-posting/useTogglePublishJobPosting";
import { categoryLabel } from "../types/job-posting";
import { ArrowLeft, Clipboard } from "../components/site/Icons";

export default function AdminJobDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { data: job, isPending, isError, error } = useJobPosting(slug);
  const togglePublish = useTogglePublishJobPosting();
  const deleteJob = useDeleteJobPosting();
  const [confirmDelete, setConfirmDelete] = useState(false);

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
          <Link className="admin-btn ghost" to="/admin">
            Back to job postings
          </Link>
        </div>
      </AdminShell>
    );
  }

  const written = job.totalQuestionPreSelectionTest;

  return (
    <AdminShell
      eyebrow="Job posting"
      title={job.title}
      lead={`${job.cityLocation} · ${formatSalary(job)}`}
      actions={
        <>
          <Link className="admin-btn ghost" to="/admin">
            <ArrowLeft /> Back
          </Link>
          <Link className="admin-btn ghost" to={`/admin/jobs/${job.slug}/edit`}>
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
          <Link className="admin-btn primary block" to={`/admin/jobs/${job.slug}/test`}>
            <Clipboard /> {written ? "Edit test questions" : "Build the test"}
          </Link>
        </section>
      </div>

      <ApplicantSection slug={job.slug} />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this posting?"
        body={`${job.title} and its applicant history will be removed from your dashboard.`}
        confirmLabel="Delete posting"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteJob.mutateAsync(job.slug).catch(() => null);
          navigate("/admin");
        }}
      />
    </AdminShell>
  );
}
