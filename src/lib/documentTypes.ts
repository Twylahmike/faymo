// Registry describing every client-portal document type Orion supports.
// Each type declares a structured field schema so `content` stays JSONB
// (reportable/filterable later) while the editing UI still feels document-like.

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "date"
  | "number"
  | "select"
  | "rating"
  | "bullets"
  | "repeater"
  | "table";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  /** for repeater/table */
  columns?: FieldDef[];
  /** default value for new documents */
  default?: unknown;
}

export interface DocTypeDef {
  type: string;
  label: string;
  description: string;
  /** Client can fill and submit this document */
  clientFillable?: boolean;
  /** Client can e-sign this document */
  signable?: boolean;
  fields: FieldDef[];
}

export const DOC_TYPES: DocTypeDef[] = [
  {
    type: "inquiry_form",
    label: "Inquiry Form",
    description: "Pre-onboarding enquiry, filled in by the client.",
    clientFillable: true,
    fields: [
      { key: "business_name", label: "Business / brand name", type: "text" },
      {
        key: "business_description",
        label: "What do you do and what makes it special?",
        type: "textarea",
      },
      { key: "instagram_handle", label: "Instagram handle (optional)", type: "text" },
      { key: "website", label: "Website (optional)", type: "url" },
    ],
  },
  {
    type: "agreement",
    label: "Agreement",
    description: "Service agreement the client can e-sign.",
    signable: true,
    fields: [
      { key: "marketer_name", label: "Marketer name", type: "text" },
      { key: "marketer_business", label: "Marketer business", type: "text" },
      { key: "marketer_email", label: "Marketer email", type: "text" },
      { key: "client_name", label: "Client name", type: "text" },
      { key: "client_business", label: "Client business", type: "text" },
      { key: "client_email", label: "Client email", type: "text" },
      { key: "overview", label: "Agreement overview", type: "textarea" },
      { key: "scope_of_work", label: "Scope of work", type: "bullets" },
      { key: "deliverables", label: "Deliverables", type: "bullets" },
      { key: "package_tier", label: "Package tier", type: "text" },
      { key: "effective_date", label: "Effective date", type: "date" },
    ],
  },
  {
    type: "welcome_email",
    label: "Welcome Email",
    description: "Numbered onboarding steps sent to the client.",
    fields: [
      { key: "intro", label: "Intro paragraph", type: "textarea" },
      {
        key: "steps",
        label: "Onboarding steps",
        type: "repeater",
        columns: [
          { key: "title", label: "Step title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "link", label: "Link (optional)", type: "url" },
        ],
      },
      { key: "closing", label: "Closing / presence paragraph", type: "textarea" },
    ],
  },
  {
    type: "questionnaire",
    label: "Welcome Questionnaire",
    description: "Deep-dive brand questionnaire, filled in by the client.",
    clientFillable: true,
    fields: [
      { key: "offer", label: "Describe your offer in detail", type: "textarea" },
      { key: "target_audience", label: "Who is your target audience?", type: "textarea" },
      { key: "delivery", label: "How do you deliver your product / service?", type: "textarea" },
      { key: "has_testimonial", label: "Do you have a client result / testimonial?", type: "select", options: ["Yes", "No"] },
      { key: "testimonial", label: "Testimonial / result details", type: "textarea" },
      { key: "limiting_beliefs", label: "Your audience's limiting beliefs", type: "textarea" },
      { key: "blockers", label: "What's stopping them from reaching their goal?", type: "textarea" },
      { key: "pain_points", label: "Pain points of your target audience", type: "textarea" },
      { key: "desired_outcomes", label: "Desired outcomes of your target audience", type: "textarea" },
      { key: "competitor_1", label: "Competitor link 1", type: "url" },
      { key: "competitor_2", label: "Competitor link 2", type: "url" },
      { key: "competitor_3", label: "Competitor link 3", type: "url" },
      { key: "sales_funnel", label: "How does your sales funnel work?", type: "textarea" },
      { key: "background_story", label: "Background story — what inspired you to start?", type: "textarea" },
    ],
  },
  {
    type: "client_portal_summary",
    label: "Welcome Document",
    description: "Portal home screen shown to the client on login.",
    fields: [
      { key: "greeting", label: "Greeting", type: "text", placeholder: "Welcome, {business name}" },
      { key: "intro", label: "Intro paragraph", type: "textarea" },
      {
        key: "sections",
        label: "What you'll find in your portal",
        type: "repeater",
        columns: [
          { key: "title", label: "Section", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
        default: [
          { title: "Project Scope", description: "" },
          { title: "Timeline & Milestones", description: "" },
          { title: "Task List", description: "" },
          { title: "Billing & Documents", description: "" },
          { title: "Communication & Meetings", description: "" },
          { title: "Workspace Progress", description: "" },
        ],
      },
    ],
  },
  {
    type: "welcome_document",
    label: "Welcome Pack",
    description: "Additional welcome material for the client.",
    fields: [
      { key: "title", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "highlights", label: "Highlights", type: "bullets" },
    ],
  },
  {
    type: "proposal",
    label: "Proposal",
    description: "Formal project proposal.",
    fields: [
      { key: "prepared_by", label: "Prepared by", type: "text" },
      { key: "prepared_for", label: "Prepared for", type: "text" },
      { key: "project_title", label: "Project title", type: "text" },
      { key: "subtitle", label: "Subtitle / category", type: "text" },
      { key: "tagline", label: "Tagline / description", type: "textarea" },
      { key: "year", label: "Year / date", type: "text" },
    ],
  },
  {
    type: "strategy_kpi",
    label: "Strategy & KPIs",
    description: "Goals and the metrics you'll report on.",
    fields: [
      { key: "goals", label: "Goals", type: "textarea" },
      {
        key: "kpis",
        label: "Key performance indicators",
        type: "repeater",
        columns: [
          { key: "metric", label: "Metric", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
        default: [
          { metric: "Follower Growth", description: "" },
          { metric: "Reach & Impressions", description: "" },
          { metric: "Engagement Rates", description: "" },
          { metric: "Lead Generation & Sales", description: "" },
        ],
      },
    ],
  },
  {
    type: "content_calendar",
    label: "Content Calendar",
    description: "Planned content, viewable as a table or calendar grid.",
    fields: [
      {
        key: "posts",
        label: "Planned posts",
        type: "table",
        columns: [
          { key: "date", label: "Date", type: "date" },
          { key: "title", label: "Post title", type: "text" },
          { key: "format", label: "Format", type: "select", options: ["Video", "Carousel", "Story", "Reel", "Static", "Live"] },
          { key: "pillar", label: "Content pillar", type: "text" },
          { key: "assigned_to", label: "Assigned to", type: "text" },
          { key: "status", label: "Status", type: "select", options: ["Needs review", "In progress", "Created", "Scheduled", "Posted"] },
          { key: "approved", label: "Approved", type: "select", options: ["Yes", "No"] },
          { key: "due_date", label: "Due date", type: "date" },
        ],
      },
    ],
  },
  {
    type: "content_creation_notes",
    label: "Content Creation Notes",
    description: "Scripting, filming and editing status notes.",
    fields: [
      { key: "notes", label: "Notes", type: "textarea" },
      {
        key: "pieces",
        label: "Per-piece status",
        type: "repeater",
        columns: [
          { key: "piece", label: "Content piece", type: "text" },
          { key: "stage", label: "Stage", type: "select", options: ["Scripting", "Filming", "Editing", "Ready", "Published"] },
          { key: "note", label: "Note", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "monthly_analytics",
    label: "Monthly Analytics",
    description: "Reporting period performance snapshot.",
    fields: [
      { key: "period_start", label: "Period start", type: "date" },
      { key: "period_end", label: "Period end", type: "date" },
      {
        key: "age_breakdown",
        label: "Age breakdown",
        type: "repeater",
        columns: [
          { key: "bracket", label: "Age bracket", type: "text" },
          { key: "percentage", label: "Percentage", type: "number" },
        ],
        default: [
          { bracket: "18-24", percentage: 0 },
          { bracket: "25-34", percentage: 0 },
          { bracket: "35-44", percentage: 0 },
          { bracket: "45+", percentage: 0 },
        ],
      },
      { key: "gender_male", label: "Male %", type: "number" },
      { key: "gender_female", label: "Female %", type: "number" },
      { key: "active_times", label: "Most active times", type: "textarea" },
      { key: "summary", label: "Summary", type: "textarea" },
    ],
  },
  {
    type: "feedback_form",
    label: "Feedback Form",
    description: "Client satisfaction feedback (client-fillable, locked after submit).",
    clientFillable: true,
    fields: [
      { key: "why_us", label: "What made you choose to work with us over others?", type: "textarea" },
      { key: "most_valuable", label: "What aspects of our work did you find most valuable?", type: "textarea" },
      { key: "improvements", label: "In what areas could we improve or add services?", type: "textarea" },
      { key: "rating", label: "Overall satisfaction", type: "rating" },
    ],
  },
  {
    type: "invoice",
    label: "Invoice",
    description: "Structured invoice with line items and payment tracking.",
    fields: [
      { key: "invoice_no", label: "Invoice number", type: "text" },
      { key: "billed_by", label: "Billed by", type: "textarea" },
      { key: "billed_to", label: "Billed to", type: "textarea" },
      { key: "issued_date", label: "Issued date", type: "date" },
      { key: "due_date", label: "Due date", type: "date" },
      {
        key: "line_items",
        label: "Line items",
        type: "table",
        columns: [
          { key: "description", label: "Description", type: "text" },
          { key: "qty", label: "Qty", type: "number" },
          { key: "price", label: "Price", type: "number" },
          { key: "amount", label: "Amount", type: "number" },
        ],
      },
      { key: "subtotal", label: "Subtotal", type: "number" },
      { key: "advance_payment_due", label: "Advance payment due", type: "number" },
      { key: "remaining_balance", label: "Remaining balance", type: "number" },
      { key: "total", label: "Total", type: "number" },
      { key: "bank_details", label: "Bank account details", type: "textarea" },
      { key: "terms_text", label: "Terms and conditions", type: "textarea" },
      { key: "footer", label: "Thank-you footer", type: "text" },
    ],
  },
  {
    type: "file_attachment",
    label: "Uploaded File",
    description: "Contracts, signed PDFs or any other file for this client.",
    fields: [
      { key: "description", label: "Description", type: "textarea" },
    ],
  },
];

export const DOC_STATUSES = [
  "draft",
  "sent",
  "awaiting_signature",
  "signed",
  "paid",
  "completed",
] as const;

export const getDocType = (type: string): DocTypeDef | undefined =>
  DOC_TYPES.find((d) => d.type === type);

export const defaultContent = (def: DocTypeDef): Record<string, unknown> => {
  const content: Record<string, unknown> = {};
  def.fields.forEach((f) => {
    if (f.default !== undefined) content[f.key] = f.default;
    else if (f.type === "bullets" || f.type === "repeater" || f.type === "table") content[f.key] = [];
    else if (f.type === "rating" || f.type === "number") content[f.key] = 0;
    else content[f.key] = "";
  });
  return content;
};
