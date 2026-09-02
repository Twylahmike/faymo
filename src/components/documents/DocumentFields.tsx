import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Star } from "lucide-react";
import type { FieldDef } from "@/lib/documentTypes";

type Content = Record<string, any>;

interface Props {
  fields: FieldDef[];
  value: Content;
  onChange: (next: Content) => void;
  readOnly?: boolean;
}

const emptyRow = (columns: FieldDef[]) =>
  Object.fromEntries(columns.map((c) => [c.key, c.type === "number" ? 0 : ""]));

const Rating = ({ value, onChange, readOnly }: { value: number; onChange: (n: number) => void; readOnly?: boolean }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={readOnly}
        onClick={() => onChange(n)}
        className="disabled:cursor-default"
        aria-label={`${n} star${n > 1 ? "s" : ""}`}
      >
        <Star className={`h-5 w-5 ${n <= (value || 0) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
      </button>
    ))}
  </div>
);

const DocumentFields = ({ fields, value, onChange, readOnly }: Props) => {
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });

  const renderSimple = (f: FieldDef, v: any, set2: (v: any) => void) => {
    switch (f.type) {
      case "textarea":
        return (
          <Textarea
            value={v ?? ""}
            placeholder={f.placeholder}
            readOnly={readOnly}
            rows={3}
            onChange={(e) => set2(e.target.value)}
            className="bg-secondary border-border resize-none"
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={v ?? 0}
            readOnly={readOnly}
            onChange={(e) => set2(Number(e.target.value))}
            className="bg-secondary border-border"
          />
        );
      case "date":
        return (
          <Input type="date" value={v ?? ""} readOnly={readOnly} onChange={(e) => set2(e.target.value)} className="bg-secondary border-border" />
        );
      case "select":
        return readOnly ? (
          <Input value={v ?? ""} readOnly className="bg-secondary border-border" />
        ) : (
          <Select value={v || undefined} onValueChange={set2}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {f.options?.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        );
      case "rating":
        return <Rating value={v} onChange={set2} readOnly={readOnly} />;
      default:
        return (
          <Input
            type={f.type === "url" ? "url" : "text"}
            value={v ?? ""}
            placeholder={f.placeholder}
            readOnly={readOnly}
            onChange={(e) => set2(e.target.value)}
            className="bg-secondary border-border"
          />
        );
    }
  };

  return (
    <div className="space-y-5">
      {fields.map((f) => {
        const v = value?.[f.key];

        if (f.type === "bullets") {
          const items: string[] = Array.isArray(v) ? v : [];
          return (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={item}
                    readOnly={readOnly}
                    onChange={(e) => {
                      const next = [...items];
                      next[i] = e.target.value;
                      set(f.key, next);
                    }}
                    className="bg-secondary border-border"
                  />
                  {!readOnly && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => set(f.key, items.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <Button type="button" variant="outline" size="sm" onClick={() => set(f.key, [...items, ""])}>
                  <Plus className="h-3 w-3 mr-1" /> Add item
                </Button>
              )}
              {readOnly && items.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
            </div>
          );
        }

        if (f.type === "repeater" || f.type === "table") {
          const rows: Content[] = Array.isArray(v) ? v : [];
          const cols = f.columns || [];
          return (
            <div key={f.key} className="space-y-3">
              <Label>{f.label}</Label>
              {rows.length === 0 && <p className="text-sm text-muted-foreground">No entries yet.</p>}
              <div className="space-y-3">
                {rows.map((row, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 bg-secondary/40">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {cols.map((c) => (
                        <div key={c.key} className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{c.label}</Label>
                          {renderSimple(c, row[c.key], (nv) => {
                            const next = [...rows];
                            next[i] = { ...row, [c.key]: nv };
                            set(f.key, next);
                          })}
                        </div>
                      ))}
                    </div>
                    {!readOnly && (
                      <Button type="button" variant="ghost" size="sm" className="mt-2 text-red-500"
                        onClick={() => set(f.key, rows.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {!readOnly && (
                <Button type="button" variant="outline" size="sm" onClick={() => set(f.key, [...rows, emptyRow(cols)])}>
                  <Plus className="h-3 w-3 mr-1" /> Add row
                </Button>
              )}
            </div>
          );
        }

        return (
          <div key={f.key} className="space-y-2">
            <Label>{f.label}</Label>
            {renderSimple(f, v, (nv) => set(f.key, nv))}
          </div>
        );
      })}
    </div>
  );
};

export default DocumentFields;
