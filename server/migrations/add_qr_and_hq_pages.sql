-- Settings for the beer-mat QR quiz finder and the QMGHQ pub/bar page.

INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('landing_title', 'Find your next quiz night', 'text', 'Homepage QR-first landing heading'),
('landing_subtitle', 'QMG runs quiz nights, events and QMGHQ. Scan in, find the nearest quiz, or book one for your venue.', 'text', 'Homepage QR-first landing intro'),
('quiz_finder_title', 'Where is the nearest quiz?', 'text', 'QR quiz finder page heading'),
('quiz_finder_subtitle', 'Scan, search and find your next QMG quiz night.', 'text', 'QR quiz finder page intro'),
('quiz_finder_intro', 'Search by venue, town or postcode. Tap directions when you find the one.', 'text', 'QR quiz finder helper text'),
('qmghq_title', 'QMGHQ', 'text', 'QMGHQ page heading'),
('qmghq_subtitle', 'The home of quiz nights, drinks and good craic.', 'text', 'QMGHQ page intro'),
('qmghq_intro', 'A proper local base for QMG: quizzes, bar nights, events and private bookings.', 'text', 'QMGHQ about copy'),
('qmghq_address', '', 'text', 'QMGHQ address'),
('qmghq_hours', '', 'text', 'QMGHQ opening hours'),
('fatsoma_events_url', 'https://www.fatsoma.com/p/the-qmg-/events', 'text', 'Fatsoma ticketed events page')
ON CONFLICT (setting_key) DO NOTHING;
