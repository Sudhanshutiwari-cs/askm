-- ============================================================================
-- ASTSANKHLAM PHASE 2 CORE PLATFORM WORKFLOW MIGRATION
-- Supporting: Client Journey + Professional Journey + Founder/Admin Journey
-- ============================================================================

-- 1. Extend `therapists` table with Phase 2 attributes
ALTER TABLE public.therapists
  ADD COLUMN IF NOT EXISTS tier VARCHAR(30) DEFAULT 'professional' CHECK (tier IN ('professional', 'intern')),
  ADD COLUMN IF NOT EXISTS verified_domains TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS session_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS registration_no TEXT,
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5, 2) DEFAULT 25.00,
  ADD COLUMN IF NOT EXISTS astsankhlam_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;

-- Ensure existing therapist has default tier and astsankhlam_id if missing
UPDATE public.therapists
SET 
  tier = COALESCE(tier, 'professional'),
  verified_domains = CASE WHEN verified_domains IS NULL OR verified_domains = '{}' THEN ARRAY['General Counseling', 'CBT'] ELSE verified_domains END,
  astsankhlam_id = COALESCE(astsankhlam_id, 'AST-TH-' || UPPER(SUBSTRING(id::text, 1, 6)))
WHERE astsankhlam_id IS NULL;

-- 2. Extend `session_notes` table for 30-min structured clinical documentation
ALTER TABLE public.session_notes
  ADD COLUMN IF NOT EXISTS core_concerns TEXT,
  ADD COLUMN IF NOT EXISTS observations TEXT,
  ADD COLUMN IF NOT EXISTS tools_journals TEXT,
  ADD COLUMN IF NOT EXISTS homework TEXT,
  ADD COLUMN IF NOT EXISTS dos_donts TEXT,
  ADD COLUMN IF NOT EXISTS next_session_focus TEXT,
  ADD COLUMN IF NOT EXISTS client_visible BOOLEAN DEFAULT true;

-- 3. Create `professional_applications` table for therapists & interns public application
CREATE TABLE IF NOT EXISTS public.professional_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  tier VARCHAR(30) NOT NULL CHECK (tier IN ('professional', 'intern')),
  degree_title TEXT NOT NULL,
  degree_serial_no TEXT,
  university TEXT,
  license_number TEXT,
  experience_years INT DEFAULT 0,
  languages TEXT[] DEFAULT '{"English"}',
  domains TEXT[] DEFAULT '{}',
  bio TEXT,
  resume_url TEXT,
  certificate_urls TEXT[] DEFAULT '{}',
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create `client_intakes` table for Step 2 Safety triage + Step 4 confidential intake
CREATE TABLE IF NOT EXISTS public.client_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  has_crisis_flag BOOLEAN DEFAULT false,
  support_tier VARCHAR(30) DEFAULT 'professional' CHECK (support_tier IN ('professional', 'intern')),
  primary_concerns TEXT[] DEFAULT '{}',
  distress_duration TEXT,
  prior_therapy_experience TEXT,
  preferred_language TEXT DEFAULT 'English',
  preferred_gender TEXT DEFAULT 'any',
  goals_summary TEXT,
  matched_therapist_ids UUID[] DEFAULT '{}',
  selected_therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create `rematch_requests` table for Step 11 Client Re-match
CREATE TABLE IF NOT EXISTS public.rematch_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  previous_therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  desired_attributes TEXT,
  preferred_tier VARCHAR(30) DEFAULT 'professional',
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'resolved', 'cancelled')),
  new_therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
  admin_resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create `client_feedback` table for Step 10 post-session review & quality monitoring
CREATE TABLE IF NOT EXISTS public.client_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_complaint BOOLEAN DEFAULT false,
  complaint_details TEXT,
  admin_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create `helpline_tickets` table for client & therapist helpline / support requests
CREATE TABLE IF NOT EXISTS public.helpline_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_ref TEXT UNIQUE NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('client', 'therapist', 'guest')),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  subject TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Create `workshops` table for Admin-scheduled weekly meetings & intern training
CREATE TABLE IF NOT EXISTS public.workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  speaker_name TEXT NOT NULL,
  tier_target VARCHAR(30) DEFAULT 'all' CHECK (tier_target IN ('all', 'professional', 'intern')),
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  meeting_url TEXT,
  materials_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_therapists_tier ON public.therapists(tier);
CREATE INDEX IF NOT EXISTS idx_therapists_is_active ON public.therapists(is_active);
CREATE INDEX IF NOT EXISTS idx_client_intakes_booking ON public.client_intakes(booking_id);
CREATE INDEX IF NOT EXISTS idx_rematch_patient ON public.rematch_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_feedback_therapist ON public.client_feedback(therapist_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.helpline_tickets(status);
CREATE INDEX IF NOT EXISTS idx_workshops_date ON public.workshops(scheduled_date);
