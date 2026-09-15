import { useState } from "react";
import { ArrowRight, Clipboard, FileText, Sparkles } from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";
import type { HomepageData } from "../../types/auth";
import { ApplicationDetailModal } from "../Application/ApplicationDetailModal";
import { applicationStatusLabel } from "../../lib/application-status";

const statusDetails: Record<string, { label: string; tone: string }> = {
  DRAFT: { label: "Draft", tone: "wait" },
  PENDING: { label: "Pending", tone: "wait" },
  TEST_ASSIGNED: { label: "Test Assigned", tone: "wait" },
  PROCESS: { label: "Process", tone: "wait" },
  INTERVIEW: { label: "Interview", tone: "good" },
  ACCEPTED: { label: "Accepted", tone: "good" },
  REJECTED: { label: "Rejected", tone: "bad" },
};

type SidebarProps = Pick<
  HomepageData,
  "applications" | "profileCompletion"
> & { loading: boolean };

export function Sidebar({
  applications,
  profileCompletion,
  loading,
}: SidebarProps) {
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  return (
    <>
    <aside className="dashboard-side">
      <Reveal>
        <article id="applications">
          <p className="eyebrow">Your applications</p>
          {loading ? (
            <div className="dashboard-side-placeholder is-loading" />
          ) : applications.length ? (
            <ul>
              {applications.map((application) => {
                const status = statusDetails[application.status] ?? {
                  label: applicationStatusLabel(application.status),
                  tone: "wait",
                };
                return (
                  <li key={application.id}>
                    <button className="application-row-button" type="button" onClick={() => setSelectedApplicationId(application.id)}>
                      <FileText />
                      <span>
                        <b>{application.job.title}</b>
                        <small>{application.job.company.companyName}</small>
                      </span>
                      <em className={status.tone}>{status.label}</em>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>You have not submitted any applications yet.</p>
          )}
          <a href="/dashboard">
            Open dashboard <ArrowRight />
          </a>
        </article>
      </Reveal>

      <Reveal delay={80}>
        <article>
          <p className="eyebrow">Profile</p>
          <p>
            {profileCompletion === 100
              ? "Your profile is complete."
              : "Complete your profile to get better job matches."}
          </p>
          <div className="profile-progress">
            <i style={{ width: `${profileCompletion}%` }} />
          </div>
          <small>{profileCompletion}% complete</small>
          <a className="fill-action" href="/profile">
            {profileCompletion === 100 ? "View profile" : "Complete profile"}
          </a>
        </article>
      </Reveal>

      <Reveal delay={180}>
        <article className="home-priority-card">
          <div className="home-promo-icon"><Sparkles /></div>
          <p className="eyebrow">Polaris Pro · Priority</p>
          <h2>Stand out as a priority applicant</h2>
          <p>Put your application closer to the top when hiring teams start reviewing.</p>
          <a href="/pricing">Upgrade to Polaris Pro <ArrowRight /></a>
        </article>
      </Reveal>
      <Reveal delay={220}>
        <article className="home-assessment-card">
          <div className="home-promo-icon"><Clipboard /></div>
          <p className="eyebrow">Verified skills</p>
          <h2>Give recruiters proof, not promises</h2>
          <p>Skill badges help your profile stand out before the first interview.</p>
          <a href="/pricing">Upgrade to Polaris Plus <ArrowRight /></a>
        </article>
      </Reveal>
    </aside>
    <ApplicationDetailModal applicationId={selectedApplicationId} onClose={() => setSelectedApplicationId(null)} />
    </>
  );
}
