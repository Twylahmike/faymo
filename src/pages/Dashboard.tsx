import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import AddCreatorDialog from "@/components/dashboard/AddCreatorDialog";
import {
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  LogOut,
  Sparkles,
  Bell,
} from "lucide-react";

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [creatorCount, setCreatorCount] = useState(0);
  const [creators, setCreators] = useState<any[]>([]);

  const fetchCreators = useCallback(async () => {
    if (!user) return;
    const { data, count } = await supabase
      .from("creators")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setCreators(data || []);
    setCreatorCount(count || 0);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const totalFollowers = creators.reduce((sum, c) => sum + (c.followers || 0), 0);
  const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const stats = [
    { label: "Active Creators", value: String(creatorCount), icon: Users, change: creatorCount > 0 ? "Active" : "+0%" },
    { label: "Campaigns", value: "0", icon: BarChart3, change: "+0%" },
    { label: "Messages", value: "0", icon: MessageSquare, change: "0 new" },
    { label: "Total Reach", value: formatNumber(totalFollowers), icon: TrendingUp, change: totalFollowers > 0 ? "Combined" : "+0%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold">
              F<span className="text-primary">🩵</span>ymo
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
            </button>
            <span className="text-sm text-muted-foreground">
              {profile?.display_name || user.email}
            </span>
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
              Welcome back, <span className="text-gradient">{profile?.display_name || "Creator"}</span>
            </h1>
            <p className="mt-1 text-muted-foreground">Here's an overview of your creator management hub.</p>
          </div>
          {creatorCount > 0 && (
            <AddCreatorDialog onCreatorAdded={fetchCreators} />
          )}
        </div>

        {/* Stats grid */}
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

        {creatorCount === 0 ? (
          /* Empty state */
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-8 w-8" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">No creators yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Start by adding your first creator to your roster. You can manage their profiles, campaigns, and analytics all in one place.
            </p>
            <AddCreatorDialog onCreatorAdded={fetchCreators}>
              <Button className="rounded-full bg-primary text-primary-foreground px-6">
                Add Your First Creator
              </Button>
            </AddCreatorDialog>
          </div>
        ) : (
          /* Creator list */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <div key={creator.id} className="glass-card rounded-xl p-5 transition-all hover:glow-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold text-foreground">{creator.name}</h3>
                    {creator.handle && (
                      <p className="text-sm text-muted-foreground">{creator.handle}</p>
                    )}
                  </div>
                  {creator.platform && (
                    <span className="text-xs rounded-full bg-primary/10 text-primary px-2.5 py-1">
                      {creator.platform}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {creator.category && <span>{creator.category}</span>}
                  {creator.followers > 0 && (
                    <span>{formatNumber(creator.followers)} followers</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
