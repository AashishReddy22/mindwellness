/*
  # Mental Wellness App Schema

  1. New Tables
    - `user_profiles` - Extended user profile with preferences
    - `moods` - Available moods in the system
    - `user_moods` - User mood history and tracking
    - `games` - Available games
    - `game_sessions` - User game play history
    - `music_playlists` - Mood-based music playlists
    - `user_progress` - Progress tracking and achievements
    - `daily_routines` - User daily routine completion tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create moods table
CREATE TABLE IF NOT EXISTS moods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  emoji text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL,
  difficulty text DEFAULT 'easy',
  duration_seconds integer DEFAULT 180,
  emoji text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create music playlists table
CREATE TABLE IF NOT EXISTS music_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mood_id uuid REFERENCES moods(id),
  description text,
  songs text DEFAULT '[]',
  cover_url text,
  created_at timestamptz DEFAULT now()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text,
  goals text DEFAULT '[]',
  music_preferences text DEFAULT '[]',
  onboarding_complete boolean DEFAULT false,
  preferred_theme text DEFAULT 'dark',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user moods table
CREATE TABLE IF NOT EXISTS user_moods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_id uuid NOT NULL REFERENCES moods(id),
  timestamp timestamptz DEFAULT now(),
  notes text
);

-- Create game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES games(id),
  mood_before_id uuid REFERENCES moods(id),
  mood_after_id uuid REFERENCES moods(id),
  score integer DEFAULT 0,
  duration_seconds integer,
  completed boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create user progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_games_played integer DEFAULT 0,
  total_music_sessions integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  last_activity timestamptz,
  achievements text DEFAULT '[]',
  emotional_balance_score integer DEFAULT 50,
  updated_at timestamptz DEFAULT now()
);

-- Create daily routines table
CREATE TABLE IF NOT EXISTS daily_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  mood_check_completed boolean DEFAULT false,
  game_completed boolean DEFAULT false,
  music_session_completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_routines ENABLE ROW LEVEL SECURITY;

-- Policies for moods (public read)
CREATE POLICY "Moods are readable by everyone"
  ON moods FOR SELECT
  TO authenticated
  USING (true);

-- Policies for games (public read)
CREATE POLICY "Games are readable by everyone"
  ON games FOR SELECT
  TO authenticated
  USING (true);

-- Policies for music playlists (public read)
CREATE POLICY "Music playlists are readable by everyone"
  ON music_playlists FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policies for user moods
CREATE POLICY "Users can read own moods"
  ON user_moods FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own moods"
  ON user_moods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for game sessions
CREATE POLICY "Users can read own game sessions"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game sessions"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game sessions"
  ON game_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for user progress
CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for daily routines
CREATE POLICY "Users can read own daily routines"
  ON daily_routines FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily routines"
  ON daily_routines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily routines"
  ON daily_routines FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert initial moods
INSERT INTO moods (name, emoji, color) VALUES
  ('Calm', '🧘', '#C7CEEA'),
  ('Happy', '😊', '#FFC0CB'),
  ('Sad', '😢', '#B4E7FF'),
  ('Anxious', '😰', '#FFE4B5'),
  ('Angry', '😠', '#FFB6C6'),
  ('Focused', '🎯', '#D4FFFF'),
  ('Low Energy', '😑', '#E6E6FA')
ON CONFLICT DO NOTHING;

-- Insert initial games
INSERT INTO games (name, description, type, duration_seconds, emoji, color) VALUES
  ('Pattern Match', 'Match pairs of patterns to improve focus', 'focus', 180, '🧩', '#C7CEEA'),
  ('Memory Cards', 'Remember and match the cards', 'memory', 240, '🎴', '#FFC0CB'),
  ('Breathing Sync', 'Sync your breathing with visual cues', 'emotion', 300, '💨', '#B4E7FF'),
  ('Tap Rhythm', 'Tap along with the rhythm for stress relief', 'relief', 180, '🎵', '#FFE4B5'),
  ('Word Recall', 'Recall words from memory', 'memory', 200, '📝', '#D4FFFF'),
  ('Emotion Respond', 'Choose wise responses to scenarios', 'emotion', 240, '💭', '#E6E6FA')
ON CONFLICT DO NOTHING;

-- Insert mood-based playlists
INSERT INTO music_playlists (name, mood_id, description, songs) 
SELECT 'Calm Vibes', id, 'Relaxing instrumental and lo-fi tracks', '["Lo-fi Study", "Ambient Dreams", "Piano Peace"]' FROM moods WHERE name = 'Calm'
ON CONFLICT DO NOTHING;

INSERT INTO music_playlists (name, mood_id, description, songs) 
SELECT 'Happy Moments', id, 'Uplifting pop and indie tracks', '["Good Vibes", "Sunshine Pop", "Feel Good"]' FROM moods WHERE name = 'Happy'
ON CONFLICT DO NOTHING;

INSERT INTO music_playlists (name, mood_id, description, songs) 
SELECT 'Emotional Flow', id, 'Soft and reflective songs', '["Piano Reflections", "Acoustic Heart", "Gentle Rain"]' FROM moods WHERE name = 'Sad'
ON CONFLICT DO NOTHING;

INSERT INTO music_playlists (name, mood_id, description, songs) 
SELECT 'Focus Zone', id, 'Classical and lo-fi beats for concentration', '["Deep Focus", "Classical Study", "Beat Focus"]' FROM moods WHERE name = 'Focused'
ON CONFLICT DO NOTHING;