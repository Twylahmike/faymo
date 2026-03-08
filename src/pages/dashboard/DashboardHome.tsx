import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, CalendarDays, TrendingUp, DollarSign, Briefcase, CheckCircle2, AlertCircle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, parseISO, startOfMonth } from "date-fns";

const DashboardHome = () => {
  const { user } = useAuth();
  const { role, isAdmin } = useUserRole();
  const [stats, setStats] = useState({ clients: 0, creators: 0, projects: 0, invoiceTotal: 0, pendingInvoices: 0, activeProjects: 0 });
  const [invoices, setInvoices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    const [clientsRes, creatorsRes, projectsRes, invoicesRes, activityRes] = await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("creators").select("id", { count: "exact", head: true }),
      supabase.from("projects").select("id, status"),
      supabase.from("invoices").select("*"),
      supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(15),
    ]);

    const allProjects = projectsRes.data || [];
    const allInvoices = invoicesRes.data || [];
    const activeProjects = allProjects.filter(p => p.status === "in_progress").length;
    const invoiceTotal = allInvoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
    const pendingInvoices = allInvoices.filter(i => i.status === "pending" || i.status === "sent").length;

    setStats({ clients: clientsRes.count || 0, creators: creatorsRes.count || 0, projects: allProjects.length, invoiceTotal, pendingInvoices, activeProjects });
    setInvoices(allInvoices);
    setProjects(allProjects);
    setRecentActivity(activityRes.data || []);
  }, [user]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const revenueData = useMemo(() => {
    const monthMap: Record<string, { revenue: number; expenses: number }> = {};
    invoices.forEach(inv => {
      const month = inv.paid_at ? format(parseISO(inv.paid_at), "MMM yyyy") : (inv.created_at ? format(parseISO(inv.created_at), "MMM yyyy") : null);
      if (!month) return;
      if (!monthMap[month]) monthMap[month] = { revenue: 0, expenses: 0 };
      if (inv.status === "paid") monthMap[month].revenue += Number(inv.amount);
    });
    return Object.entries(monthMap).map(([month, data]) => ({ month, ...data })).slice(-6);
  }, [invoices]);

  const projectStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      const s = p.status || "planning";
      counts[s] = (counts[s] || 0) + 1;
    });
    const colorMap: Record<string, string> = {
      planning: "hsl(var(--muted-foreground))",
      in_progress: "hsl(var(--primary))",
      completed: "hsl(142, 76%, 36%)",
      on_hold: "hsl(45, 93%, 47%)",
    };
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace("_", " "),
      value,
      color: colorMap[name] || "hsl(var(--muted-foreground))",
    }));
  }, [projects]);

  // Workers see fewer stat cards (no revenue)
  const statCards = isAdmin ? [
    { label: "Total Clients", value: stats.clients, icon: Building2, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Creators", value: stats.creators, icon: Users, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Active Projects", value: stats.activeProjects, icon: Briefcase, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Revenue", value: `KES ${stats.invoiceTotal.toLocaleString()}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Pending Invoices", value: stats.pendingInvoices, icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Total Projects", value: stats.projects, icon: CalendarDays, color: "text-primary", bg: "bg-primary/10" },
  ] : [
    { label: "Total Clients", value: stats.clients, icon: Building2, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Active Projects", value: stats.activeProjects, icon: Briefcase, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Total Projects", value: stats.projects, icon: CalendarDays, color: "text-primary", bg: "bg-primary/10" },
    { label: "Creators", value: stats.creators, icon: Users, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's what's happening with your agency.</p>
      </div>

      <div className={`grid gap-4 sm:grid-cols-2 ${isAdmin ? "lg:grid-cols-3 xl:grid-cols-6" : "lg:grid-cols-4"}`}>
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card p-4 rounded-xl transition-all hover:glow-border">
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

      <div className="grid gap-6 lg:grid-cols-3">
        {isAdmin && (
          <div className="glass-card rounded-xl p-5 lg:col-span-2">
            <h3 className="font-display font-bold mb-4">Revenue Trend</h3>
            {revenueData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No invoice data yet. Create and mark invoices as paid to see trends.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        <div className={`glass-card rounded-xl p-5 ${!isAdmin ? "lg:col-span-2" : ""}`}>
          <h3 className="font-display font-bold mb-4">Project Status</h3>
          {projectStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No projects yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={projectStatus} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {projectStatus.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2">
                {projectStatus.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    {s.name} ({s.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="font-display font-bold">Recent Activity</h3>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activity yet.</p>
          ) : (
            <div className="space-y-0 max-h-[300px] overflow-y-auto">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex gap-3 py-2.5 border-b border-border/30 last:border-0">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{log.action}</p>
                    {log.details && <p className="text-xs text-muted-foreground truncate">{log.details}</p>}
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <h3 className="font-display font-bold mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Add Client", href: "/dashboard/clients", color: "bg-blue-400/10 text-blue-400 hover:bg-blue-400/20" },
            { label: "New Project", href: "/dashboard/projects", color: "bg-purple-400/10 text-purple-400 hover:bg-purple-400/20" },
            { label: "Create Invoice", href: "/dashboard/payments", color: "bg-green-400/10 text-green-400 hover:bg-green-400/20" },
            { label: "View Reports", href: "/dashboard/reports", color: "bg-orange-400/10 text-orange-400 hover:bg-orange-400/20" },
          ].map((action) => (
            <a key={action.label} href={action.href} className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${action.color}`}>
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
