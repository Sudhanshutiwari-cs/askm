import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('clinic_settings').select('*').limit(1).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data })
}

export async function PATCH(request: Request) {
  const { id, updates } = await request.json()
  const supabase = createAdminClient()

  let error
  if (id) {
    const res = await supabase.from('clinic_settings').update(updates).eq('id', id)
    error = res.error
  } else {
    const res = await supabase.from('clinic_settings').insert(updates)
    error = res.error
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ error: null })
}
