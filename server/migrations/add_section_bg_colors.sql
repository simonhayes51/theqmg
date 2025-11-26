-- Add background color fields for homepage sections
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('social_proof_bg_color', '#003DA5', 'text', 'Background color for social proof section (hex code)'),
('services_bg_color', '#DC143C', 'text', 'Background color for services section (hex code)'),
('events_bg_color', '#003DA5', 'text', 'Background color for events section (hex code)'),
('gallery_bg_color', '#003DA5', 'text', 'Background color for gallery section (hex code)'),
('team_bg_color', '#DC143C', 'text', 'Background color for team section (hex code)'),
('reviews_bg_color', '#DC143C', 'text', 'Background color for reviews section (hex code)'),
('footer_bg_color', '#1a1a1a', 'text', 'Background color for footer section (hex code)')
ON CONFLICT (setting_key) DO NOTHING;

COMMENT ON COLUMN site_settings.setting_value IS 'For color settings, use hex codes (#RRGGBB) or rgba values';
