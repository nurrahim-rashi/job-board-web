import { useMemo, useState } from "react";

import { useAnalyticsOverview } from "../../hooks/api/analytics/useAnalyticsOverview";
import { useApplicantInterests } from "../../hooks/api/analytics/useApplicantInterests";
import { usePlatformEngagement } from "../../hooks/api/analytics/usePlatformEngagement";
import { useSalaryTrends } from "../../hooks/api/analytics/useSalaryTrends";
import { useUserDemographics } from "../../hooks/api/analytics/useUserDemographics";
import { AdminSelect, type AdminSelectOption } from "../Admin/AdminSelect";
import { analyticsRanges } from "../../types/analytics";
import { jobCategories, type JobCategory } from "../../types/job-posting";
import { DemographicsSection } from "./DemographicsSection";
import { EngagementSection } from "./EngagementSection";
import { InterestsSection } from "./InterestsSection";
import { OverviewSection } from "./OverviewSection";
import { SalarySection } from "./SalarySection";
import { currencyOptions } from "../../lib/currency";

const rangeOptions: AdminSelectOption[] = analyticsRanges.map((range) => ({
  value: String(range.value),
  label: range.label,
}));

const categoryOptions: AdminSelectOption[] = [
  { value: "", label: "All categories" },
  ...jobCategories.map((item) => ({ value: item.value, label: item.label })),
];

export function AnalyticsDashboard() {
  const [months, setMonths] = useState(6);
  const [category, setCategory] = useState<JobCategory | "">("");
  const [currency, setCurrency] = useState("IDR");

  const query = useMemo(
    () => ({ months, currency, ...(category ? { category } : {}) }),
    [months, category, currency],
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
        <AdminSelect
          variant="stacked"
          label="Range"
          value={String(months)}
          onChange={(next) => setMonths(Number(next))}
          options={rangeOptions}
        />
        <AdminSelect
          variant="stacked"
          label="Category"
          value={category}
          onChange={(next) => setCategory(next as JobCategory | "")}
          options={categoryOptions}
        />
        <AdminSelect
          variant="stacked"
          label="Salary currency"
          value={currency}
          onChange={setCurrency}
          options={currencyOptions}
        />
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
