-- Create storage bucket for contract documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contract-documents', 'contract-documents', true);

-- Create policies for contract documents
CREATE POLICY "Allow authenticated users to upload contract documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'contract-documents' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated users to view contract documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'contract-documents' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated users to update their contract documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'contract-documents' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated users to delete their contract documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'contract-documents' 
  AND auth.uid() IS NOT NULL
);