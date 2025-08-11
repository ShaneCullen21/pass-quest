-- Remove start_date and end_date columns from projects table
ALTER TABLE public.projects 
DROP COLUMN start_date,
DROP COLUMN end_date;