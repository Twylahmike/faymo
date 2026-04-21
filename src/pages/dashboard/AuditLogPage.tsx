import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ScrollText } from "lucide-react";
import { format } from "date-fns";

interface AuditEntry {
  id: string;
  actor_id: string;
  actor_name: string | null;
  target_id: string | null;
  target_name: string | null;
  action: string;
  entity_type: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

const actionColors: Record<string, string> = {
  created_member: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  created_work: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  uploaded_work: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  updated_work: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  deleted_work: "bg-red-500/15 text-red-400 border-red-500/30",
};

const AuditLogPage = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      const { data } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      setEntries((data as AuditEntry[]) || []);
      setLoading(false);
    };
    fetchEntries();
  }, []);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        (e.actor_name?.toLowerCase().includes(q)) ||
        (e.target_name?.toLowerCase().includes(q)) ||
        e.action.toLowerCase().includes(q);
      const t = new Date(e.created_at).getTime();
      const fromOk = !dateFrom || t >= new Date(dateFrom).getTime();
      const toOk = !dateTo || t <= new Date(dateTo + "T23:59:59").getTime();
      return matchesSearch && fromOk && toOk;
    });
  }, [entries, search, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Searchable history of admin and member actions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by member, target or action..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border" />
        </div>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
          className="bg-secondary border-border sm:w-40" />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
          className="bg-secondary border-border sm:w-40" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center border border-border">
          <ScrollText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No audit entries match your filters.</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">When</TableHead>
                <TableHead className="text-muted-foreground">Actor</TableHead>
                <TableHead className="text-muted-foreground">Action</TableHead>
                <TableHead className="text-muted-foreground">Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id} className="border-border">
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(e.created_at), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-sm">{e.actor_name || e.actor_id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={actionColors[e.action] || "bg-muted/30"}>
                      {e.action.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{e.target_name || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;