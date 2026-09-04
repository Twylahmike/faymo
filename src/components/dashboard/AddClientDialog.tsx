import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Copy, Check, Upload, FileText, Loader2, AlertCircle } from "lucide-react";

interface AddClientDialogProps {
  onClientAdded: () => void;
  children?: React.ReactNode;
}

const emptyForm = {
  name: "",
  email: "",
  company: "",
  phone: "",
  notes: "",
  instagram_handle: "",
  website: "",
  status: "lead",
};

const AddClientDialog = ({ onClientAdded, children }: AddClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setLoading(true);
    const slug = form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      + "-" + Math.random().toString(36).slice(2, 6);

    const response = await supabase.functions.invoke("create-client-account", {
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || null,
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
        instagram_handle: form.instagram_handle.trim() || null,
        website: form.website.trim() || null,
        status: form.status,
        portal_slug: slug,
      },
    });

    if (response.error || response.data?.error) {
      setLoading(false);
      toast.error(response.data?.error || "Failed to create client account");
      return;
    }

    const newClientId = response.data?.client?.id as string | undefined;
    if (!newClientId) {
      setLoading(false);
      toast.error("Client account was created without a client record");
      return;
    }

    // Keep this update for deployments where the account function has not yet
    // picked up the optional profile fields.
    const { error: detailsError } = await supabase.from("clients").update({
      instagram_handle: form.instagram_handle.trim() || null,
      website: form.website.trim() || null,
      status: form.status,
      portal_slug: slug,
    }).eq("id", newClientId);

    setLoading(false);
    if (detailsError) {
      toast.error(`Account created, but client details could not be saved: ${detailsError.message}`);
      return;
    }

    setCreatedClientId(newClientId);
    setCredentials(response.data.credentials);
    toast.success(`Client account created for ${form.name}!`);
    onClientAdded();
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (!createdClientId || selectedFiles.length === 0) return;

    setDocumentUploading(true);
    setUploadErrors([]);
    let uploadedCount = 0;
    const failures: string[] = [];
    const { data: { user } } = await supabase.auth.getUser();

    for (const file of selectedFiles) {
      if (file.size > 20 * 1024 * 1024) {
        failures.push(`${file.name} — file is larger than the 20MB limit`);
        toast.error(`${file.name} is too large (max 20MB)`);
        continue;
      }


      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `clients/${createdClientId}/documents/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
      if (uploadError) {
        failures.push(`${file.name} — upload failed: ${uploadError.message}`);
        toast.error(`Could not upload ${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
      const { error: documentError } = await supabase.from("documents").insert({
        client_id: createdClientId,
        doc_type: "file_attachment" as any,
        title: file.name,
        content: { description: "" } as any,
        status: "sent",
        file_url: publicUrl.publicUrl,
        file_name: file.name,
        created_by: user?.id ?? null,
      } as any);

      if (documentError) {
        failures.push(`${file.name} — saved to storage but not added to the portal: ${documentError.message}`);
        toast.error(`File uploaded but could not be added to the portal: ${documentError.message}`);
        continue;
      }

      uploadedCount += 1;
      setUploadedDocuments((current) => [...current, file.name]);
    }

    setDocumentUploading(false);
    setUploadErrors(failures);
    e.target.value = "";
    if (uploadedCount > 0) toast.success(`${uploadedCount} document${uploadedCount === 1 ? "" : "s"} added to the client portal`);
  };

  const copyCredentials = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Credentials copied to clipboard!");
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setCredentials(null);
      setCreatedClientId(null);
      setUploadedDocuments([]);
      setUploadErrors([]);
      setDocumentUploading(false);
      setCopied(false);
      setForm(emptyForm);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {children || (
          <Button className="rounded-full bg-primary text-primary-foreground px-6">
            <UserPlus className="h-4 w-4 mr-1" /> Add Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {credentials ? "Client Account Created" : "Add a Client"}
          </DialogTitle>
        </DialogHeader>

        {credentials ? (
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Share these credentials with your client so they can log in and view their progress.
            </p>
            <div className="rounded-lg bg-secondary p-4 space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">Email</span>
                <p className="text-sm font-mono text-foreground break-all">{credentials.email}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Password</span>
                <p className="text-sm font-mono text-foreground break-all">{credentials.password}</p>
              </div>
            </div>
            <Button onClick={copyCredentials} variant="outline" className="w-full">
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copied!" : "Copy Credentials"}
            </Button>
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div>
                <p className="text-sm font-medium">Add client documents</p>
                <p className="text-xs text-muted-foreground">Upload contracts, invoices, and files for this client’s portal.</p>
              </div>
              <Button variant="outline" asChild disabled={documentUploading} className="w-full">
                <label className="cursor-pointer">
                  {documentUploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                  {documentUploading ? "Uploading..." : "Upload documents"}
                  <input type="file" multiple className="hidden" onChange={handleDocumentUpload} />
                </label>
              </Button>
              {uploadedDocuments.length > 0 && (
                <div className="space-y-1">
                  {uploadedDocuments.map((fileName) => (
                    <p key={fileName} className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-primary" /> {fileName}
                    </p>
                  ))}
                </div>
              )}
              {uploadErrors.length > 0 && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 space-y-1">
                  <p className="flex items-center gap-2 text-xs font-medium text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Some files could not be added
                  </p>
                  {uploadErrors.map((message) => (
                    <p key={message} className="text-xs text-destructive/90 break-words">{message}</p>
                  ))}
                  <p className="text-xs text-muted-foreground">Fix the issue above and upload those files again.</p>
                </div>
              )}
            </div>
            <Button onClick={() => handleClose(false)} className="w-full rounded-full bg-primary text-primary-foreground">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name *</Label>
              <Input id="client-name" placeholder="Client name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required maxLength={100} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email *</Label>
              <Input id="client-email" type="email" placeholder="client@company.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required maxLength={255} className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="client-company">Company</Label>
                <Input id="client-company" placeholder="Company name" value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  maxLength={100} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-phone">Phone</Label>
                <Input id="client-phone" placeholder="+1 234 567" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  maxLength={20} className="bg-secondary border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="client-instagram">Instagram</Label>
                <Input id="client-instagram" placeholder="@handle" value={form.instagram_handle}
                  onChange={(e) => setForm({ ...form, instagram_handle: e.target.value })}
                  maxLength={100} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-website">Website</Label>
                <Input id="client-website" type="url" placeholder="https://..." value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  maxLength={255} className="bg-secondary border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(status) => setForm({ ...form, status })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-notes">Notes</Label>
              <Textarea id="client-notes" placeholder="Any notes..." value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                maxLength={1000} className="bg-secondary border-border resize-none" rows={3} />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground mt-1">
              {loading ? "Creating Account..." : "Create Client Account"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;
