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
    const { bookingId, therapistId, rating, reviewText, isComplaint = false, complaintDetails } = payload

    if (!bookingId || !therapistId || !rating) {
      return NextResponse.json({ error: 'Missing required feedback fields' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: patient } = await admin
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    const adminFlagged = rating <= 2 || Boolean(isComplaint)

    const { data: feedback, error } = await admin
      .from('client_feedback')
      .insert({
        booking_id: bookingId,
        patient_id: patient.id,
        therapist_id: therapistId,
        rating,
        review_text: reviewText || null,
        is_complaint: Boolean(isComplaint),
        complaint_details: complaintDetails || null,
        admin_flagged: adminFlagged,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If a complaint was flagged, create a helpline ticket automatically for clinical oversight
    if (adminFlagged) {
      const ticketRef = 'HLP-' + Date.now().toString(36).toUpperCase().slice(-5)
      await admin.from('helpline_tickets').insert({
        ticket_ref: ticketRef,
        user_type: 'client',
        user_name: user.email || 'Client',
        user_email: user.email || '',
        subject: `Quality Concern Flagged (Rating: ${rating}/5)`,
        category: 'clinical_quality',
        message: complaintDetails || reviewText || `Client left a low rating of ${rating}/5.`,
        priority: 'high',
        status: 'open',
      })
    }

    return NextResponse.json({ feedback, error: null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
