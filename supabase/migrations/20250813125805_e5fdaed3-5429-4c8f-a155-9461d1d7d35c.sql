-- Add signing profile support to clients table
ALTER TABLE public.clients 
ADD COLUMN is_signing_profile BOOLEAN DEFAULT FALSE;

-- Add signing profile tracking to profiles table  
ALTER TABLE public.profiles
ADD COLUMN signing_profile_created BOOLEAN DEFAULT FALSE;

-- Create unique constraint to ensure only one signing profile per user
CREATE UNIQUE INDEX unique_signing_profile_per_user 
ON public.clients (user_id) 
WHERE is_signing_profile = TRUE;