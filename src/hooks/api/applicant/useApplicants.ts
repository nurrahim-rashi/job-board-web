import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { axiosInstance } from "../../../lib/axios";
import type { PagedResponse } from "../../../types/api";
import type { ApplicantListItem, ApplicantQuery } from "../../../types/applicant";

export const useApplicants = (slug: string | undefined, query: ApplicantQuery = {}) =>
  useQuery({
    queryKey: ["applicants", slug, query],
    enabled: Boolean(slug),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await axiosInstance.get<PagedResponse<ApplicantListItem>>(
        `/job-posting/${slug}/applicants`,
        { params: query },
      );
      return { applicants: response.data.data ?? [], meta: response.data.meta };
    },
  });
