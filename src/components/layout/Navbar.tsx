import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import OrionLogo from "@/components/OrionLogo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Section links are prefixed with "/" so they still work when clicked from
  // a page other than the homepage (e.g. /pricing) — a bare "#divisions"
  // href only scrolls if that section already exists on the current page.
  const navLinks = [
    { label: "Divisions", href: "/#divisions" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/#faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <OrionLogo className="h-8 w-8 text-primary" />
          <span className="font-display text-xl font-bold tracking-tight">
            ORI<span className="text-primary">O</span>N
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link key={link.label} to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </a>
            )
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow" onClick={() => navigate("/pricing")}>
                Get Started
              </Button>
            </>
          )}
        </div>

        <button className="text-foreground md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4 px-6 py-6">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link key={link.label} to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground" onClick={() => setIsOpen(false)}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground" onClick={() => setIsOpen(false)}>
                  {link.label}
                </a>
              )
            )}
            <div className="flex gap-3 pt-2">
              {user ? (
                <Button size="sm" className="rounded-full bg-primary text-primary-foreground" onClick={() => { navigate("/dashboard"); setIsOpen(false); }}>Dashboard</Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { navigate("/login"); setIsOpen(false); }}>Login</Button>
                  <Button size="sm" className="rounded-full bg-primary text-primary-foreground" onClick={() => { navigate("/pricing"); setIsOpen(false); }}>Get Started</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
