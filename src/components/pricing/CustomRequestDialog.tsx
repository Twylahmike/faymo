import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface CustomRequestDialogProps {
  children: React.ReactNode;
  /** Pre-fills the message field, e.g. when enquiring about a specific listed product. */
  presetMessage?: string;
}

const CustomRequestDialog = ({ children, presetMessage }: CustomRequestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", budget: "", message: presetMessage || "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Name, email, and a short description are required");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("custom_requests").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim() || null,
      phone: form.phone.trim() || null,
      budget: form.budget.trim() || null,
      message: form.message.trim(),
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to submit — please try again");
      return;
    }

    setSubmitted(true);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: "", email: "", company: "", phone: "", budget: "", message: presetMessage || "" });
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center">Request received</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Thanks — our team will review your request and get back to you shortly.
            </p>
            <Button className="w-full rounded-full" onClick={() => handleClose(false)}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Tell us what you need</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cr-name">Name *</Label>
                  <Input id="cr-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cr-email">Email *</Label>
                  <Input id="cr-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cr-company">Company</Label>
                  <Input id="cr-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cr-phone">Phone</Label>
                  <Input id="cr-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cr-budget">Budget (optional)</Label>
                <Input id="cr-budget" placeholder="e.g. $5,000 - $10,000" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cr-message">What do you need? *</Label>
                <Textarea id="cr-message" placeholder="Tell us about your project, goals, and timeline..."
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required maxLength={2000} rows={4} />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground">
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomRequestDialog;
