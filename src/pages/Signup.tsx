import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import OrionLogo from "@/components/OrionLogo";

// Public self-registration is disabled — ORION is invite-only. Team member
// credentials are created from the dashboard's Team page. This page is kept
// as a friendly landing spot for anyone who still has an old /signup link.
const Signup = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="absolute top-0 left-0 right-0 hero-glow h-96 pointer-events-none" />
      <div className="relative w-full max-w-sm text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="flex items-center justify-center gap-2 mb-2">
          <OrionLogo className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold">ORI<span className="text-primary">O</span>N</span>
        </div>
        <h1 className="font-display text-2xl font-bold mb-1">Sign-ups are closed</h1>
        <p className="text-sm text-muted-foreground mb-8">
          ORION is invite-only. If you're a team member, ask your admin for login credentials.
        </p>

        <Link to="/login">
          <Button className="w-full rounded-full bg-primary text-primary-foreground">
            Go to Login
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Signup;
