import { useAnalyticsQuery } from "./analyticsQuery";
import type { AnalyticsQuery, ApplicantInterests } from "../../../types/analytics";

export const useApplicantInterests = (query: AnalyticsQuery = {}) =>
  useAnalyticsQuery<ApplicantInterests>("interests", query);
