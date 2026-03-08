import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName.trim()) {
      toast.error("Agency name is required");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, agencyName.trim());
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to confirm your account!");
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="absolute top-0 left-0 right-0 hero-glow h-96 pointer-events-none" />
      <div className="relative w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold">F<span className="text-primary">🩵</span>ymo</span>
        </div>
        <h1 className="font-display text-2xl font-bold mb-1">Register your agency</h1>
        <p className="text-sm text-muted-foreground mb-2">Create an agency account to manage your team, clients & creators</p>
        <p className="text-xs text-muted-foreground/70 mb-8">Are you a client or team member? Ask your agency for login credentials.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="agency-name">Agency Name *</Label>
            <Input
              id="agency-name"
              type="text"
              placeholder="Your agency name"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="agency@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-secondary border-border"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground mt-2">
            {loading ? "Creating agency..." : "Register Agency"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
