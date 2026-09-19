import { axiosInstance } from "./axios";
import type {
  PurchaseSubscriptionInput,
  PurchaseSubscriptionResponse,
  SubscriptionPlan,
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

export const fetchSubscriptionPlans =
  async (): Promise<SubscriptionPlansResponse> => {
    const response = await axiosInstance.get<
      SubscriptionPlansResponse | SubscriptionPlan[]
    >("/subscriptions");

    if (Array.isArray(response.data)) {
      return {
        message: "Subscription plans retrieved successfully",
        data: response.data,
      };
    }

    if (!Array.isArray(response.data?.data)) {
      throw new Error("Subscription plans are temporarily unavailable.");
    }

    return response.data;
  };

export const purchaseSubscription = async (
  data: PurchaseSubscriptionInput,
): Promise<PurchaseSubscriptionResponse> => {
  const response = await axiosInstance.post<PurchaseSubscriptionResponse>(
    "/subscriptions/purchase",
    data,
  );

  return response.data;
};
