import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32">
      {/* Background glow */}
      <div className="hero-glow absolute inset-0 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Now in Public Beta
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Manage Your Creators.
            <br />
            <span className="text-gradient">Scale Your Impact.</span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
            F🩵ymo is the all-in-one platform for agencies and brands to discover, manage, and collaborate with creators and influencers — powered by AI.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="rounded-full bg-primary text-primary-foreground px-8 text-base font-semibold hover:bg-primary/90 animate-pulse-glow"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-border/50 px-8 text-base hover:bg-secondary"
            >
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
            {[
              { value: "10K+", label: "Creators Managed" },
              { value: "500+", label: "Agencies" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-bold text-gradient">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="glass-card glow-border overflow-hidden rounded-2xl p-1">
            <div className="rounded-xl bg-secondary/50 p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-accent/60" />
                <div className="h-3 w-3 rounded-full bg-primary/60" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Active Campaigns", value: "24" },
                  { label: "Total Reach", value: "4.2M" },
                  { label: "Revenue", value: "$128K" },
                ].map((item) => (
                  <div key={item.label} className="glass-card p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-1 font-display text-2xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="glass-card rounded-lg p-4 h-32 flex items-end">
                  <div className="flex items-end gap-1 w-full">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-primary/60"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="glass-card rounded-lg p-4 h-32 flex flex-col justify-between">
                  {["Instagram", "TikTok", "YouTube"].map((platform) => (
                    <div key={platform} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{platform}</span>
                      <div className="h-2 w-24 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.random() * 40 + 50}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow behind card */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
