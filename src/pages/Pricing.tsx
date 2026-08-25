import { useEffect, useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import PricingFAQ from "@/components/pricing/PricingFAQ";
import CustomRequestDialog from "@/components/pricing/CustomRequestDialog";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string | null;
  category: string | null;
}

const MOST_POPULAR_MARKER = "(Most Popular)";

const ServiceCard = ({ service }: { service: Service }) => {
  const popular = service.name.includes(MOST_POPULAR_MARKER);
  const name = service.name.replace(MOST_POPULAR_MARKER, "").trim();

  return (
    <div
      className={`relative glass-card flex flex-col rounded-2xl p-8 transition-all duration-300 ${
        popular ? "glow-border border-primary/40" : "hover:glow-border"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
          Most Popular
        </div>
      )}
      <div className="mb-4">
        <h3 className="font-display text-xl font-bold">{name}</h3>
        {service.description && (
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{service.description}</p>
        )}
      </div>
      <div className="mt-auto pt-4">
        <div className="mb-4">
          <span className="font-display text-3xl font-bold">
            {service.currency || "KES"} {Number(service.price).toLocaleString()}
          </span>
        </div>
        <CustomRequestDialog presetMessage={`I'm interested in "${name}".\n\n`}>
          <Button
            className={`w-full rounded-full ${
              popular
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Enquire About This
          </Button>
        </CustomRequestDialog>
      </div>
    </div>
  );
};

const Pricing = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("services")
      .select("id, name, description, price, currency, category")
      .eq("status", "active")
      .order("category", { ascending: true })
      .order("price", { ascending: true })
      .then(({ data }) => {
        setServices(data || []);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, Service[]>();
    services.forEach((s) => {
      const key = s.category || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return Array.from(map.entries());
  }, [services]);

  return (
    <Layout>
      <section className="pt-32 pb-12 lg:pt-44">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Pricing</p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
            Products &amp; <span className="text-gradient">services</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Pick a product or service below, or tell us what you need and we'll scope something custom.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="mx-auto max-w-6xl space-y-16">
              {categories.map(([category, items]) => (
                <div key={category}>
                  <h2 className="font-display text-2xl font-bold mb-6">{category}</h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </div>
              ))}

              {services.length === 0 && (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <p className="text-muted-foreground">No published services yet — check back soon, or request a custom quote below.</p>
                </div>
              )}

              {/* Custom / enterprise card */}
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">Something Bespoke</h2>
                <div className="relative glass-card glow-border border-primary/40 flex flex-col rounded-2xl p-8 max-w-md transition-all duration-300">
                  <div className="mb-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-bold">Custom Quote</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Full digital transformation, a custom platform, or a mix of the above — tell us what you need and we'll scope it.
                    </p>
                  </div>
                  <ul className="mb-6 flex flex-col gap-2.5 flex-1">
                    {[
                      "Scoped to your exact requirements",
                      "Combine multiple divisions & services",
                      "Dedicated account manager",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <CustomRequestDialog>
                    <Button className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Contact Sales
                    </Button>
                  </CustomRequestDialog>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <PricingFAQ />
    </Layout>
  );
};

export default Pricing;
