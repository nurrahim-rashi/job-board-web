import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";

export const useDeleteJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await axiosInstance.delete<ApiResponse<never>>(`/job-posting/${slug}`);
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(response.message ?? "Job Posting successfully deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
