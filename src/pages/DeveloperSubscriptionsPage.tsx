import { useEffect, useState } from "react";
import { DeveloperShell } from "../components/Developer/DeveloperShell";
import {
  fetchDeveloperSubscriptions,
  updateSubscriptionPlan,
} from "../lib/subscription-api";
import {
  subscriptionNameLabel,
  type SubscriptionPlan,
} from "../types/subscription";

export default function DeveloperSubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchDeveloperSubscriptions();

        setPlans(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load subscription plans.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadSubscriptions();
  }, []);

  const updatePlanField = (
    planName: string,
    field: "price" | "durationDays",
    value: number,
  ) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.name === planName
          ? {
              ...plan,
              [field]: value,
            }
          : plan,
      ),
    );
  };

  const handleSave = async (plan: SubscriptionPlan) => {
    try {
      setSavingPlan(plan.name);
      setMessage("");
      setError("");

      const response = await updateSubscriptionPlan(plan.name, {
        price: plan.price,
        durationDays: plan.durationDays,
      });

      setPlans((currentPlans) =>
        currentPlans.map((currentPlan) =>
          currentPlan.name === plan.name ? response.data : currentPlan,
        ),
      );

      setMessage(
        `${subscriptionNameLabel(plan.name)} subscription updated successfully.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update subscription plan.",
      );
    } finally {
      setSavingPlan(null);
    }
  };

  return (
    <DeveloperShell
      eyebrow="Developer tools"
      title="Subscription management"
      lead="Configure the available subscription tiers, pricing, and subscription duration."
    >
      <section className="role-panel subscription-management-page">
        {message ? <p>{message}</p> : null}
        {error ? <p>{error}</p> : null}

        {loading ? (
          <p>Loading subscription plans...</p>
        ) : (
          <div className="panel-grid">
            {plans.map((plan) => (
              <article className="panel-card" key={plan.id}>
                <p className="eyebrow">Subscription plan</p>
                <h2>{plan.name}</h2>

                <div className="subscription-plan-fields">
                  <label className="subscription-plan-field">
                    <span>Price</span>

                    <div className="subscription-input-wrap">
                      <span className="subscription-input-prefix">IDR</span>
                      <input
                        type="number"
                        min="1"
                        value={plan.price}
                        onChange={(event) =>
                          updatePlanField(
                            plan.name,
                            "price",
                            Number(event.target.value),
                          )
                        }
                      />
                    </div>
                  </label>

                  <label className="subscription-plan-field">
                    <span>Duration</span>

                    <div className="subscription-input-wrap">
                      <input
                        type="number"
                        min="1"
                        value={plan.durationDays}
                        onChange={(event) =>
                          updatePlanField(
                            plan.name,
                            "durationDays",
                            Number(event.target.value),
                          )
                        }
                      />
                      <span className="subscription-input-suffix">days</span>
                    </div>
                  </label>
                </div>

                <div className="subscription-plan-features">
                  <span>Included features</span>

                  <ul>
                    {plan.featuresAccess.cvGenerator ? (
                      <li>CV Generator</li>
                    ) : null}

                    {plan.featuresAccess.skillAssessmentLimit === null ? (
                      <li>Unlimited skill assessments</li>
                    ) : typeof plan.featuresAccess.skillAssessmentLimit ===
                      "number" ? (
                      <li>
                        {plan.featuresAccess.skillAssessmentLimit} skill
                        assessments
                      </li>
                    ) : null}

                    {plan.featuresAccess.priorityReview ? (
                      <li>Priority application review</li>
                    ) : null}
                  </ul>
                </div>

                <button
                  className="button button-primary"
                  type="button"
                  disabled={savingPlan === plan.name}
                  onClick={() => void handleSave(plan)}
                >
                  {savingPlan === plan.name ? "Saving..." : "Save changes"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </DeveloperShell>
  );
}
