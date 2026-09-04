import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";
import type { JobPostingDetail } from "../../../types/job-posting";

export const useJobPosting = (slug: string | undefined) =>
  useQuery({
    queryKey: ["jobs", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<JobPostingDetail>>(`/job-posting/${slug}`);
      if (!response.data.data) throw new Error("Invalid job detail response");
      return response.data.data;
    },
  });
