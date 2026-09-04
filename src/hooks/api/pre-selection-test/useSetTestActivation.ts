import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";
import type { ActivationPayload } from "../../../types/pre-selection-test";
import type { JobPosting } from "../../../types/job-posting";

export const useSetTestActivation = (slug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ActivationPayload) => {
      const response = await axiosInstance.patch<ApiResponse<JobPosting>>(
        `/job-posting/${slug}/pre-selection-test/activation`,
        payload,
      );
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["pre-selection-test", slug] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(response.message ?? "Pre-selection test updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
