import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const supabase = createAdminClient()

    const {
      hasCrisisFlag = false,
      supportTier = 'professional',
      primaryConcerns = [],
      distressDuration = '',
      priorTherapyExperience = '',
      preferredLanguage = 'English',
      preferredGender = 'any',
      clientName = 'Guest',
      clientEmail = '',
      clientPhone = '',
    } = payload

    // 1. Query therapists filtered by tier and active status
    let query = supabase
      .from('therapists')
      .select('id, user_id, username, first_name, last_name, email, phone, photo_url, bio, qualifications, specializations, verified_domains, experience_years, consultation_fee, languages, gender, is_active, tier, session_count, astsankhlam_id, is_verified')
      .eq('is_active', true)

    if (supportTier) {
      query = query.eq('tier', supportTier)
    }

    const { data: allTherapists, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 2. Score & rank matching therapists based on concerns, language, and gender
    const scoredTherapists = (allTherapists || []).map((t) => {
      let matchScore = 10 // base score

      // Language match (+15)
      if (
        t.languages &&
        Array.isArray(t.languages) &&
        t.languages.some((l: string) => l.toLowerCase() === preferredLanguage.toLowerCase())
      ) {
        matchScore += 15
      }

      // Gender preference match (+10)
      if (preferredGender !== 'any' && t.gender) {
        if (t.gender.toLowerCase() === preferredGender.toLowerCase()) {
          matchScore += 10
        }
      }

      // Concern / Specialization overlap (+8 per domain)
      const therapistDomains = [
        ...(Array.isArray(t.specializations) ? t.specializations : []),
        ...(Array.isArray(t.verified_domains) ? t.verified_domains : []),
      ].map((s: string) => s.toLowerCase())

      if (Array.isArray(primaryConcerns)) {
        primaryConcerns.forEach((concern: string) => {
          if (therapistDomains.some((d) => d.includes(concern.toLowerCase()) || concern.toLowerCase().includes(d))) {
            matchScore += 12
          }
        })
      }

      // Verified badge bonus (+5)
      if (t.is_verified) {
        matchScore += 5
      }

      return {
        ...t,
        matchScore,
      }
    })

    // Sort descending by matchScore, then by experience
    scoredTherapists.sort((a, b) => b.matchScore - a.matchScore || b.experience_years - a.experience_years)

    // 3. Save intake record for clinical continuity
    let intakeId = null
    if (clientEmail) {
      const { data: intakeRecord } = await supabase
        .from('client_intakes')
        .insert({
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone || null,
          has_crisis_flag: Boolean(hasCrisisFlag),
          support_tier: supportTier,
          primary_concerns: primaryConcerns,
          distress_duration: distressDuration || null,
          prior_therapy_experience: priorTherapyExperience || null,
          preferred_language: preferredLanguage,
          preferred_gender: preferredGender,
          matched_therapist_ids: scoredTherapists.slice(0, 5).map((t) => t.id),
        })
        .select('id')
        .maybeSingle()

      intakeId = intakeRecord?.id ?? null
    }

    return NextResponse.json({
      intakeId,
      hasCrisisFlag,
      matches: scoredTherapists,
      totalMatched: scoredTherapists.length,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to process intake' }, { status: 500 })
  }
}
