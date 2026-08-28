import Layout from "@/components/layout/Layout";

const Terms = () => {
  return (
    <Layout>
      <section className="relative py-24 lg:py-32">
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Legal</p>
            <h1 className="font-display text-3xl font-bold sm:text-4xl mb-6">Terms of Service</h1>
            <p className="text-sm text-muted-foreground mb-10">Last updated: August 2026</p>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">Engagements</h2>
                <p>
                  Services described on this site are delivered under a separate written agreement or
                  statement of work with ORION. Pricing shown publicly is indicative; final scope, pricing,
                  and delivery timelines are confirmed once we understand your requirements, including for
                  any request submitted through a "Contact Sales" or custom quote form.
                </p>
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">Client accounts</h2>
                <p>
                  ORION dashboard and client portal access is invite-only and issued to clients and team
                  members for the purpose of managing active work. Credentials are personal and must not
                  be shared. Access may be revoked at ORION's discretion, including at the end of an
                  engagement.
                </p>
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">Intellectual property</h2>
                <p>
                  Ownership of deliverables produced under an engagement is governed by that engagement's
                  written agreement. Absent a specific agreement, ORION retains ownership of its own
                  internal tools, frameworks, and pre-existing intellectual property used to deliver work.
                </p>
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">Contact</h2>
                <p>
                  Questions about these terms can be sent to{" "}
                  <a href="mailto:hello@orion.com" className="text-primary hover:underline">
                    hello@orion.com
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Terms;
