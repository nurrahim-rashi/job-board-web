import { useState } from "react";
import { ArrowRight, Building, FileText } from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";
import type { HomepageData } from "../../types/auth";
import { ApplicationDetailModal } from "../Application/ApplicationDetailModal";

const statusDetails: Record<string, { label: string; tone: string }> = {
  DRAFT: { label: "Draft", tone: "wait" },
  PENDING: { label: "CV screening", tone: "wait" },
  TEST_ASSIGNED: { label: "Test assigned", tone: "wait" },
  PROCESS: { label: "In review", tone: "wait" },
  INTERVIEW: { label: "Interview", tone: "good" },
  ACCEPTED: { label: "Accepted", tone: "good" },
  REJECTED: { label: "Not selected", tone: "bad" },
};

type SidebarProps = Pick<
  HomepageData,
  "applications" | "profileCompletion" | "followedCompanies"
> & { loading: boolean };

export function Sidebar({
  applications,
  profileCompletion,
  followedCompanies,
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
                  label: application.status.replaceAll("_", " "),
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

      <Reveal delay={140}>
        <article id="companies">
          <p className="eyebrow">Companies you follow</p>
          {loading ? (
            <div className="dashboard-side-placeholder is-loading" />
          ) : followedCompanies.length ? (
            <ul className="company-list">
              {followedCompanies.map((company) => (
                <li key={company.id}>
                  <b>
                    <Building />
                  </b>
                  <span>
                    <strong>{company.companyName}</strong>
                    <small>{company.city}</small>
                  </span>
                  <em>{company.openJobs} jobs</em>
                </li>
              ))}
            </ul>
          ) : (
            <p>You are not following any companies yet.</p>
          )}
          <a href="/companies">
            Browse companies <ArrowRight />
          </a>
        </article>
      </Reveal>
    </aside>
    <ApplicationDetailModal applicationId={selectedApplicationId} onClose={() => setSelectedApplicationId(null)} />
    </>
  );
}
