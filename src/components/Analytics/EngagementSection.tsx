import type { PlatformEngagement } from "../../types/analytics";
import {
  formatCurrency,
  formatNumber,
  interviewLabels,
  planLabels,
} from "./analyticsData";
import { BarList } from "./charts/BarList";
import { ChartCard, ChartEmpty } from "./charts/ChartCard";
import { seriesColors } from "./charts/chartUtils";

export function EngagementSection({ data }: { data: PlatformEngagement }) {
  const totalInterviews = data.interviews.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <section className="analytics-section">
      <header className="analytics-heading">
        <div>
          <p className="eyebrow">Platform signals</p>
          <h2>The rest of the picture</h2>
        </div>
        <p>
          Screening, assessments, subscriptions and reviews — the numbers a company needs before
          deciding how to run its next hiring round.
        </p>
      </header>

      <div className="chart-grid">
        <ChartCard
          span="full"
          title="Busiest employers"
          note="Ranked by applications received in the range"
        >
          {data.topCompanies.length ? (
            <div className="analytics-table companies">
              <div className="analytics-row head">
                <span>Company</span>
                <span>City</span>
                <span>Postings</span>
                <span>Applications</span>
                <span>Hires</span>
                <span>Hire rate</span>
              </div>
              {data.topCompanies.map((company) => (
                <div className="analytics-row" key={company.id}>
                  <span>
                    <b>{company.companyName}</b>
                  </span>
                  <span>{company.city}</span>
                  <span className="figure">{formatNumber(company.jobs)}</span>
                  <span className="figure">{formatNumber(company.applications)}</span>
                  <span className="figure">{formatNumber(company.hires)}</span>
                  <span>
                    <em className={`admin-chip ${company.hireRate > 0 ? "good" : ""}`}>
                      {company.hireRate}%
                    </em>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard
          title="Pre-selection screening"
          note="How the 25 question test is being used"
          footer={`${data.preSelection.jobsWithTest} of ${data.preSelection.publishedJobs} postings attach a test.`}
        >
          <div className="analytics-meters">
            <div>
              <span>Test adoption</span>
              <i>
                <b style={{ width: `${data.preSelection.adoptionRate}%` }} />
              </i>
              <small>{data.preSelection.adoptionRate}% of live postings</small>
            </div>
            <div>
              <span>Completion</span>
              <i>
                <b style={{ width: `${data.preSelection.completionRate}%` }} />
              </i>
              <small>
                {formatNumber(data.preSelection.submitted)} of {formatNumber(data.preSelection.attempts)} attempts submitted
              </small>
            </div>
            <div>
              <span>Average score</span>
              <i>
                <b style={{ width: `${data.preSelection.averageScore ?? 0}%` }} />
              </i>
              <small>
                {data.preSelection.averageScore === null
                  ? "No test has been submitted yet"
                  : `${data.preSelection.averageScore} out of 100`}
              </small>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Skill assessments"
          note="Attempts taken by job seekers"
          footer="A high pass rate with few attempts usually means the question bank is too easy."
        >
          {data.assessments.length ? (
            <BarList
              series={[{ name: "Attempts", color: seriesColors[2] }]}
              format={formatNumber}
              items={data.assessments.map((assessment) => ({
                label: assessment.title,
                values: [assessment.attempts],
                note: `${assessment.passRate}% passed · average ${assessment.averageScore ?? 0}`,
              }))}
            />
          ) : (
            <ChartEmpty label="Nobody has taken an assessment in this range." />
          )}
        </ChartCard>

        <ChartCard
          title="Subscriptions"
          note="Plans bought in the range"
          footer={`Recognised from active plans only: ${formatCurrency(
            data.subscriptions.reduce((sum, plan) => sum + plan.revenue, 0),
          )}.`}
        >
          {data.subscriptions.length ? (
            <BarList
              series={[{ name: "Active", color: seriesColors[0] }]}
              format={formatNumber}
              items={data.subscriptions.map((plan) => ({
                label: planLabels[plan.plan] ?? plan.plan,
                values: [plan.active],
                note: `${plan.pending} awaiting approval · ${plan.expired} expired`,
              }))}
            />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard
          title="Interview outcomes"
          note={`${formatNumber(totalInterviews)} interviews booked in the range`}
          footer="Cancellations climbing is the earliest sign a hiring round is stalling."
        >
          {totalInterviews > 0 ? (
            <BarList
              series={[{ name: "Interviews", color: seriesColors[1] }]}
              format={formatNumber}
              items={data.interviews.map((entry) => ({
                label: interviewLabels[entry.status] ?? entry.status,
                values: [entry.count],
                note: `${Math.round((entry.count / totalInterviews) * 100)}% of bookings`,
              }))}
            />
          ) : (
            <ChartEmpty label="No interview has been booked in this range." />
          )}
        </ChartCard>

        <ChartCard
          title="How companies are rated"
          note={`Averaged from ${formatNumber(data.reviews.total)} employee reviews`}
          footer={
            data.reviews.overall === null
              ? "No company has been rated in this range."
              : `Overall ${data.reviews.overall} out of 5 across the four pillars.`
          }
        >
          {data.reviews.total > 0 ? (
            <BarList
              scaleMax={5}
              series={[{ name: "Rating", color: seriesColors[3] }]}
              format={(value) => `${value} / 5`}
              items={data.reviews.breakdown.map((rating) => ({
                label: rating.label,
                values: [rating.value],
              }))}
            />
          ) : (
            <ChartEmpty label="No company review was written in this range." />
          )}
        </ChartCard>
      </div>
    </section>
  );
}
