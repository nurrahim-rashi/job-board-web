import type { AnalyticsOverview } from "../../types/analytics";
import {
  formatCompact,
  formatDelta,
  formatNumber,
  metricCards,
  statusLabels,
} from "./analyticsData";
import { AreaChart } from "./charts/AreaChart";
import { BarList } from "./charts/BarList";
import { ChartCard, ChartEmpty } from "./charts/ChartCard";
import { seriesColors } from "./charts/chartUtils";

const deltaClass = (delta: number | null) => {
  if (delta === null || delta === 0) return "flat";
  return delta > 0 ? "up" : "down";
};

export function OverviewSection({ data }: { data: AnalyticsOverview }) {
  const seekerTrend = data.trend.map((point) => ({
    label: point.label,
    value: point.jobSeekers,
  }));
  const applicationTrend = data.trend.map((point) => ({
    label: point.label,
    value: point.applications,
  }));

  return (
    <section className="analytics-section">
      <div className="analytics-hero">
        <div>
          <p className="eyebrow">Polaris community</p>
          <strong>{formatNumber(data.community.totalUsers)}</strong>
          <p>
            registered accounts, {formatNumber(data.community.totalCompanies)} companies and{" "}
            {formatNumber(data.community.totalJobs)} live postings on the board right now.
          </p>
        </div>
        <div>
          <span>Applications per live posting</span>
          <b>{data.applicationsPerJob}</b>
          <small>Everything below is filtered to the selected range.</small>
        </div>
      </div>

      <div className="analytics-metrics">
        {metricCards.map((card) => {
          const metric = data.metrics[card.key];

          return (
            <article key={card.key}>
              <span>{card.label}</span>
              <b>{formatNumber(metric.value)}</b>
              <em className={deltaClass(metric.delta)}>
                {metric.delta === null ? "—" : `${metric.delta > 0 ? "↑" : metric.delta < 0 ? "↓" : "→"} ${Math.abs(metric.delta)}%`}
              </em>
              <small>{card.hint} · {formatDelta(metric.delta)}</small>
            </article>
          );
        })}
      </div>

      <div className="chart-grid">
        <ChartCard
          title="New job seekers"
          note="Accounts created each month"
          footer={`${formatNumber(data.metrics.jobSeekers.value)} in total across the range`}
        >
          <AreaChart data={seekerTrend} name="Job seekers" color={seriesColors[0]} format={formatCompact} />
        </ChartCard>

        <ChartCard
          title="Applications submitted"
          note="Drafts are excluded"
          footer={`${formatNumber(data.metrics.applications.value)} in total across the range`}
        >
          <AreaChart data={applicationTrend} name="Applications" color={seriesColors[1]} format={formatCompact} />
        </ChartCard>

        <ChartCard
          span="full"
          title="Where applications are sitting"
          note="Snapshot of every application created in the range"
          footer="Rejected applications stay in the count so the shares always add up to 100%."
        >
          {data.pipeline.some((stage) => stage.count > 0) ? (
            <BarList
              series={[{ name: "Applications", color: seriesColors[0] }]}
              format={formatNumber}
              items={data.pipeline.map((stage) => ({
                label: statusLabels[stage.status],
                values: [stage.count],
                note: `${stage.share}% of applications`,
              }))}
            />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>
      </div>
    </section>
  );
}
