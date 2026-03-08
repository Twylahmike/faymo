import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Plus, Search } from "lucide-react";
import { toast } from "sonner";

const ServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", status: "active" });

  const fetchServices = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("services").select("*").order("created_at", { ascending: false });
    setServices(data || []);
  }, [user]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleAdd = async () => {
    if (!user || !form.name) return;
    const { error } = await supabase.from("services").insert({
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price) || 0,
      category: form.category || null,
      status: form.status,
      user_id: user.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Service added");
    setForm({ name: "", description: "", price: "", category: "", status: "active" });
    setIsOpen(false);
    fetchServices();
  };

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your service offerings</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="h-4 w-4 mr-1" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
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
              <Button className="w-full" onClick={handleAdd}>Add Service</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                <span className={`text-xs rounded-full px-2 py-0.5 ${service.status === "active" ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                  {service.status}
                </span>
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
