import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { SeekerDashboardShell } from "../components/Dashboard/SeekerDashboardShell";
import { Bookmark, MapPin } from "../components/site/Icons";
import { getMySavedJobsPage, unsaveJob, type SavedJob } from "../services/saved-job.service";
import { categoryLabel } from "../types/job-posting";
import { DataSkeleton } from "../components/site/DataSkeleton";
import { SeekerDashboardHero } from "../components/Dashboard/SeekerDashboardHero";
import { formatJobLocation } from "../lib/location";

const PAGE_SIZE = 8;

export default function SavedJobsPage() {
  const [items, setItems] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    getMySavedJobsPage(page, PAGE_SIZE)
      .then((result) => {
        setItems(result.items);
        setTotalPages(result.pagination.totalPages);
      })
      .catch((error) => {
        setItems([]);
        toast.error(error instanceof Error ? error.message : "Unable to load saved jobs.");
      })
      .finally(() => setLoading(false));
  }, [page]);

  async function removeSaved(slug: string) {
    const previous = items;
    setItems((current) => current.filter((item) => item.job.slug !== slug));
    try {
      await unsaveJob(slug);
      if (items.length === 1 && page > 1) setPage(page - 1);
    } catch (error) {
      setItems(previous);
      toast.error(error instanceof Error ? error.message : "Unable to remove saved job.");
    }
  }

  return <div className="workspace-dashboard seeker-dashboard-overview"><Navbar /><main>
    <SeekerDashboardHero />
    <SeekerDashboardShell><section className="seeker-application-page-card">
      <header className="seeker-card-heading"><p className="eyebrow">Your shortlist</p><h2>Jobs you saved</h2></header>
      {loading ? <DataSkeleton count={5} /> : items.length ? <div className="saved-job-list">{items.map(({ job }) => <article key={job.slug}><a href={`/jobs/${job.slug}`}><span><b>{job.title}</b><small>{job.company.companyName}</small><small><MapPin />{formatJobLocation(job)} · {categoryLabel(job.category)}</small></span></a><button type="button" onClick={() => void removeSaved(job.slug)}><Bookmark />Remove</button></article>)}</div> : <div className="seeker-menu-empty"><Bookmark /><h3>No saved jobs yet.</h3><p>Save a role from its job detail page and it will appear here.</p><a className="admin-btn" href="/jobs">Browse jobs</a></div>}
      {!loading && totalPages > 1 && <footer className="seeker-pagination"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></footer>}
    </section></SeekerDashboardShell>
  </main><Footer /></div>;
}
