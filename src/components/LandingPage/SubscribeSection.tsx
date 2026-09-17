import { useEffect, useState } from "react";

import { Check, FileText, Gauge, Sparkles, Star } from "../site/Icons";
import { Stars } from "../site/Stars";
import { Reveal } from "../../hooks/useReveal";
import { AuthModal } from "../site/AuthModal";
import { useAuth } from "../../stores/useAuth";
import {
  fetchSubscriptionPlans,
  purchaseSubscription,
} from "../../lib/subscription-api";
import {
  subscriptionNameLabel,
  type SubscriptionName,
  type SubscriptionPlan,
} from "../../types/subscription";

const perks = [
  {
    icon: FileText,
    title: "CV Generator",
    body: "Turn your profile into a clean, recruiter-friendly CV in one click — tailored per role.",
  },
  {
    icon: Gauge,
    title: "Skill Assessment",
    body: "Short, honest tests that put a verified badge next to the skills you actually have.",
  },
  {
    icon: Star,
    title: "Priority CV review",
    body: "Your application lands at the top of the pile, with feedback back inside 48 hours.",
  },
];

const price = (value: number) => `IDR ${value.toLocaleString("id-ID")}`;

export function SubscribeSection() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState("");
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const user = useAuth((state) => state.user);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setPlansLoading(true);
        setPlansError("");

        const response = await fetchSubscriptionPlans();

        setPlans(response.data);
      } catch (error) {
        setPlansError(
          error instanceof Error
            ? error.message
            : "Failed to load subscription plans.",
        );
      } finally {
        setPlansLoading(false);
      }
    };

    void loadPlans();
  }, []);

  const subscribe = async (plan: SubscriptionName) => {
    if (!user) {
      sessionStorage.setItem(
        "authReturnTo",
        `${window.location.pathname}${window.location.search}`,
      );

      sessionStorage.setItem("postAuthAction", `subscribe:${plan}`);
      setAuthOpen(true);
      return;
    }

    if (user.role !== "JOB_SEEKER") return;

    try {
      setIsPurchasing(plan);

      const response = await purchaseSubscription({
        plan,
      });

      window.location.assign(response.data.payment.redirectUrl);
    } catch (error) {
      console.error("Failed to purchase subscription:", error);
    } finally {
      setIsPurchasing(null);
    }
  };

  useEffect(() => {
    const action = sessionStorage.getItem("postAuthAction");

    if (user?.role !== "JOB_SEEKER" || !action?.startsWith("subscribe:")) {
      return;
    }

    sessionStorage.removeItem("postAuthAction");

    void subscribe(action.slice("subscribe:".length) as SubscriptionName);
  }, [user]);

  return (
    <section id="subscribe" className="subscribe-section">
      <Stars />

      <div className="subscribe-content">
        <Reveal className="subscribe-heading">
          <p>MEMBERSHIP</p>

          <h2>
            Unlock the tools that get you <span>hired sooner</span>
          </h2>
        </Reveal>

        <div className="pricing-grid">
          <Reveal delay={0}>
            <article>
              <h3>Free</h3>
              <p>Everything you need to start applying.</p>

              <strong>Free</strong>

              <ul>
                {[
                  ["Unlimited job search & company browsing", true],
                  ["Jobs near you, within your city radius", true],
                  ["Track your job applications", true],
                  ["CV Generator", false],
                  ["Skill Assessment", false],
                  ["Priority CV review", false],
                ].map(([label, included]) => (
                  <li key={String(label)}>
                    <Check className={included ? "included" : ""} />

                    <span className={included ? "" : "disabled"}>{label}</span>
                  </li>
                ))}
              </ul>

              <button type="button" onClick={() => setAuthOpen(true)}>
                Create free account
              </button>
            </article>
          </Reveal>

          {plansLoading ? (
            <p>Loading subscription plans...</p>
          ) : plansError ? (
            <p>{plansError}</p>
          ) : (
            plans.map((plan, index) => {
              const featured = plan.name === "STANDARD";
              const assessmentLimit = plan.featuresAccess.skillAssessmentLimit;

              return (
                <Reveal key={plan.id} delay={(index + 1) * 100}>
                  <article className={featured ? "featured" : ""}>
                    {featured && (
                      <em>
                        <Sparkles />
                        Most popular
                      </em>
                    )}

                    <h3>{subscriptionNameLabel(plan.name)}</h3>

                    <p>
                      {plan.name === "STANDARD"
                        ? "For people who are actively hunting."
                        : "Serious about landing the right offer."}
                    </p>

                    <strong>
                      {price(plan.price)}
                      <small>/{plan.durationDays} days</small>
                    </strong>

                    <ul>
                      <li>
                        <Check className="included" />
                        <span>Everything in Free</span>
                      </li>

                      {plan.featuresAccess.cvGenerator ? (
                        <li>
                          <Check className="included" />
                          <span>CV Generator</span>
                        </li>
                      ) : null}

                      {assessmentLimit === null ? (
                        <li>
                          <Check className="included" />
                          <span>Unlimited Skill Assessments</span>
                        </li>
                      ) : typeof assessmentLimit === "number" ? (
                        <li>
                          <Check className="included" />
                          <span>
                            Skill Assessment up to {assessmentLimit} times per
                            subscription
                          </span>
                        </li>
                      ) : null}

                      {plan.featuresAccess.priorityReview ? (
                        <li>
                          <Check className="included" />
                          <span>Priority review when applying</span>
                        </li>
                      ) : (
                        <li>
                          <Check />
                          <span className="disabled">
                            Priority review when applying
                          </span>
                        </li>
                      )}
                    </ul>

                    <button
                      type="button"
                      disabled={isPurchasing !== null}
                      onClick={() => void subscribe(plan.name)}
                    >
                      {isPurchasing === plan.name
                        ? "Redirecting..."
                        : `Subscribe to ${subscriptionNameLabel(plan.name)}`}
                    </button>
                  </article>
                </Reveal>
              );
            })
          )}
        </div>

        <div className="perk-grid">
          {perks.map(({ icon: Icon, title, body }, index) => (
            <Reveal key={title} delay={index * 90}>
              <article>
                <Icon />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <AuthModal
        open={authOpen}
        initialMode="register"
        initialRole="JOB_SEEKER"
        onClose={() => setAuthOpen(false)}
      />
    </section>
  );
}
