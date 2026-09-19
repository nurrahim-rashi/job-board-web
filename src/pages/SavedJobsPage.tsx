import { useEffect, useMemo, useState } from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { SeekerDashboardShell } from "../components/Dashboard/SeekerDashboardShell";
import { Bookmark, MapPin } from "../components/site/Icons";
import { getPublicJob, type PublicJobDetail } from "../services/job.service";
import { useAuth } from "../stores/useAuth";
import { categoryLabel } from "../types/job-posting";
import { DataSkeleton } from "../components/site/DataSkeleton";
import { SeekerDashboardHero } from "../components/Dashboard/SeekerDashboardHero";
import { formatJobLocation } from "../lib/location";

const PAGE_SIZE = 8;

export default function SavedJobsPage() {
  const user = useAuth((state) => state.user);
  const [jobs, setJobs] = useState<PublicJobDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const storageKey = `polaris-saved-jobs-${user?.id ?? "guest"}`;

  useEffect(() => {
    const slugs = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as string[];
    Promise.all(slugs.map((slug) => getPublicJob(slug).catch(() => null)))
      .then((items) => setJobs(items.filter((job): job is PublicJobDetail => Boolean(job))))
      .finally(() => setLoading(false));
  }, [storageKey]);

  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const visibleJobs = useMemo(() => jobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [jobs, page]);

  function removeSaved(slug: string) {
    const next = jobs.filter((job) => job.slug !== slug);
    setJobs(next);
    localStorage.setItem(storageKey, JSON.stringify(next.map((job) => job.slug)));
    if ((page - 1) * PAGE_SIZE >= next.length && page > 1) setPage(page - 1);
  }

  return <div className="workspace-dashboard seeker-dashboard-overview"><Navbar /><main>
    <SeekerDashboardHero />
    <SeekerDashboardShell><section className="seeker-application-page-card">
      <header className="seeker-card-heading"><p className="eyebrow">Your shortlist</p><h2>Jobs you saved</h2></header>
      {loading ? <DataSkeleton count={5} /> : visibleJobs.length ? <div className="saved-job-list">{visibleJobs.map((job) => <article key={job.slug}><a href={`/jobs/${job.slug}`}><span><b>{job.title}</b><small>{job.company.companyName}</small><small><MapPin />{formatJobLocation(job)} · {categoryLabel(job.category)}</small></span></a><button type="button" onClick={() => removeSaved(job.slug)}><Bookmark />Remove</button></article>)}</div> : <div className="seeker-menu-empty"><Bookmark /><h3>No saved jobs yet.</h3><p>Save a role from its job detail page and it will appear here.</p><a className="admin-btn" href="/jobs">Browse jobs</a></div>}
      {!loading && jobs.length > 0 && <footer className="seeker-pagination"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></footer>}
    </section></SeekerDashboardShell>
  </main><Footer /></div>;
}
