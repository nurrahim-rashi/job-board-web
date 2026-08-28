import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";
import type { PreSelectionTest } from "../../../types/pre-selection-test";

export const usePreSelectionTest = (slug: string | undefined) =>
  useQuery({
    queryKey: ["pre-selection-test", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<PreSelectionTest>>(
        `/jobs/${slug}/pre-selection-test`,
      );
      if (!response.data.data) throw new Error("Invalid pre-selection test response");
      return response.data.data;
    },
  });
