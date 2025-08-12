-- Add type column to templates table
ALTER TABLE public.templates 
ADD COLUMN type text NOT NULL DEFAULT 'Contract';

-- Add check constraint for valid types
ALTER TABLE public.templates 
ADD CONSTRAINT templates_type_check 
CHECK (type IN ('Proposal', 'Contract', 'Invoice'));