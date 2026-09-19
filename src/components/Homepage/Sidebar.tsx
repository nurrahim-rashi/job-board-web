import { useState } from "react";
import { ArrowRight, Clipboard, FileText, Sparkles } from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";
import type { HomepageData } from "../../types/auth";
import { ApplicationDetailModal } from "../Application/ApplicationDetailModal";
import { StatusBadge } from "../site/StatusBadge";

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
              {applications.map((application) => (
                  <li key={application.id}>
                    <button className="application-row-button" type="button" onClick={() => setSelectedApplicationId(application.id)}>
                      <FileText />
                      <span>
                        <b>{application.job.title}</b>
                        <small>{application.job.company.companyName}</small>
                      </span>
                      <StatusBadge status={application.status} />
                    </button>
                  </li>
                ))}
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
