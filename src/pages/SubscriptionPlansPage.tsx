import { useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import {
  fetchSubscriptionPlans,
  purchaseSubscription,
} from "../lib/subscription-api";
import type { SubscriptionName, SubscriptionPlan } from "../types/subscription";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<SubscriptionName | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchSubscriptionPlans();

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

    void loadPlans();
  }, []);

  const handlePurchase = async (plan: SubscriptionName) => {
    try {
      setPurchasing(plan);
      setError("");

      const response = await purchaseSubscription({
        plan,
      });

      window.location.href = response.data.payment.redirectUrl;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create subscription payment.",
      );

      setPurchasing(null);
    }
  };

  return (
    <div className="workspace-dashboard">
      <Navbar />

      <main>
        <section className="role-panel">
          <div className="analytics-intro">
            <p className="eyebrow">Membership</p>
            <h1>Choose your subscription</h1>
            <p>
              Unlock premium tools for your job search and professional profile.
            </p>
          </div>

          {error ? <p className="profile-error">{error}</p> : null}

          {loading ? (
            <p>Loading subscription plans...</p>
          ) : (
            <div className="panel-grid">
              {plans.map((plan) => (
                <article className="panel-card" key={plan.id}>
                  <p className="eyebrow">Subscription plan</p>

                  <h2>{plan.name}</h2>

                  <strong>{formatPrice(plan.price)}</strong>

                  <p>{plan.durationDays} days</p>

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
                        assessment attempts
                      </li>
                    ) : null}

                    {plan.featuresAccess.priorityReview ? (
                      <li>Priority application review</li>
                    ) : null}
                  </ul>

                  <button
                    className="button button-primary"
                    type="button"
                    disabled={purchasing !== null}
                    onClick={() => void handlePurchase(plan.name)}
                  >
                    {purchasing === plan.name
                      ? "Opening payment..."
                      : `Subscribe to ${plan.name}`}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
