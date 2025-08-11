-- Make shane11cullen@hotmail.com an admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'shane11cullen@hotmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update templates RLS policy to allow all users to view master templates
DROP POLICY IF EXISTS "Users can view templates" ON public.templates;

CREATE POLICY "Users can view templates" 
ON public.templates 
FOR SELECT 
USING (
  (template_type = 'master'::text) OR 
  ((template_type = 'customized'::text) AND (auth.uid() = user_id))
);