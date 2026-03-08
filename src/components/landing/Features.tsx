import {
  BarChart3,
  MessageSquare,
  Brain,
  FolderLock,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track creator performance, campaign ROI, and audience insights in real-time with powerful dashboards.",
  },
  {
    icon: MessageSquare,
    title: "Unified Messaging",
    description: "Communicate with all your creators from one inbox. Email, DMs, and chat — all in one place.",
  },
  {
    icon: Brain,
    title: "AI Copilot",
    description: "Get smart recommendations for creator matching, content strategy, and campaign optimization.",
  },
  {
    icon: FolderLock,
    title: "Content Vault",
    description: "Securely store, organize, and share creative assets with built-in approval workflows.",
  },
  {
    icon: Users,
    title: "Creator CRM",
    description: "Manage your entire talent roster with profiles, contracts, rates, and collaboration history.",
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description: "Automate repetitive tasks — from onboarding to payments — with customizable workflows.",
  },
];

const Features = () => {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Features</p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            Everything you need to{" "}
            <span className="text-gradient">manage creators</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            A complete toolkit designed for agencies, brands, and talent managers.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card group p-6 transition-all duration-300 hover:glow-border hover:bg-card/80"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
