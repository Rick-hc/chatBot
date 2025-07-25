-- Initialize PostgreSQL database for chatbot system
-- This script sets up the basic table structure

-- Create feedback table for user interactions
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    qa_id VARCHAR(255) NOT NULL,
    user_question TEXT,
    selected_answer TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create qa_data table for storing questions and answers
CREATE TABLE IF NOT EXISTS qa_data (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    tags JSONB,
    embedding JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_qa_id ON feedback(qa_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_qa_data_question ON qa_data USING gin(to_tsvector('english', question));
CREATE INDEX IF NOT EXISTS idx_qa_data_category ON qa_data(category);
CREATE INDEX IF NOT EXISTS idx_qa_data_created_at ON qa_data(created_at);

-- Insert sample data (optional)
INSERT INTO qa_data (id, question, answer, category, tags) VALUES 
(1, 'What is machine learning?', 'Machine learning is a method of data analysis that automates analytical model building.', 'Technology', '["AI", "ML", "Technology"]'),
(2, 'How does artificial intelligence work?', 'Artificial intelligence works by using algorithms and statistical models to perform tasks without explicit instructions.', 'Technology', '["AI", "Technology"]'),
(3, 'What is deep learning?', 'Deep learning is a subset of machine learning that uses neural networks with multiple layers.', 'Technology', '["AI", "Deep Learning", "Neural Networks"]'),
(4, 'Explain neural networks', 'Neural networks are computing systems inspired by biological neural networks that process information.', 'Technology', '["Neural Networks", "AI"]'),
(5, 'What is natural language processing?', 'Natural language processing is a branch of AI that helps computers understand and process human language.', 'Technology', '["NLP", "AI", "Language"]')
ON CONFLICT (id) DO NOTHING;

-- Grant appropriate permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chatbot_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO chatbot_user;