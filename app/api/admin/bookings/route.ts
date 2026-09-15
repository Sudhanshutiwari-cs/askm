import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createAdminClient()

  // 1. Fetch bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*, therapists(first_name, last_name)')
    .order('created_at', { ascending: false })

  if (bookingsError) {
    // If relational query has an issue, fallback to flat query and merge
    const { data: flatBookings, error: flatError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (flatError) {
      return NextResponse.json({ error: flatError.message, bookings: [] }, { status: 500 })
    }

    const { data: allTherapists } = await supabase
      .from('therapists')
      .select('id, first_name, last_name')

    const tMap = new Map((allTherapists ?? []).map((t) => [t.id, t]))

    const enriched = (flatBookings ?? []).map((b) => {
      const t = b.therapist_id ? tMap.get(b.therapist_id) : null
      const therapistData = t ? { first_name: t.first_name, last_name: t.last_name } : null
      return {
        ...b,
        therapist: therapistData,
        therapists: therapistData,
      }
    })

    return NextResponse.json({ bookings: enriched })
  }

  // 2. Fetch any missing therapists if join missed any therapist_id
  const missingIds = Array.from(
    new Set(
      (bookings ?? [])
        .filter((b: any) => (!b.therapists || !b.therapists.first_name) && b.therapist_id)
        .map((b: any) => b.therapist_id)
    )
  )

  let fallbackMap = new Map<string, { first_name: string; last_name: string }>()
  if (missingIds.length > 0) {
    const { data: extraTherapists } = await supabase
      .from('therapists')
      .select('id, first_name, last_name')
      .in('id', missingIds)

    fallbackMap = new Map((extraTherapists ?? []).map((t) => [t.id, { first_name: t.first_name, last_name: t.last_name }]))
  }

  const enriched = (bookings ?? []).map((b: any) => {
    const t = b.therapists || (b.therapist_id ? fallbackMap.get(b.therapist_id) : null)
    const therapistData = t ? { first_name: t.first_name, last_name: t.last_name } : null
    return {
      ...b,
      therapist: therapistData,
      therapists: therapistData,
    }
  })

  return NextResponse.json({ bookings: enriched })
}

export async function PATCH(request: Request) {
  const { id, status } = await request.json()
  const supabase = createAdminClient()
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ error: null })
}
