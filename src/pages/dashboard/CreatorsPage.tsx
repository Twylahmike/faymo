import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, UserCheck } from "lucide-react";
import AddCreatorDialog from "@/components/dashboard/AddCreatorDialog";

const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const CreatorsPage = () => {
  const { user } = useAuth();
  const [creators, setCreators] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCreators = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("creators").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setCreators(data || []);
  }, [user]);

  useEffect(() => { fetchCreators(); }, [fetchCreators]);

  const filtered = creators.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.handle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.platform || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Creators</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your creator roster</p>
        </div>
        <AddCreatorDialog onCreatorAdded={fetchCreators} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search creators..." className="pl-9 bg-secondary/50 border-border/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10">
            <UserCheck className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">No creators yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">Add your first creator to your roster.</p>
          <AddCreatorDialog onCreatorAdded={fetchCreators}>
            <Button className="rounded-full bg-amber-500 hover:bg-amber-600 text-white px-6">Add Creator</Button>
          </AddCreatorDialog>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((creator) => (
            <div key={creator.id} className="glass-card rounded-xl p-5 transition-all hover:glow-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold">{creator.name}</h3>
                  {creator.handle && <p className="text-sm text-muted-foreground">{creator.handle}</p>}
                </div>
                {creator.platform && (
                  <span className="text-xs rounded-full bg-amber-400/10 text-amber-400 px-2.5 py-1">{creator.platform}</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {creator.category && <span>{creator.category}</span>}
                {creator.followers > 0 && <span>{formatNumber(creator.followers)} followers</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorsPage;
