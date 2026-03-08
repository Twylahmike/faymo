import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, CalendarDays, TrendingUp, DollarSign, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const DashboardHome = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [stats, setStats] = useState({ clients: 0, creators: 0, projects: 0, invoiceTotal: 0, pendingInvoices: 0, activeProjects: 0 });

  const fetchStats = useCallback(async () => {
    if (!user) return;
    const [clientsRes, creatorsRes, projectsRes, invoicesRes] = await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("creators").select("id", { count: "exact", head: true }),
      supabase.from("projects").select("id, status"),
      supabase.from("invoices").select("amount, status"),
    ]);

    const activeProjects = (projectsRes.data || []).filter(p => p.status === "in_progress").length;
    const invoices = invoicesRes.data || [];
    const invoiceTotal = invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
    const pendingInvoices = invoices.filter(i => i.status === "pending" || i.status === "sent").length;

    setStats({
      clients: clientsRes.count || 0,
      creators: creatorsRes.count || 0,
      projects: (projectsRes.data || []).length,
      invoiceTotal,
      pendingInvoices,
      activeProjects,
    });
  }, [user]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statCards = [
    { label: "Total Clients", value: stats.clients, icon: Building2, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Creators", value: stats.creators, icon: Users, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Active Projects", value: stats.activeProjects, icon: Briefcase, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Revenue", value: `KES ${stats.invoiceTotal.toLocaleString()}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Pending Invoices", value: stats.pendingInvoices, icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Total Projects", value: stats.projects, icon: CalendarDays, color: "text-primary", bg: "bg-primary/10" },
  ];

  // Mock chart data for now
  const revenueData = [
    { month: "Jan", revenue: 45000, expenses: 30000 },
    { month: "Feb", revenue: 52000, expenses: 28000 },
    { month: "Mar", revenue: 61000, expenses: 35000 },
    { month: "Apr", revenue: 58000, expenses: 32000 },
    { month: "May", revenue: 72000, expenses: 38000 },
    { month: "Jun", revenue: 85000, expenses: 42000 },
  ];

  const projectStatus = [
    { name: "Planning", value: 3, color: "hsl(var(--muted-foreground))" },
    { name: "In Progress", value: 5, color: "hsl(var(--primary))" },
    { name: "Completed", value: 8, color: "hsl(142, 76%, 36%)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's what's happening with your agency.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="glass-card rounded-xl p-5 lg:col-span-2">
          <h3 className="font-display font-bold mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project Status Pie */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-display font-bold mb-4">Project Status</h3>
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
        </div>
      </div>

      {/* Quick Actions */}
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
