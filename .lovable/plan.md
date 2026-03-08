

## What Can Be Added or Perfected

After reviewing the entire codebase, here are the gaps and improvement opportunities organized by priority:

---

### 1. Incomplete Client Detail Tabs
The client detail page has 4 placeholder tabs showing "coming soon":
- **Services tab** — should list services linked to the client
- **Payments tab** — should show invoices filtered to that client
- **Tasks tab** — should show tasks from projects belonging to that client
- **Files tab** — should use the FileUpload component for client-specific file management

**Work:** Wire each tab to query existing tables (invoices, tasks, projects, services) filtered by `client_id`, and integrate the FileUpload component for the files tab.

---

### 2. Dashboard Charts Use Mock Data
`DashboardHome.tsx` has hardcoded revenue/expense data and static project status pie chart values instead of pulling from actual invoice and project records.

**Work:** Replace mock arrays with real aggregations from the `invoices` and `projects` tables, grouped by month.

---

### 3. Reports Page Uses Mock Revenue Trend
`ReportsPage.tsx` has a hardcoded bar chart. The Export button does nothing.

**Work:** Aggregate real invoice data by month for the chart. Implement CSV/PDF export using browser APIs or a library.

---

### 4. Settings Page Is Minimal
Only has display name and bio. Missing: avatar upload, password change, notification preferences, agency branding settings.

**Work:** Add avatar upload via storage bucket, password change via `supabase.auth.updateUser`, and a notification preferences section.

---

### 5. Client Portal Needs Polish
- No way for clients to view their invoices/payments
- No file viewing capability
- No real-time notifications for clients
- Missing dark/light mode toggle

**Work:** Add invoice list, file viewer, notification bell, and theme toggle to the client portal.

---

### 6. Missing Delete/Edit Actions
Most entities (clients, creators, projects, tasks, invoices, services) lack edit and delete functionality. Users can only create.

**Work:** Add edit dialogs and delete confirmations with proper cascading behavior.

---

### 7. No Recurring Invoices
The payments spec mentions recurring payment management, but there's no mechanism to auto-generate invoices on a schedule.

**Work:** Add a `recurring_interval` field to invoices and a scheduled edge function or trigger to generate new invoices.

---

### 8. Search in Top Bar Is Non-Functional
The search input in `DashboardTopBar.tsx` is decorative — it doesn't search anything.

**Work:** Implement global search across clients, projects, invoices, and tasks with a command palette (cmdk is already installed).

---

### 9. No Email Notifications
Task assignments, invoice creation, and content approvals don't send email alerts.

**Work:** Create an edge function using a mail service (e.g., Resend) triggered on key events.

---

### Recommended Priority Order
1. **Fill client detail tabs** — highest visibility, already stubbed out
2. **Replace mock chart data** — dashboard credibility
3. **Add edit/delete actions** — basic CRUD completeness
4. **Global search with command palette** — cmdk is installed, quick win
5. **Settings enhancements** — avatar upload, password change
6. **Client portal invoices + files** — client-facing value
7. **Export functionality** — reports usefulness
8. **Recurring invoices** — advanced feature
9. **Email notifications** — requires external service setup

