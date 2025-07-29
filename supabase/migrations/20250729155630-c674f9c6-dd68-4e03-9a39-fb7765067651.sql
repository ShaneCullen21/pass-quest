-- Create a profile for the existing user
INSERT INTO public.profiles (user_id, first_name, last_name)
VALUES ('65ad2fbc-a132-4de7-b6ec-39dcba4a59c3', '', '')
ON CONFLICT (user_id) DO NOTHING;