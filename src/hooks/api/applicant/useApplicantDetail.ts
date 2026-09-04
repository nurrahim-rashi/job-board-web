import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";
import type { ApplicantDetail } from "../../../types/applicant";

export const useApplicantDetail = (slug: string | undefined, applicationId: number | null) =>
  useQuery({
    queryKey: ["applicants", slug, "detail", applicationId],
    enabled: Boolean(slug) && applicationId != null,
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<ApplicantDetail>>(
        `/job-posting/${slug}/applicants/${applicationId}`,
      );
      if (!response.data.data) throw new Error("Invalid applicant detail response");
      return response.data.data;
    },
  });
