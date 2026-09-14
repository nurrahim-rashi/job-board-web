import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "../../../lib/axios";
import type { AssignTestResult } from "../../../types/pre-selection-test";

export const useAssignTest = (slug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationIds: number[]) => {
      const response = await axiosInstance.patch<AssignTestResult>(
        `/job-posting/${slug}/pre-selection-test/assign`,
        { applicationIds },
      );
      return response.data;
    },
    onSuccess: ({ assignedCount, skippedCount }) => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      const sent = `Test sent to ${assignedCount} ${assignedCount === 1 ? "applicant" : "applicants"}`;
      toast.success(skippedCount ? `${sent} · ${skippedCount} skipped` : sent);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
