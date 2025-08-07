-- Create new documents table to consolidate all document types
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'document',
  status TEXT NOT NULL DEFAULT 'draft',
  amount NUMERIC,
  document_url TEXT,
  document_content JSONB,
  field_data JSONB,
  template_id UUID,
  due_date DATE,
  signed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  signing_status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate data from existing tables
INSERT INTO public.documents (
  id, user_id, project_id, title, description, type, status, amount, 
  document_url, document_content, field_data, template_id, signed_at, 
  expires_at, signing_status, created_at, updated_at
)
SELECT 
  id, user_id, project_id, title, description, 'contract' as type, status, amount,
  document_url, document_content, field_data, template_id, signed_at,
  expires_at, signing_status, created_at, updated_at
FROM public.contracts;

INSERT INTO public.documents (
  id, user_id, project_id, title, description, type, status, amount, created_at, updated_at
)
SELECT 
  id, user_id, project_id, title, description, 'proposal' as type, status, amount, created_at, updated_at
FROM public.proposals;

INSERT INTO public.documents (
  id, user_id, project_id, title, description, type, status, amount, due_date, created_at, updated_at
)
SELECT 
  id, user_id, project_id, title, description, 'invoice' as type, status, amount, due_date, created_at, updated_at
FROM public.invoices;

-- Migrate contract fields to use documents table
UPDATE public.contract_fields 
SET contract_id = documents.id 
FROM public.documents 
WHERE contract_fields.contract_id = documents.id;

-- Migrate contract clients to use documents table  
UPDATE public.contract_clients 
SET contract_id = documents.id 
FROM public.documents 
WHERE contract_clients.contract_id = documents.id;

-- Drop old tables (uncomment when ready)
-- DROP TABLE public.contracts CASCADE;
-- DROP TABLE public.proposals CASCADE; 
-- DROP TABLE public.invoices CASCADE;