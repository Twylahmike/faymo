import { useRef, useState } from "react";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileArchive, Upload, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { DOC_TYPES, defaultContent, getDocType } from "@/lib/documentTypes";

const MAX_MB = 20;
const ALLOWED = ["pdf", "doc", "docx", "txt", "rtf", "csv", "xls", "xlsx", "ppt", "pptx", "png", "jpg", "jpeg", "webp", "gif", "heic"];

interface Candidate {
  id: string;
  name: string;
  size: number;
  file: File;
  docType: string;
  matched: boolean;
}

interface Rejected {
  name: string;
  reason: string;
}

interface ResultRow {
  name: string;
  ok: boolean;
  detail: string;
}

const guessType = (name: string): string | null => {
  const n = name.toLowerCase();
  const rules: [string, string][] = [
    ["inquiry", "inquiry_form"],
    ["enquiry", "inquiry_form"],
    ["agreement", "agreement"],
    ["contract", "agreement"],
    ["invoice", "invoice"],
    ["welcome email", "welcome_email"],
    ["welcome-email", "welcome_email"],
    ["welcome", "welcome_document"],
    ["questionnaire", "questionnaire"],
    ["proposal", "proposal"],
    ["strategy", "strategy_kpi"],
    ["kpi", "strategy_kpi"],
    ["calendar", "content_calendar"],
    ["notes", "content_creation_notes"],
    ["analytics", "monthly_analytics"],
    ["report", "monthly_analytics"],
    ["feedback", "feedback_form"],
    ["portal", "client_portal_summary"],
  ];
  for (const [needle, type] of rules) if (n.includes(needle)) return type;
  return null;
};

const ext = (name: string) => name.split(".").pop()?.toLowerCase() || "";
const safe = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

const validate = (name: string, size: number): string | null => {
  if (!name || name.startsWith(".") || name.includes("__MACOSX")) return "Hidden or system file";
  if (size === 0) return "File is empty";
  if (size > MAX_MB * 1024 * 1024) return `Larger than ${MAX_MB}MB`;
  if (!ALLOWED.includes(ext(name))) return `Unsupported file type (.${ext(name) || "unknown"})`;
  return null;
};

const BulkDocumentUpload = ({
  clientId,
  open,
  onOpenChange,
  onDone,
}: {
  clientId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDone: () => void;
}) => {
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [rejected, setRejected] = useState<Rejected[]>([]);
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setCandidates([]);
    setRejected([]);
    setResults(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const addFiles = async (fileList: FileList) => {
    setReading(true);
    setResults(null);
    const nextCandidates: Candidate[] = [];
    const nextRejected: Rejected[] = [];

    const push = (name: string, file: File) => {
      const reason = validate(name, file.size);
      if (reason) return nextRejected.push({ name, reason });
      const guessed = guessType(name);
      nextCandidates.push({
        id: `${name}-${nextCandidates.length}-${Date.now()}`,
        name,
        size: file.size,
        file,
        docType: guessed || "file_attachment",
        matched: !!guessed,
      });
    };

    for (const file of Array.from(fileList)) {
      if (ext(file.name) === "zip") {
        try {
          const zip = await JSZip.loadAsync(file);
          const entries = Object.values(zip.files).filter((e) => !e.dir);
          if (entries.length === 0) nextRejected.push({ name: file.name, reason: "ZIP contains no files" });
          for (const entry of entries) {
            const base = entry.name.split("/").pop() || entry.name;
            if (entry.name.includes("__MACOSX") || base.startsWith(".")) {
              nextRejected.push({ name: entry.name, reason: "Hidden or system file" });
              continue;
            }
            const blob = await entry.async("blob");
            push(base, new File([blob], base, { type: blob.type }));
          }
        } catch {
          nextRejected.push({ name: file.name, reason: "ZIP could not be opened — it may be corrupted or password-protected" });
        }
      } else {
        push(file.name, file);
      }
    }

    // duplicate names within the batch
    const seen = new Set<string>();
    const deduped = nextCandidates.filter((c) => {
      if (seen.has(c.name.toLowerCase())) {
        nextRejected.push({ name: c.name, reason: "Duplicate file name in this batch" });
        return false;
      }
      seen.add(c.name.toLowerCase());
      return true;
    });

    setCandidates((prev) => [...prev, ...deduped]);
    setRejected((prev) => [...prev, ...nextRejected]);
    setReading(false);
    if (deduped.length === 0 && nextRejected.length > 0) toast.error("No usable files found in that selection");
  };

  const setType = (id: string, docType: string) =>
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, docType } : c)));

  const removeCandidate = (id: string) => setCandidates((prev) => prev.filter((c) => c.id !== id));

  const save = async () => {
    if (!candidates.length) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const rows: ResultRow[] = rejected.map((r) => ({ name: r.name, ok: false, detail: r.reason }));

    for (const c of candidates) {
      const path = `clients/${clientId}/documents/${Date.now()}-${safe(c.name)}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, c.file);
      if (upErr) {
        rows.push({ name: c.name, ok: false, detail: `Upload failed — ${upErr.message}` });
        continue;
      }
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      const def = getDocType(c.docType);
      const { error } = await supabase.from("documents").insert({
        client_id: clientId,
        doc_type: c.docType as any,
        title: c.name,
        content: (def ? defaultContent(def) : {}) as any,
        status: "sent",
        file_url: pub.publicUrl,
        file_name: c.name,
        client_fillable: !!def?.clientFillable,
        created_by: user?.id ?? null,
      } as any);
      if (error) rows.push({ name: c.name, ok: false, detail: `Could not save — ${error.message}` });
      else rows.push({ name: c.name, ok: true, detail: `Saved as ${def?.label || "Uploaded File"}` });
    }

    setSaving(false);
    setResults(rows);
    setCandidates([]);
    setRejected([]);
    const okCount = rows.filter((r) => r.ok).length;
    if (okCount) toast.success(`${okCount} document${okCount === 1 ? "" : "s"} added`);
    onDone();
  };

  const okRows = results?.filter((r) => r.ok) ?? [];
  const failRows = results?.filter((r) => !r.ok) ?? [];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Bulk upload documents</DialogTitle>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".zip,.pdf,.doc,.docx,.txt,.rtf,.csv,.xls,.xlsx,.ppt,.pptx,image/*"
          onChange={(e) => e.target.files?.length && addFiles(e.target.files)}
        />

        <button
          onClick={() => inputRef.current?.click()}
          disabled={reading || saving}
          className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 hover:bg-accent/30 transition-colors disabled:opacity-50"
        >
          {reading ? <Loader2 className="h-7 w-7 mx-auto text-primary animate-spin" /> : <FileArchive className="h-7 w-7 mx-auto text-muted-foreground mb-2" />}
          <p className="text-sm">{reading ? "Reading files..." : "Choose a ZIP or several files"}</p>
          <p className="text-xs text-muted-foreground mt-1">Each file is matched to a document type automatically. Max {MAX_MB}MB per file.</p>
        </button>

        {candidates.length > 0 && (
          <div className="space-y-2">
            <Label>{candidates.length} file{candidates.length === 1 ? "" : "s"} ready</Label>
            {candidates.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(c.size / 1024 / 1024).toFixed(2)} MB ·{" "}
                    {c.matched ? "matched automatically" : "no match — choose a type"}
                  </p>
                </div>
                <Select value={c.docType} onValueChange={(v) => setType(c.id, v)}>
                  <SelectTrigger className="h-8 w-48 bg-secondary border-border text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((d) => <SelectItem key={d.type} value={d.type}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeCandidate(c.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {rejected.length > 0 && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 space-y-1">
            <p className="text-sm font-medium text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> {rejected.length} file{rejected.length === 1 ? "" : "s"} skipped
            </p>
            {rejected.map((r, i) => (
              <p key={i} className="text-xs text-red-500/90 break-all">{r.name} — {r.reason}</p>
            ))}
          </div>
        )}

        {results && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Badge className="bg-emerald-500/15 text-emerald-500">{okRows.length} uploaded</Badge>
              <Badge className="bg-red-500/15 text-red-500">{failRows.length} failed</Badge>
            </div>
            <div className="rounded-lg border border-border divide-y divide-border">
              {results.map((r, i) => (
                <div key={i} className="flex items-start gap-2 p-2">
                  {r.ok
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    : <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <p className="text-sm break-all">{r.name}</p>
                    <p className="text-xs text-muted-foreground break-all">{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Close</Button>
          <Button
            onClick={save}
            disabled={saving || reading || candidates.length === 0}
            className="rounded-full bg-primary text-primary-foreground"
          >
            <Upload className="h-4 w-4 mr-1" /> {saving ? "Uploading..." : `Upload ${candidates.length || ""}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkDocumentUpload;
