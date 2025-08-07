-- Add template type and master template reference to templates table
ALTER TABLE public.templates 
ADD COLUMN template_type TEXT DEFAULT 'master' CHECK (template_type IN ('master', 'customized')),
ADD COLUMN master_template_id UUID REFERENCES public.templates(id);

-- Update existing templates to be master templates
UPDATE public.templates SET template_type = 'master' WHERE template_type IS NULL;

-- Make template_type not null after setting defaults
ALTER TABLE public.templates ALTER COLUMN template_type SET NOT NULL;