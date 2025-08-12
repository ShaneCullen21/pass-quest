-- Remove all orphaned document_fields
DELETE FROM document_fields 
WHERE document_id IN (
  'ea032cca-c394-451f-88b0-c967619d12d8',
  '6379e664-ad00-4536-827a-d938a73eaeb7', 
  'ab9caf21-da2a-4983-939e-da1366ddd058',
  '3504c4a9-2b70-4ba2-9c9d-1d8ca4b00683'
);

-- Clean up any remaining orphaned records
DELETE FROM document_fields df 
WHERE NOT EXISTS (
  SELECT 1 FROM documents d WHERE d.id = df.document_id
);

-- Now add the foreign key constraints
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