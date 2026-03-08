import { Search, Handshake, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Discover Creators",
    description: "Search and filter through millions of creators by niche, audience, engagement rate, and more.",
  },
  {
    icon: Handshake,
    step: "02",
    title: "Collaborate & Manage",
    description: "Onboard creators, manage contracts, assign campaigns, and track deliverables — all in one place.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Measure & Scale",
    description: "Analyze campaign performance, optimize ROI, and scale your creator program with data-driven insights.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">How It Works</p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            Three steps to{" "}
            <span className="text-gradient">creator success</span>
          </h2>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent lg:block" />

          <div className="grid gap-12 lg:gap-16">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className={`flex flex-col items-center gap-8 lg:flex-row ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 text-center lg:text-left">
                  <span className="font-display text-5xl font-bold text-primary/20">{step.step}</span>
                  <h3 className="mt-2 font-display text-2xl font-bold">{step.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                {/* Center icon */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  <step.icon className="h-7 w-7" />
                </div>

                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
