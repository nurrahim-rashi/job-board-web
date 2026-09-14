import { Link } from "react-router-dom";
import { DeveloperShell } from "../components/Developer/DeveloperShell";

export default function DeveloperHomePage() {
  return (
    <DeveloperShell
      eyebrow="Developer dashboard"
      title="Platform overview"
      lead="Manage assessments, subscriptions, and platform performance."
    >
      <section className="panel-stats">
        <article>
          <span>Skill assessments</span>
          <b>24</b>
          <small>Manage assessment content</small>
        </article>

        <article>
          <span>Subscriptions</span>
          <b>138</b>
          <small>Manage user subscriptions</small>
        </article>

        <article>
          <span>Platform analytics</span>
          <b>View</b>
          <small>Monitor website performance</small>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel-card developer-tools-card">
          <p className="eyebrow">Management</p>
          <h2>Developer tools</h2>

          <div className="developer-tool-links">
            <Link to="/dashboard/developer/assessments">
              <span>
                <b>Manage skill assessments</b>
                <small>Create assessments and manage questions</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>

            <Link to="/dashboard/developer/subscriptions">
              <span>
                <b>Manage subscriptions</b>
                <small>Review plans, payments, and user access</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>

            <Link to="/dashboard/developer/analytics">
              <span>
                <b>View website analytics</b>
                <small>Monitor platform activity and performance</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      </section>
    </DeveloperShell>
  );
}
