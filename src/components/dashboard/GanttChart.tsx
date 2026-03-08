import { useMemo } from "react";
import { differenceInDays, addDays, format, max, min, startOfDay } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const statusColors: Record<string, string> = {
  planning: "bg-muted-foreground/40",
  todo: "bg-muted-foreground/40",
  in_progress: "bg-primary",
  review: "bg-amber-400",
  completed: "bg-green-400",
};

const priorityBorders: Record<string, string> = {
  low: "border-muted-foreground/30",
  medium: "border-blue-400/50",
  high: "border-orange-400/50",
  urgent: "border-red-400/50",
};

interface GanttTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
}

export default function GanttChart({ tasks }: { tasks: GanttTask[] }) {
  const { chartStart, chartEnd, totalDays, dayWidth, months } = useMemo(() => {
    const now = startOfDay(new Date());
    const dates = tasks.map(t => {
      const start = startOfDay(new Date(t.created_at));
      const end = t.due_date ? startOfDay(new Date(t.due_date)) : addDays(start, 7);
      return { start, end };
    });

    const chartStart = dates.length > 0
      ? min(dates.map(d => d.start))
      : addDays(now, -7);
    const chartEnd = dates.length > 0
      ? max([...dates.map(d => d.end), addDays(now, 7)])
      : addDays(now, 30);

    const totalDays = Math.max(differenceInDays(chartEnd, chartStart) + 2, 14);
    const dayWidth = 36;

    // Generate month labels
    const months: { label: string; left: number; width: number }[] = [];
    let current = new Date(chartStart);
    while (current <= chartEnd) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const startOffset = Math.max(0, differenceInDays(monthStart, chartStart));
      const endOffset = Math.min(totalDays, differenceInDays(monthEnd, chartStart) + 1);
      months.push({
        label: format(current, "MMM yyyy"),
        left: startOffset * dayWidth,
        width: (endOffset - startOffset) * dayWidth,
      });
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    return { chartStart, chartEnd, totalDays, dayWidth, months };
  }, [tasks]);

  const todayOffset = differenceInDays(startOfDay(new Date()), chartStart);

  if (tasks.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <p className="text-muted-foreground text-sm">Add tasks with due dates to see the timeline.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <ScrollArea className="w-full">
        <div style={{ minWidth: totalDays * dayWidth + 200 }}>
          {/* Header */}
          <div className="flex border-b border-border sticky top-0 bg-background z-10">
            <div className="w-[200px] shrink-0 p-3 border-r border-border">
              <span className="text-xs font-semibold text-muted-foreground">Task</span>
            </div>
            <div className="relative flex-1" style={{ height: 48 }}>
              {months.map((m, i) => (
                <div key={i} className="absolute top-0 h-6 flex items-center border-r border-border px-2"
                  style={{ left: m.left, width: m.width }}>
                  <span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
                </div>
              ))}
              {Array.from({ length: totalDays }).map((_, i) => {
                const day = addDays(chartStart, i);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <div key={i} className={`absolute bottom-0 h-5 flex items-center justify-center border-r border-border ${isWeekend ? "bg-muted/30" : ""}`}
                    style={{ left: i * dayWidth, width: dayWidth }}>
                    <span className="text-[9px] text-muted-foreground">{format(day, "d")}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rows */}
          {tasks.map((task) => {
            const start = startOfDay(new Date(task.created_at));
            const end = task.due_date ? startOfDay(new Date(task.due_date)) : addDays(start, 7);
            const leftOffset = Math.max(0, differenceInDays(start, chartStart));
            const barWidth = Math.max(1, differenceInDays(end, start) + 1);

            return (
              <div key={task.id} className="flex border-b border-border/50 hover:bg-accent/10 transition-colors">
                <div className="w-[200px] shrink-0 p-3 border-r border-border flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusColors[task.status] || statusColors.planning}`} />
                  <span className="text-xs truncate">{task.title}</span>
                </div>
                <div className="relative flex-1" style={{ height: 40 }}>
                  {/* Weekend shading */}
                  {Array.from({ length: totalDays }).map((_, i) => {
                    const day = addDays(chartStart, i);
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    return isWeekend ? (
                      <div key={i} className="absolute inset-y-0 bg-muted/20"
                        style={{ left: i * dayWidth, width: dayWidth }} />
                    ) : null;
                  })}
                  {/* Today line */}
                  {todayOffset >= 0 && todayOffset <= totalDays && (
                    <div className="absolute inset-y-0 w-px bg-primary/60 z-10"
                      style={{ left: todayOffset * dayWidth + dayWidth / 2 }} />
                  )}
                  {/* Bar */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute top-2 h-4 rounded-full ${statusColors[task.status] || statusColors.planning} border ${priorityBorders[task.priority] || ""} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                          style={{ left: leftOffset * dayWidth + 2, width: barWidth * dayWidth - 4, minWidth: 12 }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(start, "MMM d")} → {format(end, "MMM d")} · {task.status} · {task.priority}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
