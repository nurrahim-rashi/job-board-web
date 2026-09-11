import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";
import type { AnalyticsQuery } from "../../../types/analytics";

export const useAnalyticsQuery = <T>(section: string, query: AnalyticsQuery) =>
  useQuery({
    queryKey: ["analytics", section, query],
    staleTime: 60_000,
    placeholderData: (previous) => previous,
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<T>>(
        `/analytics/${section}`,
        { params: query },
      );
      if (!response.data.data) throw new Error("Invalid analytics response");
      return response.data.data;
    },
  });
