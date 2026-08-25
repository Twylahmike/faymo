import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What does ORION actually build?",
    a: "Everything from a single website to full AI agents, business automation, custom software, and managed infrastructure — organized across ORION's 8 divisions: AI, Automation, Software, Digital, Integrations, Data, Infrastructure, and Security.",
  },
  {
    q: "How do the AI agents work?",
    a: "We design and deploy custom AI agents — sales, support, operations, and more — that plug into your existing tools, act autonomously on defined workflows, and are monitored and improved on an ongoing basis.",
  },
  {
    q: "What if none of the listed products fit what I need?",
    a: "Use the 'Request a Custom Quote' card on the pricing page. Tell us what you're trying to build and we'll scope something bespoke — often combining multiple divisions into one engagement.",
  },
  {
    q: "Is my data secure?",
    a: "Security is our top priority. Every engagement includes access control, encryption, and audit logging, backed by ORION Security's ongoing monitoring.",
  },
  {
    q: "Do you offer full digital transformation?",
    a: "Yes — a full transformation engagement takes you through business audit, process mapping, AI strategy, software, automation, integrations, infrastructure, deployment, training, and ongoing managed intelligence. Request a custom quote for details.",
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
