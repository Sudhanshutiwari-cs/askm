import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const therapistId = searchParams.get('therapistId')
  if (!therapistId) return NextResponse.json({ slots: [] })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('booking_date, start_time')
    .eq('therapist_id', therapistId)
    .in('status', ['pending', 'confirmed'])

  if (error) return NextResponse.json({ slots: [] })
  return NextResponse.json({ slots: data ?? [] })
}
