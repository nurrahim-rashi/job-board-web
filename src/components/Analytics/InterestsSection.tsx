import type { ApplicantInterests } from "../../types/analytics";
import { categoryLabel } from "../../types/job-posting";
import { formatNumber } from "./analyticsData";
import { BarList } from "./charts/BarList";
import { ChartCard, ChartEmpty } from "./charts/ChartCard";
import { seriesColors } from "./charts/chartUtils";

export function InterestsSection({ data }: { data: ApplicantInterests }) {
  const busiest = data.categories.find((category) => category.jobs > 0);

  return (
    <section className="analytics-section">
      <header className="analytics-heading">
        <div>
          <p className="eyebrow">Applicant interests</p>
          <h2>What candidates are applying to</h2>
        </div>
        <p>
          {busiest
            ? `${categoryLabel(busiest.category)} is drawing the most attention at ${busiest.perJob} applications per posting.`
            : "No applications have landed in this range yet."}
        </p>
      </header>

      <div className="analytics-metrics three">
        <article>
          <span>Applications</span>
          <b>{formatNumber(data.totalApplications)}</b>
          <small>Submitted in the selected range</small>
        </article>
        <article>
          <span>Active applicants</span>
          <b>{formatNumber(data.activeApplicants)}</b>
          <small>Distinct people who applied</small>
        </article>
        <article>
          <span>Applications per person</span>
          <b>{data.applicationsPerApplicant}</b>
          <small>How widely candidates are casting the net</small>
        </article>
      </div>

      <div className="chart-grid">
        <ChartCard
          title="Most applied categories"
          note="Volume of applications per job category"
          footer="The note under each bar is the competition ratio: applications divided by live postings."
        >
          {data.categories.length ? (
            <BarList
              series={[{ name: "Applications", color: seriesColors[0] }]}
              format={formatNumber}
              items={data.categories.map((category) => ({
                label: categoryLabel(category.category),
                values: [category.applications],
                note: `${category.share}% of applications · ${category.perJob} per posting`,
              }))}
            />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard
          title="Where the demand is"
          note="City attached to the posting applied to"
          footer="Compare this with the demographics map to spot cities where supply outstrips openings."
        >
          {data.cities.length ? (
            <BarList
              series={[{ name: "Applications", color: seriesColors[2] }]}
              format={formatNumber}
              items={data.cities.map((city) => ({
                label: city.label,
                values: [city.count],
                note: `${city.share}% of applications`,
              }))}
            />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard
          span="full"
          title="Most contested postings"
          note="The individual jobs pulling the most applications"
        >
          {data.topJobs.length ? (
            <div className="analytics-table jobs">
              <div className="analytics-row head">
                <span>Posting</span>
                <span>Company</span>
                <span>Category</span>
                <span>City</span>
                <span>Applications</span>
              </div>
              {data.topJobs.map((job) => (
                <div className="analytics-row" key={job.slug}>
                  <span>
                    <b>{job.title}</b>
                  </span>
                  <span>{job.companyName}</span>
                  <span>
                    <em className="admin-chip">{categoryLabel(job.category)}</em>
                  </span>
                  <span>{job.city}</span>
                  <span className="figure">{formatNumber(job.applications)}</span>
                </div>
              ))}
            </div>
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>
      </div>
    </section>
  );
}
