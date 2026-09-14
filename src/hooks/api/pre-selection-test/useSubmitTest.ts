import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "../../../lib/axios";
import type { TestScore } from "../../../types/pre-selection-test";

export const useSubmitTest = (slug: string) =>
  useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post<TestScore>(
        `/jobs/${slug}/pre-selection-test/submit`,
      );
      return response.data;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
