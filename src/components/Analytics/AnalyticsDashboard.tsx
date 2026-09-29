import { useMemo } from "react";
import { parseAsNumberLiteral, parseAsStringLiteral, useQueryStates } from "nuqs";

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
import { useAuth } from "../../stores/useAuth";

const rangeOptions: AdminSelectOption[] = analyticsRanges.map((range) => ({
  value: String(range.value),
  label: range.label,
}));

const categoryOptions: AdminSelectOption[] = [
  { value: "", label: "All categories" },
  ...jobCategories.map((item) => ({ value: item.value, label: item.label })),
];

const searchParams = {
  months: parseAsNumberLiteral(analyticsRanges.map((range) => range.value)).withDefault(6),
  category: parseAsStringLiteral(jobCategories.map((item) => item.value)),
  currency: parseAsStringLiteral(currencyOptions.map((option) => option.value)).withDefault("IDR"),
};

export function AnalyticsDashboard() {
  const [{ months, category, currency }, setParams] = useQueryStates(searchParams);

  const query = useMemo(
    () => ({ months, currency, ...(category ? { category } : {}) }),
    [months, category, currency],
  );

  const isDeveloper = useAuth((state) => state.user?.role) === "DEVELOPER";

  const overview = useAnalyticsOverview(query);
  const demographics = useUserDemographics(query);
  const salary = useSalaryTrends(query);
  const interests = useApplicantInterests(query);
  const engagement = usePlatformEngagement(query, isDeveloper);

  const sections = [
    overview,
    demographics,
    salary,
    interests,
    ...(isDeveloper ? [engagement] : []),
  ];
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
          onChange={(next) => setParams({ months: Number(next) as typeof months })}
          options={rangeOptions}
        />
        <AdminSelect
          variant="stacked"
          label="Category"
          value={category ?? ""}
          onChange={(next) => setParams({ category: (next as JobCategory) || null })}
          options={categoryOptions}
        />
        <AdminSelect
          variant="stacked"
          label="Salary currency"
          value={currency}
          onChange={(next) => setParams({ currency: next })}
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
