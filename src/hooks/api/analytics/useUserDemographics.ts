import { useAnalyticsQuery } from "./analyticsQuery";
import type { AnalyticsQuery, UserDemographics } from "../../../types/analytics";

export const useUserDemographics = (query: AnalyticsQuery = {}) =>
  useAnalyticsQuery<UserDemographics>("demographics", query);
