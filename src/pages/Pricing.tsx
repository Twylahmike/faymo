import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PricingCard from "@/components/pricing/PricingCard";
import PricingToggle from "@/components/pricing/PricingToggle";
import PricingFAQ from "@/components/pricing/PricingFAQ";

const plans = [
  {
    name: "Starter",
    monthlyPrice: "Free",
    yearlyPrice: "Free",
    period: "",
    description: "For individuals just getting started",
    features: [
      "Up to 10 creators",
      "Basic analytics dashboard",
      "Email support",
      "1 team member",
      "Community access",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    monthlyPrice: "$49",
    yearlyPrice: "$39",
    period: "mo",
    description: "For growing agencies and brands",
    features: [
      "Unlimited creators",
      "Advanced analytics & reports",
      "AI Copilot",
      "Unified messaging inbox",
      "Content vault (50GB)",
      "Up to 10 team members",
      "Priority support",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    period: "",
    description: "For large teams with custom needs",
    features: [
      "Everything in Pro",
      "Custom integrations & API",
      "Unlimited storage",
      "SSO & advanced security",
      "Dedicated account manager",
      "Custom onboarding",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <Layout>
      <section className="pt-32 pb-12 lg:pt-44">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Pricing</p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
            Simple, transparent <span className="text-gradient">pricing</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>

          <div className="mt-10">
            <PricingToggle isYearly={isYearly} onToggle={setIsYearly} />
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 items-start">
            {plans.map((plan) => (
              <PricingCard
                key={plan.name}
                name={plan.name}
                price={isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                period={plan.period}
                description={plan.description}
                features={plan.features}
                popular={plan.popular}
                cta={plan.cta}
              />
            ))}
          </div>
        </div>
      </section>

      <PricingFAQ />
    </Layout>
  );
};

export default Pricing;
