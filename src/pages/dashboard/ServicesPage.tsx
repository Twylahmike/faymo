import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Briefcase, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type ServiceFormState = { name: string; description: string; price: string; category: string; status: string };

const emptyServiceForm: ServiceFormState = { name: "", description: "", price: "", category: "", status: "active" };

// Defined outside ServicesPage so it keeps a stable identity across renders —
// nesting this inside the page component would remount the whole form (and
// drop input focus) on every keystroke, since setForm would re-create it.
const ServiceFormFields = ({
  form,
  setForm,
  onSubmit,
  submitLabel,
}: {
  form: ServiceFormState;
  setForm: React.Dispatch<React.SetStateAction<ServiceFormState>>;
  onSubmit: () => void;
  submitLabel: string;
}) => (
  <div className="space-y-4">
    <div><Label>Service Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
    <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
    <div className="grid grid-cols-2 gap-4">
      <div><Label>Price (KES)</Label><Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} /></div>
      <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Marketing" /></div>
    </div>
    <div>
      <Label>Status</Label>
      <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <Button className="w-full" onClick={onSubmit}>{submitLabel}</Button>
  </div>
);

const ServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // Separate state for Add vs Edit so opening one never shows stale values from the other.
  const [addForm, setAddForm] = useState<ServiceFormState>(emptyServiceForm);
  const [editForm, setEditForm] = useState<ServiceFormState>(emptyServiceForm);

  const fetchServices = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("services").select("*").order("created_at", { ascending: false });
    setServices(data || []);
  }, [user]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleAdd = async () => {
    if (!user || !addForm.name) return;
    const { error } = await supabase.from("services").insert({
      name: addForm.name, description: addForm.description || null, price: parseFloat(addForm.price) || 0,
      category: addForm.category || null, status: addForm.status, user_id: user.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Service added");
    setAddForm(emptyServiceForm);
    setIsOpen(false);
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Service deleted");
    fetchServices();
  };

  const openEdit = (s: any) => {
    setEditId(s.id);
    setEditForm({ name: s.name, description: s.description || "", price: String(s.price || 0), category: s.category || "", status: s.status || "active" });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editId) return;
    const { error } = await supabase.from("services").update({
      name: editForm.name, description: editForm.description || null, price: parseFloat(editForm.price) || 0,
      category: editForm.category || null, status: editForm.status,
    }).eq("id", editId);
    if (error) { toast.error(error.message); return; }
    toast.success("Service updated");
    setEditOpen(false);
    setEditForm(emptyServiceForm);
    fetchServices();
  };

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your service offerings</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (open) setAddForm(emptyServiceForm); }}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="h-4 w-4 mr-1" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Service</DialogTitle></DialogHeader>
            <ServiceFormFields form={addForm} setForm={setAddForm} onSubmit={handleAdd} submitLabel="Add Service" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          <ServiceFormFields form={editForm} setForm={setEditForm} onSubmit={handleEdit} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search services..." className="pl-9 bg-secondary/50 border-border/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10">
            <Briefcase className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">No services yet</h2>
          <p className="text-muted-foreground">Add your first service offering.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <div key={service.id} className="glass-card rounded-xl p-5 transition-all hover:glow-border">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display font-bold">{service.name}</h3>
                <div className="flex items-center gap-1">
                  <span className={`text-xs rounded-full px-2 py-0.5 mr-1 ${service.status === "active" ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                    {service.status}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(service)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {service.name}?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(service.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {service.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{service.description}</p>}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{service.category || "Uncategorized"}</span>
                <span className="font-display font-bold text-emerald-400">KES {Number(service.price).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
