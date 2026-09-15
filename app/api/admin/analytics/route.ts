import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createAdminClient()

  const [bookingsRes, paymentsRes, therapistsRes, patientsRes] = await Promise.all([
    supabase.from('bookings').select('booking_date, status, amount, therapist_id'),
    supabase.from('payments').select('amount, status, created_at'),
    supabase.from('therapists').select('id, first_name, last_name'),
    supabase.from('patients').select('id, created_at'),
  ])

  return NextResponse.json({
    bookings: bookingsRes.data ?? [],
    payments: paymentsRes.data ?? [],
    therapists: therapistsRes.data ?? [],
    patients: patientsRes.data ?? [],
  })
}
