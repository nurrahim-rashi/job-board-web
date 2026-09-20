import type { ReactNode } from "react";
import { Building, Users } from "../site/Icons";
import { storyMilestones } from "./storiesData";
import type { ReviewStoriesData } from "../../services/review.service";

const nodes = [
  { x: 18, y: 28, size: 42, label: "AP", delay: 0 },
  { x: 34, y: 62, size: 36, label: "BW", delay: 1.2 },
  { x: 52, y: 22, size: 48, label: "NK", delay: 2.4 },
  { x: 70, y: 58, size: 38, label: "CT", delay: 0.8 },
  { x: 86, y: 32, size: 44, label: "YM", delay: 1.8 },
  { x: 62, y: 78, size: 34, label: "DP", delay: 3.2 },
  { x: 42, y: 42, size: 28, label: "F", delay: 2 },
  { x: 78, y: 44, size: 30, label: "W", delay: 1.6 },
];
const connections: [number, number][] = [
  [0, 2],
  [2, 4],
  [0, 5],
  [1, 5],
  [3, 4],
  [6, 0],
  [6, 1],
  [7, 2],
  [7, 3],
  [5, 3],
];

export function StoriesHero({
  metrics,
  loading,
}: {
  metrics: ReviewStoriesData["metrics"] | null;
  loading: boolean;
}) {
  const milestones = metrics
    ? storyMilestones(metrics)
    : [
        ["N/A", "matches made on Polaris"],
        ["N/A", "median application to offer"],
        ["N/A", "listings with a salary range"],
        ["N/A", "average verified review rating"],
        ["N/A", "rejected applications with a reason"],
      ];

  return (
    <section className="social-garden">
      <div className="social-mesh" />
      <i className="social-glow" />
      <i className="social-glow-secondary" />
      <Network />
      <div className="social-garden-content">
        <div className="social-garden-top">
          <div>
            <p className="eyebrow">
              <Users />
              Stories
            </p>
            <h1>
              The right fit,
              <br />
              <span>grown from real connection.</span>
            </h1>
            <p>
              Every match on Polaris has two sides. Here are the applicants who
              found their next team, told anonymously through verified company
              reviews and real platform outcomes.
            </p>
          </div>
          <div className="social-stat-cards">
            <StatCard
              icon={<Users />}
              value={
                metrics?.matchesMade.toLocaleString("en-US") ?? null
              }
              label="matches made"
              loading={loading}
            />
            <StatCard
              icon={<Building />}
              value={
                metrics?.medianDaysToOffer === null || !metrics
                  ? null
                  : `${metrics.medianDaysToOffer.toLocaleString("en-US")} days`
              }
              label="median application to offer"
              loading={loading}
            />
          </div>
        </div>
        <dl>
          {loading
            ? Array.from({ length: 5 }, (_, index) => (
                <div className="story-milestone-skeleton" key={index}>
                  <dt />
                  <dd />
                </div>
              ))
            : milestones.map(([value, label]) => (
                <div key={label}>
                  <dt>{value}</dt>
                  <dd>{label}</dd>
                </div>
              ))}
        </dl>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  value,
  label,
  loading,
}: {
  icon: ReactNode;
  value: string | null;
  label: string;
  loading: boolean;
}) {
  return (
    <article>
      <i>{icon}</i>
      <p>
        <b className={loading ? "story-stat-value-skeleton" : ""}>
          {loading ? null : value ?? "N/A"}
        </b>
        <span>{label}</span>
      </p>
    </article>
  );
}
function Network() {
  return (
    <div className="social-network" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="social-vine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#567450" stopOpacity=".6" />
            <stop offset="100%" stopColor="#9eaa75" stopOpacity=".3" />
          </linearGradient>
        </defs>
        {connections.map(([fromIndex, toIndex], index) => {
          const from = nodes[fromIndex]!;
          const to = nodes[toIndex]!;
          return (
            <line
              key={index}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="url(#social-vine)"
              style={{ animationDelay: `${index * 0.18}s` }}
            />
          );
        })}
        {nodes.map((node) => (
          <g key={node.label} style={{ animationDelay: `${node.delay}s` }}>
            <circle cx={node.x} cy={node.y} r={node.size / 12} />
            <circle
              className="social-pulse"
              cx={node.x}
              cy={node.y}
              r={node.size / 12}
              style={{ animationDelay: `${node.delay}s` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
