import { useAnalyticsQuery } from "./analyticsQuery";
import type { AnalyticsQuery, SalaryTrends } from "../../../types/analytics";

export const useSalaryTrends = (query: AnalyticsQuery = {}) =>
  useAnalyticsQuery<SalaryTrends>("salary-trends", query);
