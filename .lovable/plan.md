

## What Can Still Be Added, Implemented, and Perfected

After a thorough review of the entire codebase, here are the remaining gaps and improvements:

---

### 1. Recurring Invoices
No mechanism exists to auto-generate invoices on a schedule. The payments system is one-off only.

**Work:** Add a `recurring_interval` column (monthly/weekly/quarterly/none) to invoices. Create a backend function triggered on a cron schedule that duplicates invoices whose interval has elapsed, resetting status to "pending" with updated due dates.

---

### 2. Email Notifications
No email alerts are sent for any events — task assignments, invoice creation, content approvals, or new client onboarding.

**Work:** Create a backend function using the Lovable AI-supported approach or a mail service (Resend) that sends emails on key events. Wire it to be called after invoice creation, task assignment, and content approval actions.

---

### 3. Worker/Team Member Dashboard Restrictions
Workers currently see the exact same dashboard as admins. There's no role-based visibility — workers can see revenue, delete clients, manage team, etc.

**Work:** Hide admin-only sections (Team, Settings, revenue stats, client deletion) from workers. Add permission checks before destructive operations.

---

### 4. Task Edit and Delete
Tasks on the Kanban board can only be dragged between columns. There's no way to edit a task's title, description, priority, assignee, or due date after creation, and no way to delete tasks.

**Work:** Add an edit dialog and delete button to Kanban task cards or via a task detail modal.

---

### 5. Bulk Actions
No bulk operations exist anywhere — can't bulk delete clients, mark multiple invoices as paid, or reassign tasks in batch.

**Work:** Add checkbox selection to tables (Clients, Invoices, Tasks) with bulk action buttons (delete, update status, export selected).

---

### 6. Client Portal — Missing Chat/Messaging
Clients can view content and invoices but have no way to communicate with the agency through the portal. The project chat exists but is only accessible from the admin dashboard.

**Work:** Add a messaging tab to the Client Portal that shows project comments for the client's projects, allowing two-way communication.

---

### 7. Dashboard — Recent Activity Feed
The dashboard home shows stats and charts but no recent activity feed showing what happened across the agency (new clients added, invoices paid, tasks completed, content approved).

**Work:** Query the `activity_log` table and display a timeline/feed widget on `DashboardHome` showing the latest 10-15 actions across all clients.

---

### 8. Multi-Currency Support
Currency is hardcoded to "KES" in most places. The `invoices` and `services` tables have a `currency` column but the UI doesn't let users pick or display different currencies.

**Work:** Add a currency selector to invoice and service creation forms. Display the correct currency symbol in tables and reports.

---

### 9. PDF Invoice Generation
CSV export works for reports, but there's no way to generate a professional PDF invoice to send to clients.

**Work:** Build a PDF generation utility (using browser print/canvas or a library) that renders a branded invoice template and triggers download.

---

### 10. Onboarding Wizard for New Agencies
After signup, users land on an empty dashboard with no guidance. There's no setup wizard or onboarding flow.

**Work:** Create a first-time setup flow that guides new agencies to: set up their profile/branding, add their first service, add their first client, and create their first project.

---

### Recommended Priority Order
1. **Worker role restrictions** — security and UX correctness
2. **Task edit/delete on Kanban** — basic CRUD gap
3. **Recent activity feed on dashboard** — immediate value
4. **Client portal messaging** — client communication
5. **Recurring invoices** — business automation
6. **PDF invoice generation** — client-facing professionalism
7. **Multi-currency support** — internationalization
8. **Email notifications** — requires external service
9. **Bulk actions** — power-user feature
10. **Onboarding wizard** — polish

