-- Add latitude and longitude fields to venues table for map functionality
ALTER TABLE venues ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add index for faster geographic queries
CREATE INDEX IF NOT EXISTS idx_venues_coordinates ON venues(latitude, longitude);

-- Add helpful comment
COMMENT ON COLUMN venues.latitude IS 'Latitude coordinate for map display (-90 to 90)';
COMMENT ON COLUMN venues.longitude IS 'Longitude coordinate for map display (-180 to 180)';
