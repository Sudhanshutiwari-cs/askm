import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { DEFAULT_HEROES } from '@/app/api/heroes/route'

// GET /api/admin/heroes - Fetch all page hero image configurations
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')
      .order('page_name', { ascending: true })

    const heroesMap: Record<string, any> = { ...DEFAULT_HEROES }

    if (!error && data && Array.isArray(data)) {
      data.forEach((row) => {
        if (row.page_key) {
          heroesMap[row.page_key] = {
            id: row.id,
            page_key: row.page_key,
            page_name: row.page_name || DEFAULT_HEROES[row.page_key]?.page_name,
            image_url: row.image_url,
            secondary_image_url: row.secondary_image_url,
            alt_text: row.alt_text,
            updated_at: row.updated_at,
          }
        }
      })
    }

    return NextResponse.json({ heroes: Object.values(heroesMap) })
  } catch (err) {
    console.error('Error in GET /api/admin/heroes:', err)
    return NextResponse.json(
      { heroes: Object.values(DEFAULT_HEROES), error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/heroes - Update a page hero image
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { page_key, image_url, secondary_image_url, alt_text } = body

    if (!page_key || !image_url) {
      return NextResponse.json({ error: 'Page key and image URL are required' }, { status: 400 })
    }

    const defaultConf = DEFAULT_HEROES[page_key]
    if (!defaultConf) {
      return NextResponse.json({ error: `Unknown page key: ${page_key}` }, { status: 400 })
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('hero_images')
      .upsert(
        {
          page_key,
          page_name: defaultConf.page_name,
          image_url: image_url.trim(),
          secondary_image_url: secondary_image_url ? secondary_image_url.trim() : null,
          alt_text: alt_text ? alt_text.trim() : defaultConf.alt_text,
          updated_at: now,
        },
        { onConflict: 'page_key' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error updating hero image:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, hero: data })
  } catch (err) {
    console.error('Unexpected error in PATCH /api/admin/heroes:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/heroes?action=reset - Reset heroes to initial defaults
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'reset') {
      const supabase = createAdminClient()
      const rowsToInsert = Object.values(DEFAULT_HEROES).map((h) => ({
        page_key: h.page_key,
        page_name: h.page_name,
        image_url: h.image_url,
        secondary_image_url: h.secondary_image_url,
        alt_text: h.alt_text,
        updated_at: new Date().toISOString(),
      }))

      const { data, error } = await supabase
        .from('hero_images')
        .upsert(rowsToInsert, { onConflict: 'page_key' })
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, heroes: data })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Error resetting heroes:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
