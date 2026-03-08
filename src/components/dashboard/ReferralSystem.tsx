import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Plus, UserPlus, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
  contacted: { icon: UserPlus, color: "text-blue-400", bg: "bg-blue-400/10" },
  converted: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
  declined: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
};

export default function ReferralSystem() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ referrer_client_id: "", referred_name: "", referred_email: "", referred_phone: "" });

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [refRes, cliRes] = await Promise.all([
      supabase.from("referrals").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name"),
    ]);
    setReferrals(refRes.data || []);
    setClients(cliRes.data || []);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!user || !form.referrer_client_id || !form.referred_name) return;
    const { error } = await supabase.from("referrals").insert({
      referrer_client_id: form.referrer_client_id,
      referred_name: form.referred_name,
      referred_email: form.referred_email || null,
      referred_phone: form.referred_phone || null,
      created_by: user.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Referral added");
    setForm({ referrer_client_id: "", referred_name: "", referred_email: "", referred_phone: "" });
    setOpen(false);
    fetchData();
  };

  const updateStatus = async (id: string, status: string, points: number) => {
    const { error } = await supabase.from("referrals").update({ status, points_awarded: points }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    if (status === "converted" && points > 0) {
      const ref = referrals.find(r => r.id === id);
      if (ref) {
        await supabase.from("loyalty_points").insert({
          client_id: ref.referrer_client_id,
          points,
          reason: `Referral converted: ${ref.referred_name}`,
          type: "earned",
          created_by: user!.id,
        });
      }
    }
    toast.success("Referral updated");
    fetchData();
  };

  const totalConverted = referrals.filter(r => r.status === "converted").length;
  const totalPending = referrals.filter(r => r.status === "pending").length;
  const totalPoints = referrals.reduce((s, r) => s + (r.points_awarded || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Referral Program</h2>
          <p className="text-sm text-muted-foreground">Track client referrals and reward loyalty</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full"><Plus className="h-4 w-4 mr-1" /> Add Referral</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Referral</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Referring Client *</Label>
                <Select value={form.referrer_client_id} onValueChange={v => setForm(p => ({ ...p, referrer_client_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Referred Person Name *</Label><Input value={form.referred_name} onChange={e => setForm(p => ({ ...p, referred_name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={form.referred_email} onChange={e => setForm(p => ({ ...p, referred_email: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={form.referred_phone} onChange={e => setForm(p => ({ ...p, referred_phone: e.target.value }))} /></div>
              </div>
              <Button className="w-full" onClick={handleAdd}>Add Referral</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Referrals", value: referrals.length, icon: UserPlus, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Converted", value: totalConverted, icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
          { label: "Points Awarded", value: totalPoints, icon: Gift, color: "text-pink-400", bg: "bg-pink-400/10" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 rounded-xl">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg} mb-2`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="font-display text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/50 text-muted-foreground text-xs">
            <th className="text-left p-3">Referred By</th>
            <th className="text-left p-3">Referred Person</th>
            <th className="text-left p-3">Contact</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Points</th>
            <th className="text-left p-3">Actions</th>
          </tr></thead>
          <tbody>
            {referrals.map(r => {
              const sc = statusConfig[r.status] || statusConfig.pending;
              return (
                <tr key={r.id} className="border-b border-border/30 hover:bg-accent/30">
                  <td className="p-3 font-medium">{clients.find(c => c.id === r.referrer_client_id)?.name || "—"}</td>
                  <td className="p-3">{r.referred_name}</td>
                  <td className="p-3 text-muted-foreground text-xs">{r.referred_email || r.referred_phone || "—"}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${sc.bg} ${sc.color}`}>
                      <sc.icon className="h-3 w-3" /> {r.status}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{r.points_awarded || 0}</td>
                  <td className="p-3">
                    <Select value={r.status} onValueChange={v => updateStatus(r.id, v, v === "converted" ? 100 : r.points_awarded)}>
                      <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              );
            })}
            {referrals.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No referrals yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
