import type { SalaryTrends } from "../../types/analytics";
import { categoryLabel } from "../../types/job-posting";
import { formatCurrency, formatNumber, samplesNote } from "./analyticsData";
import { BarList } from "./charts/BarList";
import { ChartCard, ChartEmpty, ChartLegend } from "./charts/ChartCard";
import { seriesColors } from "./charts/chartUtils";

const salarySeries = [
  { name: "Expected by applicants", color: seriesColors[0] },
  { name: "Advertised by companies", color: seriesColors[1] },
];

export function SalarySection({ data }: { data: SalaryTrends }) {
  return (
    <section className="analytics-section">
      <header className="analytics-heading">
        <div>
          <p className="eyebrow">Salary trends</p>
          <h2>What people ask for, and what they earn</h2>
        </div>
        <p>
          Expected salaries come from application forms, advertised salaries from the posting
          itself, and reported salaries from employees who reviewed a company.
        </p>
      </header>

      <div className="analytics-metrics three">
        <article>
          <span>Average expectation</span>
          <b>{formatCurrency(data.expected.average)}</b>
          <small>{samplesNote(data.expected.samples, "application")}</small>
        </article>
        <article>
          <span>Average advertised</span>
          <b>{formatCurrency(data.offered.average)}</b>
          <small>{samplesNote(data.offered.samples, "posting")}</small>
        </article>
        <article>
          <span>Average reported</span>
          <b>{formatCurrency(data.reported.average)}</b>
          <small>{samplesNote(data.reported.samples, "review")}</small>
        </article>
      </div>

      <div className="chart-grid">
        <ChartCard
          span="full"
          title="Expectation against the advertised range"
          note="Advertised salary uses the midpoint of each posting"
          legend={<ChartLegend items={salarySeries} />}
          footer="A category where the blue bar runs past the orange one is a category where offers are being undercut."
        >
          {data.byCategory.length ? (
            <BarList
              series={salarySeries}
              format={formatCurrency}
              items={data.byCategory.map((row) => ({
                label: categoryLabel(row.category),
                values: [row.expected, row.offered],
                note: `${formatNumber(row.expectedSamples)} applicants · ${formatNumber(row.offeredSamples)} postings`,
              }))}
            />
          ) : (
            <ChartEmpty label="No salary was recorded on applications or postings in this range." />
          )}
        </ChartCard>

        <ChartCard
          title="Reported salary by position"
          note="Averaged from company reviews"
          footer="Reviews are written by people who held the role, so they are not filtered by category."
        >
          {data.byPosition.length ? (
            <BarList
              series={[{ name: "Reported salary", color: seriesColors[2] }]}
              format={formatCurrency}
              items={data.byPosition.map((row) => ({
                label: row.label,
                values: [row.average],
                note: samplesNote(row.samples, "review"),
              }))}
            />
          ) : (
            <ChartEmpty label="No review mentioned a salary in this range." />
          )}
        </ChartCard>

        <ChartCard
          title="Reported salary by location"
          note="City of the company being reviewed"
          footer="Useful when you are deciding where a new opening should be based."
        >
          {data.byLocation.length ? (
            <BarList
              series={[{ name: "Reported salary", color: seriesColors[3] }]}
              format={formatCurrency}
              items={data.byLocation.map((row) => ({
                label: row.label,
                values: [row.average],
                note: samplesNote(row.samples, "review"),
              }))}
            />
          ) : (
            <ChartEmpty label="No review mentioned a salary in this range." />
          )}
        </ChartCard>
      </div>
    </section>
  );
}
