import { Link } from "react-router-dom";
import OrionLogo from "@/components/OrionLogo";

const Footer = () => {
  const footerLinks = {
    Divisions: [
      { label: "ORION AI", href: "/#divisions" },
      { label: "ORION Automation", href: "/#divisions" },
      { label: "ORION Software", href: "/#divisions" },
      { label: "ORION Enterprise", href: "/pricing" },
    ],
    Company: [
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "mailto:hello@orion.com" },
    ],
    Legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  };

  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <OrionLogo className="h-8 w-8 text-primary" />
              <span className="font-display text-xl font-bold">
                ORI<span className="text-primary">O</span>N
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Intelligent digital systems that help businesses operate, automate, sell, and scale.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display text-sm font-semibold mb-4">{title}</h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ORION. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            The digital operating system for modern business.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
