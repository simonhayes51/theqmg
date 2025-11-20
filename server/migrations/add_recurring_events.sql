-- Recurring Events table - Templates for auto-generating events
CREATE TABLE IF NOT EXISTS recurring_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) DEFAULT 'quiz', -- 'quiz', 'race-night', 'special'
    venue_id INTEGER REFERENCES venues(id) ON DELETE SET NULL,

    -- Recurrence pattern
    recurrence_type VARCHAR(50) NOT NULL, -- 'weekly', 'biweekly', 'monthly'
    day_of_week INTEGER, -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday (for weekly/biweekly)
    week_of_month INTEGER, -- 1, 2, 3, 4, 5 (for monthly: 1st Tuesday, 2nd Friday, etc.)
    day_of_month INTEGER, -- 1-31 (for monthly: always on the 15th, etc.)

    event_time TIME NOT NULL,

    -- Generation settings
    start_date DATE NOT NULL, -- When to start generating events
    end_date DATE, -- Optional: when to stop generating events
    generate_weeks_ahead INTEGER DEFAULT 12, -- How many weeks in advance to generate

    -- Default event settings
    default_image_url VARCHAR(500),
    default_status VARCHAR(50) DEFAULT 'scheduled',

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to track which events were generated from recurring templates
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurring_event_id INTEGER REFERENCES recurring_events(id) ON DELETE SET NULL;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_recurring_active ON recurring_events(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_venue ON recurring_events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_recurring ON events(recurring_event_id);

-- Add helpful comment
COMMENT ON COLUMN recurring_events.recurrence_type IS 'weekly: every week on day_of_week, biweekly: every 2 weeks on day_of_week, monthly: either day_of_month (fixed date) or week_of_month+day_of_week (e.g., 1st Tuesday)';
COMMENT ON COLUMN recurring_events.generate_weeks_ahead IS 'Number of weeks in advance to generate events automatically';
