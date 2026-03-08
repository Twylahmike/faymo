import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, UserCheck, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AddCreatorDialog from "@/components/dashboard/AddCreatorDialog";
import { toast } from "sonner";

const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const CreatorsPage = () => {
  const { user } = useAuth();
  const [creators, setCreators] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", handle: "", platform: "", category: "", email: "", followers: "", notes: "" });

  const fetchCreators = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("creators").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setCreators(data || []);
  }, [user]);

  useEffect(() => { fetchCreators(); }, [fetchCreators]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("creators").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Creator deleted");
    fetchCreators();
  };

  const openEdit = (c: any) => {
    setEditId(c.id);
    setEditForm({ name: c.name, handle: c.handle || "", platform: c.platform || "", category: c.category || "", email: c.email || "", followers: String(c.followers || 0), notes: c.notes || "" });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editId) return;
    const { error } = await supabase.from("creators").update({
      name: editForm.name, handle: editForm.handle || null, platform: editForm.platform || null,
      category: editForm.category || null, email: editForm.email || null,
      followers: parseInt(editForm.followers) || 0, notes: editForm.notes || null,
    }).eq("id", editId);
    if (error) { toast.error(error.message); return; }
    toast.success("Creator updated");
    setEditOpen(false);
    fetchCreators();
  };

  const filtered = creators.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.handle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.platform || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Creators</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your creator roster</p>
        </div>
        <AddCreatorDialog onCreatorAdded={fetchCreators} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search creators..." className="pl-9 bg-secondary/50 border-border/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Creator</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Handle</Label><Input value={editForm.handle} onChange={e => setEditForm(p => ({ ...p, handle: e.target.value }))} /></div>
              <div><Label>Platform</Label><Input value={editForm.platform} onChange={e => setEditForm(p => ({ ...p, platform: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label><Input value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} /></div>
              <div><Label>Followers</Label><Input type="number" value={editForm.followers} onChange={e => setEditForm(p => ({ ...p, followers: e.target.value }))} /></div>
            </div>
            <div><Label>Email</Label><Input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} /></div>
            <Button className="w-full" onClick={handleEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10">
            <UserCheck className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">No creators yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">Add your first creator to your roster.</p>
          <AddCreatorDialog onCreatorAdded={fetchCreators}>
            <Button className="rounded-full bg-amber-500 hover:bg-amber-600 text-white px-6">Add Creator</Button>
          </AddCreatorDialog>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((creator) => (
            <div key={creator.id} className="glass-card rounded-xl p-5 transition-all hover:glow-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold">{creator.name}</h3>
                  {creator.handle && <p className="text-sm text-muted-foreground">{creator.handle}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {creator.platform && (
                    <span className="text-xs rounded-full bg-amber-400/10 text-amber-400 px-2.5 py-1 mr-1">{creator.platform}</span>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(creator)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {creator.name}?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(creator.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {creator.category && <span>{creator.category}</span>}
                {creator.followers > 0 && <span>{formatNumber(creator.followers)} followers</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorsPage;
