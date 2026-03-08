import { Star } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO, Talent Agency X",
    content: "F🩵ymo completely transformed how we manage our creator roster. What used to take days now takes minutes.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Brand Manager, StyleCo",
    content: "The AI copilot alone saved us 20+ hours per week on campaign planning and creator matching. Absolutely incredible.",
    rating: 5,
  },
  {
    name: "Elena Rossi",
    role: "Influencer Marketing Lead",
    content: "Finally, a platform that understands the creator economy. The analytics and workflow automation are unmatched.",
    rating: 5,
  },
];

const Testimonials = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="relative py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-6" ref={ref}>
        <div className={`mx-auto max-w-2xl text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Testimonials</p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Loved by <span className="text-gradient">industry leaders</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <div
              key={t.name}
              className={`glass-card p-6 transition-all duration-700 hover:glow-border ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 150 + 200}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed mb-6">"{t.content}"</p>
              <div>
                <p className="font-display text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
