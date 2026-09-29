import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await request.json()
    const { bookingId, previousTherapistId, reason, desiredAttributes, preferredTier = 'professional' } = payload

    if (!bookingId || !reason) {
      return NextResponse.json({ error: 'Booking ID and reason are required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Get patient record
    const { data: patient } = await admin
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    const patientId = patient?.id

    if (!patientId) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    // Insert rematch request
    const { data: rematch, error } = await admin
      .from('rematch_requests')
      .insert({
        booking_id: bookingId,
        patient_id: patientId,
        previous_therapist_id: previousTherapistId || null,
        reason,
        desired_attributes: desiredAttributes || null,
        preferred_tier: preferredTier,
        status: 'pending',
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also record a notification for the admin
    await admin.from('notifications').insert({
      user_id: user.id,
      title: 'Re-match Request Submitted',
      message: 'Your request for a therapist re-match has been submitted. Our clinical care team will assist you within 24 hours.',
    })

    return NextResponse.json({ rematch, error: null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
