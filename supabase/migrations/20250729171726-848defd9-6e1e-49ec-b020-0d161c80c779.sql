-- Create contract_versions table for tracking contract revisions
CREATE TABLE public.contract_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  document_content JSONB,
  field_data JSONB,
  changes_summary TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_current BOOLEAN DEFAULT false,
  UNIQUE(contract_id, version_number)
);

-- Enable RLS on contract_versions
ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contract_versions
CREATE POLICY "Users can manage versions of their contracts" 
ON public.contract_versions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.contracts 
    WHERE contracts.id = contract_versions.contract_id 
    AND contracts.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contracts 
    WHERE contracts.id = contract_versions.contract_id 
    AND contracts.user_id = auth.uid()
  )
);

-- Create contract_activities table for tracking contract lifecycle events
CREATE TABLE public.contract_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'created', 'sent', 'viewed', 'signed', 'completed', 'rejected'
  actor_id UUID, -- who performed the action (user or client)
  actor_type TEXT DEFAULT 'user', -- 'user' or 'client'
  client_id UUID, -- which client if applicable
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contract_activities
ALTER TABLE public.contract_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contract_activities
CREATE POLICY "Users can view activities of their contracts" 
ON public.contract_activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.contracts 
    WHERE contracts.id = contract_activities.contract_id 
    AND contracts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create activities for their contracts" 
ON public.contract_activities 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contracts 
    WHERE contracts.id = contract_activities.contract_id 
    AND contracts.user_id = auth.uid()
  )
);

-- Add additional fields to contracts table for signing workflow
ALTER TABLE public.contracts 
ADD COLUMN current_version INTEGER DEFAULT 1,
ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejection_reason TEXT,
ADD COLUMN signature_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN reminder_count INTEGER DEFAULT 0;

-- Create function to automatically create version when contract is updated
CREATE OR REPLACE FUNCTION public.create_contract_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if content has changed
  IF OLD.title != NEW.title OR 
     OLD.description != NEW.description OR 
     OLD.field_data != NEW.field_data OR
     OLD.document_content != NEW.document_content THEN
    
    -- Insert new version
    INSERT INTO public.contract_versions (
      contract_id,
      version_number,
      title,
      description,
      document_content,
      field_data,
      changes_summary,
      created_by,
      is_current
    ) VALUES (
      NEW.id,
      COALESCE(NEW.current_version, 1),
      NEW.title,
      NEW.description,
      NEW.document_content,
      NEW.field_data,
      'Contract updated',
      auth.uid(),
      true
    );

    -- Mark previous versions as not current
    UPDATE public.contract_versions 
    SET is_current = false 
    WHERE contract_id = NEW.id AND version_number != NEW.current_version;

    -- Increment version number
    NEW.current_version = COALESCE(NEW.current_version, 1) + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic versioning
CREATE TRIGGER contract_versioning_trigger
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.create_contract_version();

-- Create function to track contract status changes
CREATE OR REPLACE FUNCTION public.track_contract_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Track status changes
  IF OLD.signing_status != NEW.signing_status THEN
    INSERT INTO public.contract_activities (
      contract_id,
      activity_type,
      actor_id,
      actor_type,
      details
    ) VALUES (
      NEW.id,
      NEW.signing_status,
      auth.uid(),
      'user',
      jsonb_build_object(
        'old_status', OLD.signing_status,
        'new_status', NEW.signing_status,
        'timestamp', now()
      )
    );

    -- Set timestamps based on status
    IF NEW.signing_status = 'sent' AND OLD.signing_status != 'sent' THEN
      NEW.sent_at = now();
    ELSIF NEW.signing_status = 'completed' AND OLD.signing_status != 'completed' THEN
      NEW.completed_at = now();
      NEW.signed_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for status tracking
CREATE TRIGGER contract_status_tracking_trigger
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.track_contract_status_change();

-- Create indexes for better performance
CREATE INDEX idx_contract_versions_contract_id ON public.contract_versions(contract_id);
CREATE INDEX idx_contract_versions_version_number ON public.contract_versions(contract_id, version_number);
CREATE INDEX idx_contract_versions_current ON public.contract_versions(contract_id, is_current);
CREATE INDEX idx_contract_activities_contract_id ON public.contract_activities(contract_id);
CREATE INDEX idx_contract_activities_type ON public.contract_activities(activity_type);
CREATE INDEX idx_contracts_signing_status ON public.contracts(signing_status);
CREATE INDEX idx_contracts_sent_at ON public.contracts(sent_at);
CREATE INDEX idx_contracts_signature_deadline ON public.contracts(signature_deadline);