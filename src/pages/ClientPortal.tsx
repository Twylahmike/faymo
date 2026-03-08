import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Sparkles, LogOut, CalendarDays, CheckCircle2, Clock, FileText,
  ThumbsUp, CreditCard, FolderOpen, Bell, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

const ClientPortal = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [clientRecord, setClientRecord] = useState<any>(null);
  const [contentPlans, setContentPlans] = useState<any[]>([]);
  const [contentPosts, setContentPosts] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const loading = authLoading || roleLoading;

  const fetchData = useCallback(async () => {
    if (!user) return;

    const { data: client } = await supabase.from("clients").select("*").eq("user_id", user.id).single();
    setClientRecord(client);

    // Fetch notifications
    const { data: notifs } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    setNotifications(notifs || []);

    if (client) {
      const [plansRes, invoicesRes] = await Promise.all([
        supabase.from("content_plans").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
      ]);
      setContentPlans(plansRes.data || []);
      setInvoices(invoicesRes.data || []);

      if (plansRes.data && plansRes.data.length > 0) {
        const planIds = plansRes.data.map(p => p.id);
        const { data: posts } = await supabase.from("content_posts").select("*").in("content_plan_id", planIds).order("scheduled_date", { ascending: true });
        setContentPosts(posts || []);
      }

      const { data: logs } = await supabase.from("activity_log").select("*").eq("client_id", client.id).order("created_at", { ascending: false }).limit(20);
      setActivityLog(logs || []);

      // Fetch files from storage
      const { data: fileList } = await supabase.storage.from("media").list(`clients/${client.id}`, { limit: 50 });
      setFiles(fileList || []);
    }
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
    if (role && role !== "client") navigate("/dashboard");
  }, [role, navigate]);

  useEffect(() => {
    if (user && role === "client") fetchData();
  }, [user, role, fetchData]);

  // Realtime notifications
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("client-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications(prev => [payload.new as any, ...prev]);
          toast.info((payload.new as any).title);
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleApprove = async (postId: string) => {
    const { error } = await supabase.from("content_posts").update({
      approved_by_client: true, approved_at: new Date().toISOString(), status: "approved",
    }).eq("id", postId);
    if (error) { toast.error("Failed to approve post"); } else { toast.success("Post approved!"); fetchData(); }
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    pending_approval: "bg-yellow-500/10 text-yellow-400",
    approved: "bg-green-500/10 text-green-400",
    scheduled: "bg-primary/10 text-primary",
    published: "bg-green-500/10 text-green-400",
  };

  const invoiceStatusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-blue-500/10 text-blue-400",
    pending: "bg-yellow-500/10 text-yellow-400",
    paid: "bg-green-500/10 text-green-400",
    overdue: "bg-red-500/10 text-red-400",
    cancelled: "bg-muted text-muted-foreground",
  };

  const totalPosts = contentPosts.length;
  const approvedPosts = contentPosts.filter(p => p.approved_by_client).length;
  const pendingPosts = contentPosts.filter(p => !p.approved_by_client && p.status !== "draft").length;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const getFileUrl = (fileName: string) => {
    const { data } = supabase.storage.from("media").getPublicUrl(`clients/${clientRecord?.id}/${fileName}`);
    return data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold">F<span className="text-primary">🩵</span>ymo</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* Notification Bell */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="h-4 w-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">
                    {unreadNotifs}
                  </span>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-auto rounded-xl border border-border bg-background shadow-xl">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-semibold">Notifications</p>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 border-b border-border/50 cursor-pointer hover:bg-secondary/50 ${!n.read ? "bg-primary/5" : ""}`}
                        onClick={() => markNotificationRead(n.id)}>
                        <p className="text-sm font-medium">{n.title}</p>
                        {n.message && <p className="text-xs text-muted-foreground">{n.message}</p>}
                        <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <span className="rounded-full bg-accent/10 text-accent text-xs px-2.5 py-1 font-medium">Client</span>
            <span className="text-sm text-muted-foreground">{profile?.display_name || user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">
            Welcome, <span className="text-gradient">{profile?.display_name || clientRecord?.name || "Client"}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">View your content, invoices, and files.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-4 mb-10">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
              <CalendarDays className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold">{contentPlans.length}</p>
            <p className="text-sm text-muted-foreground">Content Plans</p>
          </div>
          <div className="glass-card p-6 rounded-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400 mb-4">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold">{approvedPosts}/{totalPosts}</p>
            <p className="text-sm text-muted-foreground">Posts Approved</p>
          </div>
          <div className="glass-card p-6 rounded-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400 mb-4">
              <Clock className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold">{pendingPosts}</p>
            <p className="text-sm text-muted-foreground">Pending Approval</p>
          </div>
          <div className="glass-card p-6 rounded-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 mb-4">
              <CreditCard className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold">{invoices.length}</p>
            <p className="text-sm text-muted-foreground">Invoices</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="content" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Content</TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Invoices</TabsTrigger>
            <TabsTrigger value="files" className="gap-1.5"><FolderOpen className="h-3.5 w-3.5" /> Files</TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> Activity</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="space-y-6">
              <h2 className="font-display text-xl font-bold">Your Content Plans</h2>
              {contentPlans.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No content plans have been created for you yet.</p>
                </div>
              ) : (
                contentPlans.map((plan) => {
                  const planPosts = contentPosts.filter(p => p.content_plan_id === plan.id);
                  return (
                    <div key={plan.id} className="glass-card rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-display text-lg font-bold text-foreground">{plan.title}</h3>
                          {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                        </div>
                        <span className={`text-xs rounded-full px-2.5 py-1 ${
                          plan.status === "active" ? "bg-primary/10 text-primary" :
                          plan.status === "completed" ? "bg-green-500/10 text-green-400" :
                          "bg-muted text-muted-foreground"
                        }`}>{plan.status}</span>
                      </div>
                      {plan.start_date && (
                        <p className="text-xs text-muted-foreground">{plan.start_date} → {plan.end_date || "ongoing"}</p>
                      )}
                      <div className="space-y-2">
                        {planPosts.map((post) => (
                          <div key={post.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                            <div className="flex items-center gap-3">
                              {post.approved_by_client ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                              <div>
                                <p className="text-sm font-medium text-foreground">{post.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {post.platform && `${post.platform} · `}
                                  {post.scheduled_date ? new Date(post.scheduled_date).toLocaleDateString() : "Unscheduled"}
                                </p>
                                {post.caption && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.caption}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs rounded-full px-2 py-0.5 ${statusColors[post.status] || statusColors.draft}`}>
                                {post.status.replace("_", " ")}
                              </span>
                              {!post.approved_by_client && post.status !== "draft" && (
                                <Button size="sm" variant="outline" className="text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
                                  onClick={() => handleApprove(post.id)}>
                                  <ThumbsUp className="h-3 w-3 mr-1" /> Approve
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        {planPosts.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">No posts in this plan yet.</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <div className="space-y-6">
              <h2 className="font-display text-xl font-bold">Your Invoices</h2>
              {invoices.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No invoices yet.</p>
                </div>
              ) : (
                <div className="glass-card rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                          <TableCell className="font-display font-bold">KES {Number(inv.amount).toLocaleString()}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</TableCell>
                          <TableCell className="text-sm capitalize">{inv.payment_method?.replace("_", " ") || "—"}</TableCell>
                          <TableCell>
                            <span className={`text-xs rounded-full px-2.5 py-1 ${invoiceStatusColors[inv.status] || invoiceStatusColors.draft}`}>{inv.status}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <div className="space-y-6">
              <h2 className="font-display text-xl font-bold">Your Files</h2>
              {files.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No files have been shared with you yet.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {files.map((file) => {
                    const url = getFileUrl(file.name);
                    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
                    return (
                      <div key={file.id || file.name} className="glass-card rounded-xl p-4 space-y-3">
                        {isImage ? (
                          <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                            <img src={url} alt={file.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="aspect-video rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">Activity Log</h2>
              {activityLog.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="glass-card rounded-xl divide-y divide-border">
                  {activityLog.map((log) => (
                    <div key={log.id} className="px-5 py-3">
                      <p className="text-sm text-foreground">{log.action}</p>
                      {log.details && <p className="text-xs text-muted-foreground">{log.details}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ClientPortal;
