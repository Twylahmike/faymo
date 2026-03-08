import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Copy, Check } from "lucide-react";

interface AddTeamMemberDialogProps {
  onMemberAdded: () => void;
}

const AddTeamMemberDialog = ({ onMemberAdded }: AddTeamMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "worker" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setLoading(true);
    const response = await supabase.functions.invoke("create-team-member", {
      body: { name: form.name.trim(), email: form.email.trim(), role: form.role },
    });
    setLoading(false);

    if (response.error || response.data?.error) {
      toast.error(response.data?.error || "Failed to create team member");
      return;
    }

    setCredentials(response.data.credentials);
    toast.success(`Team member account created for ${form.name}!`);
    onMemberAdded();
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
      setForm({ name: "", email: "", role: "worker" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-primary text-primary-foreground px-6">
          <UserPlus className="h-4 w-4 mr-1" /> Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {credentials ? "Team Member Created" : "Add Team Member"}
          </DialogTitle>
        </DialogHeader>

        {credentials ? (
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Share these login credentials with your new team member.
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
              <Label htmlFor="member-name">Full Name *</Label>
              <Input id="member-name" placeholder="Team member name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required maxLength={100} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-email">Email *</Label>
              <Input id="member-email" type="email" placeholder="member@agency.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required maxLength={255} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground mt-1">
              {loading ? "Creating Account..." : "Create Team Member"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMemberDialog;
