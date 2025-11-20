-- Question of the Day table
CREATE TABLE IF NOT EXISTS daily_questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer_a VARCHAR(255) NOT NULL,
    answer_b VARCHAR(255) NOT NULL,
    answer_c VARCHAR(255) NOT NULL,
    answer_d VARCHAR(255) NOT NULL,
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(100),
    display_date DATE NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User answers for leaderboard
CREATE TABLE IF NOT EXISTS qotd_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES daily_questions(id) ON DELETE CASCADE,
    user_name VARCHAR(100),
    selected_answer CHAR(1) NOT NULL CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_ip VARCHAR(45)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_display_date ON daily_questions(display_date DESC);
CREATE INDEX IF NOT EXISTS idx_answered_at ON qotd_answers(answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_answers ON qotd_answers(question_id);

-- Sample questions
INSERT INTO daily_questions (question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, category, display_date) VALUES
('What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'C', 'Paris has been the capital of France since 508 AD.', 'Geography', CURRENT_DATE),
('Who wrote "Romeo and Juliet"?', 'Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain', 'B', 'William Shakespeare wrote this famous tragedy around 1594-1596.', 'Literature', CURRENT_DATE + INTERVAL '1 day'),
('What year did World War II end?', '1943', '1944', '1945', '1946', 'C', 'World War II ended in 1945 with Japan''s surrender in September.', 'History', CURRENT_DATE + INTERVAL '2 days')
ON CONFLICT (display_date) DO NOTHING;
