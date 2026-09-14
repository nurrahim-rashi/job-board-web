import { Link } from "react-router-dom";
import { AdminShell } from "../components/Admin/AdminShell";
import { questionCount } from "../components/Admin/adminData";
import { useJobPostings } from "../hooks/api/job-posting/useJobPostings";
import { categoryLabel } from "../types/job-posting";
import { ArrowRight, Clipboard } from "../components/site/Icons";
import { TestSummary } from "../components/Admin/TestSummary";

export default function AdminTestsPage() {
  const { data, isPending } = useJobPostings({ limit: 50 });
  const jobs = data?.jobs ?? [];
  return (
    <AdminShell eyebrow="Pre-selection tests" title="Screen before they apply" lead={`Each test holds ${questionCount} multiple choice questions tied to one posting.`}>
      {isPending ? (
        <div className="admin-empty">
          <h2>Loading your postings…</h2>
        </div>
      ) : jobs.length ? (
        <div className="admin-test-list">
          {jobs.map((job) => (
            <article key={job.slug} className="admin-card">
              <div className="admin-detail-head">
                <div>
                  <p className="eyebrow">{categoryLabel(job.category)}</p>
                  <h2>{job.title}</h2>
                </div>
                <em className={`admin-chip ${job.hasPreSelectionTest ? "good" : ""}`}>{job.hasPreSelectionTest ? "Test on" : "Test off"}</em>
              </div>
              <TestSummary saved={job.questionCount} />
              <Link className="admin-btn ghost" to={`/admin/jobs/${job.slug}/test`}>
                <Clipboard /> Open test builder <ArrowRight />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-empty">
          <h2>Create a posting first, then attach a test to it.</h2>
        </div>
      )}
    </AdminShell>
  );
}
