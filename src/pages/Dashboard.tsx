import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddCreatorDialog from "@/components/dashboard/AddCreatorDialog";
import AddClientDialog from "@/components/dashboard/AddClientDialog";
import ContentPlanDialog from "@/components/dashboard/ContentPlanDialog";
import AddPostDialog from "@/components/dashboard/AddPostDialog";
import TeamManagement from "@/components/dashboard/TeamManagement";
import AnalyticsView from "@/components/dashboard/AnalyticsView";
import ContentCalendar from "@/components/dashboard/ContentCalendar";
import {
  BarChart3, Users, MessageSquare, TrendingUp, LogOut, Sparkles, Bell,
  Building2, CalendarDays, ChevronRight, CheckCircle2, Clock, FileText, ShieldCheck,
} from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-yellow-500/10 text-yellow-400",
  approved: "bg-green-500/10 text-green-400",
  scheduled: "bg-primary/10 text-primary",
  published: "bg-green-500/10 text-green-400",
  active: "bg-primary/10 text-primary",
  completed: "bg-green-500/10 text-green-400",
};

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [creators, setCreators] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [contentPlans, setContentPlans] = useState<any[]>([]);
  const [contentPosts, setContentPosts] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("clients");

  const loading = authLoading || roleLoading;

  const fetchCreators = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("creators").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setCreators(data || []);
  }, [user]);

  const fetchClients = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients(data || []);
  }, [user]);

  const fetchContentPlans = useCallback(async (clientId?: string) => {
    if (!user) return;
    let query = supabase.from("content_plans").select("*").order("created_at", { ascending: false });
    if (clientId) query = query.eq("client_id", clientId);
    const { data } = await query;
    setContentPlans(data || []);
  }, [user]);

  const fetchContentPosts = useCallback(async (planId?: string) => {
    if (!user) return;
    let query = supabase.from("content_posts").select("*").order("scheduled_date", { ascending: true });
    if (planId) query = query.eq("content_plan_id", planId);
    const { data } = await query;
    setContentPosts(data || []);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("display_name").eq("user_id", user.id).single().then(({ data }) => setProfile(data));
    }
  }, [user]);

  useEffect(() => {
    if (user && role && role !== "client") {
      fetchCreators();
      fetchClients();
      fetchContentPlans();
      fetchContentPosts();
    }
  }, [user, role, fetchCreators, fetchClients, fetchContentPlans, fetchContentPosts]);

  useEffect(() => {
    if (role === "client") {
      navigate("/client-portal");
    }
  }, [role, navigate]);

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || role === "client") return null;

  const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  const totalFollowers = creators.reduce((sum, c) => sum + (c.followers || 0), 0);

  const stats = [
    { label: "Clients", value: String(clients.length), icon: Building2, change: clients.length > 0 ? "Active" : "0" },
    { label: "Creators", value: String(creators.length), icon: Users, change: creators.length > 0 ? "Active" : "0" },
    { label: "Content Plans", value: String(contentPlans.length), icon: CalendarDays, change: contentPlans.filter(p => p.status === "active").length + " active" },
    { label: "Total Reach", value: formatNumber(totalFollowers), icon: TrendingUp, change: "Combined" },
  ];

  const clientPlans = selectedClient ? contentPlans.filter(p => p.client_id === selectedClient) : [];
  const selectedClientData = clients.find(c => c.id === selectedClient);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold">F<span className="text-primary">🩵</span>ymo</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium capitalize">{role}</span>
            <button className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
            </button>
            <span className="text-sm text-muted-foreground">{profile?.display_name || user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">
              Welcome back, <span className="text-gradient">{profile?.display_name || "Team"}</span>
            </h1>
            <p className="mt-1 text-muted-foreground">Manage your clients, creators, and content plans.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card p-6 rounded-xl transition-all hover:glow-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </div>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="clients" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Building2 className="h-4 w-4 mr-1" /> Clients
            </TabsTrigger>
            <TabsTrigger value="creators" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4 mr-1" /> Creators
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CalendarDays className="h-4 w-4 mr-1" /> Calendar
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4 mr-1" /> Analytics
            </TabsTrigger>
            {role === "admin" && (
              <TabsTrigger value="team" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ShieldCheck className="h-4 w-4 mr-1" /> Team
              </TabsTrigger>
            )}
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            {!selectedClient ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">Your Clients</h2>
                  <AddClientDialog onClientAdded={fetchClients} />
                </div>
                {clients.length === 0 ? (
                  <div className="glass-card rounded-2xl p-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <h2 className="font-display text-xl font-bold mb-2">No clients yet</h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Add your first client to start managing their content and campaigns.
                    </p>
                    <AddClientDialog onClientAdded={fetchClients}>
                      <Button className="rounded-full bg-primary text-primary-foreground px-6">Add Your First Client</Button>
                    </AddClientDialog>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client) => (
                      <div key={client.id} className="glass-card rounded-xl p-5 transition-all hover:glow-border cursor-pointer"
                        onClick={() => { setSelectedClient(client.id); fetchContentPlans(client.id); }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-display font-bold text-foreground">{client.name}</h3>
                            {client.company && <p className="text-sm text-muted-foreground">{client.company}</p>}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Client Detail with Content Plans */
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)}>← Back</Button>
                  <h2 className="font-display text-xl font-bold">{selectedClientData?.name}</h2>
                  {selectedClientData?.company && (
                    <span className="text-sm text-muted-foreground">({selectedClientData.company})</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">Content Plans</h3>
                  <ContentPlanDialog clientId={selectedClient} clientName={selectedClientData?.name || ""} onPlanAdded={() => fetchContentPlans(selectedClient)} />
                </div>

                {clientPlans.length === 0 ? (
                  <div className="glass-card rounded-xl p-8 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No content plans yet. Create one to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientPlans.map((plan) => {
                      const planPosts = contentPosts.filter(p => p.content_plan_id === plan.id);
                      return (
                        <div key={plan.id} className="glass-card rounded-xl p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-display font-bold text-foreground">{plan.title}</h4>
                              {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                            </div>
                            <span className={`text-xs rounded-full px-2.5 py-1 ${statusColors[plan.status] || statusColors.draft}`}>
                              {plan.status}
                            </span>
                          </div>
                          {plan.start_date && (
                            <p className="text-xs text-muted-foreground">
                              {plan.start_date} → {plan.end_date || "ongoing"}
                            </p>
                          )}

                          {/* Posts */}
                          <div className="space-y-2">
                            {planPosts.map((post) => (
                              <div key={post.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {post.approved_by_client ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{post.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {post.platform && `${post.platform} · `}
                                      {post.scheduled_date ? new Date(post.scheduled_date).toLocaleDateString() : "Unscheduled"}
                                    </p>
                                  </div>
                                </div>
                                <span className={`text-xs rounded-full px-2 py-0.5 ${statusColors[post.status] || statusColors.draft}`}>
                                  {post.status.replace("_", " ")}
                                </span>
                              </div>
                            ))}
                          </div>
                          <AddPostDialog contentPlanId={plan.id} onPostAdded={() => fetchContentPosts()} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Creators Tab */}
          <TabsContent value="creators" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Your Creators</h2>
              <AddCreatorDialog onCreatorAdded={fetchCreators} />
            </div>
            {creators.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Users className="h-8 w-8" />
                </div>
                <h2 className="font-display text-xl font-bold mb-2">No creators yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Add your first creator to your roster.
                </p>
                <AddCreatorDialog onCreatorAdded={fetchCreators}>
                  <Button className="rounded-full bg-primary text-primary-foreground px-6">Add Your First Creator</Button>
                </AddCreatorDialog>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {creators.map((creator) => (
                  <div key={creator.id} className="glass-card rounded-xl p-5 transition-all hover:glow-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display font-bold text-foreground">{creator.name}</h3>
                        {creator.handle && <p className="text-sm text-muted-foreground">{creator.handle}</p>}
                      </div>
                      {creator.platform && (
                        <span className="text-xs rounded-full bg-primary/10 text-primary px-2.5 py-1">{creator.platform}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {creator.category && <span>{creator.category}</span>}
                      {creator.followers > 0 && <span>{formatNumber(creator.followers)} followers</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <ContentCalendar contentPosts={contentPosts} clients={clients} contentPlans={contentPlans} />
          </TabsContent>
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsView contentPosts={contentPosts} />
          </TabsContent>
          {/* Team Tab (Admin only) */}
          {role === "admin" && (
            <TabsContent value="team">
              <TeamManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
