import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";
import type { Interview, UpdateInterviewInput } from "../../../types/interview";

type Variables = UpdateInterviewInput & { slug: string; interviewId: number };

export const useUpdateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, interviewId, ...body }: Variables) => {
      const response = await axiosInstance.patch<ApiResponse<Interview>>(
        `/job-posting/${slug}/interviews/${interviewId}`,
        body,
      );
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      toast.success(response.message ?? "Interview schedule updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
