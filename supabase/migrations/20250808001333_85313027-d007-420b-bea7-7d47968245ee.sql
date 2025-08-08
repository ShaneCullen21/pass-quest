-- Replace populate_mock_data to avoid duplicates and grant execute
CREATE OR REPLACE FUNCTION public.populate_mock_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert mock clients if not already present for this user
  WITH v(name, company, email, phone, address) AS (
    VALUES
      ('John Smith', 'Smith Construction LLC', 'john@smithconstruction.com', '+1-555-0101', '123 Main St, Springfield, IL 62701'),
      ('Sarah Johnson', 'Johnson Architects', 'sarah@johnsonarch.com', '+1-555-0102', '456 Oak Ave, Chicago, IL 60601'),
      ('Michael Brown', NULL, 'michael.brown@email.com', '+1-555-0103', '789 Elm Street, Peoria, IL 61601'),
      ('Lisa Davis', 'Davis Engineering Group', 'lisa@daviseng.com', '+1-555-0104', '321 Maple Dr, Rockford, IL 61101'),
      ('Robert Wilson', 'Wilson Property Management', 'robert@wilsonpm.com', '+1-555-0105', '654 Pine St, Aurora, IL 60505'),
      ('Jennifer Garcia', NULL, 'jennifer.garcia@gmail.com', '+1-555-0106', '987 Cedar Lane, Joliet, IL 60431'),
      ('David Martinez', 'Martinez Consulting', 'david@martinezconsult.com', '+1-555-0107', '147 Birch Ave, Naperville, IL 60540'),
      ('Amanda Taylor', 'Taylor Development', 'amanda@taylordev.com', '+1-555-0108', '258 Walnut St, Elgin, IL 60120'),
      ('Christopher Anderson', NULL, 'chris.anderson@yahoo.com', '+1-555-0109', '369 Spruce Rd, Waukegan, IL 60085'),
      ('Michelle Thomas', 'Thomas Real Estate', 'michelle@thomasre.com', '+1-555-0110', '741 Ash Blvd, Schaumburg, IL 60173')
  )
  INSERT INTO public.clients (name, company, email, phone, address, user_id)
  SELECT v.name, v.company, v.email, v.phone, v.address, uid
  FROM v
  LEFT JOIN public.clients c
    ON c.user_id = uid
   AND c.name = v.name
   AND COALESCE(c.email, '') = COALESCE(v.email, '')
  WHERE c.id IS NULL;

  -- Insert mock projects if not already present for this user
  WITH v2(name, location, start_date, end_date, status) AS (
    VALUES
      ('Downtown Office Complex', 'Chicago, IL', '2024-01-15'::date, '2024-12-31'::date, 'active'),
      ('Residential Subdivision Phase 1', 'Springfield, IL', '2024-02-01'::date, '2024-10-15'::date, 'active'),
      ('Municipal Library Renovation', 'Peoria, IL', '2023-09-01'::date, '2024-03-30'::date, 'completed'),
      ('Shopping Center Development', 'Rockford, IL', '2024-03-01'::date, '2025-02-28'::date, 'active'),
      ('Highway Bridge Replacement', 'Aurora, IL', '2024-01-01'::date, '2024-08-31'::date, 'active'),
      ('School District Expansion', 'Joliet, IL', '2024-04-01'::date, '2025-06-30'::date, 'active'),
      ('Medical Center Addition', 'Naperville, IL', '2023-11-01'::date, '2024-05-15'::date, 'on_hold'),
      ('Industrial Warehouse Complex', 'Elgin, IL', '2024-02-15'::date, '2024-11-30'::date, 'active'),
      ('Waterfront Condominiums', 'Waukegan, IL', '2024-05-01'::date, '2025-03-31'::date, 'active'),
      ('Historic Building Restoration', 'Schaumburg, IL', '2023-08-01'::date, '2024-04-30'::date, 'completed'),
      ('Community Recreation Center', 'Oak Park, IL', '2024-06-01'::date, '2025-01-15'::date, 'active'),
      ('Corporate Headquarters', 'Evanston, IL', '2024-03-15'::date, '2024-12-15'::date, 'active')
  )
  INSERT INTO public.projects (name, location, start_date, end_date, status, user_id)
  SELECT v2.name, v2.location, v2.start_date, v2.end_date, v2.status, uid
  FROM v2
  LEFT JOIN public.projects p
    ON p.user_id = uid
   AND p.name = v2.name
  WHERE p.id IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.populate_mock_data() TO anon, authenticated;