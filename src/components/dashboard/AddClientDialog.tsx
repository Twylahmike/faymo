import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Copy, Check } from "lucide-react";

interface AddClientDialogProps {
  onClientAdded: () => void;
  children?: React.ReactNode;
}

const AddClientDialog = ({ onClientAdded, children }: AddClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await supabase.functions.invoke("create-client-account", {
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || null,
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
      },
    });

    setLoading(false);

    if (response.error || response.data?.error) {
      toast.error(response.data?.error || "Failed to create client account");
      return;
    }

    setCredentials(response.data.credentials);
    toast.success(`Client account created for ${form.name}!`);
    onClientAdded();
  };

  const copyCredentials = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Credentials copied to clipboard!");
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setCredentials(null);
      setCopied(false);
      setForm({ name: "", email: "", company: "", phone: "", notes: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {children || (
          <Button className="rounded-full bg-primary text-primary-foreground px-6">
            <UserPlus className="h-4 w-4 mr-1" /> Add Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {credentials ? "Client Account Created" : "Add a Client"}
          </DialogTitle>
        </DialogHeader>

        {credentials ? (
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Share these credentials with your client so they can log in and view their progress.
            </p>
            <div className="rounded-lg bg-secondary p-4 space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">Email</span>
                <p className="text-sm font-mono text-foreground">{credentials.email}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Password</span>
                <p className="text-sm font-mono text-foreground">{credentials.password}</p>
              </div>
            </div>
            <Button onClick={copyCredentials} variant="outline" className="w-full">
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copied!" : "Copy Credentials"}
            </Button>
            <Button onClick={() => handleClose(false)} className="w-full rounded-full bg-primary text-primary-foreground">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name *</Label>
              <Input id="client-name" placeholder="Client name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required maxLength={100} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email *</Label>
              <Input id="client-email" type="email" placeholder="client@company.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required maxLength={255} className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="client-company">Company</Label>
                <Input id="client-company" placeholder="Company name" value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  maxLength={100} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-phone">Phone</Label>
                <Input id="client-phone" placeholder="+1 234 567" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  maxLength={20} className="bg-secondary border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-notes">Notes</Label>
              <Textarea id="client-notes" placeholder="Any notes..." value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                maxLength={1000} className="bg-secondary border-border resize-none" rows={3} />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground mt-1">
              {loading ? "Creating Account..." : "Create Client Account"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;
