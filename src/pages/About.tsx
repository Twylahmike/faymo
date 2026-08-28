import Layout from "@/components/layout/Layout";

const About = () => {
  return (
    <Layout>
      <section className="relative py-24 lg:py-32">
        <div className="absolute top-0 left-0 right-0 hero-glow h-96 pointer-events-none" />
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">About</p>
            <h1 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl mb-6">
              We build the <span className="text-gradient">operating system</span> for modern business
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              ORION is an AI, automation, software, digital infrastructure, and technology consultancy.
              We work across eight divisions — AI, Automation, Software, Digital, Integrations, Data,
              Infrastructure, and Security — to help businesses replace manual, disconnected work with
              intelligent systems that run themselves.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Rather than handing off a one-off project, we act as an embedded technology partner:
              designing, building, and maintaining the agents, workflows, platforms, and infrastructure
              that let our clients operate, automate, sell, and scale without adding headcount for
              every new system.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Have a project in mind or want to talk through what's possible? Reach us at{" "}
              <a href="mailto:hello@orion.com" className="text-primary hover:underline">
                hello@orion.com
              </a>.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
