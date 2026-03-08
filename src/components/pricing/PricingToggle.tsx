import { cn } from "@/lib/utils";

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: (yearly: boolean) => void;
}

const PricingToggle = ({ isYearly, onToggle }: PricingToggleProps) => {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border/50 bg-secondary/50 p-1">
      <button
        onClick={() => onToggle(false)}
        className={cn(
          "rounded-full px-5 py-2 text-sm font-medium transition-all",
          !isYearly
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Monthly
      </button>
      <button
        onClick={() => onToggle(true)}
        className={cn(
          "rounded-full px-5 py-2 text-sm font-medium transition-all",
          isYearly
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Yearly
        <span className="ml-1.5 text-xs opacity-70">Save 20%</span>
      </button>
    </div>
  );
};

export default PricingToggle;
