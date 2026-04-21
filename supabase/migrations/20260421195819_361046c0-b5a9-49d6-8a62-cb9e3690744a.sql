-- Work items table for member deliverables
CREATE TABLE public.work_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress',
  deliverable_url TEXT,
  deliverable_name TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.work_items ENABLE ROW LEVEL SECURITY;

-- Members read own; admins read all
CREATE POLICY "Members view their own work items"
ON public.work_items FOR SELECT
TO authenticated
USING (auth.uid() = member_id);

CREATE POLICY "Admins view all work items"
ON public.work_items FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members insert their own work items"
ON public.work_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Members update their own work items"
ON public.work_items FOR UPDATE
TO authenticated
USING (auth.uid() = member_id);

CREATE POLICY "Admins update any work item"
ON public.work_items FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members delete their own work items"
ON public.work_items FOR DELETE
TO authenticated
USING (auth.uid() = member_id);

CREATE POLICY "Admins delete any work item"
ON public.work_items FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_work_items_updated_at
BEFORE UPDATE ON public.work_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_work_items_member ON public.work_items(member_id);
CREATE INDEX idx_work_items_status ON public.work_items(status);

-- Audit log (admin-visible only)
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL,
  actor_name TEXT,
  target_id UUID,
  target_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit log"
ON public.audit_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users insert audit log"
ON public.audit_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = actor_id);

CREATE INDEX idx_audit_log_actor ON public.audit_log(actor_id);
CREATE INDEX idx_audit_log_target ON public.audit_log(target_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);

-- Member invites tracking
CREATE TABLE public.member_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'worker',
  status TEXT NOT NULL DEFAULT 'pending',
  invited_by UUID NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ
);

ALTER TABLE public.member_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage invites"
ON public.member_invites FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_member_invites_email ON public.member_invites(email);
CREATE INDEX idx_member_invites_status ON public.member_invites(status);

-- Member onboarding tracking
CREATE TABLE public.member_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  profile_completed BOOLEAN NOT NULL DEFAULT false,
  first_upload_completed BOOLEAN NOT NULL DEFAULT false,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.member_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own onboarding"
ON public.member_onboarding FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_member_onboarding_updated_at
BEFORE UPDATE ON public.member_onboarding
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for work deliverables
INSERT INTO storage.buckets (id, name, public)
VALUES ('work-deliverables', 'work-deliverables', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Members upload own deliverables"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'work-deliverables'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Members read own deliverables"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'work-deliverables'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Members delete own deliverables"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'work-deliverables'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin')
  )
);