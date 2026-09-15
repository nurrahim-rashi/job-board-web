import { useEffect, useState } from "react";
import { ArrowRight, Bookmark, MapPin, Share } from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";
import type { PublicJob } from "../../services/job.service";
import { isNewJob } from "../../lib/job-age";
import { categoryLabel } from "../../types/job-posting";
import { DataSkeleton } from "../site/DataSkeleton";
import { useAuth } from "../../stores/useAuth";
import { ShareJobModal } from "../JobDetail/ShareJobModal";

const salary = (job: PublicJob) =>
  job.salaryMin || job.salaryMax
    ? `Rp ${(job.salaryMin ?? 0).toLocaleString("id-ID")}–${(job.salaryMax ?? 0).toLocaleString("id-ID")}`
    : "Salary not disclosed";
const posted = (date: string) => {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000),
  );
  return days ? `Posted ${days} days ago` : "Posted today";
};
export function JobsResults({
  jobs,
  loading,
  onReset,
}: {
  jobs: PublicJob[];
  loading: boolean;
  onReset: () => void;
}) {
  const user = useAuth((state) => state.user);
  const [saved, setSaved] = useState<string[]>([]);
  const [sharing, setSharing] = useState<PublicJob | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
  const storageKey = user ? `polaris-saved-jobs-${user.id}` : "";
  useEffect(() => {
    if (user?.role !== "JOB_SEEKER") {
      setSaved([]);
      return;
    }
    setSaved(JSON.parse(localStorage.getItem(storageKey) ?? "[]") as string[]);
  }, [storageKey, user?.role]);
  useEffect(() => setPage(1), [jobs]);
  const toggleSaved = (slug: string) => {
    const next = saved.includes(slug)
      ? saved.filter((item) => item !== slug)
      : [...saved, slug];
    setSaved(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };
  if (loading)
    return (
      <section className="browse-results">
        <div>
          <div className="data-skeleton-heading" />
          <DataSkeleton count={6} layout="cards" />
        </div>
      </section>
    );
  return (
    <>
      <section className="browse-results">
        <div>
          <p className="browse-count">
            {jobs.length} role{jobs.length === 1 ? "" : "s"} found
          </p>
          {jobs.length ? (
            <>
              <div className="browse-job-grid">
                {jobs
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((job, index) => (
                    <Reveal key={job.slug} delay={Math.min(index, 6) * 70}>
                      <article className="browse-job-card">
                        <div className="browse-card-top">
                          {job.company.logo ? (
                            <img
                              src={
                                job.company.logo.startsWith("http")
                                  ? job.company.logo
                                  : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${job.company.logo}`
                              }
                              alt={`${job.company.companyName} logo`}
                            />
                          ) : (
                            <span>{job.company.companyName[0]}</span>
                          )}
                          <div className="browse-card-actions">
                            {isNewJob(job.createdAt) && (
                              <span className="new-job-badge">NEW</span>
                            )}
                            {user?.role === "JOB_SEEKER" && (
                              <>
                                <button
                                  type="button"
                                  className={
                                    saved.includes(job.slug) ? "saved" : ""
                                  }
                                  aria-label={`${saved.includes(job.slug) ? "Remove" : "Save"} ${job.title}`}
                                  onClick={() => toggleSaved(job.slug)}
                                >
                                  <Bookmark />
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Share ${job.title}`}
                                  onClick={() => setSharing(job)}
                                >
                                  <Share />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <h2>{job.title}</h2>
                        <p className="browse-company">
                          {job.company.companyName}
                        </p>
                        <p className="browse-location">
                          <MapPin />
                          {job.cityLocation}
                          {job.distance != null
                            ? ` · ${job.distance.toFixed(0)} km`
                            : ""}
                        </p>
                        <div className="browse-tags">
                          <span>{categoryLabel(job.category)}</span>
                          <span>{salary(job)}</span>
                        </div>
                        <small>{posted(job.createdAt)}</small>
                        <a href={`/jobs/${job.slug}`}>
                          View role <ArrowRight />
                        </a>
                      </article>
                    </Reveal>
                  ))}
              </div>
              {totalPages > 1 && (
                <div className="browse-pagination">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((value) => value - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="browse-empty">
              <h2>No roles match those filters.</h2>
              <button
                type="button"
                className="button button-primary"
                onClick={onReset}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
      {sharing && (
        <ShareJobModal
          open
          title={sharing.title}
          company={sharing.company.companyName}
          url={`${window.location.origin}/jobs/${sharing.slug}`}
          onClose={() => setSharing(null)}
        />
      )}
    </>
  );
}
