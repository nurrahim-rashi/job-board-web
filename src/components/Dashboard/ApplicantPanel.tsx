import { useState } from "react";
import type { Application } from "../../services/application.service";
import type { HomepageData } from "../../types/auth";
import { ApplicationDetailModal } from "../Application/ApplicationDetailModal";
import { ArrowRight, FileText, Sparkles } from "../site/Icons";
import { applicationStatusLabel } from "../../lib/application-status";

export function ApplicantPanel({ applications, recommendations, error = "" }: {
  applications: Application[];
  recommendations: HomepageData["recommendations"];
  error?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  return <section className="role-panel seeker-overview-panel">
    <article className="panel-card">
      <p className="eyebrow">Your applications</p><h2>Where things stand</h2>
      {error && <p className="profile-error">{error}</p>}
      <ul className="workspace-list">{applications.slice(0, 5).map((application) => <li key={application.id}><button className="application-row-button" type="button" onClick={() => setSelected(application.id)}><FileText /><span><b>{application.job.title}</b><small>{application.job.company.companyName} · {applicationStatusLabel(application.status)}</small></span><em className={application.status === "REJECTED" ? "wait" : "good"}>{applicationStatusLabel(application.status)}</em></button></li>)}{!applications.length && !error && <li><span><small>No applications yet.</small></span></li>}</ul>
      <a href="/dashboard/applications">View all applications <ArrowRight /></a>
    </article>
    <article className="panel-card recommendation-card">
      <p className="eyebrow">Picked for you</p><h2>Roles that fit your signals</h2>
      <ul className="recommendation-list">{recommendations.map((job) => <li key={job.id}><Sparkles /><span><b>{job.title}</b><small>{job.company.companyName} · {job.reason}</small></span><strong>{job.score}% match</strong><a href={`/jobs/${job.slug}`} aria-label={`View ${job.title}`}><ArrowRight /></a></li>)}{!recommendations.length && <li className="recommendation-empty"><span><b>No recommendations yet</b><small>Complete your profile to improve your matches.</small></span></li>}</ul>
    </article>
    <article className="panel-card priority-upgrade-card">
      <div><p className="eyebrow">Polaris Pro</p><h2>Move up for priority review</h2><p>Put future applications closer to the top of a company&rsquo;s review queue.</p></div>
      <a href="/pricing">Upgrade to Polaris Pro <ArrowRight /></a>
    </article>
    <ApplicationDetailModal applicationId={selected} onClose={() => setSelected(null)} />
  </section>;
}
