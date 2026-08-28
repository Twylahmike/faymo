import Layout from "@/components/layout/Layout";

const Privacy = () => {
  return (
    <Layout>
      <section className="relative py-24 lg:py-32">
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Legal</p>
            <h1 className="font-display text-3xl font-bold sm:text-4xl mb-6">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mb-10">Last updated: August 2026</p>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">Information we collect</h2>
                <p>
                  When you submit a request through this site — for example the "Contact Sales" or custom
                  quote form — we collect the details you provide, such as your name, email, phone number,
                  company, and project requirements, so we can respond to your enquiry. Clients and team
                  members using the ORION dashboard have accounts that store the information needed to
                  deliver and manage their projects.
                </p>
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">How we use it</h2>
                <p>
                  We use the information you provide to respond to enquiries, scope and deliver projects,
                  manage client accounts, and communicate about work in progress. We do not sell your
                  personal information to third parties.
                </p>
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">Data storage</h2>
                <p>
                  Account and project data is stored with our infrastructure provider using
                  industry-standard security practices, including access controls scoped to your role.
                </p>
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">Your rights</h2>
                <p>
                  You may request access to, correction of, or deletion of your personal data at any time
                  by contacting{" "}
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

export default Privacy;
