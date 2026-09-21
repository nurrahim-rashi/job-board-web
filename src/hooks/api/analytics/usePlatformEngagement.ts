import { useAnalyticsQuery } from "./analyticsQuery";
import type { AnalyticsQuery, PlatformEngagement } from "../../../types/analytics";

export const usePlatformEngagement = (
  query: AnalyticsQuery = {},
  enabled = true,
) => useAnalyticsQuery<PlatformEngagement>("engagement", query, enabled);
