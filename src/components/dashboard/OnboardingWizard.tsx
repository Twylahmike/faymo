import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { User, Briefcase, Building2, FolderKanban, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { id: "profile", label: "Your Profile", icon: User },
  { id: "service", label: "First Service", icon: Briefcase },
  { id: "client", label: "First Client", icon: Building2 },
  { id: "project", label: "First Project", icon: FolderKanban },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({ display_name: "", bio: "" });
  const [service, setService] = useState({ name: "", description: "", price: "", category: "" });
  const [client, setClient] = useState({ name: "", company: "", email: "", phone: "" });
  const [project, setProject] = useState({ name: "", description: "" });

  // Track created IDs to link project to client
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (step === 0) {
        // Save profile
        if (!profile.display_name) { toast.error("Please enter your name"); setLoading(false); return; }
        const { error } = await supabase.from("profiles").update({
          display_name: profile.display_name, bio: profile.bio || null,
        }).eq("user_id", user.id);
        if (error) throw error;
      } else if (step === 1) {
        // Create service
        if (!service.name) { toast.error("Please enter a service name"); setLoading(false); return; }
        const { error } = await supabase.from("services").insert({
          name: service.name, description: service.description || null,
          price: parseFloat(service.price) || 0, category: service.category || null,
          user_id: user.id,
        });
        if (error) throw error;
      } else if (step === 2) {
        // Create client
        if (!client.name) { toast.error("Please enter a client name"); setLoading(false); return; }
        const { data, error } = await supabase.from("clients").insert({
          name: client.name, company: client.company || null,
          email: client.email || null, phone: client.phone || null,
          agency_user_id: user.id,
        }).select("id").single();
        if (error) throw error;
        setCreatedClientId(data.id);
      } else if (step === 3) {
        // Create project
        if (!project.name) { toast.error("Please enter a project name"); setLoading(false); return; }
        const { error } = await supabase.from("projects").insert({
          name: project.name, description: project.description || null,
          client_id: createdClientId, created_by: user.id,
        });
        if (error) throw error;

        // Mark onboarding as complete
        await supabase.auth.updateUser({ data: { onboarding_completed: true } });
        toast.success("You're all set! Welcome to your agency dashboard.");
        onComplete();
        return;
      }
      setStep(s => s + 1);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (step === 3) {
      await supabase.auth.updateUser({ data: { onboarding_completed: true } });
      toast.success("Setup complete!");
      onComplete();
      return;
    }
    setStep(s => s + 1);
  };

  const StepIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-2">
            <StepIcon className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">Welcome! Let's set up your agency</h1>
          <p className="text-muted-foreground text-sm">Step {step + 1} of {STEPS.length}: {STEPS[step].label}</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {STEPS.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-1 text-xs ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
                {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          {step === 0 && (
            <>
              <div><Label>Your Name *</Label><Input value={profile.display_name} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))} placeholder="e.g. Jane Doe" /></div>
              <div><Label>Bio / Agency Description</Label><Textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about your agency..." /></div>
            </>
          )}
          {step === 1 && (
            <>
              <div><Label>Service Name *</Label><Input value={service.name} onChange={e => setService(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Social Media Management" /></div>
              <div><Label>Description</Label><Textarea value={service.description} onChange={e => setService(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Price (KES)</Label><Input type="number" value={service.price} onChange={e => setService(p => ({ ...p, price: e.target.value }))} /></div>
                <div><Label>Category</Label><Input value={service.category} onChange={e => setService(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Marketing" /></div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div><Label>Client Name *</Label><Input value={client.name} onChange={e => setClient(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Acme Corp" /></div>
              <div><Label>Company</Label><Input value={client.company} onChange={e => setClient(p => ({ ...p, company: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={client.email} onChange={e => setClient(p => ({ ...p, email: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={client.phone} onChange={e => setClient(p => ({ ...p, phone: e.target.value }))} /></div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div><Label>Project Name *</Label><Input value={project.name} onChange={e => setProject(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Q1 Campaign" /></div>
              <div><Label>Description</Label><Textarea value={project.description} onChange={e => setProject(p => ({ ...p, description: e.target.value }))} /></div>
              {createdClientId && <p className="text-xs text-muted-foreground">This project will be linked to the client you just created.</p>}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div>
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={loading}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleSkip} disabled={loading}>Skip</Button>
            <Button onClick={handleNext} disabled={loading}>
              {step === 3 ? "Finish" : "Next"} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
