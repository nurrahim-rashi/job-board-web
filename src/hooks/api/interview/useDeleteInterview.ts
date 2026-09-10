import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";

type Variables = { slug: string; interviewId: number };

export const useDeleteInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, interviewId }: Variables) => {
      const response = await axiosInstance.delete<ApiResponse<never>>(
        `/job-posting/${slug}/interviews/${interviewId}`,
      );
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      toast.success(response.message ?? "Interview schedule deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
