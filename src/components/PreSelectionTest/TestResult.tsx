import { Link } from "react-router-dom";
import type { TestScore } from "../../types/pre-selection-test";
import { formatMoment } from "./preSelectionTestData";

type TestResultProps = { title: string; company: string; result: TestScore };

export function TestResult({ title, company, result }: TestResultProps) {
  const detail =
    result.correctAnswer !== undefined && result.totalQuestions !== undefined
      ? `${result.correctAnswer} of ${result.totalQuestions} answers correct`
      : "out of 100";

  return (
    <article className="panel-card pretest-result">
      <p className="eyebrow">Test submitted</p>
      <strong className="pretest-score">{result.score}</strong>
      <p className="pretest-count">{detail}</p>
      <h2>{title}</h2>
      <p>
        {company} sees this score next to your CV. Your application moves to the review stage now. The dashboard shows
        what happens next.
      </p>
      {result.submittedAt ? <small>Submitted {formatMoment(result.submittedAt)}</small> : null}
      <Link className="button button-primary" to="/dashboard">
        Back to dashboard
      </Link>
    </article>
  );
}
