import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profile?: { display_name: string | null };
}

export default function ProjectComments({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState("");
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("project_comments")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (data) {
      setComments(data);
      // Fetch profiles for unique user_ids
      const userIds = [...new Set(data.map(c => c.user_id))];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        if (profileData) {
          const map: Record<string, string> = {};
          profileData.forEach(p => { map[p.user_id] = p.display_name || "User"; });
          setProfiles(map);
        }
      }
    }
  }, [projectId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  useEffect(() => {
    const channel = supabase
      .channel(`comments-${projectId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "project_comments", filter: `project_id=eq.${projectId}` },
        (payload) => {
          setComments(prev => [...prev, payload.new as Comment]);
          // Fetch profile if unknown
          const uid = (payload.new as Comment).user_id;
          if (!profiles[uid]) {
            supabase.from("profiles").select("user_id, display_name").eq("user_id", uid).single()
              .then(({ data }) => {
                if (data) setProfiles(prev => ({ ...prev, [data.user_id]: data.display_name || "User" }));
              });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId, profiles]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

  const handleSend = async () => {
    if (!user || !message.trim()) return;
    const { error } = await supabase.from("project_comments").insert({
      project_id: projectId, user_id: user.id, content: message.trim(),
    });
    if (error) { toast.error(error.message); return; }
    setMessage("");
  };

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="glass-card rounded-xl flex flex-col h-[400px]">
      <div className="p-4 border-b border-border">
        <h3 className="font-display font-semibold text-sm">Team Chat</h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
          )}
          {comments.map((c) => {
            const isMe = c.user_id === user?.id;
            const name = profiles[c.user_id] || "User";
            return (
              <div key={c.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{getInitials(name)}</AvatarFallback>
                </Avatar>
                <div className={`max-w-[75%] ${isMe ? "items-end" : ""}`}>
                  <p className={`text-[10px] text-muted-foreground mb-0.5 ${isMe ? "text-right" : ""}`}>{name}</p>
                  <div className={`rounded-lg px-3 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    {c.content}
                  </div>
                  <p className={`text-[10px] text-muted-foreground mt-0.5 ${isMe ? "text-right" : ""}`}>
                    {new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={!message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
