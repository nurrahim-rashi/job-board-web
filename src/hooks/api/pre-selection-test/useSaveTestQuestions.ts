import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";
import type { TestQuestionInput } from "../../../types/pre-selection-test";

export const useSaveTestQuestions = (slug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questions: TestQuestionInput[]) => {
      const response = await axiosInstance.put<ApiResponse<{ totalQuestions: number }>>(
        `/job-posting/${slug}/pre-selection-test/questions`,
        { questions },
      );
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["pre-selection-test", slug] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(response.message ?? "Test questions saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
