import { Search, Cpu, Rocket } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Audit & Strategy",
    description: "We map your business processes, assess AI readiness, and design the systems that will move the needle first.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "Build & Automate",
    description: "We build the AI agents, software, and automations — then integrate them with the tools you already run on.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Deploy & Scale",
    description: "We deploy to production and stay on as your managed technology partner — monitoring, improving, and expanding as you grow.",
  },
];

const HowItWorks = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="how-it-works" className="relative py-24 lg:py-32">
      <div className="container mx-auto px-6" ref={ref}>
        <div className={`mx-auto max-w-2xl text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">How It Works</p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            Three steps to a{" "}
            <span className="text-gradient">digital operating system</span>
          </h2>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent lg:block" />

          <div className="grid gap-12 lg:gap-16">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className={`flex flex-col items-center gap-8 lg:flex-row transition-all duration-700 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${index * 200 + 200}ms` }}
              >
                <div className="flex-1 text-center lg:text-left">
                  <span className="font-display text-5xl font-bold text-primary/20">{step.step}</span>
                  <h3 className="mt-2 font-display text-2xl font-bold">{step.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
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
