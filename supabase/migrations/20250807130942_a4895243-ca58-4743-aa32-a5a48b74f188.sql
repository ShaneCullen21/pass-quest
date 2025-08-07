-- Create template_comments table for persistent comments
CREATE TABLE public.template_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  selected_text TEXT NOT NULL,
  range_from INTEGER NOT NULL,
  range_to INTEGER NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.template_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for template comments
CREATE POLICY "Users can view their template comments" 
ON public.template_comments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their template comments" 
ON public.template_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their template comments" 
ON public.template_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their template comments" 
ON public.template_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_template_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_template_comments_updated_at
  BEFORE UPDATE ON public.template_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_template_comments_updated_at();