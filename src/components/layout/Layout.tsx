import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { hash } = useLocation();

  // Client-side route changes don't auto-scroll to a URL hash the way a full
  // page load does — so "/#divisions"-style links (used to reach a homepage
  // section from any other page) need a manual scroll once the target
  // section has actually rendered.
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    // Wait a tick for the destination page's content to mount before scrolling.
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [hash]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
