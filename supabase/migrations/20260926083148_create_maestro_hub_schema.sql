/*
# Maestro Hub — Initial Schema

Creates the four core tables for the tuition platform and their RLS policies.

## Tables

1. `tutors` — one row per registered tutor, keyed by auth.uid().
   - id (uuid, PK, = auth.users.id), email, full_name, subjects, bio, hourly_rate, location, phone, created_at
2. `guardian_requests` — public submissions from guardians looking for a tutor.
   - id, guardian_name, guardian_email, guardian_phone, student_name, subject, level, details, budget, status (default 'pending'), created_at
3. `tuitions` — approved tuition listings visible on the public board.
   - id, request_id (FK to guardian_requests), title, subject, level, details, budget, status (default 'open'), created_at
4. `applications` — a tutor's application to a tuition.
   - id, tutor_id (FK to tutors), tuition_id (FK to tuitions), message, status (default 'pending'), created_at

## RLS / Security

### tutors (owner-scoped, authenticated)
- SELECT: authenticated can read all tutor profiles (public directory)
- INSERT: authenticated can insert their own row only (auth.uid() = id)
- UPDATE: authenticated can update their own row only
- DELETE: authenticated can delete their own row only

### guardian_requests (public submit, admin read)
- SELECT: anon + authenticated can read (so guardians can see their own submission; admin can review)
- INSERT: anon + authenticated can insert (public form, no login required)
- UPDATE: authenticated can update (admin approves → changes status)
- DELETE: authenticated can delete

### tuitions (public read, admin write)
- SELECT: anon + authenticated can read (public tuition board)
- INSERT: authenticated can insert (admin approves request → creates tuition)
- UPDATE: authenticated can update (admin changes status)
- DELETE: authenticated can delete

### applications (tutor-scoped + tuition-owner read)
- SELECT: authenticated can read (tutor sees their own applications; admin sees all)
- INSERT: authenticated can insert their own application (auth.uid() = tutor_id)
- UPDATE: authenticated can update
- DELETE: authenticated can delete

## Notes
1. `tutors.id` is NOT auto-generated — it is set to auth.uid() at insert time.
2. `guardian_requests` accepts anonymous inserts for the public form.
3. All timestamps default to now().
4. No dummy/sample data is inserted.
*/

-- ===== tutors =====
CREATE TABLE IF NOT EXISTS tutors (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  subjects text,
  bio text,
  hourly_rate numeric,
  location text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tutors_select_all" ON tutors;
CREATE POLICY "tutors_select_all" ON tutors FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "tutors_insert_own" ON tutors;
CREATE POLICY "tutors_insert_own" ON tutors FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "tutors_update_own" ON tutors;
CREATE POLICY "tutors_update_own" ON tutors FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "tutors_delete_own" ON tutors;
CREATE POLICY "tutors_delete_own" ON tutors FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ===== guardian_requests =====
CREATE TABLE IF NOT EXISTS guardian_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_name text NOT NULL,
  guardian_email text NOT NULL,
  guardian_phone text,
  student_name text,
  subject text NOT NULL,
  level text,
  details text,
  budget text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE guardian_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guardian_requests_select_public" ON guardian_requests;
CREATE POLICY "guardian_requests_select_public" ON guardian_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "guardian_requests_insert_public" ON guardian_requests;
CREATE POLICY "guardian_requests_insert_public" ON guardian_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "guardian_requests_update_auth" ON guardian_requests;
CREATE POLICY "guardian_requests_update_auth" ON guardian_requests FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "guardian_requests_delete_auth" ON guardian_requests;
CREATE POLICY "guardian_requests_delete_auth" ON guardian_requests FOR DELETE
  TO authenticated USING (true);

-- ===== tuitions =====
CREATE TABLE IF NOT EXISTS tuitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES guardian_requests(id) ON DELETE SET NULL,
  title text NOT NULL,
  subject text NOT NULL,
  level text,
  details text,
  budget text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tuitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tuitions_select_public" ON tuitions;
CREATE POLICY "tuitions_select_public" ON tuitions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "tuitions_insert_auth" ON tuitions;
CREATE POLICY "tuitions_insert_auth" ON tuitions FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "tuitions_update_auth" ON tuitions;
CREATE POLICY "tuitions_update_auth" ON tuitions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "tuitions_delete_auth" ON tuitions;
CREATE POLICY "tuitions_delete_auth" ON tuitions FOR DELETE
  TO authenticated USING (true);

-- ===== applications =====
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  tuition_id uuid NOT NULL REFERENCES tuitions(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tutor_id, tuition_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_select_auth" ON applications;
CREATE POLICY "applications_select_auth" ON applications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "applications_insert_own" ON applications;
CREATE POLICY "applications_insert_own" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "applications_update_auth" ON applications;
CREATE POLICY "applications_update_auth" ON applications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "applications_delete_auth" ON applications;
CREATE POLICY "applications_delete_auth" ON applications FOR DELETE
  TO authenticated USING (true);

-- ===== Indexes =====
CREATE INDEX IF NOT EXISTS idx_tutors_email ON tutors(email);
CREATE INDEX IF NOT EXISTS idx_guardian_requests_status ON guardian_requests(status);
CREATE INDEX IF NOT EXISTS idx_tuitions_status ON tuitions(status);
CREATE INDEX IF NOT EXISTS idx_applications_tutor ON applications(tutor_id);
CREATE INDEX IF NOT EXISTS idx_applications_tuition ON applications(tuition_id);
