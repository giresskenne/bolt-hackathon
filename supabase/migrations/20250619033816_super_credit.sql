/*
  # Fix RLS policies for users table

  1. Security
    - Enable RLS on `users` table
    - Add policy for anonymous users to insert (signup)
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to update their own data

  2. Changes
    - Fixed type mismatch in RLS policies by removing unnecessary text casting
    - Both auth.uid() and id are uuid types, so no casting needed
*/

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert new records (for signup)
CREATE POLICY "Allow anonymous signup"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);