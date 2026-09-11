export type SubscriptionName = "STANDARD" | "PROFESSIONAL";

export type SubscriptionFeatures = {
  cvGenerator?: boolean;
  skillAssessmentLimit?: number | null;
  priorityReview?: boolean;
  [key: string]: unknown;
};

export type SubscriptionPlan = {
  id: number;
  name: SubscriptionName;
  price: number;
  durationDays: number;
  featuresAccess: SubscriptionFeatures;
  createdAt?: string;
  updatedAt?: string;
};

export type SubscriptionPlansResponse = {
  message: string;
  data: SubscriptionPlan[];
};

export type UpdateSubscriptionInput = {
  price?: number;
  durationDays?: number;
  featuresAccess?: SubscriptionFeatures;
};

export type UpdateSubscriptionResponse = {
  message: string;
  data: SubscriptionPlan;
};

export type PurchaseSubscriptionInput = {
  plan: SubscriptionName;
};

export type PurchaseSubscriptionResponse = {
  message: string;
  data: {
    subscription: {
      id: number;
      userId: number;
      subscriptionId: number;
      status: "PENDING_APPROVAL" | "ACTIVE" | "EXPIRED";
      paymentStatus: string | null;
      midtransOrderId: string | null;
      midtransSnapToken: string | null;
      midtransRedirectUrl: string | null;
      startDate: string | null;
      endDate: string | null;
      subscription: SubscriptionPlan;
    };
    payment: {
      orderId: string;
      snapToken: string;
      redirectUrl: string;
    };
  };
};
