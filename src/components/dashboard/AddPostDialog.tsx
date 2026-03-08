import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import FileUpload from "./FileUpload";

interface AddPostDialogProps {
  contentPlanId: string;
  onPostAdded: () => void;
  children?: React.ReactNode;
}

const platforms = ["Instagram", "TikTok", "YouTube", "Twitter/X", "Facebook", "LinkedIn", "Other"];

const AddPostDialog = ({ contentPlanId, onPostAdded, children }: AddPostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    caption: "",
    platform: "",
    scheduled_date: "",
    media_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Post title is required");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("content_posts").insert({
      content_plan_id: contentPlanId,
      title: form.title.trim(),
      caption: form.caption.trim() || null,
      platform: form.platform || null,
      scheduled_date: form.scheduled_date || null,
      media_url: form.media_url || null,
      status: "draft",
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to add post");
    } else {
      toast.success("Post added!");
      setForm({ title: "", caption: "", platform: "", scheduled_date: "", media_url: "" });
      setOpen(false);
      onPostAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="ghost" className="text-xs text-primary">
            <Plus className="h-3 w-3 mr-1" /> Add Post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add Content Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="Post title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required maxLength={200} className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label>Caption</Label>
            <Textarea placeholder="Post caption/copy..." value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              maxLength={2000} className="bg-secondary border-border resize-none" rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Media</Label>
            <FileUpload
              folder="content-posts"
              accept="image/*,video/*"
              onUpload={(url) => setForm({ ...form, media_url: url })}
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
              <Label>Scheduled Date</Label>
              <Input type="datetime-local" value={form.scheduled_date}
                onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                className="bg-secondary border-border" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground">
            {loading ? "Adding..." : "Add Post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPostDialog;
