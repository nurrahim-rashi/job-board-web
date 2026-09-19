import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminShell } from "../components/Admin/AdminShell";
import { AdminSelect, type AdminSelectOption } from "../components/Admin/AdminSelect";
import { ConfirmDialog } from "../components/Admin/ConfirmDialog";
import { daysLeft, formatDate, formatSalary } from "../components/Admin/adminData";
import { useJobPostings } from "../hooks/api/job-posting/useJobPostings";
import { useDeleteJobPosting } from "../hooks/api/job-posting/useDeleteJobPosting";
import { useTogglePublishJobPosting } from "../hooks/api/job-posting/useTogglePublishJobPosting";
import { categoryLabel, jobCategories, type JobCategory, type JobListQuery } from "../types/job-posting";
import { ArrowRight, Search } from "../components/site/Icons";
import { isNewJob } from "../lib/job-age";
import { formatJobLocation } from "../lib/location";

type SortKey = "newest" | "oldest" | "title" | "applicants" | "deadline";

const categoryOptions: AdminSelectOption[] = [
  { value: "all", label: "All categories" },
  ...jobCategories.map((item) => ({ value: item.value, label: item.label })),
];

const statusOptions: AdminSelectOption[] = [
  { value: "all", label: "All status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const sortOptions: AdminSelectOption[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title A–Z" },
  { value: "applicants", label: "Most applicants" },
  { value: "deadline", label: "Closing soonest" },
];

const sorting: Record<Exclude<SortKey, "applicants">, Pick<JobListQuery, "sortBy" | "sortOrder">> = {
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  oldest: { sortBy: "createdAt", sortOrder: "asc" },
  title: { sortBy: "title", sortOrder: "asc" },
  deadline: { sortBy: "deadline", sortOrder: "asc" },
};

export default function AdminJobsPage() {
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isPending, isError, error } = useJobPostings({
    limit: 50,
    ...(term && { search: term }),
    ...(category !== "all" && { category: category as JobCategory }),
    ...sorting[sort === "applicants" ? "newest" : sort],
  });

  const togglePublish = useTogglePublishJobPosting();
  const deleteJob = useDeleteJobPosting();

  const jobs = useMemo(() => data?.jobs ?? [], [data]);

  const results = useMemo(() => {
    const visible = jobs.filter((job) => {
      if (status === "published" && !job.isPublished) return false;
      if (status === "draft" && job.isPublished) return false;
      return true;
    });
    return sort === "applicants" ? [...visible].sort((left, right) => right.applicantCount - left.applicantCount) : visible;
  }, [jobs, sort, status]);

  const live = jobs.filter((job) => job.isPublished).length;
  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicantCount, 0);
  const doomed = jobs.find((job) => job.slug === pendingDelete);

  function reset() {
    setQuery("");
    setCategory("all");
    setStatus("all");
    setSort("newest");
  }

  return (
    <AdminShell
      eyebrow="Job postings"
      title="Manage your roles"
      lead="Create, publish and retire the roles your company is hiring for."
      actions={
        <Link className="admin-btn primary" to="/admin/jobs/new">
          New job posting
        </Link>
      }
    >
      <div className="admin-stats">
        <article>
          <span>Live roles</span>
          <b>{live}</b>
          <small>{jobs.length - live} in draft</small>
        </article>
        <article>
          <span>Applicants</span>
          <b>{totalApplicants}</b>
          <small>Across all postings</small>
        </article>
        <article>
          <span>With pre-selection test</span>
          <b>{jobs.filter((job) => job.hasPreSelectionTest).length}</b>
          <small>25 questions each</small>
        </article>
      </div>

      <section className="admin-filters">
        <label className="admin-search">
          <Search />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by job title" />
        </label>
        <AdminSelect
          ariaLabel="Filter by category"
          value={category}
          onChange={setCategory}
          options={categoryOptions}
        />
        <AdminSelect
          ariaLabel="Filter by publish status"
          value={status}
          onChange={setStatus}
          options={statusOptions}
        />
        <AdminSelect label="Sort" value={sort} onChange={(next) => setSort(next as SortKey)} options={sortOptions} />
      </section>

      {isPending ? (
        <div className="admin-empty">
          <h2>Loading your postings…</h2>
        </div>
      ) : isError ? (
        <div className="admin-empty">
          <h2>{error.message}</h2>
        </div>
      ) : results.length ? (
        <div className="admin-table">
          <div className="admin-row admin-row-head">
            <span>Role</span>
            <span>Category</span>
            <span>Applicants</span>
            <span>Deadline</span>
            <span>Published</span>
            <span />
          </div>
          {results.map((job) => (
            <div key={job.slug} className="admin-row">
              <span className="admin-role">
                <b>{job.title} {isNewJob(job.createdAt) && <i className="new-job-badge">NEW</i>}</b>
                <small>
                  {formatJobLocation(job)} · {formatSalary(job)}
                </small>
              </span>
              <span>
                <em className="admin-chip">{categoryLabel(job.category)}</em>
              </span>
              <span>
                <b>{job.applicantCount}</b> applied
              </span>
              <span>
                {formatDate(job.deadline)}
                <small className={daysLeft(job.deadline) < 0 ? "danger" : ""}>
                  {daysLeft(job.deadline) < 0 ? "Closed" : `${daysLeft(job.deadline)} days left`}
                </small>
              </span>
              <span>
                <button
                  type="button"
                  className={`admin-switch ${job.isPublished ? "on" : ""}`}
                  disabled={togglePublish.isPending}
                  onClick={() => togglePublish.mutate({ slug: job.slug, isPublished: !job.isPublished })}
                  aria-label={`${job.isPublished ? "Unpublish" : "Publish"} ${job.title}`}
                >
                  <i />
                </button>
              </span>
              <span className="admin-row-actions">
                <Link to={`/admin/jobs/${job.slug}`}>
                  Detail <ArrowRight />
                </Link>
                <button type="button" onClick={() => setPendingDelete(job.slug)}>
                  Delete
                </button>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-empty">
          <h2>No postings match those filters.</h2>
          <button type="button" className="admin-btn ghost" onClick={reset}>
            Clear filters
          </button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(doomed)}
        title="Delete this posting?"
        body={`${doomed?.title ?? ""} and its applicant history will be removed from your dashboard.`}
        confirmLabel="Delete posting"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteJob.mutate(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </AdminShell>
  );
}
