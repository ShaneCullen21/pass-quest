-- Create unified document_fields table
CREATE TABLE public.document_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  client_id UUID,
  field_type TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT,
  placeholder TEXT,
  default_value TEXT,
  position_x NUMERIC NOT NULL,
  position_y NUMERIC NOT NULL,
  width NUMERIC DEFAULT 100,
  height NUMERIC DEFAULT 30,
  page_number INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  validation_rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unified document_clients table
CREATE TABLE public.document_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  client_id UUID NOT NULL,
  role TEXT DEFAULT 'signatory',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.document_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for document_fields
CREATE POLICY "Users can manage their document fields" 
ON public.document_fields 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM documents 
  WHERE documents.id = document_fields.document_id 
  AND documents.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM documents 
  WHERE documents.id = document_fields.document_id 
  AND documents.user_id = auth.uid()
));

-- Create RLS policies for document_clients
CREATE POLICY "Users can manage their document clients" 
ON public.document_clients 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM documents 
  WHERE documents.id = document_clients.document_id 
  AND documents.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM documents 
  WHERE documents.id = document_clients.document_id 
  AND documents.user_id = auth.uid()
));

-- Migrate data from contracts to documents (only if not already exists)
INSERT INTO public.documents (
  id, title, description, status, signing_status, document_url, 
  field_data, document_content, amount, expires_at, signed_at,
  project_id, template_id, user_id, created_at, updated_at, type
)
SELECT 
  c.id, c.title, c.description, c.status, c.signing_status, c.document_url,
  c.field_data, c.document_content, c.amount, c.expires_at, c.signed_at,
  c.project_id, c.template_id, c.user_id, c.created_at, c.updated_at, 'contract'
FROM contracts c
WHERE NOT EXISTS (
  SELECT 1 FROM documents d WHERE d.id = c.id
);

-- Migrate data from contract_fields to document_fields
INSERT INTO public.document_fields (
  id, document_id, client_id, field_type, field_name, field_value,
  placeholder, default_value, position_x, position_y, width, height,
  page_number, is_required, validation_rules, created_at, updated_at
)
SELECT 
  cf.id, cf.contract_id, cf.client_id, cf.field_type, cf.field_name, cf.field_value,
  cf.placeholder, cf.default_value, cf.position_x, cf.position_y, cf.width, cf.height,
  cf.page_number, cf.is_required, cf.validation_rules, cf.created_at, cf.updated_at
FROM contract_fields cf
WHERE EXISTS (SELECT 1 FROM contracts c WHERE c.id = cf.contract_id);

-- Migrate data from contract_clients to document_clients
INSERT INTO public.document_clients (
  id, document_id, client_id, role, created_at
)
SELECT 
  cc.id, cc.contract_id, cc.client_id, cc.role, cc.created_at
FROM contract_clients cc
WHERE EXISTS (SELECT 1 FROM contracts c WHERE c.id = cc.contract_id);

-- Create triggers for updated_at
CREATE TRIGGER update_document_fields_updated_at
  BEFORE UPDATE ON public.document_fields
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Drop obsolete tables
DROP TABLE IF EXISTS public.contract_fields CASCADE;
DROP TABLE IF EXISTS public.contract_clients CASCADE;
DROP TABLE IF EXISTS public.contracts CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.proposals CASCADE;