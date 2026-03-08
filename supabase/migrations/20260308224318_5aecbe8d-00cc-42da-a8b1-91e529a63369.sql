
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'client' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  ELSIF NEW.raw_user_meta_data->>'role' = 'agency' OR NEW.raw_user_meta_data->>'role' IS NULL THEN
    -- Self-signup users (agencies) or users without a role flag get admin
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    -- Explicit worker role from team member creation
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'worker');
  END IF;
  RETURN NEW;
END;
$function$;
