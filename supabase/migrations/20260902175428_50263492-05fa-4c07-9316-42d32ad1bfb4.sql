-- Extend clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS instagram_handle text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'lead',
  ADD COLUMN IF NOT EXISTS portal_slug text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS brand_color text;

CREATE UNIQUE INDEX IF NOT EXISTS clients_portal_slug_key ON public.clients (portal_slug) WHERE portal_slug IS NOT NULL;

-- Enums
DO $$ BEGIN
  CREATE TYPE public.doc_type AS ENUM (
    'inquiry_form','agreement','invoice','welcome_document','welcome_email','questionnaire',
    'client_portal_summary','proposal','strategy_kpi','content_calendar','content_creation_notes',
    'monthly_analytics','feedback_form','file_attachment'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.doc_status AS ENUM ('draft','sent','awaiting_signature','signed','paid','completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helper: is the current user the owner of this client record?
CREATE OR REPLACE FUNCTION public.is_client_owner(_client_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.clients c WHERE c.id = _client_id AND c.user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.is_agency_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','worker'))
$$;

-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  doc_type public.doc_type NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.doc_status NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  file_url text,
  file_name text,
  client_fillable boolean NOT NULL DEFAULT false,
  submitted_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage documents" ON public.documents FOR ALL TO authenticated
  USING (public.is_agency_staff()) WITH CHECK (public.is_agency_staff());
CREATE POLICY "Clients view own documents" ON public.documents FOR SELECT TO authenticated
  USING (public.is_client_owner(client_id));
CREATE POLICY "Clients submit fillable documents" ON public.documents FOR UPDATE TO authenticated
  USING (public.is_client_owner(client_id) AND client_fillable = true AND doc_type IN ('inquiry_form','questionnaire','feedback_form'))
  WITH CHECK (public.is_client_owner(client_id) AND client_fillable = true);

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS documents_client_id_idx ON public.documents (client_id);

-- Signatures
CREATE TABLE IF NOT EXISTS public.document_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  signer_name text NOT NULL,
  signer_email text,
  typed_signature text,
  signature_image_url text,
  ip_address text,
  signed_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.document_signatures TO authenticated;
GRANT ALL ON public.document_signatures TO service_role;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view signatures" ON public.document_signatures FOR SELECT TO authenticated
  USING (public.is_agency_staff());
CREATE POLICY "Clients view own signatures" ON public.document_signatures FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_id AND public.is_client_owner(d.client_id)));
CREATE POLICY "Clients sign own documents" ON public.document_signatures FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_id AND public.is_client_owner(d.client_id)));
CREATE POLICY "Staff sign documents" ON public.document_signatures FOR INSERT TO authenticated
  WITH CHECK (public.is_agency_staff());

-- Templates
CREATE TABLE IF NOT EXISTS public.document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type public.doc_type NOT NULL,
  name text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_templates TO authenticated;
GRANT ALL ON public.document_templates TO service_role;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage templates" ON public.document_templates FOR ALL TO authenticated
  USING (public.is_agency_staff()) WITH CHECK (public.is_agency_staff());

CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON public.document_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Extend invoices
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS issued_date date,
  ADD COLUMN IF NOT EXISTS subtotal numeric,
  ADD COLUMN IF NOT EXISTS advance_payment_due numeric,
  ADD COLUMN IF NOT EXISTS remaining_balance numeric,
  ADD COLUMN IF NOT EXISTS bank_details jsonb,
  ADD COLUMN IF NOT EXISTS terms_text text;