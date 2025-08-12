-- Add foreign key constraints with proper cascade rules
ALTER TABLE documents ADD CONSTRAINT fk_documents_project_id 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE document_fields ADD CONSTRAINT fk_document_fields_document_id
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;

ALTER TABLE document_clients ADD CONSTRAINT fk_document_clients_document_id
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;

ALTER TABLE document_clients ADD CONSTRAINT fk_document_clients_client_id  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

-- Create function to check if client can be deleted
CREATE OR REPLACE FUNCTION can_delete_client(client_uuid uuid)
RETURNS TABLE(can_delete boolean, project_count integer, document_count integer) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (
      NOT EXISTS (
        SELECT 1 FROM projects 
        WHERE client_uuid = ANY(client_ids) AND user_id = auth.uid()
      ) AND
      NOT EXISTS (
        SELECT 1 FROM document_clients dc
        JOIN documents d ON dc.document_id = d.id
        WHERE dc.client_id = client_uuid AND d.user_id = auth.uid()
      )
    ) as can_delete,
    (
      SELECT COUNT(*)::integer FROM projects 
      WHERE client_uuid = ANY(client_ids) AND user_id = auth.uid()
    ) as project_count,
    (
      SELECT COUNT(*)::integer FROM document_clients dc
      JOIN documents d ON dc.document_id = d.id
      WHERE dc.client_id = client_uuid AND d.user_id = auth.uid()
    ) as document_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get document count for project deletion warning
CREATE OR REPLACE FUNCTION get_project_document_count(project_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer FROM documents 
    WHERE project_id = project_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;