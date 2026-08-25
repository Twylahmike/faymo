-- Let a "Contact Sales" request specify a preferred date/time for a call.
ALTER TABLE public.custom_requests
  ADD COLUMN IF NOT EXISTS preferred_date DATE,
  ADD COLUMN IF NOT EXISTS preferred_time TIME;
