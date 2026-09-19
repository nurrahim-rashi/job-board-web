import { useEffect, useState } from "react";
import { ApplicationDetailModal } from "../components/Application/ApplicationDetailModal";
import { countdownLabel } from "../components/Admin/Interviews/interviewHelpers";
import { SeekerDashboardHero } from "../components/Dashboard/SeekerDashboardHero";
import { SeekerDashboardShell } from "../components/Dashboard/SeekerDashboardShell";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { DataSkeleton } from "../components/site/DataSkeleton";
import { StatusBadge } from "../components/site/StatusBadge";
import { statusColor } from "../lib/status";
import { formatJobLocation } from "../lib/location";
import {
  getMyApplicationsPage,
  type Application,
  type ApplicationPage,
} from "../services/application.service";

type View = "interviews" | "tests" | "closed";
const interviewFilters = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const;
const closedFilters = ["ACCEPTED", "REJECTED"] as const;
const titleCase = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function SeekerApplicationsPage({ view }: { view?: View }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<ApplicationPage | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const title = view === "interviews" ? "Interviews" : view === "tests" ? "Pre-selection tests" : view === "closed" ? "Closed jobs" : "All jobs applied";
  const cardTitle = view === "interviews" ? "Your interviews" : view === "tests" ? "Your assigned tests" : view === "closed" ? "Your closed applications" : "Your applications";
  const filters = view === "interviews" ? interviewFilters : view === "closed" ? closedFilters : [];

  useEffect(() => {
    setPage(1);
    setStatus("");
  }, [view]);

  useEffect(() => {
    let cancelled = false;
    setResult(null);
    void getMyApplicationsPage(page, view, status || undefined)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setResult({ items: [], pagination: { page, limit: 8, total: 0, totalPages: 1 } });
      });
    return () => { cancelled = true; };
  }, [page, status, view]);

  const description = view === "interviews" ? "Keep every interview time and meeting detail close." : view === "tests" ? "Complete tests assigned by hiring teams." : view === "closed" ? "Review applications that have reached a final decision." : "Review every role you have applied for and its latest status.";

  return (
    <div className="workspace-dashboard seeker-dashboard-overview">
      <Navbar />
      <main>
        <SeekerDashboardHero />
        <SeekerDashboardShell>
          <section className="seeker-application-page-card">
            <header className="seeker-card-heading seeker-card-heading-with-filter">
              <div><p className="eyebrow">Application workspace</p><h2>{cardTitle}</h2></div>
              {filters.length > 0 && (
                <label className="seeker-status-filter">
                  <span>Status</span>
                  <select
                    value={status}
                    style={status ? { borderColor: statusColor(status), color: statusColor(status) } : undefined}
                    onChange={(event) => { setStatus(event.target.value); setPage(1); }}
                  >
                    <option value="">All statuses</option>
                    {filters.map((filter) => <option key={filter} value={filter} style={{ color: statusColor(filter) }}>{titleCase(filter)}</option>)}
                  </select>
                </label>
              )}
            </header>
            {result ? (
              <>
                {result.items.length ? (
                  <div className="seeker-application-table">
                    {result.items.map((application: Application) => (
                      <article key={application.id}>
                        <button type="button" onClick={() => setSelected(application.id)}>
                          <span><b>{application.job.title}</b><small>{application.job.company.companyName} · {formatJobLocation(application.job)}</small></span>
                          <StatusBadge
                            status={
                              view === "interviews" && application.interview
                                ? application.interview.status
                                : application.status
                            }
                          />
                          {view === "interviews" && application.interview ? <small>{countdownLabel(application.interview.interviewDate)}</small> : null}
                        </button>
                        {view === "tests" ? <a href={`/jobs/${application.job.slug}/pre-selection-test`}>Start test</a> : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="seeker-menu-empty"><h3>No {status ? titleCase(status).toLowerCase() : title.toLowerCase()} yet.</h3><p>{description}</p></div>
                )}
                <footer className="seeker-pagination">
                  <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
                  <span>Page {result.pagination.page} of {result.pagination.totalPages}</span>
                  <button disabled={page >= result.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
                </footer>
              </>
            ) : <DataSkeleton count={5} />}
          </section>
          <ApplicationDetailModal applicationId={selected} onClose={() => setSelected(null)} />
        </SeekerDashboardShell>
      </main>
      <Footer />
    </div>
  );
}
