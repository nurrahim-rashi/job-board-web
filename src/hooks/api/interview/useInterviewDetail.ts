import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";
import type { Interview } from "../../../types/interview";

export const useInterviewDetail = (slug: string | undefined, interviewId: number | null) =>
  useQuery({
    queryKey: ["interviews", slug, "detail", interviewId],
    enabled: Boolean(slug) && interviewId != null,
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<Interview>>(
        `/job-posting/${slug}/interviews/${interviewId}`,
      );
      if (!response.data.data) throw new Error("Invalid interview response");
      return response.data.data;
    },
  });
