import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export interface HeroConfig {
  page_key: string
  page_name: string
  image_url: string
  secondary_image_url?: string | null
  alt_text?: string | null
}

export const DEFAULT_HEROES: Record<string, HeroConfig> = {
  home: {
    page_key: 'home',
    page_name: 'Home Page',
    image_url: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80',
    secondary_image_url: null,
    alt_text: 'Astsankhlam - Holistic Wellness & Healing',
  },
  about: {
    page_key: 'about',
    page_name: 'About Page',
    image_url: 'https://res.cloudinary.com/doficc2yl/image/upload/v1789452549/20260814_182755_0000.jpg_mv7oq3.jpg',
    secondary_image_url: null,
    alt_text: 'Astsankhlam - Find the right support for your healing journey',
  },
  services: {
    page_key: 'services',
    page_name: 'Services Page',
    image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1000&q=80',
    secondary_image_url: null,
    alt_text: 'Therapy and compassionate counseling session',
  },
  careers: {
    page_key: 'careers',
    page_name: 'Careers Page',
    image_url: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    alt_text: 'Mindful Therapy Session',
  },
  contact: {
    page_key: 'contact',
    page_name: 'Contact Page',
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    secondary_image_url: null,
    alt_text: 'Astsankhlam sanctuary',
  },
}

// GET /api/heroes - Fetch hero images for pages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')

    const mergedHeroes: Record<string, HeroConfig> = { ...DEFAULT_HEROES }

    if (!error && data && Array.isArray(data)) {
      data.forEach((row) => {
        if (row.page_key) {
          mergedHeroes[row.page_key] = {
            page_key: row.page_key,
            page_name: row.page_name || DEFAULT_HEROES[row.page_key]?.page_name || row.page_key,
            image_url: row.image_url || DEFAULT_HEROES[row.page_key]?.image_url,
            secondary_image_url: row.secondary_image_url ?? DEFAULT_HEROES[row.page_key]?.secondary_image_url,
            alt_text: row.alt_text ?? DEFAULT_HEROES[row.page_key]?.alt_text,
          }
        }
      })
    }

    if (page && mergedHeroes[page]) {
      return NextResponse.json({ hero: mergedHeroes[page] })
    }

    return NextResponse.json({ heroes: mergedHeroes })
  } catch (err) {
    console.error('Error in GET /api/heroes:', err)
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    if (page && DEFAULT_HEROES[page]) {
      return NextResponse.json({ hero: DEFAULT_HEROES[page] })
    }
    return NextResponse.json({ heroes: DEFAULT_HEROES })
  }
}
