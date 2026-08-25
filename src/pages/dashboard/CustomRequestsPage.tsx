import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Inbox, Mail, Phone, Building2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface CustomRequest {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  budget: string | null;
  message: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  contacted: "bg-amber-500/10 text-amber-400",
  closed: "bg-muted text-muted-foreground",
};

const CustomRequestsPage = () => {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    const { data } = await supabase
      .from("custom_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRequests((data as CustomRequest[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("custom_requests").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Custom Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Custom quote requests submitted from the pricing page</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Inbox className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">No requests yet</h2>
          <p className="text-muted-foreground">Custom quote requests from the public pricing page will show up here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((r) => (
            <div key={r.id} className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold">{r.name}</h3>
                    <span className={`text-xs rounded-full px-2.5 py-0.5 ${statusColors[r.status] || statusColors.new}`}>{r.status}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {r.email}</span>
                    {r.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {r.phone}</span>}
                    {r.company && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {r.company}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {r.budget && <span className="text-xs text-muted-foreground">Budget: {r.budget}</span>}
                  <Select value={r.status} onValueChange={(v) => handleStatusChange(r.id, v)}>
                    <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="mt-3 text-sm text-foreground/90 whitespace-pre-wrap">{r.message}</p>
              <p className="mt-3 text-[10px] text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy HH:mm")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomRequestsPage;
