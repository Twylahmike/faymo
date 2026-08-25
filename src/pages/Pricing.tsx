import { useEffect, useState } from "react";
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
            <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="glass-card flex flex-col rounded-2xl p-8 transition-all duration-300 hover:glow-border"
                >
                  <div className="mb-4">
                    {service.category && (
                      <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">{service.category}</p>
                    )}
                    <h3 className="font-display text-xl font-bold">{service.name}</h3>
                    {service.description && (
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    )}
                  </div>
                  <div className="mt-auto pt-4">
                    <div className="mb-4">
                      <span className="font-display text-3xl font-bold">
                        {service.currency || "KES"} {Number(service.price).toLocaleString()}
                      </span>
                    </div>
                    <CustomRequestDialog presetMessage={`I'm interested in "${service.name}".\n\n`}>
                      <Button className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        Enquire About This
                      </Button>
                    </CustomRequestDialog>
                  </div>
                </div>
              ))}

              {/* Custom / enterprise card */}
              <div className="relative glass-card glow-border border-primary/40 flex flex-col rounded-2xl p-8 transition-all duration-300">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Custom
                </div>
                <div className="mb-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold">Something bespoke</h3>
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
                    Request a Custom Quote
                  </Button>
                </CustomRequestDialog>
              </div>

              {!loading && services.length === 0 && (
                <div className="sm:col-span-2 lg:col-span-3 glass-card rounded-2xl p-12 text-center">
                  <p className="text-muted-foreground">No published services yet — check back soon, or request a custom quote above.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <PricingFAQ />
    </Layout>
  );
};

export default Pricing;
