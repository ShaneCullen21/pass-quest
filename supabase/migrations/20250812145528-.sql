-- Update RLS policies for template comments to allow viewing master template comments
-- First drop existing policies
DROP POLICY IF EXISTS "Users can view their template comments" ON public.template_comments;
DROP POLICY IF EXISTS "Users can create their template comments" ON public.template_comments;
DROP POLICY IF EXISTS "Users can update their template comments" ON public.template_comments;
DROP POLICY IF EXISTS "Users can delete their template comments" ON public.template_comments;

-- Create new policies that allow viewing comments on master templates
CREATE POLICY "Users can view template comments" ON public.template_comments 
FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.templates 
    WHERE templates.id = template_comments.template_id 
    AND templates.template_type = 'master'
  )
);

-- Allow users to create comments on any template they can access
CREATE POLICY "Users can create template comments" ON public.template_comments 
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (
      SELECT 1 FROM public.templates 
      WHERE templates.id = template_comments.template_id 
      AND (templates.user_id = auth.uid() OR templates.template_type = 'master')
    )
  )
);

-- Users can only update their own comments
CREATE POLICY "Users can update their template comments" ON public.template_comments 
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments, admins can delete any comments on master templates
CREATE POLICY "Users can delete template comments" ON public.template_comments 
FOR DELETE USING (
  auth.uid() = user_id OR 
  (has_role(auth.uid(), 'admin') AND EXISTS (
    SELECT 1 FROM public.templates 
    WHERE templates.id = template_comments.template_id 
    AND templates.template_type = 'master'
  ))
);