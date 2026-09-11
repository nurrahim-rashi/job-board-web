import { axiosInstance } from "./axios";
import type {
  SubscriptionPlansResponse,
  UpdateSubscriptionInput,
  UpdateSubscriptionResponse,
} from "../types/subscription";

export const fetchDeveloperSubscriptions =
  async (): Promise<SubscriptionPlansResponse> => {
    const response = await axiosInstance.get<SubscriptionPlansResponse>(
      "/subscriptions/manage",
    );

    return response.data;
  };

export const updateSubscriptionPlan = async (
  name: string,
  data: UpdateSubscriptionInput,
): Promise<UpdateSubscriptionResponse> => {
  const response = await axiosInstance.patch<UpdateSubscriptionResponse>(
    `/subscriptions/${name}`,
    data,
  );

  return response.data;
};
