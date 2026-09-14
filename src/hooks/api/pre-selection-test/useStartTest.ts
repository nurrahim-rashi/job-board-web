import { useMutation } from "@tanstack/react-query";

import { axiosInstance } from "../../../lib/axios";
import type { TestSession } from "../../../types/pre-selection-test";

export const useStartTest = (slug: string) =>
  useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post<TestSession>(
        `/jobs/${slug}/pre-selection-test/start`,
      );
      return response.data;
    },
  });
