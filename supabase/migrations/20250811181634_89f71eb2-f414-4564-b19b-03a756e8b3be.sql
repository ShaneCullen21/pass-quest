-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = _user_id 
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing template policies
DROP POLICY IF EXISTS "Users can create their own templates" ON public.templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.templates;
DROP POLICY IF EXISTS "Users can view their own templates" ON public.templates;

-- New template policies
-- All users can view master templates (created by admins) and their own customized templates
CREATE POLICY "Users can view templates"
ON public.templates
FOR SELECT
USING (
  template_type = 'master' OR 
  (template_type = 'customized' AND auth.uid() = user_id)
);

-- Only admins can create master templates, all users can create customized templates
CREATE POLICY "Template creation policy"
ON public.templates
FOR INSERT
WITH CHECK (
  (template_type = 'master' AND public.has_role(auth.uid(), 'admin')) OR
  (template_type = 'customized' AND auth.uid() = user_id)
);

-- Only admins can update master templates, users can update their own customized templates
CREATE POLICY "Template update policy"
ON public.templates
FOR UPDATE
USING (
  (template_type = 'master' AND public.has_role(auth.uid(), 'admin')) OR
  (template_type = 'customized' AND auth.uid() = user_id)
);

-- Only admins can delete master templates, users can delete their own customized templates
CREATE POLICY "Template delete policy"
ON public.templates
FOR DELETE
USING (
  (template_type = 'master' AND public.has_role(auth.uid(), 'admin')) OR
  (template_type = 'customized' AND auth.uid() = user_id)
);

-- Function to automatically assign 'user' role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Trigger to assign role to new users
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();