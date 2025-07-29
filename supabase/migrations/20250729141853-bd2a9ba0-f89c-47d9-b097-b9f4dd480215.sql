-- Update projects table to support multiple clients (up to 5)
ALTER TABLE public.projects 
DROP COLUMN clients_ids;

ALTER TABLE public.projects 
ADD COLUMN client_ids UUID[] DEFAULT '{}';

-- Add a constraint to limit to maximum 5 clients
ALTER TABLE public.projects 
ADD CONSTRAINT max_5_clients CHECK (array_length(client_ids, 1) <= 5 OR client_ids IS NULL);