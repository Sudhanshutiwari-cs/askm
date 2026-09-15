import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : null

    const supabase = await createClient()

    let query = supabase
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (category && category.toLowerCase() !== 'all') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,excerpt.ilike.%${search}%,author_name.ilike.%${search}%`
      )
    }

    if (limit && !isNaN(limit) && limit > 0) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching blogs from Supabase:', error)
      return NextResponse.json({ blogs: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ blogs: data || [], error: null })
  } catch (err) {
    console.error('Unexpected error in GET /api/blogs:', err)
    return NextResponse.json(
      { blogs: [], error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
