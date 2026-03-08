import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Can I try F🩵ymo for free?",
    a: "Yes! Our Starter plan is completely free and includes core features for managing up to 10 creators. No credit card required.",
  },
  {
    q: "How does the AI Copilot work?",
    a: "Our AI Copilot analyzes your creator data, campaign history, and industry trends to provide smart recommendations for creator matching, content strategy, and budget optimization.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
  },
  {
    q: "Is my data secure?",
    a: "Security is our top priority. We use enterprise-grade encryption, SOC 2 compliance, and regular security audits to keep your data safe.",
  },
  {
    q: "Do you offer custom enterprise solutions?",
    a: "Yes, our Enterprise plan includes custom integrations, dedicated support, SLA guarantees, and tailored onboarding. Contact our sales team for details.",
  },
];

const PricingFAQ = () => {
  return (
    <section id="faq" className="py-24 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">FAQ</p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Frequently asked <span className="text-gradient">questions</span>
          </h2>
        </div>

        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass-card rounded-xl px-6 border-border/50"
              >
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default PricingFAQ;
