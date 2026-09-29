export type SupportTier = 'professional' | 'intern'

export interface Therapist {
  id: string
  user_id?: string | null
  username?: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  photo_url?: string | null
  bio: string | null
  qualifications?: string | null
  specializations: string[] | null
  languages: string[] | null
  experience_years: number
  consultation_fee: number
  gender: string | null
  is_active: boolean
  tier: SupportTier
  verified_domains: string[]
  session_count: number
  registration_no?: string | null
  commission_rate: number
  astsankhlam_id?: string | null
  is_verified: boolean
}

export interface ProfessionalApplication {
  id: string
  full_name: string
  email: string
  phone: string
  tier: SupportTier
  degree_title: string
  degree_serial_no?: string | null
  university?: string | null
  license_number?: string | null
  experience_years: number
  languages: string[]
  domains: string[]
  bio?: string | null
  resume_url?: string | null
  certificate_urls: string[]
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  admin_notes?: string | null
  created_at: string
  updated_at: string
}

export interface ClientIntake {
  id: string
  booking_id?: string | null
  patient_id?: string | null
  client_name: string
  client_email: string
  client_phone?: string | null
  has_crisis_flag: boolean
  support_tier: SupportTier
  primary_concerns: string[]
  distress_duration?: string | null
  prior_therapy_experience?: string | null
  preferred_language: string
  preferred_gender: string
  goals_summary?: string | null
  matched_therapist_ids: string[]
  selected_therapist_id?: string | null
  created_at: string
}

export interface StructuredSessionNote {
  id: string
  booking_id: string
  therapist_id: string
  notes?: string | null
  prescription?: string | null
  follow_up_date?: string | null
  core_concerns?: string | null
  observations?: string | null
  tools_journals?: string | null
  homework?: string | null
  dos_donts?: string | null
  next_session_focus?: string | null
  client_visible: boolean
  created_at: string
  bookings?: {
    booking_ref: string
    patient_name: string
    booking_date: string
    start_time?: string
  } | null
}

export interface RematchRequest {
  id: string
  booking_id: string
  patient_id: string
  previous_therapist_id?: string | null
  reason: string
  desired_attributes?: string | null
  preferred_tier: string
  status: 'pending' | 'matched' | 'resolved' | 'cancelled'
  new_therapist_id?: string | null
  admin_resolution_notes?: string | null
  created_at: string
  updated_at: string
  patients?: {
    first_name: string
    last_name: string
    email: string
  } | null
  therapists?: {
    first_name: string
    last_name: string
  } | null
}

export interface ClientFeedback {
  id: string
  booking_id: string
  patient_id: string
  therapist_id: string
  rating: number
  review_text?: string | null
  is_complaint: boolean
  complaint_details?: string | null
  admin_flagged: boolean
  created_at: string
}

export interface HelplineTicket {
  id: string
  ticket_ref: string
  user_type: 'client' | 'therapist' | 'guest'
  user_name: string
  user_email: string
  user_phone?: string | null
  subject: string
  category: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  admin_notes?: string | null
  created_at: string
  updated_at: string
}

export interface Workshop {
  id: string
  title: string
  description?: string | null
  speaker_name: string
  tier_target: 'all' | 'professional' | 'intern'
  scheduled_date: string
  start_time: string
  end_time: string
  meeting_url?: string | null
  materials_url?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
