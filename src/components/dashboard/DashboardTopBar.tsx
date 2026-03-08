import { LogOut, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NotificationCenter } from "./NotificationCenter";
import GlobalSearch from "./GlobalSearch";

export function DashboardTopBar() {
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("display_name").eq("user_id", user.id).single()
        .then(({ data }) => setDisplayName(data?.display_name || null));
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <header className="h-14 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 gap-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-muted-foreground" />
          <button
            onClick={() => setSearchOpen(true)}
            className="relative hidden md:flex items-center gap-2 h-9 w-64 rounded-md border border-border/50 bg-secondary/50 px-3 text-sm text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationCenter />
          <span className="rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium capitalize">
            {role}
          </span>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {displayName || user?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
