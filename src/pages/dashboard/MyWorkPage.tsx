import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Upload, FileText, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface WorkItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  deliverable_url: string | null;
  deliverable_name: string | null;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  in_progress: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  submitted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
};

const MyWorkPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "in_progress" });
  const [file, setFile] = useState<File | null>(null);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("work_items")
      .select("*")
      .eq("member_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data as WorkItem[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim()) return;
    setSubmitting(true);

    let deliverable_url: string | null = null;
    let deliverable_name: string | null = null;

    if (file) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("work-deliverables")
        .upload(path, file);
      if (uploadErr) {
        toast.error("Upload failed: " + uploadErr.message);
        setSubmitting(false);
        return;
      }
      deliverable_url = path;
      deliverable_name = file.name;
    }

    const { data: inserted, error } = await supabase
      .from("work_items")
      .insert({
        member_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        deliverable_url,
        deliverable_name,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create work item");
      setSubmitting(false);
      return;
    }

    // Audit log
    await supabase.from("audit_log").insert({
      actor_id: user.id,
      actor_name: user.email,
      target_id: inserted.id,
      target_name: inserted.title,
      action: file ? "uploaded_work" : "created_work",
      entity_type: "work_item",
      details: { status: form.status, has_file: !!file },
    });

    // Mark first upload onboarding done
    if (file) {
      await supabase.from("member_onboarding").upsert(
        { user_id: user.id, first_upload_completed: true },
        { onConflict: "user_id" }
      );
    }

    toast.success("Work item created");
    setForm({ title: "", description: "", status: "in_progress" });
    setFile(null);
    setOpen(false);
    setSubmitting(false);
    fetchItems();
  };

  const downloadFile = async (path: string, name: string) => {
    const { data, error } = await supabase.storage.from("work-deliverables").createSignedUrl(path, 60);
    if (error || !data) { toast.error("Failed to get file"); return; }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = name;
    a.click();
  };

  const handleDelete = async (item: WorkItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    if (item.deliverable_url) {
      await supabase.storage.from("work-deliverables").remove([item.deliverable_url]);
    }
    await supabase.from("work_items").delete().eq("id", item.id);
    if (user) {
      await supabase.from("audit_log").insert({
        actor_id: user.id,
        actor_name: user.email,
        target_id: item.id,
        target_name: item.title,
        action: "deleted_work",
        entity_type: "work_item",
      });
    }
    toast.success("Deleted");
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">My Work</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your deliverables and submissions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" /> New Work Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-background border-border">
            <DialogHeader><DialogTitle className="font-display">Create Work Item</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="wi-title">Title *</Label>
                <Input id="wi-title" value={form.title} required maxLength={200}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wi-desc">Description</Label>
                <Textarea id="wi-desc" value={form.description} rows={3} maxLength={1000}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wi-file">Deliverable file (optional)</Label>
                <Input id="wi-file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="bg-secondary border-border" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full rounded-full bg-primary text-primary-foreground">
                {submitting ? "Creating..." : (<><Upload className="h-4 w-4 mr-1" /> Create</>)}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center border border-border">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No work items yet. Create your first one!</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Title</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">File</TableHead>
                <TableHead className="text-muted-foreground">Created</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell>
                    <p className="font-medium text-foreground">{item.title}</p>
                    {item.description && <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[item.status] || ""}>
                      {item.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.deliverable_url && item.deliverable_name ? (
                      <Button variant="ghost" size="sm" className="h-7 text-xs"
                        onClick={() => downloadFile(item.deliverable_url!, item.deliverable_name!)}>
                        <Download className="h-3 w-3 mr-1" /> {item.deliverable_name}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(item.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}
                      className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default MyWorkPage;