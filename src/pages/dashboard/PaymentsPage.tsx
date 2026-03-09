import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Plus, Clock, AlertCircle, CheckCircle2, Search, Pencil, Trash2, Download, FileDown } from "lucide-react";
import { toast } from "sonner";
import { generateInvoicePdf } from "@/lib/generateInvoicePdf";

const CURRENCIES = ["KES", "USD", "EUR", "GBP", "UGX", "TZS", "NGN"];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-500/10 text-blue-400",
  pending: "bg-yellow-500/10 text-yellow-400",
  paid: "bg-green-500/10 text-green-400",
  overdue: "bg-red-500/10 text-red-400",
  cancelled: "bg-muted text-muted-foreground",
};

const PaymentsPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ client_id: "", amount: "", due_date: "", notes: "", payment_method: "", currency: "KES", recurring_interval: "none" });
  const [editForm, setEditForm] = useState({ client_id: "", amount: "", due_date: "", notes: "", payment_method: "", status: "", currency: "KES", recurring_interval: "none" });
  const [profileName, setProfileName] = useState("");

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [invRes, clientRes, profileRes] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name, email"),
      supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
    ]);
    setInvoices(invRes.data || []);
    setClients(clientRes.data || []);
    setProfileName(profileRes.data?.display_name || "Your Agency");
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAdd = async () => {
    if (!user || !form.client_id || !form.amount) return;
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from("invoices").insert({
      invoice_number: invoiceNumber, client_id: form.client_id, amount: parseFloat(form.amount),
      due_date: form.due_date || null, notes: form.notes || null, payment_method: form.payment_method || null,
      currency: form.currency, recurring_interval: form.recurring_interval,
      status: "pending", created_by: user.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Invoice created");
    setForm({ client_id: "", amount: "", due_date: "", notes: "", payment_method: "", currency: "KES", recurring_interval: "none" });
    setIsOpen(false);
    fetchAll();
  };

  const handleEdit = async () => {
    if (!editingInvoice || !editForm.client_id || !editForm.amount) return;
    const update: any = {
      client_id: editForm.client_id, amount: parseFloat(editForm.amount),
      due_date: editForm.due_date || null, notes: editForm.notes || null,
      payment_method: editForm.payment_method || null, status: editForm.status,
      currency: editForm.currency, recurring_interval: editForm.recurring_interval,
    };
    if (editForm.status === "paid" && editingInvoice.status !== "paid") update.paid_at = new Date().toISOString();
    const { error } = await supabase.from("invoices").update(update).eq("id", editingInvoice.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Invoice updated");
    setIsEditOpen(false);
    setEditingInvoice(null);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Invoice deleted");
    fetchAll();
  };

  const openEditDialog = (inv: any) => {
    setEditingInvoice(inv);
    setEditForm({
      client_id: inv.client_id, amount: String(inv.amount), due_date: inv.due_date || "",
      notes: inv.notes || "", payment_method: inv.payment_method || "", status: inv.status || "draft",
      currency: inv.currency || "KES", recurring_interval: (inv as any).recurring_interval || "none",
    });
    setIsEditOpen(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const update: any = { status };
    if (status === "paid") update.paid_at = new Date().toISOString();
    const { error } = await supabase.from("invoices").update(update).eq("id", id);
    if (error) { toast.error(error.message); return; }
    fetchAll();
  };

  const handleDownloadPdf = (inv: any) => {
    const client = clients.find(c => c.id === inv.client_id);
    generateInvoicePdf({
      invoiceNumber: inv.invoice_number,
      clientName: client?.name || "Client",
      clientEmail: client?.email,
      amount: Number(inv.amount),
      currency: inv.currency || "KES",
      dueDate: inv.due_date,
      status: inv.status,
      paymentMethod: inv.payment_method,
      notes: inv.notes,
      createdAt: inv.created_at,
      agencyName: profileName,
    });
  };

  // Bulk actions
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(i => i.id)));
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    const { error } = await supabase.from("invoices").delete().in("id", ids);
    if (error) { toast.error(error.message); return; }
    toast.success(`${ids.length} invoices deleted`);
    setSelected(new Set());
    fetchAll();
  };

  const handleBulkStatus = async (status: string) => {
    const ids = Array.from(selected);
    const update: any = { status };
    if (status === "paid") update.paid_at = new Date().toISOString();
    const { error } = await supabase.from("invoices").update(update).in("id", ids);
    if (error) { toast.error(error.message); return; }
    toast.success(`${ids.length} invoices updated to ${status}`);
    setSelected(new Set());
    fetchAll();
  };

  const handleBulkExport = () => {
    const ids = Array.from(selected);
    const rows = invoices.filter(i => ids.includes(i.id));
    const csv = ["Invoice #,Client,Amount,Currency,Status,Due Date,Created"]
      .concat(rows.map(i => {
        const cn = clients.find(c => c.id === i.client_id)?.name || "";
        return `${i.invoice_number},"${cn}",${i.amount},${i.currency || "KES"},${i.status},${i.due_date || ""},${i.created_at}`;
      })).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "invoices-export.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported!");
  };

  const totalReceived = invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = invoices.filter(i => i.status === "pending" || i.status === "sent").reduce((s, i) => s + Number(i.amount), 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + Number(i.amount), 0);

  const filtered = invoices.filter(i => {
    const clientName = clients.find(c => c.id === i.client_id)?.name || "";
    return clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const CurrencySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  const RecurringSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="none">One-time</SelectItem>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="monthly">Monthly</SelectItem>
        <SelectItem value="quarterly">Quarterly</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track invoices and payments</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-green-500 hover:bg-green-600 text-white">
              <Plus className="h-4 w-4 mr-1" /> Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Client *</Label>
                <Select value={form.client_id} onValueChange={v => setForm(p => ({ ...p, client_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Currency</Label><CurrencySelect value={form.currency} onChange={v => setForm(p => ({ ...p, currency: v }))} /></div>
                <div><Label>Amount *</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
                <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Method</Label>
                  <Select value={form.payment_method} onValueChange={v => setForm(p => ({ ...p, payment_method: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Recurring</Label><RecurringSelect value={form.recurring_interval} onChange={v => setForm(p => ({ ...p, recurring_interval: v }))} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
              <Button className="w-full" onClick={handleAdd}>Create Invoice</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Invoice {editingInvoice?.invoice_number}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client *</Label>
              <Select value={editForm.client_id} onValueChange={v => setEditForm(p => ({ ...p, client_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Currency</Label><CurrencySelect value={editForm.currency} onChange={v => setEditForm(p => ({ ...p, currency: v }))} /></div>
              <div><Label>Amount *</Label><Input type="number" value={editForm.amount} onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div><Label>Due Date</Label><Input type="date" value={editForm.due_date} onChange={e => setEditForm(p => ({ ...p, due_date: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Payment Method</Label>
                <Select value={editForm.payment_method} onValueChange={v => setEditForm(p => ({ ...p, payment_method: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={v => setEditForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Recurring</Label><RecurringSelect value={editForm.recurring_interval} onChange={v => setEditForm(p => ({ ...p, recurring_interval: v }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} /></div>
            <Button className="w-full" onClick={handleEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      {isAdmin && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-400/10"><CheckCircle2 className="h-4 w-4 text-green-400" /></div>
            </div>
            <p className="font-display text-xl font-bold text-green-400">KES {totalReceived.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Received</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400/10"><Clock className="h-4 w-4 text-yellow-400" /></div>
            </div>
            <p className="font-display text-xl font-bold text-yellow-400">KES {totalPending.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-400/10"><AlertCircle className="h-4 w-4 text-red-400" /></div>
            </div>
            <p className="font-display text-xl font-bold text-red-400">KES {totalOverdue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </div>
        </div>
      )}

      {/* Search + Bulk Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." className="pl-9 bg-secondary/50 border-border/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
            <Select onValueChange={handleBulkStatus}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Set status..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Mark Paid</SelectItem>
                <SelectItem value="pending">Mark Pending</SelectItem>
                <SelectItem value="cancelled">Cancel</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleBulkExport}><FileDown className="h-3.5 w-3.5 mr-1" /> Export</Button>
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30"><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selected.size} invoices?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleBulkDelete}>Delete All</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>

      {/* Invoices Table */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-400/10">
            <CreditCard className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">No invoices yet</h2>
          <p className="text-muted-foreground">Create your first invoice.</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => (
                <TableRow key={inv.id} data-state={selected.has(inv.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox checked={selected.has(inv.id)} onCheckedChange={() => toggleSelect(inv.id)} />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                  <TableCell>{clients.find(c => c.id === inv.client_id)?.name || "—"}</TableCell>
                  <TableCell className="font-display font-bold">{inv.currency || "KES"} {Number(inv.amount).toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-sm capitalize">{inv.payment_method?.replace("_", " ") || "—"}</TableCell>
                  <TableCell className="text-sm capitalize">{(inv as any).recurring_interval === "none" || !(inv as any).recurring_interval ? "—" : (inv as any).recurring_interval}</TableCell>
                  <TableCell>
                    <span className={`text-xs rounded-full px-2.5 py-1 ${statusColors[inv.status]}`}>{inv.status}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Download PDF" onClick={() => handleDownloadPdf(inv)}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Select value={inv.status} onValueChange={(v) => handleStatusChange(inv.id, v)}>
                        <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(inv)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Invoice {inv.invoice_number}?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete this invoice. This cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(inv.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
