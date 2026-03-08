-- Add recurring_interval to invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS recurring_interval text DEFAULT 'none';

-- Add RLS policy for clients to insert project comments (for messaging)
CREATE POLICY "Clients can insert comments on their projects"
ON public.project_comments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM projects p JOIN clients c ON c.id = p.client_id
    WHERE p.id = project_comments.project_id AND c.user_id = auth.uid()
  )
);