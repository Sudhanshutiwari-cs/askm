import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { DEFAULT_REELS } from '@/app/api/reels/route'

// GET /api/admin/reels - Fetch all reels for admin management
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('reels')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching admin reels:', error)
      return NextResponse.json({ reels: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reels: data || [], error: null })
  } catch (err) {
    console.error('Unexpected error in GET /api/admin/reels:', err)
    return NextResponse.json(
      { reels: [], error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/reels - Create a new reel or seed defaults
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const supabase = createAdminClient()

    if (action === 'seed') {
      // Seed default reels
      const seedItems = DEFAULT_REELS.map(({ id: _, ...rest }) => ({
        ...rest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { data, error } = await supabase
        .from('reels')
        .insert(seedItems)
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, reels: data })
    }

    const body = await request.json()
    const title = (body.title || '').trim()
    const imageUrl = (body.image_url || '').trim()
    const linkUrl = body.link_url ? body.link_url.trim() : null
    const orderIndex = typeof body.order_index === 'number' ? body.order_index : 0
    const isActive = typeof body.is_active === 'boolean' ? body.is_active : true

    if (!title) {
      return NextResponse.json({ error: 'Title / caption is required' }, { status: 400 })
    }
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('reels')
      .insert({
        title,
        image_url: imageUrl,
        link_url: linkUrl || null,
        order_index: orderIndex,
        is_active: isActive,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reel:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, reel: data })
  } catch (err) {
    console.error('Unexpected error in POST /api/admin/reels:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/reels - Update an existing reel
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, title, image_url, link_url, order_index, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'Reel ID is required' }, { status: 400 })
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof title === 'string') updatePayload.title = title.trim()
    if (typeof image_url === 'string') updatePayload.image_url = image_url.trim()
    if (link_url !== undefined) updatePayload.link_url = link_url ? link_url.trim() : null
    if (typeof order_index === 'number') updatePayload.order_index = order_index
    if (typeof is_active === 'boolean') updatePayload.is_active = is_active

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('reels')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating reel:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, reel: data })
  } catch (err) {
    console.error('Unexpected error in PATCH /api/admin/reels:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/reels - Delete a reel
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Reel ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('reels')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting reel:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/admin/reels:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
