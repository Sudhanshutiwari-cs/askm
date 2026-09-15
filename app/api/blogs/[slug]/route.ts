import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required', blog: null }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (error) {
      console.error(`Error fetching blog [${slug}]:`, error)
      return NextResponse.json({ error: error.message, blog: null }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Blog not found', blog: null }, { status: 404 })
    }

    return NextResponse.json({ blog: data, error: null })
  } catch (err) {
    console.error('Unexpected error in GET /api/blogs/[slug]:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error', blog: null },
      { status: 500 }
    )
  }
}
