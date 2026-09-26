/*
# Add admins table for admin authentication

## New Tables
- `admins`: stores admin user IDs that map to auth.users
  - id (uuid, PK, = auth.users.id)
  - email (text, unique, not null)
  - created_at (timestamptz, default now())

## Security
- RLS enabled on admins
- SELECT: authenticated can read (needed to check if current user is admin)
- INSERT/UPDATE/DELETE: authenticated can modify (admin self-service)
- No dummy data inserted.

## Notes
1. The admin login flow: user signs in via standard Supabase auth, then the app checks if their auth.uid() exists in the admins table.
2. To make someone an admin, insert their auth user id and email into this table.
*/

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_select_auth" ON admins;
CREATE POLICY "admins_select_auth" ON admins FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admins_insert_auth" ON admins;
CREATE POLICY "admins_insert_auth" ON admins FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admins_update_auth" ON admins;
CREATE POLICY "admins_update_auth" ON admins FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admins_delete_auth" ON admins;
CREATE POLICY "admins_delete_auth" ON admins FOR DELETE
  TO authenticated USING (true);
