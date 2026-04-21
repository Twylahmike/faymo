import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Sparkles, X } from "lucide-react";

interface OnboardingState {
  profile_completed: boolean;
  first_upload_completed: boolean;
  dismissed: boolean;
}

const MemberOnboardingChecklist = () => {
  const { user } = useAuth();
  const { isWorker } = useUserRole();
  const navigate = useNavigate();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isWorker) { setLoading(false); return; }
    const load = async () => {
      // Read or initialize onboarding row
      const { data } = await supabase
        .from("member_onboarding")
        .select("profile_completed, first_upload_completed, dismissed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) {
        await supabase.from("member_onboarding").insert({ user_id: user.id });
        setState({ profile_completed: false, first_upload_completed: false, dismissed: false });
      } else {
        setState(data as OnboardingState);
      }

      // Auto-detect profile completion (display name set & non-default)
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, bio")
        .eq("user_id", user.id)
        .maybeSingle();

      const hasProfile = !!(profile?.display_name && profile.display_name !== user.email);
      if (hasProfile && data && !data.profile_completed) {
        await supabase.from("member_onboarding").update({ profile_completed: true }).eq("user_id", user.id);
        setState((s) => s ? { ...s, profile_completed: true } : s);
      }
      setLoading(false);
    };
    load();
  }, [user, isWorker]);

  const dismiss = async () => {
    if (!user) return;
    await supabase.from("member_onboarding").update({ dismissed: true }).eq("user_id", user.id);
    setState((s) => s ? { ...s, dismissed: true } : s);
  };

  if (loading || !isWorker || !state || state.dismissed) return null;
  if (state.profile_completed && state.first_upload_completed) return null;

  const steps = [
    { done: state.profile_completed, label: "Complete your profile", action: () => navigate("/dashboard/settings") },
    { done: state.first_upload_completed, label: "Submit your first work item", action: () => navigate("/dashboard/my-work") },
  ];

  return (
    <div className="glass-card rounded-2xl border border-primary/30 bg-primary/5 p-5 relative">
      <button onClick={dismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-display font-bold">Welcome! Let's get you set up</h3>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <button key={i} onClick={step.action}
            className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-accent/30 transition-colors">
            {step.done
              ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
            <span className={`text-sm ${step.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {step.label}
            </span>
          </button>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={dismiss} className="mt-3 text-xs text-muted-foreground">
        Dismiss checklist
      </Button>
    </div>
  );
};

export default MemberOnboardingChecklist;