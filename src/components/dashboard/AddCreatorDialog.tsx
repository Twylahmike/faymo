import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface AddCreatorDialogProps {
  onCreatorAdded: () => void;
  children?: React.ReactNode;
}

const platforms = ["Instagram", "TikTok", "YouTube", "Twitter/X", "Twitch", "Other"];
const categories = ["Lifestyle", "Tech", "Fashion", "Gaming", "Food", "Fitness", "Travel", "Beauty", "Education", "Other"];

const AddCreatorDialog = ({ onCreatorAdded, children }: AddCreatorDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    platform: "",
    handle: "",
    email: "",
    followers: "",
    category: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) {
      toast.error("Creator name is required");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("creators").insert({
      user_id: user.id,
      name: form.name.trim(),
      platform: form.platform || null,
      handle: form.handle.trim() || null,
      email: form.email.trim() || null,
      followers: form.followers ? parseInt(form.followers) : 0,
      category: form.category || null,
      notes: form.notes.trim() || null,
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to add creator");
    } else {
      toast.success(`${form.name} added to your roster!`);
      setForm({ name: "", platform: "", handle: "", email: "", followers: "", category: "", notes: "" });
      setOpen(false);
      onCreatorAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="rounded-full bg-primary text-primary-foreground px-6">
            <Plus className="h-4 w-4 mr-1" /> Add Creator
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add a Creator</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="creator-name">Name *</Label>
            <Input
              id="creator-name"
              placeholder="Creator name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              maxLength={100}
              className="bg-secondary border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="creator-handle">Handle</Label>
              <Input
                id="creator-handle"
                placeholder="@handle"
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                maxLength={100}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creator-followers">Followers</Label>
              <Input
                id="creator-followers"
                type="number"
                placeholder="0"
                value={form.followers}
                onChange={(e) => setForm({ ...form, followers: e.target.value })}
                min={0}
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creator-email">Email</Label>
            <Input
              id="creator-email"
              type="email"
              placeholder="creator@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              maxLength={255}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creator-notes">Notes</Label>
            <Textarea
              id="creator-notes"
              placeholder="Any notes about this creator..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              maxLength={1000}
              className="bg-secondary border-border resize-none"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground mt-1">
            {loading ? "Adding..." : "Add Creator"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCreatorDialog;
