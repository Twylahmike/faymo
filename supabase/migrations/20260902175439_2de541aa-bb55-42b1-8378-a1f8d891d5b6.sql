REVOKE EXECUTE ON FUNCTION public.is_client_owner(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_agency_staff() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon;