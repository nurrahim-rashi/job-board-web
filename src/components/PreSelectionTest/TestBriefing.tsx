import { Link } from "react-router-dom";
import { Clipboard, Clock, Shield } from "../site/Icons";

type TestBriefingProps = {
  title: string;
  company: string;
  durationMinutes: number | null;
  notice: string;
  busy: boolean;
  onStart: () => void;
};

export function TestBriefing({ title, company, durationMinutes, notice, busy, onStart }: TestBriefingProps) {
  return (
    <article className="panel-card pretest-brief">
      <p className="eyebrow">Pre-selection test</p>
      <h1>{title}</h1>
      <p>{company}</p>
      <ul className="pretest-rules">
        <li>
          <Clock />
          <span>
            <b>{durationMinutes ?? 30} minutes</b>
            <small>The clock starts when you open the first question and keeps running if you close the tab.</small>
          </span>
        </li>
        <li>
          <Clipboard />
          <span>
            <b>Multiple choice</b>
            <small>Each question has four options. Your pick is saved the moment you select it, so you can move between questions freely.</small>
          </span>
        </li>
        <li>
          <Shield />
          <span>
            <b>One attempt</b>
            <small>There is no retake. When the time runs out the answers you have saved so far are scored as they are.</small>
          </span>
        </li>
      </ul>
      {notice ? <p className="pretest-note">{notice}</p> : null}
      <div className="pretest-brief-actions">
        <button type="button" className="button button-primary" onClick={onStart} disabled={busy}>
          {busy ? "Opening…" : "Start test"}
        </button>
        <Link className="pretest-back" to="/dashboard">
          Back to dashboard
        </Link>
      </div>
    </article>
  );
}
