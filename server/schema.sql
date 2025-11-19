-- Quiz Master General Database Schema

-- Create database (run this separately if needed)
-- CREATE DATABASE quiz_master_general;

-- Users table (for admin authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100), -- 'quiz', 'race-night', 'special'
    venue_id INTEGER REFERENCES venues(id) ON DELETE SET NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    postcode VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100), -- emoji or icon class name
    features TEXT[], -- array of feature bullet points
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews/Testimonials table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL,
    venue_name VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members (Quizmasters) table
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100), -- 'Lead Quizmaster', 'Quizmaster', etc.
    bio TEXT,
    image_url VARCHAR(500),
    email VARCHAR(255),
    phone VARCHAR(50),
    specialties TEXT[], -- array of specialties
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery images table
CREATE TABLE IF NOT EXISTS gallery_images (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    category VARCHAR(100), -- 'quiz-night', 'race-night', 'special-event'
    event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site settings table (for general site content)
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50), -- 'text', 'html', 'json', 'boolean'
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact form submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    replied BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_venues_active ON venues(is_active);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured, is_approved);
CREATE INDEX IF NOT EXISTS idx_team_active ON team_members(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category);

-- Insert default admin user (password: 'admin123' - CHANGE THIS!)
-- Password hash for 'admin123'
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@thequizmastergeneral.com', '$2b$10$rKjPZWvXPZ0QRrqZx7EO7O.GxFYZxJhEkC5yYxVxEqMVxQxYxVxQx', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('site_title', 'The Quiz Master General', 'text', 'Main site title'),
('site_tagline', 'North East England''s Premier Quiz & Entertainment Provider', 'text', 'Site tagline'),
('hero_title', 'The Quiz Master General', 'text', 'Homepage hero title'),
('hero_subtitle', 'Bringing Fun, Laughter, and Competition to Venues Across the North East', 'text', 'Homepage hero subtitle'),
('contact_email', 'info@thequizmastergeneral.com', 'text', 'Main contact email'),
('contact_phone', '', 'text', 'Main contact phone'),
('coverage_area', 'Newcastle, Gateshead, Durham, Sunderland & surrounding areas', 'text', 'Service coverage area'),
('facebook_url', '', 'text', 'Facebook page URL'),
('twitter_url', '', 'text', 'Twitter/X URL'),
('instagram_url', '', 'text', 'Instagram URL')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample services
INSERT INTO services (title, description, icon, features, display_order, is_active) VALUES
('Quiz Nights', 'Engaging quiz nights tailored to your venue. From pub quizzes to corporate events, we bring the questions, the fun, and the competition!', '🎯', ARRAY['Fresh questions every time', 'Professional hosting', 'Customizable rounds', 'Music & picture rounds'], 1, true),
('Race Nights', 'Exciting race nights that get everyone involved! Place your bets, cheer on your horse, and enjoy an evening of thrilling entertainment.', '🏇', ARRAY['Fundraising friendly', 'Interactive betting system', 'Professional race footage', 'Great for all ages'], 2, true),
('Special Events', 'Custom entertainment packages for your special occasions. Music rounds, picture quizzes, themed nights - we do it all!', '🎉', ARRAY['Themed quiz nights', 'Corporate team building', 'Private parties', 'Charity events'], 3, true)
ON CONFLICT DO NOTHING;
