import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { BlogStatus } from '@/types/blog'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

// GET /api/admin/blogs - Get all blogs (including draft and archived)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    const supabase = createAdminClient()
    let query = supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,excerpt.ilike.%${search}%,author_name.ilike.%${search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching admin blogs:', error)
      return NextResponse.json({ blogs: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ blogs: data || [], error: null })
  } catch (err) {
    console.error('Unexpected error in GET /api/admin/blogs:', err)
    return NextResponse.json(
      { blogs: [], error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/blogs - Create a new blog
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      slug: customSlug,
      category,
      excerpt,
      content,
      author_name = 'Dipanita Biswas',
      author_image,
      featured_image,
      status = 'draft',
      read_time: customReadTime,
      published_at,
    } = body

    if (!title?.trim()) {
      return NextResponse.json({ blog: null, error: 'Title is required' }, { status: 400 })
    }
    if (!category?.trim()) {
      return NextResponse.json({ blog: null, error: 'Category is required' }, { status: 400 })
    }
    if (!content?.trim()) {
      return NextResponse.json({ blog: null, error: 'Content is required' }, { status: 400 })
    }

    const slug = (customSlug?.trim() || generateSlug(title))
    const read_time = customReadTime && Number(customReadTime) > 0
      ? Number(customReadTime)
      : estimateReadTime(content)

    const supabase = createAdminClient()

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('blogs')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { blog: null, error: `A blog post with slug "${slug}" already exists.` },
        { status: 400 }
      )
    }

    const validStatus: BlogStatus = ['draft', 'published', 'archived'].includes(status)
      ? status
      : 'draft'

    const now = new Date().toISOString()
    const publishDate = published_at || now

    const { data: newBlog, error } = await supabase
      .from('blogs')
      .insert({
        title: title.trim(),
        slug,
        category: category.trim(),
        read_time,
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        author_name: author_name.trim(),
        author_image: author_image?.trim() || null,
        featured_image: featured_image?.trim() || null,
        status: validStatus,
        published_at: publishDate,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting blog:', error)
      return NextResponse.json({ blog: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ blog: newBlog, error: null }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/admin/blogs:', err)
    return NextResponse.json(
      { blog: null, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/blogs - Update existing blog
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // If slug is being updated, verify it doesn't conflict with another post
    if (updates.slug) {
      const formattedSlug = generateSlug(updates.slug)
      const { data: existing } = await supabase
        .from('blogs')
        .select('id')
        .eq('slug', formattedSlug)
        .neq('id', id)
        .maybeSingle()

      if (existing) {
        return NextResponse.json(
          { error: `Another blog with slug "${formattedSlug}" already exists.` },
          { status: 400 }
        )
      }
      updates.slug = formattedSlug
    }

    if (updates.content && !updates.read_time) {
      updates.read_time = estimateReadTime(updates.content)
    }

    updates.updated_at = new Date().toISOString()

    const { data: updatedBlog, error } = await supabase
      .from('blogs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blog:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ blog: updatedBlog, error: null })
  } catch (err) {
    console.error('Unexpected error in PATCH /api/admin/blogs:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/blogs - Delete a blog
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let id = searchParams.get('id')

    if (!id) {
      try {
        const body = await request.json()
        id = body.id
      } catch {
        // no body provided
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('blogs').delete().eq('id', id)

    if (error) {
      console.error('Error deleting blog:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, error: null })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/admin/blogs:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
