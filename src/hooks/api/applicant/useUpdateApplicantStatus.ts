import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "../../../lib/axios";
import type { ApiResponse } from "../../../types/api";
import type { UpdateStatusInput } from "../../../types/applicant";

type Variables = UpdateStatusInput & { slug: string; applicationId: number };

export const useUpdateApplicantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, applicationId, ...body }: Variables) => {
      const response = await axiosInstance.patch<ApiResponse<unknown>>(
        `/job-posting/${slug}/applicants/${applicationId}/status`,
        body,
      );
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(response.message ?? "Applicant status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
