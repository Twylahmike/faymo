CREATE POLICY "Clients upload own file documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_client_owner(client_id)
  AND doc_type = 'file_attachment'::doc_type
);