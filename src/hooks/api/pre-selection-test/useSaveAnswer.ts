import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "../../../lib/axios";
import type { AnswerReceipt, SavedAnswer } from "../../../types/pre-selection-test";

export const useSaveAnswer = (slug: string) =>
  useMutation({
    mutationFn: async (body: SavedAnswer) => {
      const response = await axiosInstance.post<AnswerReceipt>(
        `/jobs/${slug}/pre-selection-test/answers`,
        body,
      );
      return response.data;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
