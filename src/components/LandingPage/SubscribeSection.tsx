import { useState } from "react";
import { Check, FileText, Gauge, Sparkles, Star } from "../site/Icons";
import { Stars } from "../site/Stars";
import { Reveal } from "../../hooks/useReveal";
import { purchaseSubscription } from "../../lib/subscription-api";
import type { SubscriptionName } from "../../types/subscription";

type Plan = {
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  featured?: boolean;
  features: [string, boolean][];
};
const plans: Plan[] = [
  {
    name: "Free",
    tagline: "Everything you need to start applying.",
    monthly: 0,
    yearly: 0,
    features: [
      ["Unlimited job search & company browsing", true],
      ["Jobs near you, within your city radius", true],
      ["Track your job applications", true],
      ["CV Generator", false],
      ["Skill Assessment", false],
      ["Priority CV review", false],
    ],
  },
  {
    name: "Polaris Plus",
    tagline: "For people who are actively hunting.",
    monthly: 25000,
    yearly: 250000,
    featured: true,
    features: [
      ["Everything in Free", true],
      ["CV Generator", true],
      ["Skill Assessment up to 2 times per month", true],
      ["Priority review when applying", false],
    ],
  },
  {
    name: "Polaris Pro",
    tagline: "Serious about landing the right offer.",
    monthly: 100000,
    yearly: 1000000,
    features: [
      ["Everything in Free", true],

      ["CV Generator", true],
      ["Unlimited Skill Assessments", true],
      ["Priority review when applying", true],
    ],
  },
];
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
  const [yearly, setYearly] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

  const handlePurchase = async (planName: SubscriptionName) => {
    try {
      setIsPurchasing(planName);

      const response = await purchaseSubscription({
        plan: planName,
      });

      window.location.href = response.data.payment.redirectUrl;
    } catch (error) {
      console.error("Failed to purchase subscription:", error);
    } finally {
      setIsPurchasing(null);
    }
  };
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
        <Reveal className="billing-toggle" delay={80}>
          <button
            className={!yearly ? "active" : ""}
            onClick={() => setYearly(false)}
          >
            Monthly
          </button>
          <button
            className={yearly ? "active" : ""}
            onClick={() => setYearly(true)}
          >
            Yearly <small>2 months free</small>
          </button>
        </Reveal>
        <div className="pricing-grid">
          {plans.map((plan, index) => {
            const amount = yearly ? plan.yearly : plan.monthly;
            return (
              <Reveal key={plan.name} delay={index * 100}>
                <article className={plan.featured ? "featured" : ""}>
                  {plan.featured && (
                    <em>
                      <Sparkles />
                      Most popular
                    </em>
                  )}
                  <h3>{plan.name}</h3>
                  <p>{plan.tagline}</p>
                  <strong>
                    {amount === 0 ? "Free" : price(amount)}
                    {amount > 0 && <small>/{yearly ? "year" : "month"}</small>}
                  </strong>
                  <ul>
                    {plan.features.map(([label, included]) => (
                      <li key={label}>
                        <Check className={included ? "included" : ""} />
                        <span className={included ? "" : "disabled"}>
                          {label}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    disabled={isPurchasing !== null}
                    onClick={() => {
                      if (plan.name === "Polaris Plus") {
                        void handlePurchase("STANDARD");
                      }

                      if (plan.name === "Polaris Pro") {
                        void handlePurchase("PROFESSIONAL");
                      }
                    }}
                  >
                    {amount === 0
                      ? "Create free account"
                      : isPurchasing ===
                          (plan.name === "Polaris Plus"
                            ? "STANDARD"
                            : plan.name === "Polaris Pro"
                              ? "PROFESSIONAL"
                              : null)
                        ? "Redirecting..."
                        : `Subscribe to ${plan.name}`}
                  </button>
                </article>
              </Reveal>
            );
          })}
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
    </section>
  );
}
