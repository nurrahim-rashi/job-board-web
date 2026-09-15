import type { ReactNode } from "react";
import { AnimatedMetric } from "../site/AnimatedMetric";
import { Info } from "../site/Icons";

export type QualityMetric = {
  key: string;
  label: string;
  value: number | null;
  display: string;
  explanation: string;
};

export function QualityScoreCard({
  title,
  score,
  metrics,
  children,
  company = false,
  animated = true,
}: {
  title: string;
  score: number;
  metrics: QualityMetric[];
  children?: ReactNode;
  company?: boolean;
  animated?: boolean;
}) {
  return (
    <article
      className={`${company ? "company-paper-card" : "seeker-paper-card"} quality-score-card profile-quality-card`}
    >
      <div className="quality-score-heading">
        <span>{title}</span>
        <div className="quality-info">
          <button type="button" aria-label={`About ${title}`}>
            <Info />
          </button>
          <div className="quality-tooltip" role="tooltip">
            <strong>Score breakdown</strong>
            <p>
              Metrics without enough data are shown as — and are not included in
              the score.
            </p>
            <ul>
              {metrics.map((metric) => (
                <li key={metric.key}>
                  <div>
                    <b>{metric.label}</b>
                    <em>{metric.display}</em>
                  </div>
                  <small>{metric.explanation}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="quality-score-value">
        {animated ? (
          <AnimatedMetric value={score} suffix="%" />
        ) : (
          <strong>{score}%</strong>
        )}
        <small>Community quality</small>
      </div>
      {children}
    </article>
  );
}
