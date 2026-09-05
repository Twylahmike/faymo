import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, Download, PenLine, Send, CheckCircle2 } from "lucide-react";
import DocumentFields from "./DocumentFields";
import { getDocType } from "@/lib/documentTypes";
import { format } from "date-fns";

interface PortalDoc {
  id: string;
  doc_type: string;
  title: string;
  content: Record<string, any>;
  status: string;
  version: number;
  file_url: string | null;
  file_name: string | null;
  client_fillable: boolean;
  submitted_at: string | null;
  updated_at: string;
}

const statusColor: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-500/15 text-blue-500",
  awaiting_signature: "bg-amber-500/15 text-amber-500",
  signed: "bg-emerald-500/15 text-emerald-500",
  paid: "bg-emerald-500/15 text-emerald-500",
  completed: "bg-primary/15 text-primary",
};

const PortalDocuments = ({
  clientId,
  clientName,
  clientEmail,
}: {
  clientId: string;
  clientName: string;
  clientEmail?: string | null;
}) => {
  const [docs, setDocs] = useState<PortalDoc[]>([]);
  const [signedIds, setSignedIds] = useState<string[]>([]);
  const [open, setOpen] = useState<PortalDoc | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchDocs = useCallback(async () => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("client_id", clientId)
      .neq("status", "draft")
      .order("created_at", { ascending: true });
    const list = (data as unknown as PortalDoc[]) || [];
    setDocs(list);
    if (list.length) {
      const { data: sigs } = await supabase
        .from("document_signatures")
        .select("document_id")
        .in("document_id", list.map((d) => d.id));
      setSignedIds((sigs || []).map((s: any) => s.document_id));
    }
  }, [clientId]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const openDoc = (doc: PortalDoc) => {
    setOpen(doc);
    setDraft(doc.content || {});
    setSignature("");
  };

  const def = open ? getDocType(open.doc_type) : undefined;
  const canFill = !!open && open.client_fillable && !open.submitted_at;
  const canSign = !!open && !!def?.signable && !signedIds.includes(open.id);

  const submitForm = async () => {
    if (!open) return;
    setBusy(true);
    const { error } = await supabase
      .from("documents")
      .update({ content: draft as any, submitted_at: new Date().toISOString() })
      .eq("id", open.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Submitted — thank you!");
    setOpen(null);
    fetchDocs();
  };

  const sign = async () => {
    if (!open || !signature.trim()) return toast.error("Type your full name to sign");
    setBusy(true);
    const { error } = await supabase.from("document_signatures").insert({
      document_id: open.id,
      signer_name: signature.trim(),
      signer_email: clientEmail ?? null,
      typed_signature: signature.trim(),
    } as any);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Document signed");
    setOpen(null);
    fetchDocs();
  };

  const handleUpload = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) return toast.error(`${file.name} is larger than 20MB`);
    setUploading(true);
    const path = `clients/${clientId}/uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("media").upload(path, file);
    if (upErr) {
      setUploading(false);
      return toast.error(`Upload failed — ${upErr.message}`);
    }
    const url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("documents").insert({
      client_id: clientId,
      doc_type: "file_attachment" as any,
      title: file.name,
      content: { description: `Uploaded by ${clientName}` } as any,
      status: "sent",
      file_url: url,
      file_name: file.name,
      created_by: user?.id ?? null,
    } as any);
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Document uploaded");
    fetchDocs();
  };

  const uploadButton = (
    <Button variant="outline" asChild disabled={uploading}>
      <label className="cursor-pointer">
        <Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Upload document"}
        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
      </label>
    </Button>
  );

  if (docs.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed space-y-3">
        <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No documents yet. You can upload your own here.</p>
        <div className="flex justify-center">{uploadButton}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">{uploadButton}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {docs.map((doc) => {
          const d = getDocType(doc.doc_type);
          const signed = signedIds.includes(doc.id);
          return (
            <Card key={doc.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{d?.label} · updated {format(new Date(doc.updated_at), "d MMM yyyy")}</p>
                </div>
                <Badge className={statusColor[doc.status] || ""}>{doc.status.replace("_", " ")}</Badge>
              </div>
              {signed && <p className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Signed</p>}
              {doc.submitted_at && <p className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Submitted</p>}
              {doc.file_url ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={doc.file_url} target="_blank" rel="noreferrer"><Download className="h-3 w-3 mr-1" /> Download</a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => openDoc(doc)}>
                  {doc.client_fillable && !doc.submitted_at
                    ? (<><PenLine className="h-3 w-3 mr-1" /> Fill in</>)
                    : (<><FileText className="h-3 w-3 mr-1" /> View</>)}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{open?.title}</DialogTitle></DialogHeader>
          {def && <DocumentFields fields={def.fields} value={draft} onChange={setDraft} readOnly={!canFill} />}

          {canSign && (
            <div className="space-y-2 rounded-lg border border-border p-4 bg-secondary/40">
              <Label>Type your full name to sign</Label>
              <Input value={signature} onChange={(e) => setSignature(e.target.value)}
                placeholder={clientName} className="bg-background border-border font-display text-lg" />
              <p className="text-xs text-muted-foreground">By typing your name you agree to the terms of this document.</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            {canFill && (
              <Button onClick={submitForm} disabled={busy} className="rounded-full bg-primary text-primary-foreground">
                <Send className="h-4 w-4 mr-1" /> {busy ? "Submitting..." : "Submit"}
              </Button>
            )}
            {canSign && (
              <Button onClick={sign} disabled={busy} className="rounded-full bg-primary text-primary-foreground">
                <PenLine className="h-4 w-4 mr-1" /> {busy ? "Signing..." : "Sign document"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortalDocuments;
