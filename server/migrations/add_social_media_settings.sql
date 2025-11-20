-- Add social media API settings to site_settings table
-- These settings will store API credentials for Instagram and Facebook

-- Instagram settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('instagram_access_token', '', 'text', 'Instagram Basic Display API access token'),
('instagram_user_id', '', 'text', 'Instagram user ID for fetching posts'),
('instagram_enabled', 'false', 'boolean', 'Enable/disable Instagram feed display'),
('facebook_access_token', '', 'text', 'Facebook Graph API access token'),
('facebook_page_id', '', 'text', 'Facebook page ID for fetching posts'),
('facebook_enabled', 'false', 'boolean', 'Enable/disable Facebook feed display'),
('whatsapp_number', '', 'text', 'WhatsApp business number (format: 447xxxxxxxxx)'),
('whatsapp_enabled', 'false', 'boolean', 'Enable/disable WhatsApp chat widget'),
('whatsapp_default_message', 'Hi! I''d like to know more about your quiz nights.', 'text', 'Default WhatsApp message')
ON CONFLICT (setting_key) DO NOTHING;

-- Create table for caching social media posts to avoid rate limits
CREATE TABLE IF NOT EXISTS social_media_cache (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL, -- 'instagram' or 'facebook'
    post_id VARCHAR(255) NOT NULL UNIQUE,
    post_data JSONB NOT NULL, -- Store entire post object
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_social_cache_platform ON social_media_cache(platform);
CREATE INDEX IF NOT EXISTS idx_social_cache_expires ON social_media_cache(expires_at);

COMMENT ON TABLE social_media_cache IS 'Caches social media posts to reduce API calls and avoid rate limits';
COMMENT ON COLUMN social_media_cache.expires_at IS 'Cache expires after 1 hour by default';
