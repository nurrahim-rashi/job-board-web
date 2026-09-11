import { useMemo, useState } from "react";

import { useAnalyticsOverview } from "../../hooks/api/analytics/useAnalyticsOverview";
import { useApplicantInterests } from "../../hooks/api/analytics/useApplicantInterests";
import { usePlatformEngagement } from "../../hooks/api/analytics/usePlatformEngagement";
import { useSalaryTrends } from "../../hooks/api/analytics/useSalaryTrends";
import { useUserDemographics } from "../../hooks/api/analytics/useUserDemographics";
import { analyticsRanges } from "../../types/analytics";
import { jobCategories, type JobCategory } from "../../types/job-posting";
import { DemographicsSection } from "./DemographicsSection";
import { EngagementSection } from "./EngagementSection";
import { InterestsSection } from "./InterestsSection";
import { OverviewSection } from "./OverviewSection";
import { SalarySection } from "./SalarySection";

export function AnalyticsDashboard() {
  const [months, setMonths] = useState(6);
  const [category, setCategory] = useState<JobCategory | "">("");

  const query = useMemo(
    () => ({ months, ...(category ? { category } : {}) }),
    [months, category],
  );

  const overview = useAnalyticsOverview(query);
  const demographics = useUserDemographics(query);
  const salary = useSalaryTrends(query);
  const interests = useApplicantInterests(query);
  const engagement = usePlatformEngagement(query);

  const sections = [overview, demographics, salary, interests, engagement];
  const failed = sections.find((section) => section.error);
  const loading = sections.some((section) => section.isPending);
  const refreshing = sections.some((section) => section.isFetching);

  return (
    <div className="analytics">
      <div className="analytics-filters">
        <label>
          Range
          <select value={months} onChange={(event) => setMonths(Number(event.target.value))}>
            {analyticsRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as JobCategory | "")}
          >
            <option value="">All categories</option>
            {jobCategories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <p>
          {refreshing
            ? "Refreshing…"
            : "Filters apply to every chart below. Review based numbers stay platform wide."}
        </p>
      </div>

      {failed ? (
        <div className="admin-empty">
          <h2>{failed.error?.message ?? "Analytics could not be loaded."}</h2>
        </div>
      ) : loading ? (
        <div className="admin-empty">
          <h2>Crunching the numbers…</h2>
        </div>
      ) : (
        <div className={refreshing ? "analytics-body is-busy" : "analytics-body"}>
          {overview.data ? <OverviewSection data={overview.data} /> : null}
          {demographics.data ? <DemographicsSection data={demographics.data} /> : null}
          {salary.data ? <SalarySection data={salary.data} /> : null}
          {interests.data ? <InterestsSection data={interests.data} /> : null}
          {engagement.data ? <EngagementSection data={engagement.data} /> : null}
        </div>
      )}
    </div>
  );
}
