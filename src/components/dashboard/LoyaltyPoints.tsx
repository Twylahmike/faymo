import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function LoyaltyPoints() {
  const { user } = useAuth();
  const [points, setPoints] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ client_id: "", points: "", reason: "", type: "earned" });

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [ptsRes, cliRes] = await Promise.all([
      supabase.from("loyalty_points").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name"),
    ]);
    setPoints(ptsRes.data || []);
    setClients(cliRes.data || []);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!user || !form.client_id || !form.points || !form.reason) return;
    const { error } = await supabase.from("loyalty_points").insert({
      client_id: form.client_id,
      points: parseInt(form.points),
      reason: form.reason,
      type: form.type,
      created_by: user.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Points recorded");
    setForm({ client_id: "", points: "", reason: "", type: "earned" });
    setOpen(false);
    fetchData();
  };

  // Aggregate points per client
  const clientTotals = clients.map(c => {
    const clientPts = points.filter(p => p.client_id === c.id);
    const earned = clientPts.filter(p => p.type === "earned").reduce((s, p) => s + p.points, 0);
    const redeemed = clientPts.filter(p => p.type === "redeemed").reduce((s, p) => s + p.points, 0);
    return { ...c, earned, redeemed, balance: earned - redeemed };
  }).filter(c => c.earned > 0 || c.redeemed > 0).sort((a, b) => b.balance - a.balance);

  const totalEarned = points.filter(p => p.type === "earned").reduce((s, p) => s + p.points, 0);
  const totalRedeemed = points.filter(p => p.type === "redeemed").reduce((s, p) => s + p.points, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Loyalty Points</h2>
          <p className="text-sm text-muted-foreground">Track and manage client loyalty rewards</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full"><Plus className="h-4 w-4 mr-1" /> Add Points</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Loyalty Points</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Client *</Label>
                <Select value={form.client_id} onValueChange={v => setForm(p => ({ ...p, client_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Points *</Label><Input type="number" value={form.points} onChange={e => setForm(p => ({ ...p, points: e.target.value }))} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="earned">Earned</SelectItem>
                      <SelectItem value="redeemed">Redeemed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Reason *</Label><Input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="e.g. Referral bonus, Monthly reward..." /></div>
              <Button className="w-full" onClick={handleAdd}>Record Points</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Earned", value: totalEarned, icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
          { label: "Total Redeemed", value: totalRedeemed, icon: TrendingDown, color: "text-orange-400", bg: "bg-orange-400/10" },
          { label: "Active Balance", value: totalEarned - totalRedeemed, icon: Star, color: "text-amber-400", bg: "bg-amber-400/10" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 rounded-xl">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg} mb-2`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="font-display text-xl font-bold">{s.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Client leaderboard */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="font-display font-semibold mb-3">Client Leaderboard</h3>
        <div className="space-y-2">
          {clientTotals.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors">
              <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground">Earned: {c.earned} · Redeemed: {c.redeemed}</p>
              </div>
              <span className="flex items-center gap-1 font-display font-bold text-amber-400">
                <Star className="h-3.5 w-3.5" /> {c.balance}
              </span>
            </div>
          ))}
          {clientTotals.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No loyalty points recorded yet</p>}
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass-card rounded-xl overflow-hidden">
        <h3 className="font-display font-semibold p-4 pb-2">Recent Activity</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/50 text-muted-foreground text-xs">
            <th className="text-left p-3">Client</th>
            <th className="text-left p-3">Points</th>
            <th className="text-left p-3">Type</th>
            <th className="text-left p-3">Reason</th>
            <th className="text-left p-3">Date</th>
          </tr></thead>
          <tbody>
            {points.slice(0, 20).map(p => (
              <tr key={p.id} className="border-b border-border/30 hover:bg-accent/30">
                <td className="p-3 font-medium">{clients.find(c => c.id === p.client_id)?.name || "—"}</td>
                <td className={`p-3 font-bold ${p.type === "earned" ? "text-green-400" : "text-orange-400"}`}>
                  {p.type === "earned" ? "+" : "-"}{p.points}
                </td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${p.type === "earned" ? "bg-green-400/10 text-green-400" : "bg-orange-400/10 text-orange-400"}`}>{p.type}</span></td>
                <td className="p-3 text-muted-foreground">{p.reason}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {points.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No points recorded yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
