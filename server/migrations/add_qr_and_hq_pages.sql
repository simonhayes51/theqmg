-- Settings for the beer-mat QR quiz finder and the QMGHQ pub/bar page.

INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('landing_title', 'Find your next quiz night', 'text', 'Homepage QR-first landing heading'),
('landing_subtitle', 'The Quizmaster General runs weekly pub quizzes across the North East, with QMGHQ in Tynemouth for themed nights, drinks, games and ticketed events.', 'text', 'Homepage QR-first landing intro'),
('quiz_finder_title', 'Where is the nearest quiz?', 'text', 'QR quiz finder page heading'),
('quiz_finder_subtitle', 'Weekly Quizmaster General nights across Tyne and Wear and the wider North East.', 'text', 'QR quiz finder page intro'),
('quiz_finder_intro', 'Search by venue, town or postcode. Use your location to sort by nearest first.', 'text', 'QR quiz finder helper text'),
('qmghq_title', 'QMGHQ', 'text', 'QMGHQ page heading'),
('qmghq_subtitle', 'Land of Green Ginger, Tynemouth. The home of themed quizzes, Super Sundays, drinks and private events.', 'text', 'QMGHQ page intro'),
('qmghq_intro', 'QMG Headquarters is the venue side of The Quizmaster General: themed quiz nights, games and trivia, poker, family events, food pop-ups and bar nights from the Land of Green Ginger.', 'text', 'QMGHQ about copy'),
('qmghq_address', 'Land of Green Ginger, Tynemouth', 'text', 'QMGHQ address'),
('qmghq_hours', '', 'text', 'QMGHQ opening hours'),
('fatsoma_events_url', 'https://www.fatsoma.com/p/the-qmg-/events', 'text', 'Fatsoma ticketed events page'),
('qmghq_facebook_url', '', 'text', 'QMGHQ Facebook page URL')
ON CONFLICT (setting_key) DO NOTHING;
