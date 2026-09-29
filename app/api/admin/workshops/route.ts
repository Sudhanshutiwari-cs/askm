import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const admin = createAdminClient()
    const { data: workshops, error } = await admin
      .from('workshops')
      .select('*')
      .order('scheduled_date', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ workshops })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payload = await request.json()
    const {
      title,
      description,
      speakerName,
      tierTarget = 'all',
      scheduledDate,
      startTime,
      endTime,
      meetingUrl,
      materialsUrl,
    } = payload

    if (!title || !speakerName || !scheduledDate || !startTime || !endTime) {
      return NextResponse.json({ error: 'Title, speaker, date, and times are required' }, { status: 400 })
    }

    const { data: workshop, error } = await admin
      .from('workshops')
      .insert({
        title,
        description: description || null,
        speaker_name: speakerName,
        tier_target: tierTarget,
        scheduled_date: scheduledDate,
        start_time: startTime,
        end_time: endTime,
        meeting_url: meetingUrl || null,
        materials_url: materialsUrl || null,
        is_active: true,
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ workshop, error: null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await request.json()
    await admin.from('workshops').delete().eq('id', id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
