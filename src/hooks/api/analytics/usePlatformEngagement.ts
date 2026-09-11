import { useAnalyticsQuery } from "./analyticsQuery";
import type { AnalyticsQuery, PlatformEngagement } from "../../../types/analytics";

export const usePlatformEngagement = (query: AnalyticsQuery = {}) =>
  useAnalyticsQuery<PlatformEngagement>("engagement", query);
