-- Create a function to populate mock data for the current user
CREATE OR REPLACE FUNCTION populate_mock_data()
RETURNS void
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  -- Insert mock clients for the current user
  INSERT INTO public.clients (name, company, email, phone, address, user_id) VALUES
  ('John Smith', 'Smith Construction LLC', 'john@smithconstruction.com', '+1-555-0101', '123 Main St, Springfield, IL 62701', auth.uid()),
  ('Sarah Johnson', 'Johnson Architects', 'sarah@johnsonarch.com', '+1-555-0102', '456 Oak Ave, Chicago, IL 60601', auth.uid()),
  ('Michael Brown', NULL, 'michael.brown@email.com', '+1-555-0103', '789 Elm Street, Peoria, IL 61601', auth.uid()),
  ('Lisa Davis', 'Davis Engineering Group', 'lisa@daviseng.com', '+1-555-0104', '321 Maple Dr, Rockford, IL 61101', auth.uid()),
  ('Robert Wilson', 'Wilson Property Management', 'robert@wilsonpm.com', '+1-555-0105', '654 Pine St, Aurora, IL 60505', auth.uid()),
  ('Jennifer Garcia', NULL, 'jennifer.garcia@gmail.com', '+1-555-0106', '987 Cedar Lane, Joliet, IL 60431', auth.uid()),
  ('David Martinez', 'Martinez Consulting', 'david@martinezconsult.com', '+1-555-0107', '147 Birch Ave, Naperville, IL 60540', auth.uid()),
  ('Amanda Taylor', 'Taylor Development', 'amanda@taylordev.com', '+1-555-0108', '258 Walnut St, Elgin, IL 60120', auth.uid()),
  ('Christopher Anderson', NULL, 'chris.anderson@yahoo.com', '+1-555-0109', '369 Spruce Rd, Waukegan, IL 60085', auth.uid()),
  ('Michelle Thomas', 'Thomas Real Estate', 'michelle@thomasre.com', '+1-555-0110', '741 Ash Blvd, Schaumburg, IL 60173', auth.uid());

  -- Insert mock projects for the current user
  INSERT INTO public.projects (name, location, start_date, end_date, status, user_id) VALUES
  ('Downtown Office Complex', 'Chicago, IL', '2024-01-15', '2024-12-31', 'active', auth.uid()),
  ('Residential Subdivision Phase 1', 'Springfield, IL', '2024-02-01', '2024-10-15', 'active', auth.uid()),
  ('Municipal Library Renovation', 'Peoria, IL', '2023-09-01', '2024-03-30', 'completed', auth.uid()),
  ('Shopping Center Development', 'Rockford, IL', '2024-03-01', '2025-02-28', 'active', auth.uid()),
  ('Highway Bridge Replacement', 'Aurora, IL', '2024-01-01', '2024-08-31', 'active', auth.uid()),
  ('School District Expansion', 'Joliet, IL', '2024-04-01', '2025-06-30', 'active', auth.uid()),
  ('Medical Center Addition', 'Naperville, IL', '2023-11-01', '2024-05-15', 'on_hold', auth.uid()),
  ('Industrial Warehouse Complex', 'Elgin, IL', '2024-02-15', '2024-11-30', 'active', auth.uid()),
  ('Waterfront Condominiums', 'Waukegan, IL', '2024-05-01', '2025-03-31', 'active', auth.uid()),
  ('Historic Building Restoration', 'Schaumburg, IL', '2023-08-01', '2024-04-30', 'completed', auth.uid()),
  ('Community Recreation Center', 'Oak Park, IL', '2024-06-01', '2025-01-15', 'active', auth.uid()),
  ('Corporate Headquarters', 'Evanston, IL', '2024-03-15', '2024-12-15', 'active', auth.uid());
END;
$$;