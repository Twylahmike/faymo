
-- Project comments table for team collaboration
CREATE TABLE public.project_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

-- Workers and admins can manage comments
CREATE POLICY "Workers and admins can manage project comments"
  ON public.project_comments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'worker'::app_role));

-- Clients can view comments on their projects
CREATE POLICY "Clients can view comments on their projects"
  ON public.project_comments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects p JOIN clients c ON c.id = p.client_id
    WHERE p.id = project_comments.project_id AND c.user_id = auth.uid()
  ));

-- Enable realtime for project_comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_comments;
