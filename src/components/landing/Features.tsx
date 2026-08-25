import {
  Brain,
  Workflow,
  Code2,
  Palette,
  Plug,
  BarChart3,
  Cloud,
  ShieldCheck,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const divisions = [
  {
    icon: Brain,
    title: "ORION AI",
    description: "Custom AI agents, LLM applications, chatbots, and voice AI that think and act on your business's behalf.",
    services: [
      "Custom AI Agent Development",
      "AI Sales Agents",
      "AI Customer-Service Agents",
      "Retrieval-Augmented Generation (RAG)",
      "AI Voice Receptionists",
      "Multilingual AI Assistants",
    ],
  },
  {
    icon: Workflow,
    title: "ORION Automation",
    description: "Business, sales, and marketing workflows automated end-to-end — from lead capture to fulfillment.",
    services: [
      "Business Process Automation",
      "Workflow Automation",
      "RPA Implementation",
      "Lead Scoring & Routing",
      "Sales Pipeline Automation",
      "Email & WhatsApp Marketing Automation",
    ],
  },
  {
    icon: Code2,
    title: "ORION Software",
    description: "SaaS platforms, web apps, mobile apps, and custom software engineered for scale.",
    services: [
      "Custom Web Applications",
      "SaaS Platforms",
      "Android & iOS Applications",
      "CRM & ERP Platforms",
      "API Development",
      "Microservices & Serverless Applications",
    ],
  },
  {
    icon: Palette,
    title: "ORION Digital",
    description: "Websites, e-commerce, UI/UX, and brand systems that convert and compound.",
    services: [
      "Corporate & Business Websites",
      "E-commerce & Multi-Vendor Marketplaces",
      "UI/UX & Product Design",
      "Brand Strategy & Visual Identity",
      "Landing Pages & Marketing Websites",
      "SEO & Conversion Rate Optimization",
    ],
  },
  {
    icon: Plug,
    title: "ORION Integrations",
    description: "APIs, payments, CRMs, WhatsApp, and third-party systems connected into one operating layer.",
    services: [
      "REST & GraphQL API Development",
      "M-Pesa STK Push / C2B / B2C",
      "Stripe & PayPal Integration",
      "WhatsApp API Integration",
      "CRM & ERP Integrations",
      "Webhook Systems",
    ],
  },
  {
    icon: BarChart3,
    title: "ORION Data",
    description: "Analytics, BI, dashboards, and pipelines that turn raw data into decisions.",
    services: [
      "Business Intelligence & Dashboards",
      "Data Analytics & Visualization",
      "Predictive Analytics & Forecasting",
      "Data Warehousing & Pipelines (ETL/ELT)",
      "KPI & Executive Dashboards",
      "Data Migration & Cleaning",
    ],
  },
  {
    icon: Cloud,
    title: "ORION Infrastructure",
    description: "Cloud architecture, DevOps, deployment, and monitoring that keeps everything running.",
    services: [
      "Cloud Architecture & Migration",
      "CI/CD Pipelines",
      "Containerization & Docker Deployment",
      "Server & Application Monitoring",
      "Database Hosting & Backup Systems",
      "Disaster Recovery",
    ],
  },
  {
    icon: ShieldCheck,
    title: "ORION Security",
    description: "Application security, access control, and auditing that keep your systems trustworthy.",
    services: [
      "Application & API Security",
      "Authentication & Access Control",
      "Vulnerability Assessment",
      "Security Auditing & Monitoring",
      "Encryption & Secrets Management",
      "Fraud Detection Systems",
    ],
  },
];

const Features = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="divisions" className="relative py-24 lg:py-32">
      <div className="container mx-auto px-6" ref={ref}>
        <div className={`mx-auto max-w-2xl text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Divisions</p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            8 divisions, one{" "}
            <span className="text-gradient">digital operating system</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            50+ services organized into the systems that run your entire business.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {divisions.map((division, index) => (
            <div
              key={division.title}
              className={`glass-card group p-6 transition-all duration-700 hover:glow-border hover:bg-card/80 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 80 + 200}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <division.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{division.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{division.description}</p>
              <ul className="flex flex-wrap gap-1.5">
                {division.services.map((service) => (
                  <li
                    key={service}
                    className="rounded-full border border-border/50 bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
