import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";
import type { JobPosting } from "../../../types/job-posting";

type TogglePublishInput = { slug: string; isPublished: boolean };

export const useTogglePublishJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, isPublished }: TogglePublishInput) => {
      const response = await axiosInstance.patch<ApiResponse<JobPosting>>(
        `/jobs/${slug}/publish`,
        { isPublished },
      );
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(response.message ?? "Job Posting status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
