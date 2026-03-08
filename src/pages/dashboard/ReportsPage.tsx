import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, DollarSign, Users, Briefcase, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const ReportsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ clients: 0, projects: 0, revenue: 0, creators: 0 });
  const [invoices, setInvoices] = useState<any[]>([]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [clientsRes, projectsRes, invoicesRes, creatorsRes] = await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("invoices").select("*"),
      supabase.from("creators").select("id", { count: "exact", head: true }),
    ]);
    const revenue = (invoicesRes.data || []).filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
    setStats({ clients: clientsRes.count || 0, projects: projectsRes.count || 0, revenue, creators: creatorsRes.count || 0 });
    setInvoices(invoicesRes.data || []);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const kpiCards = [
    { label: "Total Revenue", value: `KES ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Total Clients", value: stats.clients, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Total Projects", value: stats.projects, icon: Briefcase, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Creators", value: stats.creators, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  const invoicesByStatus = [
    { name: "Paid", value: invoices.filter(i => i.status === "paid").length, color: "hsl(142, 76%, 36%)" },
    { name: "Pending", value: invoices.filter(i => i.status === "pending" || i.status === "sent").length, color: "hsl(45, 93%, 47%)" },
    { name: "Overdue", value: invoices.filter(i => i.status === "overdue").length, color: "hsl(0, 84%, 60%)" },
    { name: "Draft", value: invoices.filter(i => i.status === "draft").length, color: "hsl(var(--muted-foreground))" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of all key metrics</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="glass-card p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-display font-bold mb-4">Invoice Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={invoicesByStatus} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={45} label>
                {invoicesByStatus.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {invoicesByStatus.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="font-display font-bold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { month: "Jan", amount: 30000 },
              { month: "Feb", amount: 45000 },
              { month: "Mar", amount: 55000 },
              { month: "Apr", amount: 48000 },
              { month: "May", amount: 62000 },
              { month: "Jun", amount: stats.revenue || 75000 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
