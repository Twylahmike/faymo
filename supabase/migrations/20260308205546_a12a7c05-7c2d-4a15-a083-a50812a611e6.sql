
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'worker', 'client');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 5. RLS for user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins and workers can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'worker'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. Clients table (agency's clients)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- the client's auth user
  agency_user_id UUID NOT NULL, -- the worker/admin who created this client
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  phone TEXT,
  notes TEXT,
  auto_generated_password TEXT, -- stored temporarily for agency to share
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers and admins can manage clients" ON public.clients
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'worker')
  );

CREATE POLICY "Clients can view their own record" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

-- 7. Content plans table
CREATE TABLE public.content_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, completed
  created_by UUID NOT NULL, -- worker who created it
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers and admins can manage content plans" ON public.content_plans
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'worker')
  );

CREATE POLICY "Clients can view their own content plans" ON public.content_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = content_plans.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- 8. Content posts table
CREATE TABLE public.content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_plan_id UUID REFERENCES public.content_plans(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  caption TEXT,
  platform TEXT, -- instagram, tiktok, youtube, etc.
  scheduled_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, pending_approval, approved, scheduled, published
  creator_id UUID REFERENCES public.creators(id) ON DELETE SET NULL,
  media_url TEXT,
  notes TEXT,
  engagement_reach INTEGER DEFAULT 0,
  engagement_likes INTEGER DEFAULT 0,
  engagement_comments INTEGER DEFAULT 0,
  approved_by_client BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers and admins can manage content posts" ON public.content_posts
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'worker')
  );

CREATE POLICY "Clients can view their own content posts" ON public.content_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.content_plans cp
      JOIN public.clients c ON c.id = cp.client_id
      WHERE cp.id = content_posts.content_plan_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update approval on their posts" ON public.content_posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.content_plans cp
      JOIN public.clients c ON c.id = cp.client_id
      WHERE cp.id = content_posts.content_plan_id
      AND c.user_id = auth.uid()
    )
  );

-- 9. Activity log for client progress tracking
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  performed_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers and admins can manage activity log" ON public.activity_log
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'worker')
  );

CREATE POLICY "Clients can view their own activity log" ON public.activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = activity_log.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- 10. Auto-assign 'admin' role to existing users (first user becomes admin)
-- and update trigger to assign 'worker' role to new signups by default
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this user was created as a client (has metadata flag)
  IF NEW.raw_user_meta_data->>'role' = 'client' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  ELSE
    -- Default: assign worker role to new signups
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'worker');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- 11. Updated_at triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_plans_updated_at BEFORE UPDATE ON public.content_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_posts_updated_at BEFORE UPDATE ON public.content_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
