-- Create templates table for reusable contract templates
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  document_url TEXT, -- URL to uploaded template document (PDF/Word)
  template_data JSONB, -- Store template structure and default fields
  category TEXT DEFAULT 'contract',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for templates
CREATE POLICY "Users can view their own templates" 
ON public.templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" 
ON public.templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON public.templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON public.templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create contract_clients junction table for many-to-many relationship
CREATE TABLE public.contract_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL,
  client_id UUID NOT NULL,
  role TEXT DEFAULT 'signatory', -- signatory, witness, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contract_id, client_id)
);

-- Enable RLS on contract_clients
ALTER TABLE public.contract_clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contract_clients
CREATE POLICY "Users can view their contract clients" 
ON public.contract_clients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.contracts 
    WHERE contracts.id = contract_clients.contract_id 
    AND contracts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their contract clients" 
ON public.contract_clients 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.contracts 
    WHERE contracts.id = contract_clients.contract_id 
    AND contracts.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contracts 
    WHERE contracts.id = contract_clients.contract_id 
    AND contracts.user_id = auth.uid()
  )
);

-- Create contract_fields table for drag-and-drop field storage
CREATE TABLE public.contract_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL,
  client_id UUID, -- Which client this field is associated with
  field_type TEXT NOT NULL, -- 'text', 'signature', 'date', 'checkbox', etc.
  field_name TEXT NOT NULL,
  position_x NUMERIC NOT NULL,
  position_y NUMERIC NOT NULL,
  width NUMERIC DEFAULT 100,
  height NUMERIC DEFAULT 30,
  page_number INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  placeholder TEXT,
  default_value TEXT,
  validation_rules JSONB,
  field_value TEXT, -- Actual field value when filled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contract_fields
ALTER TABLE public.contract_fields ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contract_fields
CREATE POLICY "Users can manage their contract fields" 
ON public.contract_fields 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.contracts 
    WHERE contracts.id = contract_fields.contract_id 
    AND contracts.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contracts 
    WHERE contracts.id = contract_fields.contract_id 
    AND contracts.user_id = auth.uid()
  )
);

-- Enhance contracts table with additional fields
ALTER TABLE public.contracts 
ADD COLUMN template_id UUID,
ADD COLUMN document_url TEXT,
ADD COLUMN document_content JSONB,
ADD COLUMN field_data JSONB,
ADD COLUMN signing_status TEXT DEFAULT 'draft',
ADD COLUMN signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contract_fields_updated_at
BEFORE UPDATE ON public.contract_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_templates_user_id ON public.templates(user_id);
CREATE INDEX idx_templates_category ON public.templates(category);
CREATE INDEX idx_contract_clients_contract_id ON public.contract_clients(contract_id);
CREATE INDEX idx_contract_clients_client_id ON public.contract_clients(client_id);
CREATE INDEX idx_contract_fields_contract_id ON public.contract_fields(contract_id);
CREATE INDEX idx_contract_fields_client_id ON public.contract_fields(client_id);
CREATE INDEX idx_contracts_template_id ON public.contracts(template_id);
CREATE INDEX idx_contracts_signing_status ON public.contracts(signing_status);