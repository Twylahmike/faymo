-- Scope worker access: a worker can only see/manage the clients and
-- projects they personally created. Admins keep full access to everything.
-- Workers can never delete clients or projects (admin-only). Once an
-- invoice has been generated against a project, only an admin can edit
-- that project going forward.

-- ── Clients ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Workers and admins can manage clients" ON public.clients;

CREATE POLICY "Admins manage all clients" ON public.clients
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Workers view their own clients" ON public.clients
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'worker') AND agency_user_id = auth.uid());

CREATE POLICY "Workers insert their own clients" ON public.clients
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'worker') AND agency_user_id = auth.uid());

CREATE POLICY "Workers update their own clients" ON public.clients
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'worker') AND agency_user_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'worker') AND agency_user_id = auth.uid());

-- No worker DELETE policy: only the "Admins manage all clients" policy
-- above grants DELETE, so workers can never delete a client.

-- ── Projects ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Workers and admins can manage projects" ON public.projects;

CREATE POLICY "Admins manage all projects" ON public.projects
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Workers view their own projects" ON public.projects
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'worker') AND created_by = auth.uid());

CREATE POLICY "Workers insert their own projects" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'worker') AND created_by = auth.uid());

-- Workers can edit a project they created, but only until an invoice has
-- been generated against it — after that, only an admin can edit it.
CREATE POLICY "Workers update their own projects before invoicing" ON public.projects
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'worker')
    AND created_by = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM public.invoices WHERE invoices.project_id = projects.id)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'worker')
    AND created_by = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM public.invoices WHERE invoices.project_id = projects.id)
  );

-- No worker DELETE policy: only the "Admins manage all projects" policy
-- above grants DELETE, so workers can never delete a project.
