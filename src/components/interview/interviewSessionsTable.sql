
-- Create interview_sessions table schema
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  answers JSONB NOT NULL DEFAULT '[]',
  feedback JSONB NOT NULL DEFAULT '[]',
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Add Row Level Security
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own interview sessions
CREATE POLICY "Users can view their own interview sessions"
  ON public.interview_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to create their own interview sessions
CREATE POLICY "Users can create their own interview sessions"
  ON public.interview_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own interview sessions
CREATE POLICY "Users can update their own interview sessions"
  ON public.interview_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_created_at ON public.interview_sessions(created_at);

-- Comment on table
COMMENT ON TABLE public.interview_sessions IS 'Stores user interview practice sessions';
