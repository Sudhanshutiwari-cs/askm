'use client'

import { useEffect, useState } from 'react'

export function useHeroImage(
  pageKey: string,
  defaultImage: string,
  defaultSecondaryImage?: string
) {
  const [imageUrl, setImageUrl] = useState<string>(defaultImage)
  const [secondaryImageUrl, setSecondaryImageUrl] = useState<string | undefined>(defaultSecondaryImage)
  const [altText, setAltText] = useState<string>('')

  useEffect(() => {
    let isMounted = true

    async function fetchHero() {
      try {
        const res = await fetch(`/api/heroes?page=${pageKey}`)
        if (!res.ok) return
        const data = await res.json()
        if (isMounted && data.hero) {
          if (data.hero.image_url) setImageUrl(data.hero.image_url)
          if (data.hero.secondary_image_url !== undefined) setSecondaryImageUrl(data.hero.secondary_image_url)
          if (data.hero.alt_text) setAltText(data.hero.alt_text)
        }
      } catch {
        // Silently fall back to default
      }
    }

    fetchHero()

    return () => {
      isMounted = false
    }
  }, [pageKey])

  return { imageUrl, secondaryImageUrl, altText }
}
