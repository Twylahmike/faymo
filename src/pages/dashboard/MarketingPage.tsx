import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, TrendingUp, MousePointerClick, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import ContentCalendar from "@/components/dashboard/ContentCalendar";
import AnalyticsView from "@/components/dashboard/AnalyticsView";

const MarketingPage = () => {
  const { user } = useAuth();
  const [contentPosts, setContentPosts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [contentPlans, setContentPlans] = useState<any[]>([]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [postsRes, clientsRes, plansRes] = await Promise.all([
      supabase.from("content_posts").select("*"),
      supabase.from("clients").select("*"),
      supabase.from("content_plans").select("*"),
    ]);
    setContentPosts(postsRes.data || []);
    setClients(clientsRes.data || []);
    setContentPlans(plansRes.data || []);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalReach = contentPosts.reduce((s, p) => s + (p.engagement_reach || 0), 0);
  const totalLikes = contentPosts.reduce((s, p) => s + (p.engagement_likes || 0), 0);
  const totalComments = contentPosts.reduce((s, p) => s + (p.engagement_comments || 0), 0);
  const published = contentPosts.filter(p => p.status === "published").length;

  const stats = [
    { label: "Total Reach", value: totalReach.toLocaleString(), icon: TrendingUp, color: "text-pink-400", bg: "bg-pink-400/10" },
    { label: "Engagement", value: (totalLikes + totalComments).toLocaleString(), icon: MousePointerClick, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Published Posts", value: published, icon: Megaphone, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Posts", value: contentPosts.length, icon: Users, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Marketing</h1>
        <p className="text-sm text-muted-foreground mt-1">Content performance and campaign analytics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="font-display text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <AnalyticsView contentPosts={contentPosts} />

      <div>
        <h2 className="font-display text-xl font-bold mb-4">Content Calendar</h2>
        <ContentCalendar contentPosts={contentPosts} clients={clients} contentPlans={contentPlans} />
      </div>
    </div>
  );
};

export default MarketingPage;
