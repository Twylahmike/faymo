import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, ChevronRight, Phone, Mail, FileText, CheckCircle2, Clock } from "lucide-react";
import AddClientDialog from "@/components/dashboard/AddClientDialog";
import ContentPlanDialog from "@/components/dashboard/ContentPlanDialog";
import AddPostDialog from "@/components/dashboard/AddPostDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-yellow-500/10 text-yellow-400",
  approved: "bg-green-500/10 text-green-400",
  scheduled: "bg-primary/10 text-primary",
  published: "bg-green-500/10 text-green-400",
  active: "bg-primary/10 text-primary",
  completed: "bg-green-500/10 text-green-400",
};

const ClientsPage = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentPlans, setContentPlans] = useState<any[]>([]);
  const [contentPosts, setContentPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

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

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClientData = clients.find(c => c.id === selectedClient);
  const clientPlans = contentPlans.filter(p => p.client_id === selectedClient);

  if (selectedClient && selectedClientData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedClient(null); setActiveTab("overview"); }}>← Back</Button>
          <div>
            <h1 className="font-display text-2xl font-bold">{selectedClientData.name}</h1>
            {selectedClientData.company && <p className="text-sm text-muted-foreground">{selectedClientData.company}</p>}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Contact Info */}
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

            {/* Content Plans */}
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
            <div className="glass-card rounded-xl p-8 text-center">
              <Briefcase className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Service management coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Payment history coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Client tasks coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground">File management coming soon.</p>
            </div>
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
              onClick={() => { setSelectedClient(client.id); fetchContentPlans(client.id); fetchContentPosts(); }}
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

// Need Briefcase import for placeholder
import { Briefcase } from "lucide-react";

export default ClientsPage;
