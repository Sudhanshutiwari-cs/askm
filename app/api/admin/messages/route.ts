import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/messages - Fetch contact messages with filtering and stats
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim().toLowerCase()
    const filter = searchParams.get('filter') // 'all' | 'unread' | 'read'

    const supabase = createAdminClient()

    // 1. Fetch counts
    const { data: allMessages, error: countError } = await supabase
      .from('contact_messages')
      .select('id, is_read')

    if (countError) {
      console.error('Error fetching message counts:', countError)
      return NextResponse.json({ messages: [], stats: { total: 0, unread: 0 }, error: countError.message }, { status: 500 })
    }

    const total = allMessages?.length || 0
    const unread = allMessages?.filter((m) => !m.is_read).length || 0

    // 2. Query messages
    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter === 'unread') {
      query = query.eq('is_read', false)
    } else if (filter === 'read') {
      query = query.eq('is_read', true)
    }

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching contact messages:', error)
      return NextResponse.json({ messages: [], stats: { total, unread }, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      messages: data || [],
      stats: { total, unread },
      error: null,
    })
  } catch (err) {
    console.error('Unexpected error in GET /api/admin/messages:', err)
    return NextResponse.json(
      { messages: [], stats: { total: 0, unread: 0 }, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/messages - Update is_read status
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, is_read } = body

    if (!id || typeof is_read !== 'boolean') {
      return NextResponse.json({ error: 'Message ID and is_read status are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ is_read })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating message status:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: data })
  } catch (err) {
    console.error('Unexpected error in PATCH /api/admin/messages:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/messages - Delete a message
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting contact message:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/admin/messages:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
