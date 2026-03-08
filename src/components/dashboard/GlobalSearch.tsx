import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Building2, Briefcase, CreditCard, CheckCircle2 } from "lucide-react";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  type: "client" | "project" | "invoice" | "task";
  href: string;
}

const icons = {
  client: Building2,
  project: Briefcase,
  invoice: CreditCard,
  task: CheckCircle2,
};

export default function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setResults([]); return; }
    const term = `%${q}%`;

    const [clients, projects, invoices, tasks] = await Promise.all([
      supabase.from("clients").select("id, name, company").ilike("name", term).limit(5),
      supabase.from("projects").select("id, name").ilike("name", term).limit(5),
      supabase.from("invoices").select("id, invoice_number, amount").ilike("invoice_number", term).limit(5),
      supabase.from("tasks").select("id, title").ilike("title", term).limit(5),
    ]);

    const r: SearchResult[] = [
      ...(clients.data || []).map(c => ({ id: c.id, label: c.name, sublabel: c.company, type: "client" as const, href: "/dashboard/clients" })),
      ...(projects.data || []).map(p => ({ id: p.id, label: p.name, type: "project" as const, href: "/dashboard/projects" })),
      ...(invoices.data || []).map(i => ({ id: i.id, label: i.invoice_number, sublabel: `KES ${Number(i.amount).toLocaleString()}`, type: "invoice" as const, href: "/dashboard/payments" })),
      ...(tasks.data || []).map(t => ({ id: t.id, label: t.title, type: "task" as const, href: "/dashboard/projects" })),
    ];
    setResults(r);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const grouped = {
    client: results.filter(r => r.type === "client"),
    project: results.filter(r => r.type === "project"),
    invoice: results.filter(r => r.type === "invoice"),
    task: results.filter(r => r.type === "task"),
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search clients, projects, invoices, tasks..." value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {(["client", "project", "invoice", "task"] as const).map(type => {
          const items = grouped[type];
          if (items.length === 0) return null;
          const Icon = icons[type];
          return (
            <CommandGroup key={type} heading={type.charAt(0).toUpperCase() + type.slice(1) + "s"}>
              {items.map(item => (
                <CommandItem key={item.id} onSelect={() => { navigate(item.href); onOpenChange(false); }}>
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                  {item.sublabel && <span className="ml-2 text-xs text-muted-foreground">{item.sublabel}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
