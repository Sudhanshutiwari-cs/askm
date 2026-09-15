import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const DEFAULT_REELS = [
  {
    id: 'default-1',
    title: 'Therapy & Counseling',
    image_url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=600&q=80',
    link_url: null,
    order_index: 1,
    is_active: true,
  },
  {
    id: 'default-2',
    title: 'Yoga for Mental Health',
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    link_url: null,
    order_index: 2,
    is_active: true,
  },
  {
    id: 'default-3',
    title: 'Chakra Healing',
    image_url: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?auto=format&fit=crop&w=600&q=80',
    link_url: null,
    order_index: 3,
    is_active: true,
  },
  {
    id: 'default-4',
    title: 'Mindfulness & Meditation',
    image_url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80',
    link_url: null,
    order_index: 4,
    is_active: true,
  },
  {
    id: 'default-5',
    title: 'Breathwork & Energy Alignment',
    image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    link_url: null,
    order_index: 5,
    is_active: true,
  },
  {
    id: 'default-6',
    title: 'Holistic Wellness Journey',
    image_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=600&q=80',
    link_url: null,
    order_index: 6,
    is_active: true,
  },
]

// GET /api/reels - Fetch all active reels for public display
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('reels')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.warn('Could not fetch reels from db, using defaults:', error.message)
      return NextResponse.json({ reels: DEFAULT_REELS, fallback: true })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ reels: DEFAULT_REELS, fallback: true })
    }

    return NextResponse.json({ reels: data, fallback: false })
  } catch (err) {
    console.error('Unexpected error fetching reels:', err)
    return NextResponse.json({ reels: DEFAULT_REELS, fallback: true })
  }
}
