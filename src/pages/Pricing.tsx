import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PricingCard from "@/components/pricing/PricingCard";
import PricingToggle from "@/components/pricing/PricingToggle";
import PricingFAQ from "@/components/pricing/PricingFAQ";

const plans = [
  {
    name: "Starter",
    monthlyPrice: "$1,500",
    yearlyPrice: "$1,200",
    period: "mo",
    description: "Website + AI chatbot + analytics",
    features: [
      "Business or marketing website",
      "AI chatbot for website & socials",
      "Core analytics & tracking",
      "Basic SEO setup",
      "Email support",
    ],
    cta: "Get Started",
  },
  {
    name: "Growth",
    monthlyPrice: "$4,500",
    yearlyPrice: "$3,600",
    period: "mo",
    description: "Website + CRM + automation + AI support",
    features: [
      "Everything in Starter",
      "Custom CRM & sales pipeline",
      "Sales & marketing automation",
      "AI customer-support agent",
      "Executive dashboards",
      "Priority support",
    ],
    popular: true,
    cta: "Start Growth Plan",
  },
  {
    name: "Scale",
    monthlyPrice: "$12,000",
    yearlyPrice: "$9,600",
    period: "mo",
    description: "Custom software + AI agents + integrations",
    features: [
      "Everything in Growth",
      "Custom software / SaaS platform",
      "Multi-agent AI systems",
      "Payment & third-party integrations",
      "Data pipelines & forecasting",
      "Dedicated account manager",
    ],
    cta: "Talk to Sales",
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    period: "",
    description: "Complete digital transformation",
    features: [
      "Business audit & process mapping",
      "AI & technology strategy",
      "Custom infrastructure & security",
      "Managed AI & automation (Managed Intelligence)",
      "Team training & AI governance",
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
            From a single website to a full digital transformation — packages that grow with your business.
          </p>

          <div className="mt-10">
            <PricingToggle isYearly={isYearly} onToggle={setIsYearly} />
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-4 items-start">
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
                onSelect={() => {
                  window.location.href = `mailto:hello@orion.com?subject=${encodeURIComponent(
                    `${plan.name} plan inquiry`
                  )}`;
                }}
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
