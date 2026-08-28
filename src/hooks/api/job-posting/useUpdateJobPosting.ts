import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";
import type { JobPosting, UpdateJobPayload } from "../../../types/job-posting";
import { multipart, toJobFormData } from "./jobFormData";

export const useUpdateJobPosting = (slug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateJobPayload) => {
      const response = await axiosInstance.put<ApiResponse<JobPosting>>(
        `/jobs/${slug}`,
        toJobFormData(payload),
        multipart,
      );
      if (!response.data.data) throw new Error("Invalid update job response");
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(response.message ?? "Job Posting successfully updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
