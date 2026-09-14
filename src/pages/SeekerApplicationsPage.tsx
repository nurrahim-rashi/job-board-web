import { useEffect, useState } from "react";
import { ApplicationDetailModal } from "../components/Application/ApplicationDetailModal";
import { SeekerDashboardShell } from "../components/Dashboard/SeekerDashboardShell";
import { getMyApplicationsPage, type Application, type ApplicationPage } from "../services/application.service";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Stars } from "../components/site/Stars";
import { applicationStatusLabel } from "../lib/application-status";

export default function SeekerApplicationsPage({ view }: { view?: "interviews" | "tests" | "closed" }) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ApplicationPage | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const title = view === "interviews" ? "Interviews" : view === "tests" ? "Pre-selection tests" : view === "closed" ? "Closed jobs" : "All jobs applied";
  const cardTitle = view === "interviews" ? "Your interviews" : view === "tests" ? "Your assigned tests" : view === "closed" ? "Your closed applications" : "Your applications";
  useEffect(() => { setResult(null); getMyApplicationsPage(page, view).then(setResult).catch(() => setResult({ items: [], pagination: { page, limit: 8, total: 0, totalPages: 1 } })); }, [page, view]);
  const description = view === "interviews" ? "Keep every interview time and meeting detail close." : view === "tests" ? "Complete tests assigned by hiring teams." : view === "closed" ? "Review applications that have reached a final decision." : "Review every role you have applied for and its latest status.";
  return <div className="workspace-dashboard seeker-dashboard-overview"><Navbar /><main>
    <section className="workspace-hero seeker-list-hero"><div className="night-sky" /><Stars /><div className="workspace-hero-inner"><p className="eyebrow light">Applications</p><h1>{title}</h1><p>{description}</p></div></section>
    <SeekerDashboardShell><section className="seeker-application-page-card"><header className="seeker-card-heading"><p className="eyebrow">Application workspace</p><h2>{cardTitle}</h2></header>{result ? <>{result.items.length ? <div className="seeker-application-table">{result.items.map((application: Application) => <article key={application.id}><button type="button" onClick={() => setSelected(application.id)}><span><b>{application.job.title}</b><small>{application.job.company.companyName} · {application.job.cityLocation}</small></span><em>{applicationStatusLabel(application.status)}</em>{view === "interviews" && application.interview ? <small>{new Date(application.interview.interviewDate).toLocaleString()}</small> : null}</button>{view === "tests" ? <a href={`/jobs/${application.job.slug}/pre-selection-test`}>Start test</a> : null}</article>)}</div> : <div className="seeker-menu-empty"><h3>No {title.toLowerCase()} yet.</h3><p>{description}</p></div>}
      <footer className="seeker-pagination"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {result.pagination.page} of {result.pagination.totalPages}</span><button disabled={page >= result.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></footer></> : <div className="seeker-menu-empty"><h3>Loading…</h3></div>}</section>
    <ApplicationDetailModal applicationId={selected} onClose={() => setSelected(null)} />
  </SeekerDashboardShell></main><Footer /></div>;
}
