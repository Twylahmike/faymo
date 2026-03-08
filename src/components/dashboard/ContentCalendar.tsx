import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContentCalendarProps {
  contentPosts: any[];
  clients: any[];
  contentPlans: any[];
}

const platformBadgeColors: Record<string, string> = {
  Instagram: "bg-pink-500/20 text-pink-400",
  TikTok: "bg-primary/20 text-primary",
  YouTube: "bg-red-500/20 text-red-400",
  "Twitter/X": "bg-muted text-muted-foreground",
  Facebook: "bg-blue-500/20 text-blue-400",
  LinkedIn: "bg-blue-600/20 text-blue-300",
};

const statusDot: Record<string, string> = {
  draft: "bg-muted-foreground",
  pending_approval: "bg-yellow-400",
  approved: "bg-green-400",
  scheduled: "bg-primary",
  published: "bg-green-500",
};

const ContentCalendar = ({ contentPosts, clients, contentPlans }: ContentCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();

  const postsByDay = useMemo(() => {
    const map: Record<number, any[]> = {};
    contentPosts.forEach((post) => {
      if (!post.scheduled_date) return;
      const d = new Date(post.scheduled_date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(post);
      }
    });
    return map;
  }, [contentPosts, year, month]);

  const getClientName = (post: any) => {
    const plan = contentPlans.find((p) => p.id === post.content_plan_id);
    if (!plan) return null;
    const client = clients.find((c) => c.id === plan.client_id);
    return client?.name || null;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="text-xs"
          >
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Week header */}
        <div className="grid grid-cols-7 border-b border-border/50">
          {weekDays.map((d) => (
            <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const posts = day ? postsByDay[day] || [] : [];
            return (
              <div
                key={i}
                className={`min-h-[100px] border-b border-r border-border/30 p-1.5 ${
                  day === null ? "bg-secondary/30" : "bg-card/40"
                }`}
              >
                {day !== null && (
                  <>
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        isToday(day)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {posts.slice(0, 3).map((post: any) => (
                        <div
                          key={post.id}
                          className="group relative rounded px-1.5 py-0.5 text-[10px] leading-tight bg-secondary/60 hover:bg-secondary cursor-default transition-colors"
                          title={`${post.title}${getClientName(post) ? ` — ${getClientName(post)}` : ""}`}
                        >
                          <div className="flex items-center gap-1">
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[post.status] || statusDot.draft}`} />
                            <span className="truncate font-medium text-foreground">{post.title}</span>
                          </div>
                          {post.platform && (
                            <span className={`inline-block mt-0.5 rounded px-1 py-px text-[9px] ${platformBadgeColors[post.platform] || "bg-muted text-muted-foreground"}`}>
                              {post.platform}
                            </span>
                          )}
                        </div>
                      ))}
                      {posts.length > 3 && (
                        <span className="text-[10px] text-muted-foreground pl-1">
                          +{posts.length - 3} more
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContentCalendar;
