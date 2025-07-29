-- Insert 10 fake clients for testing using the current user's ID
INSERT INTO public.clients (name, company, email, phone, address, user_id) VALUES
('Sarah Johnson', 'Johnson Photography', 'sarah@johnsonphoto.com', '(555) 123-4567', '123 Main Street, New York, NY 10001', '65ad2fbc-a132-4de7-b6ec-39dcba4a59c3'),
('Michael Chen', 'Chen Design Studio', 'michael@chendesign.com', '(555) 234-5678', '456 Oak Avenue, Los Angeles, CA 90210', '65ad2fbc-a132-4de7-b6ec-39dcba4a59c3'),
('Emily Rodriguez', 'Rodriguez Events', 'emily@rodriguezvents.com', '(555) 345-6789', '789 Pine Road, Chicago, IL 60601', '65ad2fbc-a132-4de7-b6ec-39dcba4a59c3'),
('David Thompson', 'Thompson Media Group', 'david@thompsonmedia.com', '(555) 456-7890', '321 Elm Street, Austin, TX 78701', '65ad2fbc-a132-4de7-b6ec-39dcba4a59c3'),
('Jessica Liu', 'Liu Creative Agency', 'jessica@liucreative.com', '(555) 567-8901', '654 Maple Drive, Seattle, WA 98101', '65ad2fbc-a132-4de7-b6ec-39dcba4a59c3'),
('Robert Wilson', 'Wilson Consulting', 'robert@wilsonconsulting.com', '(555) 678-9012', '987 Cedar Lane, Denver, CO 80201', '65ad2fbc-a132-4de7-b6ec-39dcba4a59c3'),
('Amanda Davis', 'Davis Marketing Solutions', 'amanda@davismarketing.com', '(555) 789-0123', '147 Birch Avenue, Miami, FL 33101', '65ad2fbc-a132-4de7-b6ec-39dcba4a59c3'),
('Christopher Brown', 'Brown Entertainment', 'chris@brownentertainment.com', '(555) 890-1234', '258 Spruce Street, Boston, MA 02101', '65ad2fbc-a132-4de7-b6ec-39dcba4a59c3'),
('Rachel Green', 'Green Productions', 'rachel@greenproductions.com', '(555) 901-2345', '369 Willow Road, San Francisco, CA 94101', '65ad2fbc-a132-4de7-b6ec-39dcba4a59c3'),
('James Anderson', 'Anderson & Associates', 'james@andersonassoc.com', '(555) 012-3456', '741 Aspen Boulevard, Portland, OR 97201', '65ad2fbc-a132-4de7-b6ec-39dcba4a59c3');