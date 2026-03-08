import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CalendarPlus } from "lucide-react";

interface ContentPlanDialogProps {
  clientId: string;
  clientName: string;
  onPlanAdded: () => void;
  children?: React.ReactNode;
}

const ContentPlanDialog = ({ clientId, clientName, onPlanAdded, children }: ContentPlanDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("content_plans").insert({
      client_id: clientId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      created_by: user.id,
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to create content plan");
    } else {
      // Log activity
      await supabase.from("activity_log").insert({
        client_id: clientId,
        action: "Content plan created",
        details: `"${form.title}" plan created for ${clientName}`,
        performed_by: user.id,
      });
      toast.success("Content plan created!");
      setForm({ title: "", description: "", start_date: "", end_date: "" });
      setOpen(false);
      onPlanAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline" className="text-xs">
            <CalendarPlus className="h-3 w-3 mr-1" /> New Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">New Content Plan for {clientName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="Q1 Campaign" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required maxLength={100} className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Plan details..." value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={1000} className="bg-secondary border-border resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="bg-secondary border-border" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground">
            {loading ? "Creating..." : "Create Plan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContentPlanDialog;
