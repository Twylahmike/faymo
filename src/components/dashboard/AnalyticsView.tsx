import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Heart, MessageCircle, Eye } from "lucide-react";

interface AnalyticsViewProps {
  contentPosts: any[];
}

const platformColors: Record<string, string> = {
  Instagram: "hsl(330, 70%, 55%)",
  TikTok: "hsl(187, 85%, 53%)",
  YouTube: "hsl(0, 72%, 51%)",
  "Twitter/X": "hsl(210, 10%, 40%)",
  Facebook: "hsl(220, 60%, 50%)",
  LinkedIn: "hsl(210, 80%, 45%)",
  Other: "hsl(215, 15%, 55%)",
};

const chartConfig: ChartConfig = {
  likes: { label: "Likes", color: "hsl(330, 70%, 55%)" },
  comments: { label: "Comments", color: "hsl(187, 85%, 53%)" },
  reach: { label: "Reach", color: "hsl(45, 90%, 55%)" },
};

const AnalyticsView = ({ contentPosts }: AnalyticsViewProps) => {
  const publishedPosts = useMemo(
    () => contentPosts.filter((p) => p.status === "published"),
    [contentPosts]
  );

  const totals = useMemo(() => {
    return publishedPosts.reduce(
      (acc, p) => ({
        likes: acc.likes + (p.engagement_likes || 0),
        comments: acc.comments + (p.engagement_comments || 0),
        reach: acc.reach + (p.engagement_reach || 0),
      }),
      { likes: 0, comments: 0, reach: 0 }
    );
  }, [publishedPosts]);

  const platformData = useMemo(() => {
    const map: Record<string, { likes: number; comments: number; reach: number; count: number }> = {};
    publishedPosts.forEach((p) => {
      const plat = p.platform || "Other";
      if (!map[plat]) map[plat] = { likes: 0, comments: 0, reach: 0, count: 0 };
      map[plat].likes += p.engagement_likes || 0;
      map[plat].comments += p.engagement_comments || 0;
      map[plat].reach += p.engagement_reach || 0;
      map[plat].count += 1;
    });
    return Object.entries(map).map(([name, vals]) => ({
      name,
      ...vals,
      fill: platformColors[name] || platformColors.Other,
    }));
  }, [publishedPosts]);

  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    contentPosts.forEach((p) => {
      const s = p.status || "draft";
      map[s] = (map[s] || 0) + 1;
    });
    const statusColors: Record<string, string> = {
      draft: "hsl(215, 15%, 55%)",
      pending_approval: "hsl(45, 90%, 55%)",
      approved: "hsl(140, 60%, 45%)",
      scheduled: "hsl(187, 85%, 53%)",
      published: "hsl(140, 70%, 40%)",
    };
    return Object.entries(map).map(([name, value]) => ({
      name: name.replace("_", " "),
      value,
      fill: statusColors[name] || "hsl(215, 15%, 55%)",
    }));
  }, [contentPosts]);

  const timelineData = useMemo(() => {
    const sorted = [...publishedPosts]
      .filter((p) => p.scheduled_date)
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

    const map: Record<string, { likes: number; comments: number; reach: number }> = {};
    sorted.forEach((p) => {
      const date = new Date(p.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!map[date]) map[date] = { likes: 0, comments: 0, reach: 0 };
      map[date].likes += p.engagement_likes || 0;
      map[date].comments += p.engagement_comments || 0;
      map[date].reach += p.engagement_reach || 0;
    });
    return Object.entries(map).map(([date, vals]) => ({ date, ...vals }));
  }, [publishedPosts]);

  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

  const metricCards = [
    { label: "Total Reach", value: fmt(totals.reach), icon: Eye, color: "text-yellow-400" },
    { label: "Total Likes", value: fmt(totals.likes), icon: Heart, color: "text-pink-400" },
    { label: "Total Comments", value: fmt(totals.comments), icon: MessageCircle, color: "text-primary" },
    { label: "Published Posts", value: String(publishedPosts.length), icon: TrendingUp, color: "text-green-400" },
  ];

  if (contentPosts.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">No posts yet. Create content to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((m) => (
          <div key={m.label} className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <m.icon className={`h-5 w-5 ${m.color}`} />
              <span className="text-sm text-muted-foreground">{m.label}</span>
            </div>
            <p className="font-display text-2xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Engagement by Platform */}
        {platformData.length > 0 && (
          <Card className="bg-card/60 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Engagement by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 16%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="likes" fill="hsl(330, 70%, 55%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="comments" fill="hsl(187, 85%, 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Post Status Distribution */}
        {statusData.length > 0 && (
          <Card className="bg-card/60 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Post Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Engagement Timeline */}
      {timelineData.length > 1 && (
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Engagement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 16%)" />
                <XAxis dataKey="date" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="reach" stroke="hsl(45, 90%, 55%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="likes" stroke="hsl(330, 70%, 55%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="comments" stroke="hsl(187, 85%, 53%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsView;
