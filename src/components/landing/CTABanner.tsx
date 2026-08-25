import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const CTABanner = () => {
  const { ref, isVisible } = useScrollAnimation();
  const navigate = useNavigate();

  return (
    <section className="relative py-24 lg:py-32">
      <div className="container mx-auto px-6" ref={ref}>
        <div className={`relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-12 text-center lg:p-20 transition-all duration-700 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-32 bg-primary/10 blur-[80px] pointer-events-none" />

          <h2 className="relative font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            Ready to <span className="text-gradient">transform</span> your
            <br className="hidden sm:block" /> entire digital operation?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Join the businesses already running on ORION's AI, automation, and software systems.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="rounded-full bg-primary text-primary-foreground px-8 text-base font-semibold hover:bg-primary/90"
              onClick={() => navigate("/pricing")}
            >
              Book a Strategy Call
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
