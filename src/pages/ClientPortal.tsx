import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sparkles, LogOut, CalendarDays, CheckCircle2, Clock, FileText,
  BarChart3, ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";

const ClientPortal = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [clientRecord, setClientRecord] = useState<any>(null);
  const [contentPlans, setContentPlans] = useState<any[]>([]);
  const [contentPosts, setContentPosts] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  const loading = authLoading || roleLoading;

  const fetchData = useCallback(async () => {
    if (!user) return;

    // Get client record
    const { data: client } = await supabase.from("clients").select("*").eq("user_id", user.id).single();
    setClientRecord(client);

    if (client) {
      // Fetch content plans
      const { data: plans } = await supabase.from("content_plans").select("*").eq("client_id", client.id).order("created_at", { ascending: false });
      setContentPlans(plans || []);

      // Fetch posts for all plans
      if (plans && plans.length > 0) {
        const planIds = plans.map(p => p.id);
        const { data: posts } = await supabase.from("content_posts").select("*").in("content_plan_id", planIds).order("scheduled_date", { ascending: true });
        setContentPosts(posts || []);
      }

      // Fetch activity log
      const { data: logs } = await supabase.from("activity_log").select("*").eq("client_id", client.id).order("created_at", { ascending: false }).limit(20);
      setActivityLog(logs || []);
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

  const handleApprove = async (postId: string) => {
    const { error } = await supabase.from("content_posts").update({
      approved_by_client: true,
      approved_at: new Date().toISOString(),
      status: "approved",
    }).eq("id", postId);

    if (error) {
      toast.error("Failed to approve post");
    } else {
      toast.success("Post approved!");
      fetchData();
    }
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

  const totalPosts = contentPosts.length;
  const approvedPosts = contentPosts.filter(p => p.approved_by_client).length;
  const pendingPosts = contentPosts.filter(p => !p.approved_by_client && p.status !== "draft").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold">F<span className="text-primary">🩵</span>ymo</span>
          </div>
          <div className="flex items-center gap-4">
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
          <p className="mt-1 text-muted-foreground">View your content plans and track progress.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-3 mb-10">
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
        </div>

        {/* Content Plans */}
        <div className="space-y-6 mb-10">
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
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                  {plan.start_date && (
                    <p className="text-xs text-muted-foreground">
                      {plan.start_date} → {plan.end_date || "ongoing"}
                    </p>
                  )}

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

        {/* Activity Log */}
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
      </main>
    </div>
  );
};

export default ClientPortal;
