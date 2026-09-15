import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/newsletter - Fetch newsletter subscribers with search, status filtering, and stats
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim().toLowerCase()
    const status = searchParams.get('status')

    const supabase = createAdminClient()

    // 1. Fetch total counts for statistics
    const { data: allSubscribers, error: countError } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_subscribed')

    if (countError) {
      console.error('Error fetching subscriber counts:', countError)
      return NextResponse.json({ subscribers: [], stats: { total: 0, active: 0, unsubscribed: 0 }, error: countError.message }, { status: 500 })
    }

    const total = allSubscribers?.length || 0
    const active = allSubscribers?.filter((s) => s.is_subscribed).length || 0
    const unsubscribed = total - active

    // 2. Build filtered query for subscribers list
    let query = supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (status === 'active') {
      query = query.eq('is_subscribed', true)
    } else if (status === 'unsubscribed') {
      query = query.eq('is_subscribed', false)
    }

    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching filtered newsletter subscribers:', error)
      return NextResponse.json({ subscribers: [], stats: { total, active, unsubscribed }, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      subscribers: data || [],
      stats: { total, active, unsubscribed },
      error: null,
    })
  } catch (err) {
    console.error('Unexpected error in GET /api/admin/newsletter:', err)
    return NextResponse.json(
      { subscribers: [], stats: { total: 0, active: 0, unsubscribed: 0 }, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/newsletter - Update subscriber status (toggle is_subscribed)
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, is_subscribed } = body

    if (!id || typeof is_subscribed !== 'boolean') {
      return NextResponse.json({ error: 'Subscriber ID and is_subscribed status are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const updatePayload: Record<string, any> = {
      is_subscribed,
      updated_at: now,
    }

    if (is_subscribed) {
      updatePayload.subscribed_at = now
      updatePayload.unsubscribed_at = null
    } else {
      updatePayload.unsubscribed_at = now
    }

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscriber status:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, subscriber: data })
  } catch (err) {
    console.error('Unexpected error in PATCH /api/admin/newsletter:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/newsletter - Delete a subscriber
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting subscriber:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/admin/newsletter:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
