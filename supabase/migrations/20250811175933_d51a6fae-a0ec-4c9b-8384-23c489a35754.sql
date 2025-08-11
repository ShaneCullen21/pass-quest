-- Add first_name and last_name columns to clients table
ALTER TABLE public.clients 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Migrate existing data by splitting the name field
UPDATE public.clients 
SET 
  first_name = CASE 
    WHEN position(' ' in name) > 0 
    THEN split_part(name, ' ', 1)
    ELSE name
  END,
  last_name = CASE 
    WHEN position(' ' in name) > 0 
    THEN substring(name from position(' ' in name) + 1)
    ELSE ''
  END
WHERE name IS NOT NULL;

-- Set both fields as NOT NULL now that we have data
ALTER TABLE public.clients 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Drop the old name column
ALTER TABLE public.clients DROP COLUMN name;

-- Drop the populate_mock_data function since we're removing mock data feature
DROP FUNCTION IF EXISTS public.populate_mock_data();