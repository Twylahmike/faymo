import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FileText, Plus, Trash2, Upload, Download, PenLine, Save, BookmarkPlus, FileArchive } from "lucide-react";
import BulkDocumentUpload from "./BulkDocumentUpload";
import DocumentFields from "./DocumentFields";
import { DOC_TYPES, DOC_STATUSES, getDocType, defaultContent } from "@/lib/documentTypes";
import { format } from "date-fns";

interface ClientDocument {
  id: string;
  client_id: string;
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

interface Signature {
  id: string;
  document_id: string;
  signer_name: string;
  signer_email: string | null;
  typed_signature: string | null;
  signed_at: string;
}

const statusColor: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-500/15 text-blue-500",
  awaiting_signature: "bg-amber-500/15 text-amber-500",
  signed: "bg-emerald-500/15 text-emerald-500",
  paid: "bg-emerald-500/15 text-emerald-500",
  completed: "bg-primary/15 text-primary",
};

const ClientDocuments = ({ clientId, clientName }: { clientId: string; clientName: string }) => {
  const [docs, setDocs] = useState<ClientDocument[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [templates, setTemplates] = useState<{ id: string; name: string; doc_type: string; content: any }[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newType, setNewType] = useState<string>("agreement");
  const [newTitle, setNewTitle] = useState("");
  const [newTemplate, setNewTemplate] = useState<string>("none");
  const [editing, setEditing] = useState<ClientDocument | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [newMode, setNewMode] = useState<"write" | "upload">("write");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchDocs = useCallback(async () => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true });
    const list = (data as unknown as ClientDocument[]) || [];
    setDocs(list);
    if (list.length) {
      const { data: sigs } = await supabase
        .from("document_signatures")
        .select("*")
        .in("document_id", list.map((d) => d.id));
      setSignatures((sigs as unknown as Signature[]) || []);
    } else {
      setSignatures([]);
    }
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    fetchDocs();
    supabase.from("document_templates").select("*").then(({ data }) => setTemplates((data as any) || []));
  }, [fetchDocs]);

  const handleCreate = async () => {
    const def = getDocType(newType);
    if (!def) return;
    if (newMode === "upload" && !newFile) return toast.error("Choose a file to send, or switch to writing the contents");
    setCreating(true);
    const tpl = templates.find((t) => t.id === newTemplate);
    const { data: { user } } = await supabase.auth.getUser();

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    if (newMode === "upload" && newFile) {
      if (newFile.size > 20 * 1024 * 1024) {
        setCreating(false);
        return toast.error(`${newFile.name} is larger than 20MB`);
      }
      const path = `clients/${clientId}/documents/${Date.now()}-${newFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, newFile);
      if (upErr) {
        setCreating(false);
        return toast.error(`Upload failed — ${upErr.message}`);
      }
      fileUrl = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
      fileName = newFile.name;
    }

    const { error } = await supabase.from("documents").insert({
      client_id: clientId,
      doc_type: newType as any,
      title: newTitle.trim() || fileName || def.label,
      content: (tpl?.content as any) || defaultContent(def),
      status: newMode === "upload" ? "sent" : "draft",
      client_fillable: newMode === "upload" ? false : !!def.clientFillable,
      file_url: fileUrl,
      file_name: fileName,
      created_by: user?.id ?? null,
    } as any);
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success(newMode === "upload" ? "File sent to the client portal" : "Document created");
    setCreateOpen(false);
    setNewTitle("");
    setNewTemplate("none");
    setNewFile(null);
    setNewMode("write");
    fetchDocs();
  };

  const openEdit = (doc: ClientDocument) => {
    setEditing(doc);
    setDraft(doc.content || {});
  };

  const handleSave = async (status?: string) => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from("documents")
      .update({
        content: draft as any,
        version: editing.version + 1,
        ...(status ? { status: status as any } : {}),
      })
      .eq("id", editing.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Document updated");
    setEditing(null);
    fetchDocs();
  };

  const handleStatus = async (doc: ClientDocument, status: string) => {
    const { error } = await supabase.from("documents").update({ status: status as any }).eq("id", doc.id);
    if (error) return toast.error(error.message);
    fetchDocs();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Document deleted");
    fetchDocs();
  };

  const saveAsTemplate = async () => {
    if (!editing) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("document_templates").insert({
      doc_type: editing.doc_type as any,
      name: `${editing.title} template`,
      content: draft as any,
      created_by: user.id,
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Saved as reusable template");
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const path = `clients/${clientId}/documents/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("media").upload(path, file);
    if (upErr) {
      setUploading(false);
      return toast.error(upErr.message);
    }
    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("documents").insert({
      client_id: clientId,
      doc_type: "file_attachment" as any,
      title: file.name,
      content: { description: "" } as any,
      status: "sent",
      file_url: pub.publicUrl,
      file_name: file.name,
      created_by: user?.id ?? null,
    } as any);
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("File uploaded to client portal");
    fetchDocs();
  };

  const editingDef = editing ? getDocType(editing.doc_type) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">Portal Documents</h3>
          <p className="text-sm text-muted-foreground">Everything {clientName} sees when they log in.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setBulkOpen(true)}>
            <FileArchive className="h-4 w-4 mr-1" /> Bulk upload
          </Button>
          <Button variant="outline" asChild disabled={uploading}>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Upload file"}
              <input
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
            </label>
          </Button>
          <Button className="rounded-full bg-primary text-primary-foreground" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New document
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading documents...</p>
      ) : docs.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No documents yet. Create the agreement, welcome pack or invoice to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {docs.map((doc) => {
            const def = getDocType(doc.doc_type);
            const sig = signatures.find((s) => s.document_id === doc.id);
            return (
              <Card key={doc.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{def?.label} · v{doc.version} · updated {format(new Date(doc.updated_at), "d MMM yyyy")}</p>
                  </div>
                  <Badge className={statusColor[doc.status] || ""}>{doc.status.replace("_", " ")}</Badge>
                </div>

                {doc.submitted_at && (
                  <p className="text-xs text-emerald-500">Client submitted {format(new Date(doc.submitted_at), "d MMM yyyy")}</p>
                )}
                {sig && (
                  <p className="text-xs text-emerald-500">Signed by {sig.signer_name} on {format(new Date(sig.signed_at), "d MMM yyyy")}</p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Select value={doc.status} onValueChange={(v) => handleStatus(doc, v)}>
                    <SelectTrigger className="h-8 w-40 bg-secondary border-border text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOC_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {doc.file_url ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.file_url} target="_blank" rel="noreferrer"><Download className="h-3 w-3 mr-1" /> Open</a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => openEdit(doc)}>
                      <PenLine className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this document?</AlertDialogTitle>
                        <AlertDialogDescription>"{doc.title}" will be removed from {clientName}'s portal permanently.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(doc.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display">New document</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setNewMode("write")}
                className={`rounded-lg border p-3 text-left text-sm transition-colors ${newMode === "write" ? "border-primary bg-primary/10" : "border-border hover:bg-accent/40"}`}
              >
                <PenLine className="h-4 w-4 mb-1" />
                Write the contents
              </button>
              <button
                onClick={() => setNewMode("upload")}
                className={`rounded-lg border p-3 text-left text-sm transition-colors ${newMode === "upload" ? "border-primary bg-primary/10" : "border-border hover:bg-accent/40"}`}
              >
                <Upload className="h-4 w-4 mb-1" />
                Upload a file
              </button>
            </div>
            <div className="space-y-2">
              <Label>Document type</Label>
              <Select value={newType} onValueChange={(v) => { setNewType(v); setNewTemplate("none"); }}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.filter((d) => newMode === "upload" || d.type !== "file_attachment").map((d) => (
                    <SelectItem key={d.type} value={d.type}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{getDocType(newType)?.description}</p>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                placeholder={newFile?.name || getDocType(newType)?.label} className="bg-secondary border-border" />
            </div>
            {newMode === "upload" ? (
              <div className="space-y-2">
                <Label>File</Label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-sm hover:border-primary/50">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{newFile ? newFile.name : "Choose a file (max 20MB)"}</span>
                  <input type="file" className="hidden" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            ) : (
              templates.some((t) => t.doc_type === newType) && (
                <div className="space-y-2">
                  <Label>Start from template</Label>
                  <Select value={newTemplate} onValueChange={setNewTemplate}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Blank</SelectItem>
                      {templates.filter((t) => t.doc_type === newType).map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={creating} className="rounded-full bg-primary text-primary-foreground w-full">
              {creating ? "Saving..." : newMode === "upload" ? "Send file to client" : "Create document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editing?.title}</DialogTitle>
          </DialogHeader>
          {editingDef && (
            <DocumentFields fields={editingDef.fields} value={draft} onChange={setDraft} />
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={saveAsTemplate} className="sm:mr-auto">
              <BookmarkPlus className="h-4 w-4 mr-1" /> Save as template
            </Button>
            {editingDef?.signable && (
              <Button variant="outline" onClick={() => handleSave("awaiting_signature")}>Send for signature</Button>
            )}
            <Button onClick={() => handleSave()} disabled={saving} className="rounded-full bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDocuments;
