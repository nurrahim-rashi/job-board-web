import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "../../../lib/axios";
import type { PagedResponse } from "../../../types/api";
import type { JobListQuery, JobPostingListItem } from "../../../types/job-posting";

export const useJobPostings = (query: JobListQuery = {}) =>
  useQuery({
    queryKey: ["jobs", query],
    queryFn: async () => {
      const response = await axiosInstance.get<PagedResponse<JobPostingListItem>>("/job-posting", {
        params: query,
      });
      return { jobs: response.data.data ?? [], meta: response.data.meta };
    },
  });
