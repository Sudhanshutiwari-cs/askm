import { createAdminClient } from '@/lib/supabase/server'
import { sendBookingEmail } from '@/lib/email'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { format } from 'date-fns'

function generateUsername(name: string): string {
  const letters = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase().padEnd(4, 'X')
  return `${letters}ASKM`
}

function generateRef(): string {
  return 'BK' + Date.now().toString(36).toUpperCase().slice(-6)
}

function generateMeetLink(bookingRef: string): string {
  return `https://meet.jit.si/Astsankhlam-${bookingRef}-${crypto.randomBytes(8).toString('hex')}`
}

async function createPatientAccount(name: string, email: string, phone: string | null) {
  const supabase = createAdminClient()
  const username = generateUsername(name)
  const password = username
  const parts = name.trim().split(/\s+/)
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ') || ''

  const { data: existingPatient } = await supabase
    .from('patients')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingPatient) {
    return { credentials: null, patientId: existingPatient.id, error: null }
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'patient', first_name: firstName, last_name: lastName },
  })

  if (authError && !authError.message.includes('already been registered')) {
    return { credentials: null, patientId: null, error: authError.message }
  }

  const { data: newPatient, error: patientError } = await supabase
    .from('patients')
    .insert({
      user_id: authData?.user?.id ?? null,
      username,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      is_active: true,
    })
    .select('id')
    .single()

  if (patientError) {
    const { data: fallback } = await supabase.from('patients').select('id').eq('email', email).maybeSingle()
    return { credentials: null, patientId: fallback?.id ?? null, error: fallback ? null : patientError.message }
  }

  return { credentials: { username, password, email }, patientId: newPatient.id, error: null }
}

export async function POST(request: Request) {
  const payload = await request.json()
  const supabase = createAdminClient()

  const { data: therapist, error: therapistError } = await supabase
    .from('therapists')
    .select('first_name, last_name, consultation_fee')
    .eq('id', payload.therapistId)
    .eq('is_active', true)
    .single()

  if (therapistError || !therapist) {
    return NextResponse.json({ error: 'The selected therapist is unavailable.' }, { status: 400 })
  }

  const amount = Number(therapist.consultation_fee ?? 0)
  const payment = payload.payment

  if (amount > 0) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret || !payment?.orderId || !payment?.paymentId || !payment?.signature) {
      return NextResponse.json({ error: 'A successful payment is required before booking.' }, { status: 402 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${payment.orderId}|${payment.paymentId}`)
      .digest('hex')

    const expectedBuffer = Buffer.from(expectedSignature)
    const receivedBuffer = Buffer.from(String(payment.signature))
    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return NextResponse.json({ error: 'Payment verification failed. No booking was created.' }, { status: 400 })
    }
  }

  const { credentials, patientId, error: patientError } = await createPatientAccount(
    payload.patientName,
    payload.patientEmail,
    payload.patientPhone,
  )

  if (patientError || !patientId) {
    return NextResponse.json({ error: patientError ?? 'Could not create patient account.' }, { status: 500 })
  }

  const bookingRef = generateRef()
  const meetLink = generateMeetLink(bookingRef)
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      booking_ref: bookingRef,
      therapist_id: payload.therapistId,
      patient_id: patientId,
      patient_name: payload.patientName,
      patient_email: payload.patientEmail,
      patient_phone: payload.patientPhone,
      booking_date: payload.date,
      start_time: payload.startTime,
      end_time: payload.endTime,
      amount,
      notes: payload.notes,
      status: 'confirmed',
      payment_status: amount > 0 ? 'paid' : 'not_required',
      meet_link: meetLink,
    })
    .select('id')
    .single()

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 })
  }

  if (amount > 0) {
    await supabase.from('payments').insert({
      booking_id: booking.id,
      patient_id: patientId,
      razorpay_order_id: payment.orderId,
      razorpay_payment_id: payment.paymentId,
      amount,
      currency: 'INR',
      status: 'success',
      payment_method: 'razorpay',
    })
  }

  let appointmentDate = payload.date
  try {
    appointmentDate = format(new Date(payload.date), 'EEEE, MMMM d, yyyy')
  } catch {}

  const emailResult = await sendBookingEmail({
    toEmail: payload.patientEmail,
    patientName: payload.patientName,
    bookingRef,
    therapistName: `Dr. ${therapist.first_name} ${therapist.last_name}`,
    appointmentDate,
    appointmentTime: payload.startTime?.slice(0, 5) ?? '',
    meetLink,
    amount,
    username: credentials?.username,
    password: credentials?.password,
  })

  if (!emailResult.sent) {
    console.log('[v0] Booking confirmation email not sent:', emailResult.error)
  }

  return NextResponse.json({ bookingRef, bookingId: booking.id, patientId, credentials, error: null })
}
