import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";
import type { CreateJobPayload, JobPosting } from "../../../types/job-posting";
import { multipart, toJobFormData } from "./jobFormData";

export const useCreateJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateJobPayload) => {
      const response = await axiosInstance.post<ApiResponse<JobPosting>>(
        "/job-posting",
        toJobFormData(payload),
        multipart,
      );
      if (!response.data.data) throw new Error("Invalid create job response");
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(response.message ?? "Job Posting successfully created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
