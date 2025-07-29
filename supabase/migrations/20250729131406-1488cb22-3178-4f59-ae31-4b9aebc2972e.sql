-- Insert 10 fake clients for testing
INSERT INTO public.clients (name, company, email, phone, address, user_id) VALUES
('Sarah Johnson', 'Johnson Photography', 'sarah@johnsonphoto.com', '(555) 123-4567', '123 Main Street, New York, NY 10001', auth.uid()),
('Michael Chen', 'Chen Design Studio', 'michael@chendesign.com', '(555) 234-5678', '456 Oak Avenue, Los Angeles, CA 90210', auth.uid()),
('Emily Rodriguez', 'Rodriguez Events', 'emily@rodriguezvents.com', '(555) 345-6789', '789 Pine Road, Chicago, IL 60601', auth.uid()),
('David Thompson', 'Thompson Media Group', 'david@thompsonmedia.com', '(555) 456-7890', '321 Elm Street, Austin, TX 78701', auth.uid()),
('Jessica Liu', 'Liu Creative Agency', 'jessica@liucreative.com', '(555) 567-8901', '654 Maple Drive, Seattle, WA 98101', auth.uid()),
('Robert Wilson', 'Wilson Consulting', 'robert@wilsonconsulting.com', '(555) 678-9012', '987 Cedar Lane, Denver, CO 80201', auth.uid()),
('Amanda Davis', 'Davis Marketing Solutions', 'amanda@davismarketing.com', '(555) 789-0123', '147 Birch Avenue, Miami, FL 33101', auth.uid()),
('Christopher Brown', 'Brown Entertainment', 'chris@brownentertainment.com', '(555) 890-1234', '258 Spruce Street, Boston, MA 02101', auth.uid()),
('Rachel Green', 'Green Productions', 'rachel@greenproductions.com', '(555) 901-2345', '369 Willow Road, San Francisco, CA 94101', auth.uid()),
('James Anderson', 'Anderson & Associates', 'james@andersonassoc.com', '(555) 012-3456', '741 Aspen Boulevard, Portland, OR 97201', auth.uid());