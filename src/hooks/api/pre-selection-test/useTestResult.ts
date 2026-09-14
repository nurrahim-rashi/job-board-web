import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "../../../lib/axios";
import type { TestResultDetail } from "../../../types/pre-selection-test";

export const useTestResult = (slug: string | undefined, applicationId: number | null) =>
  useQuery({
    queryKey: ["pre-selection-test", slug, "results", applicationId],
    enabled: Boolean(slug) && applicationId != null,
    retry: false,
    queryFn: async () => {
      const response = await axiosInstance.get<TestResultDetail>(
        `/job-posting/${slug}/pre-selection-test/results/${applicationId}`,
      );
      return response.data;
    },
  });
