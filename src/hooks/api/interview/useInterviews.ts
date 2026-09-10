import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { axiosInstance } from "../../../lib/axios";
import type { PagedResponse } from "../../../types/api";
import type { Interview, InterviewQuery } from "../../../types/interview";

export const useInterviews = (slug: string | undefined, query: InterviewQuery = {}) =>
  useQuery({
    queryKey: ["interviews", slug, query],
    enabled: Boolean(slug),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await axiosInstance.get<PagedResponse<Interview>>(
        `/job-posting/${slug}/interviews`,
        { params: query },
      );
      return { interviews: response.data.data ?? [], meta: response.data.meta };
    },
  });
