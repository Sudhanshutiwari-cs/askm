import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: rematches, error } = await admin
      .from('rematch_requests')
      .select(`
        *,
        patients(first_name, last_name, email, phone),
        therapists:previous_therapist_id(first_name, last_name, tier),
        new_therapist:new_therapist_id(first_name, last_name)
      `)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ rematches })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { rematchId, newTherapistId, status = 'resolved', adminResolutionNotes } = await request.json()

    if (!rematchId) {
      return NextResponse.json({ error: 'Rematch ID is required' }, { status: 400 })
    }

    const { data: updated, error } = await admin
      .from('rematch_requests')
      .update({
        new_therapist_id: newTherapistId || null,
        status,
        admin_resolution_notes: adminResolutionNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rematchId)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ rematch: updated, error: null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
