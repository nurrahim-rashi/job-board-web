import { ArrowRight, FileText, Sparkles } from "../site/Icons";
import { Link } from "react-router-dom";

export function DeveloperPanel() {
  return (
    <section className="role-panel">
      <div className="panel-stats">
        <article>
          <span>Skill assessments</span>
          <b>24</b>
          <small>3 awaiting review</small>
        </article>
        <article>
          <span>Subscriptions</span>
          <b>138</b>
          <small>12 pending approval</small>
        </article>
        <article>
          <span>Published jobs</span>
          <b>62</b>
          <small>Across 31 companies</small>
        </article>
      </div>
      <div className="panel-grid">
        <article className="panel-card">
          <p className="eyebrow">Review queue</p>
          <h2>Keep the board sharp</h2>
          <ul className="workspace-list">
            <li>
              <FileText />
              <span>
                <b>Polaris Pro plan approval</b>
                <small>12 payment proofs pending</small>
              </span>
              <em className="wait">Review</em>
            </li>
            <li>
              <Sparkles />
              <span>
                <b>Product Design assessment</b>
                <small>3 new questions awaiting publish</small>
              </span>
              <em className="good">Ready</em>
            </li>
          </ul>
          <Link to="/dashboard/developer/assessments">
            Manage skill assessments <ArrowRight />
          </Link>
          <Link to="/dashboard/developer/subscriptions">
            Manage subscriptions <ArrowRight />
          </Link>
          <Link to="/dashboard/developer/analytics">
            Open website analytics <ArrowRight />
          </Link>
          <a href="/jobs">
            Open review queue <ArrowRight />
          </a>
        </article>
        <article className="panel-card">
          <p className="eyebrow">Platform health</p>
          <h2>Everything is moving</h2>
          <p>
            Companies are answering applicants in a median of 1.8 days this
            week.
          </p>
          <div className="workspace-progress developer-progress">
            <i />
          </div>
          <small>Reply guarantee compliance: 94%</small>
          <a href="/companies">
            View company performance <ArrowRight />
          </a>
        </article>
      </div>
    </section>
  );
}
