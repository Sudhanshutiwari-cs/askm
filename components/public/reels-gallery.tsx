'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface ReelItem {
  id?: string
  title: string
  image_url: string
  link_url?: string | null
  order_index?: number
  is_active?: boolean
}

const FALLBACK_REELS: ReelItem[] = [
  { id: '1', title: 'Therapy & Counseling', image_url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=600&q=80' },
  { id: '2', title: 'Yoga for Mental Health', image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80' },
  { id: '3', title: 'Chakra Healing', image_url: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?auto=format&fit=crop&w=600&q=80' },
  { id: '4', title: 'Mindfulness & Meditation', image_url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80' },
  { id: '5', title: 'Breathwork & Energy Alignment', image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80' },
  { id: '6', title: 'Holistic Wellness Journey', image_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=600&q=80' },
]

export function ReelsGallery({
  initialReels = FALLBACK_REELS,
  className = '',
}: {
  initialReels?: ReelItem[]
  className?: string
}) {
  const [reels, setReels] = useState<ReelItem[]>(initialReels)

  useEffect(() => {
    let isMounted = true
    async function fetchReels() {
      try {
        const res = await fetch('/api/reels')
        if (!res.ok) return
        const data = await res.json()
        if (isMounted && data.reels && Array.isArray(data.reels) && data.reels.length > 0) {
          setReels(data.reels)
        }
      } catch {
        // Fallback already in place
      }
    }
    fetchReels()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div
      className={`w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 overflow-hidden ${className}`}
      aria-label="Sanctuary reels gallery"
    >
      {reels.map((item, idx) => {
        const key = item.id || `${item.image_url}-${idx}`
        const isExternal = item.link_url && (item.link_url.startsWith('http://') || item.link_url.startsWith('https://'))

        const content = (
          <div className="group relative aspect-[9/13] sm:aspect-[9/14] md:aspect-[9/13] overflow-hidden bg-[#66948a]/10 w-full h-full cursor-pointer">
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-3 sm:p-4 transition-all duration-300 group-hover:from-black/85">
              <p className="text-xs sm:text-sm font-serif text-[#fffdf5] font-semibold tracking-wide drop-shadow-sm leading-snug whitespace-pre-line">
                {item.title}
              </p>
            </div>
          </div>
        )

        if (item.link_url) {
          if (isExternal) {
            return (
              <a
                key={key}
                href={item.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden"
              >
                {content}
              </a>
            )
          }
          return (
            <Link key={key} href={item.link_url} className="block overflow-hidden">
              {content}
            </Link>
          )
        }

        return <div key={key}>{content}</div>
      })}
    </div>
  )
}
