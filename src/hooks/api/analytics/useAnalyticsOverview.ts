import { useAnalyticsQuery } from "./analyticsQuery";
import type { AnalyticsQuery, AnalyticsOverview } from "../../../types/analytics";

export const useAnalyticsOverview = (query: AnalyticsQuery = {}) =>
  useAnalyticsQuery<AnalyticsOverview>("overview", query);
