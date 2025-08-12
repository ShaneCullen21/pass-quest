-- Step 1: Clean up orphaned document_fields first
DELETE FROM document_fields df 
WHERE NOT EXISTS (
  SELECT 1 FROM documents d WHERE d.id = df.document_id
);

-- Step 2: Clean up orphaned document_clients  
DELETE FROM document_clients dc
WHERE NOT EXISTS (
  SELECT 1 FROM documents d WHERE d.id = dc.document_id
) OR NOT EXISTS (
  SELECT 1 FROM clients c WHERE c.id = dc.client_id
);

-- Step 3: Clean up orphaned documents
DELETE FROM documents d
WHERE NOT EXISTS (
  SELECT 1 FROM projects p WHERE p.id = d.project_id
);