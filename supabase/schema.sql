-- Supabase Schema for Forge 90-Day Program

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create forge_programs table
CREATE TABLE IF NOT EXISTS forge_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    current_day INTEGER DEFAULT 1 CHECK (current_day >= 0 AND current_day <= 90),
    failed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    reset_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, started_at)
);

-- Create daily_logs table
CREATE TABLE IF NOT EXISTS daily_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES forge_programs(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 90),
    checks JSONB DEFAULT '{}',
    custom_tasks JSONB DEFAULT '{}',
    steps_actual INTEGER,
    notes TEXT DEFAULT '',
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(program_id, date),
    UNIQUE(program_id, day_number)
);

-- Create indexes
CREATE INDEX idx_forge_programs_user_id ON forge_programs(user_id);
CREATE INDEX idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX idx_daily_logs_program_id ON daily_logs(program_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(date);

-- Enable Row Level Security
ALTER TABLE forge_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forge_programs
CREATE POLICY "Users can view their own programs" ON forge_programs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own programs" ON forge_programs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs" ON forge_programs
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for daily_logs
CREATE POLICY "Users can view their own logs" ON daily_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs" ON daily_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs" ON daily_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_forge_programs_updated_at BEFORE UPDATE ON forge_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get or create active program
CREATE OR REPLACE FUNCTION get_or_create_active_program(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_program_id UUID;
    v_last_log_date DATE;
    v_current_day INTEGER;
BEGIN
    -- Get the most recent active program
    SELECT id, current_day INTO v_program_id, v_current_day
    FROM forge_programs
    WHERE user_id = p_user_id
      AND failed_at IS NULL
      AND completed_at IS NULL
    ORDER BY started_at DESC
    LIMIT 1;

    -- If no active program, create one
    IF v_program_id IS NULL THEN
        INSERT INTO forge_programs (user_id)
        VALUES (p_user_id)
        RETURNING id INTO v_program_id;
    ELSE
        -- Check if the last log was yesterday (to increment day)
        SELECT MAX(date) INTO v_last_log_date
        FROM daily_logs
        WHERE program_id = v_program_id;

        -- If last log was yesterday, increment the day counter
        IF v_last_log_date = CURRENT_DATE - INTERVAL '1 day' THEN
            UPDATE forge_programs
            SET current_day = current_day + 1
            WHERE id = v_program_id;
        END IF;
    END IF;

    RETURN v_program_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and reset program if incomplete
CREATE OR REPLACE FUNCTION check_and_reset_program(p_program_id UUID)
RETURNS VOID AS $$
DECLARE
    v_log_date DATE;
    v_completed BOOLEAN;
BEGIN
    -- Get yesterday's log
    SELECT date, completed INTO v_log_date, v_completed
    FROM daily_logs
    WHERE program_id = p_program_id
      AND date = CURRENT_DATE - INTERVAL '1 day';

    -- If yesterday's tasks were not completed, fail the program
    IF v_log_date IS NOT NULL AND NOT v_completed THEN
        UPDATE forge_programs
        SET failed_at = NOW()
        WHERE id = p_program_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;