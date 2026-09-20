-- Refresh the early QMG/QMGHQ placeholder copy now that the two Facebook pages
-- make the brand split clearer. Only replace unchanged old defaults or blanks.

INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('qmghq_facebook_url', '', 'text', 'QMGHQ Facebook page URL')
ON CONFLICT (setting_key) DO NOTHING;

UPDATE site_settings
SET setting_value = 'The Quizmaster General runs weekly pub quizzes across the North East, with QMGHQ in Tynemouth for themed nights, drinks, games and ticketed events.'
WHERE setting_key = 'landing_subtitle'
  AND setting_value = 'QMG runs quiz nights, events and QMGHQ. Scan in, find the nearest quiz, or book one for your venue.';

UPDATE site_settings
SET setting_value = 'Weekly Quizmaster General nights across Tyne and Wear and the wider North East.'
WHERE setting_key = 'quiz_finder_subtitle'
  AND setting_value = 'Scan, search and find your next QMG quiz night.';

UPDATE site_settings
SET setting_value = 'Search by venue, town or postcode. Use your location to sort by nearest first.'
WHERE setting_key = 'quiz_finder_intro'
  AND setting_value = 'Search by venue, town or postcode. Tap directions when you find the one.';

UPDATE site_settings
SET setting_value = 'Land of Green Ginger, Tynemouth. The home of themed quizzes, Super Sundays, drinks and private events.'
WHERE setting_key = 'qmghq_subtitle'
  AND setting_value = 'The home of quiz nights, drinks and good craic.';

UPDATE site_settings
SET setting_value = 'QMG Headquarters is the venue side of The Quizmaster General: themed quiz nights, games and trivia, poker, family events, food pop-ups and bar nights from the Land of Green Ginger.'
WHERE setting_key = 'qmghq_intro'
  AND setting_value = 'A proper local base for QMG: quizzes, bar nights, events and private bookings.';

UPDATE site_settings
SET setting_value = 'Land of Green Ginger, Tynemouth'
WHERE setting_key = 'qmghq_address'
  AND COALESCE(setting_value, '') = '';

UPDATE site_settings
SET setting_value = 'thequizmastergeneral@hotmail.com'
WHERE setting_key = 'contact_email'
  AND setting_value IN ('', 'info@thequizmastergeneral.com');

UPDATE site_settings
SET setting_value = '07772 562121'
WHERE setting_key = 'contact_phone'
  AND COALESCE(setting_value, '') = '';

UPDATE site_settings
SET setting_value = 'https://www.instagram.com/the_quizmastergeneral'
WHERE setting_key = 'instagram_url'
  AND COALESCE(setting_value, '') = '';
