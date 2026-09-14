import { useEffect, useState } from "react";
import { ArrowRight, FileText, Sparkles } from "../site/Icons";
import { Link } from "react-router-dom";
import {
  getMyApplications,
  type Application,
} from "../../services/application.service";

const recommended = [
  ["Product Designer, Growth", "Nusantara Pay", "92% match"],
  ["Senior UI Designer", "Bright Harbor", "88% match"],
  ["Design Systems Lead", "Wren", "84% match"],
];

export function ApplicantPanel() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    getMyApplications()
      .then(setApplications)
      .catch((requestError) => setError(requestError.message));
  }, []);
  const active = applications.filter((application) =>
    ["PENDING", "PROCESS", "INTERVIEW", "TEST_ASSIGNED"].includes(
      application.status,
    ),
  );
  return (
    <section className="role-panel">
      <div className="panel-stats">
        <article>
          <span>Applications</span>
          <b>{applications.length}</b>
          <small>{active.length} in progress</small>
        </article>
        <article>
          <span>Interviews</span>
          <b>
            {applications.filter((application) => application.interview).length}
          </b>
          <small>Scheduled interviews</small>
        </article>
        <article>
          <span>Profile strength</span>
          <b>80%</b>
          <small>Complete your profile</small>
        </article>
      </div>
      <div className="panel-grid">
        <article className="panel-card">
          <p className="eyebrow">Your applications</p>
          <h2>Where things stand</h2>
          {error && <p className="profile-error">{error}</p>}
          <ul className="workspace-list">
            {applications.map((application) => (
              <li key={application.id}>
                <FileText />
                <span>
                  <b>{application.job.title}</b>
                  <small>
                    {application.job.company.companyName} ·{" "}
                    {application.status.replaceAll("_", " ")}
                    {application.rejectionReason
                      ? ` · ${application.rejectionReason}`
                      : ""}
                    {application.interview
                      ? ` · Interview ${new Date(application.interview.interviewDate).toLocaleString()}`
                      : ""}
                  </small>
                </span>
                <em
                  className={
                    application.status === "REJECTED" ? "wait" : "good"
                  }
                >
                  {application.status}
                </em>
              </li>
            ))}
            {!applications.length && !error && (
              <li>
                <span>
                  <small>
                    No applications yet. Browse roles to get started.
                  </small>
                </span>
              </li>
            )}
          </ul>
          <a href="/jobs">
            Browse jobs <ArrowRight />
          </a>
        </article>
        <article className="panel-card">
          <p className="eyebrow">Your profile</p>
          <h2>Almost there</h2>
          <p>Complete your profile and upload a CV to apply in one tap.</p>
          <div className="workspace-progress">
            <i />
          </div>
          <small>80% complete</small>
          <a href="/profile">
            Complete profile <ArrowRight />
          </a>
        </article>
      </div>
      <div className="panel-grid dashboard-tools-grid">
        <article className="panel-card">
          <p className="eyebrow">Subscriptions</p>
          <h2>Unlock premium tools</h2>
          <p>
            Get access to the CV Generator, skill assessments, and priority
            features.
          </p>

          <Link to="/pricing">
            View subscription plans <ArrowRight />
          </Link>
        </article>
        <article className="panel-card">
          <p className="eyebrow">Skill assessment</p>
          <h2>Prove your skills</h2>
          <p>Take skill assessments, earn badges, and strengthen your profile.</p>
          <Link to="/dashboard/assessments">
            Browse assessments <ArrowRight />
          </Link>

          <Link to="/dashboard/assessments/results">
            Assessment history <ArrowRight />
          </Link>
        </article>
      </div>
      <article className="panel-card recommendation-card">
        <p className="eyebrow">Picked for you</p>
        <h2>Roles that fit your signals</h2>
        <ul className="recommendation-list">
          {recommended.map(([role, company, score]) => (
            <li key={role}>
              <Sparkles />
              <span>
                <b>{role}</b>
                <small>{company}</small>
              </span>
              <strong>{score}</strong>
              <a href="/jobs">
                <ArrowRight />
              </a>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
