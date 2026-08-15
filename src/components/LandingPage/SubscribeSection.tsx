import { useState } from "react";
import { Check, FileText, Gauge, Sparkles, Star } from "../site/Icons";
import { Stars } from "../site/Stars";
import { Reveal } from "../../hooks/useReveal";

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
      ["Save roles and track applications", true],
      ["CV Generator", false],
      ["Skill Assessment", false],
      ["Priority CV review", false],
    ],
  },
  {
    name: "Polaris Plus",
    tagline: "For people who are actively hunting.",
    monthly: 49000,
    yearly: 490000,
    featured: true,
    features: [
      ["Everything in Free", true],
      ["CV Generator with tailored templates", true],
      ["Skill Assessment badges on your profile", true],
      ["Priority CV review within 48 hours", true],
      ["Application insights & salary benchmarks", true],
      ["Early access to new drops", false],
    ],
  },
  {
    name: "Polaris Pro",
    tagline: "Serious about landing the right offer.",
    monthly: 89000,
    yearly: 890000,
    features: [
      ["Everything in Plus", true],
      ["Human CV review by a hiring partner", true],
      ["Unlimited Skill Assessment retakes", true],
      ["Early access to new drops", true],
      ["Direct intro to 3 companies a month", true],
      ["Interview coaching session", true],
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
const price = (value: number) =>
  `Rp ${(value / 1000).toLocaleString("en-US")}k`;
export function SubscribeSection() {
  const [yearly, setYearly] = useState(false);
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
                  <button>
                    {amount === 0
                      ? "Create free account"
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
