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
