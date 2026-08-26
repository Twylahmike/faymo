import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OrionLogo from "@/components/OrionLogo";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="absolute top-0 left-0 right-0 hero-glow h-96 pointer-events-none" />
      <div className="relative w-full max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <OrionLogo className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold">ORI<span className="text-primary">O</span>N</span>
        </div>
        <h1 className="font-display text-2xl font-bold mb-1">Set new password</h1>
        <p className="text-sm text-muted-foreground mb-8">Enter your new password below</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-secondary border-border" />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground mt-2">
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
