import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";
import type { CreateInterviewsInput, Interview } from "../../../types/interview";

type Variables = CreateInterviewsInput & { slug: string };

export const useCreateInterviews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, ...body }: Variables) => {
      const response = await axiosInstance.post<ApiResponse<Interview[]>>(
        `/job-posting/${slug}/interviews`,
        body,
      );
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      toast.success(response.message ?? "Interview schedules created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
