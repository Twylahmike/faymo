-- Let the public pricing page read active services (the product/pricing
-- "vault") without requiring login, and add a table for custom quote
-- requests submitted from that page — visible to admins only.

-- ── Public read access to active services ──────────────────────────────
CREATE POLICY "Public can view active services" ON public.services
  FOR SELECT TO anon
  USING (status = 'active');

-- ── Custom requests (public form -> admin-only inbox) ───────────────────
CREATE TABLE public.custom_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  budget TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new', -- new, contacted, closed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous website visitors) can submit a request, but
-- only submit — no read/update/delete access.
CREATE POLICY "Anyone can submit a custom request" ON public.custom_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can see or manage submitted requests.
CREATE POLICY "Admins manage custom requests" ON public.custom_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_custom_requests_updated_at BEFORE UPDATE ON public.custom_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_custom_requests_created ON public.custom_requests(created_at DESC);
CREATE INDEX idx_custom_requests_status ON public.custom_requests(status);
