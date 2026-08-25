import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
  onSelect?: () => void;
}

const PricingCard = ({ name, price, period, description, features, popular, cta, onSelect }: PricingCardProps) => {
  return (
    <div
      className={`relative glass-card flex flex-col rounded-2xl p-8 transition-all duration-300 ${
        popular ? "glow-border border-primary/40 scale-105" : "hover:glow-border"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-display text-xl font-bold">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-6">
        <span className="font-display text-4xl font-bold">{price}</span>
        {period && <span className="text-muted-foreground text-sm">/{period}</span>}
      </div>

      <ul className="mb-8 flex flex-col gap-3 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        className={`w-full rounded-full ${
          popular
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        {cta}
      </Button>
    </div>
  );
};

export default PricingCard;
