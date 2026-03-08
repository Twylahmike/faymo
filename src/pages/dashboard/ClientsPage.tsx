import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, ChevronRight, Phone, Mail, FileText, CheckCircle2, Clock, Briefcase, Trash2, Pencil, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AddClientDialog from "@/components/dashboard/AddClientDialog";
import ContentPlanDialog from "@/components/dashboard/ContentPlanDialog";
import AddPostDialog from "@/components/dashboard/AddPostDialog";
import FileUpload from "@/components/dashboard/FileUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-yellow-500/10 text-yellow-400",
  approved: "bg-green-500/10 text-green-400",
  scheduled: "bg-primary/10 text-primary",
  published: "bg-green-500/10 text-green-400",
  active: "bg-primary/10 text-primary",
  completed: "bg-green-500/10 text-green-400",
  paid: "bg-green-500/10 text-green-400",
  pending: "bg-yellow-500/10 text-yellow-400",
  sent: "bg-blue-500/10 text-blue-400",
  overdue: "bg-red-500/10 text-red-400",
};

const ClientsPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentPlans, setContentPlans] = useState<any[]>([]);
  const [contentPosts, setContentPosts] = useState<any[]>([]);
  const [clientInvoices, setClientInvoices] = useState<any[]>([]);
  const [clientTasks, setClientTasks] = useState<any[]>([]);
  const [clientServices, setClientServices] = useState<any[]>([]);
  const [clientFiles, setClientFiles] = useState<{ name: string; url: string }[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", company: "", email: "", phone: "", notes: "" });

  const fetchClients = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients(data || []);
  }, [user]);

  const fetchContentPlans = useCallback(async (clientId: string) => {
    const { data } = await supabase.from("content_plans").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
    setContentPlans(data || []);
  }, []);

  const fetchContentPosts = useCallback(async () => {
    const { data } = await supabase.from("content_posts").select("*").order("scheduled_date", { ascending: true });
    setContentPosts(data || []);
  }, []);

  const fetchClientDetails = useCallback(async (clientId: string) => {
    const [invRes, projRes, svcRes] = await Promise.all([
      supabase.from("invoices").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
      supabase.from("projects").select("id, name").eq("client_id", clientId),
      supabase.from("services").select("*").order("name"),
    ]);
    setClientInvoices(invRes.data || []);
    setClientServices(svcRes.data || []);

    const projectIds = (projRes.data || []).map(p => p.id);
    if (projectIds.length > 0) {
      const { data: tasks } = await supabase.from("tasks").select("*, projects(name)").in("project_id", projectIds).order("created_at", { ascending: false });
      setClientTasks(tasks || []);
    } else {
      setClientTasks([]);
    }

    const { data: files } = await supabase.storage.from("media").list(`${clientId}`, { limit: 100 });
    setClientFiles((files || []).map(f => ({
      name: f.name,
      url: supabase.storage.from("media").getPublicUrl(`${clientId}/${f.name}`).data.publicUrl,
    })));
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClientData = clients.find(c => c.id === selectedClient);
  const clientPlans = contentPlans.filter(p => p.client_id === selectedClient);

  const handleDelete = async (clientId: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", clientId);
    if (error) { toast.error(error.message); return; }
    toast.success("Client deleted");
    setSelectedClient(null);
    fetchClients();
  };

  const handleEdit = async () => {
    if (!selectedClient) return;
    const { error } = await supabase.from("clients").update({
      name: editForm.name, company: editForm.company || null,
      email: editForm.email || null, phone: editForm.phone || null, notes: editForm.notes || null,
    }).eq("id", selectedClient);
    if (error) { toast.error(error.message); return; }
    toast.success("Client updated");
    setEditOpen(false);
    fetchClients();
  };

  const openEdit = () => {
    if (!selectedClientData) return;
    setEditForm({
      name: selectedClientData.name, company: selectedClientData.company || "",
      email: selectedClientData.email || "", phone: selectedClientData.phone || "", notes: selectedClientData.notes || "",
    });
    setEditOpen(true);
  };

  if (selectedClient && selectedClientData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedClient(null); setActiveTab("overview"); }}>← Back</Button>
            <div>
              <h1 className="font-display text-2xl font-bold">{selectedClientData.name}</h1>
              {selectedClientData.company && <p className="text-sm text-muted-foreground">{selectedClientData.company}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openEdit}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-400/10"><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Client?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete {selectedClientData.name} and cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(selectedClient)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name *</Label><Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Company</Label><Input value={editForm.company} onChange={e => setEditForm(p => ({ ...p, company: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} /></div>
              <Button className="w-full" onClick={handleEdit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="glass-card rounded-xl p-5 space-y-3">
              <h3 className="font-display font-semibold">Contact Information</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedClientData.email && (
                  <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{selectedClientData.email}</div>
                )}
                {selectedClientData.phone && (
                  <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{selectedClientData.phone}</div>
                )}
              </div>
              {selectedClientData.notes && <p className="text-sm text-muted-foreground">{selectedClientData.notes}</p>}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold">Content Plans</h3>
                <ContentPlanDialog clientId={selectedClient} clientName={selectedClientData.name} onPlanAdded={() => fetchContentPlans(selectedClient)} />
              </div>
              {clientPlans.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No content plans yet.</p>
                </div>
              ) : (
                clientPlans.map((plan) => {
                  const planPosts = contentPosts.filter(p => p.content_plan_id === plan.id);
                  return (
                    <div key={plan.id} className="glass-card rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-display font-bold">{plan.title}</h4>
                          {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                        </div>
                        <span className={`text-xs rounded-full px-2.5 py-1 ${statusColors[plan.status] || statusColors.draft}`}>{plan.status}</span>
                      </div>
                      {planPosts.map((post) => (
                        <div key={post.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                          <div className="flex items-center gap-3">
                            {post.approved_by_client ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                            <div>
                              <p className="text-sm font-medium">{post.title}</p>
                              <p className="text-xs text-muted-foreground">{post.platform && `${post.platform} · `}{post.scheduled_date ? new Date(post.scheduled_date).toLocaleDateString() : "Unscheduled"}</p>
                            </div>
                          </div>
                          <span className={`text-xs rounded-full px-2 py-0.5 ${statusColors[post.status] || statusColors.draft}`}>{post.status.replace("_", " ")}</span>
                        </div>
                      ))}
                      <AddPostDialog contentPlanId={plan.id} onPostAdded={fetchContentPosts} />
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-4">
            {clientServices.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <Briefcase className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No services available.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {clientServices.map(svc => (
                  <div key={svc.id} className="glass-card rounded-xl p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display font-bold">{svc.name}</h3>
                      <span className={`text-xs rounded-full px-2 py-0.5 ${svc.status === "active" ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>{svc.status}</span>
                    </div>
                    {svc.description && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{svc.description}</p>}
                    <p className="text-sm font-display font-bold text-emerald-400">{svc.currency || "KES"} {Number(svc.price).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            {clientInvoices.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No invoices for this client.</p>
              </div>
            ) : (
              <div className="glass-card rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientInvoices.map(inv => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                        <TableCell className="font-display font-bold">{inv.currency || "KES"} {Number(inv.amount).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</TableCell>
                        <TableCell><span className={`text-xs rounded-full px-2.5 py-1 ${statusColors[inv.status] || statusColors.draft}`}>{inv.status}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            {clientTasks.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No tasks for this client's projects.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {clientTasks.map(task => (
                  <div key={task.id} className="glass-card rounded-lg px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{(task as any).projects?.name || "Unknown project"} · Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}</p>
                    </div>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${
                      task.status === "completed" ? "bg-green-500/10 text-green-400" :
                      task.status === "in_progress" ? "bg-primary/10 text-primary" :
                      "bg-muted text-muted-foreground"
                    }`}>{(task.status || "todo").replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="files" className="mt-4 space-y-4">
            <FileUpload
              folder={selectedClient}
              onUpload={() => fetchClientDetails(selectedClient)}
            />
            {clientFiles.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {clientFiles.map(f => (
                  <a key={f.name} href={f.url} target="_blank" rel="noopener noreferrer" className="glass-card rounded-lg p-4 flex items-center gap-3 hover:glow-border transition-all">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{f.name}</span>
                  </a>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your client relationships</p>
        </div>
        <AddClientDialog onClientAdded={fetchClients} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search clients..." className="pl-9 bg-secondary/50 border-border/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-400/10">
            <Building2 className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">No clients found</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {searchQuery ? "Try a different search." : "Add your first client to get started."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="glass-card rounded-xl p-5 transition-all hover:glow-border cursor-pointer"
              onClick={() => {
                setSelectedClient(client.id);
                fetchContentPlans(client.id);
                fetchContentPosts();
                fetchClientDetails(client.id);
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold">{client.name}</h3>
                  {client.company && <p className="text-sm text-muted-foreground">{client.company}</p>}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{client.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
