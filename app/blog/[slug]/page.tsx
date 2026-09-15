'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Menu,
  X,
  ArrowLeft,
  Clock,
  User,
  Calendar,
  Loader2,
  Share2,
  Check,
  BookOpen,
} from 'lucide-react'
import { HeaderAuthBadge } from '@/components/public/header-auth-badge'
import type { Blog } from '@/types/blog'

const colors = {
  primary: '#66948a',
  secondary: '#fffdf5',
  foreground: '#1a1a1a',
  mutedForeground: 'rgba(26, 26, 26, 0.7)',
}

const DEFAULT_FEATURED_IMAGE =
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80'

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z" />
    </svg>
  )
}

function EmailIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="24" height="18" rx="3" />
      <polyline points="1,1 13,11 25,1" />
    </svg>
  )
}

function LinkedInIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.66 1.66 0 0 0-1.66 1.66c0 .92.74 1.66 1.66 1.66.92 0 1.66-.74 1.66-1.66 0-.92-.74-1.66-1.66-1.66Z" />
    </svg>
  )
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: colors.secondary }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4 md:py-6">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="relative h-8 w-8 sm:h-10 sm:w-10 overflow-hidden rounded-full">
              <Image
                src="https://res.cloudinary.com/df01whs60/image/upload/v1781904502/logo_1_ffsttc.png"
                alt="Astsankhlam logo"
                width={40}
                height={40}
                priority
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl md:text-2xl font-black tracking-tight leading-tight" style={{ color: colors.primary }}>
                Astsankhlam
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link href="/about" className="text-sm font-medium hover:opacity-80 transition-colors whitespace-nowrap" style={{ color: colors.foreground }}>
              about
            </Link>
            <Link href="/services" className="text-sm font-medium hover:opacity-80 transition-colors whitespace-nowrap" style={{ color: colors.foreground }}>
              services
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:opacity-80 transition-colors whitespace-nowrap" style={{ color: colors.foreground }}>
              contact
            </Link>
            <Link href="/careers" className="text-sm font-medium hover:opacity-80 transition-colors whitespace-nowrap" style={{ color: colors.foreground }}>
              careers
            </Link>
            <Link href="/blog" className="text-sm font-semibold hover:opacity-80 transition-colors whitespace-nowrap underline underline-offset-4" style={{ color: colors.primary }}>
              blog
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            <div className="flex items-center gap-3 xl:gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-80 transition-colors" style={{ color: colors.foreground }}>
                <InstagramIcon size={20} />
              </a>
              <a href="https://www.linkedin.com/company/astsankhlam" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:opacity-80 transition-colors" style={{ color: colors.foreground }}>
                <LinkedInIcon size={20} />
              </a>
              <a href="mailto:hello@astsankhlam.com" aria-label="Email" className="hover:opacity-80 transition-colors" style={{ color: colors.foreground }}>
                <EmailIcon size={20} />
              </a>
            </div>
            <HeaderAuthBadge primaryColor={colors.primary} />
            <Link
              href="/book"
              className="rounded-lg px-4 xl:px-6 py-2.5 xl:py-3 text-sm font-semibold lowercase tracking-wide transition-colors hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: colors.primary, color: colors.secondary }}
            >
              book now
            </Link>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} style={{ color: colors.foreground }} /> : <Menu size={24} style={{ color: colors.foreground }} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden border-t" style={{ borderColor: 'rgba(26, 26, 26, 0.1)' }}>
            <nav className="flex flex-col py-4 space-y-3">
              <Link href="/about" className="text-sm font-medium py-2 hover:opacity-80 transition-colors" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>
                about
              </Link>
              <Link href="/services" className="text-sm font-medium py-2 hover:opacity-80 transition-colors" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>
                services
              </Link>
              <Link href="/contact" className="text-sm font-medium py-2 hover:opacity-80 transition-colors" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>
                contact
              </Link>
              <Link href="/careers" className="text-sm font-medium py-2 hover:opacity-80 transition-colors" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>
                careers
              </Link>
              <Link href="/blog" className="text-sm font-medium py-2 hover:opacity-80 transition-colors" style={{ color: colors.primary }} onClick={() => setIsMenuOpen(false)}>
                blog
              </Link>
              <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: 'rgba(26, 26, 26, 0.1)' }}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-80 transition-colors" style={{ color: colors.foreground }}>
                  <InstagramIcon size={20} />
                </a>
                <a href="https://www.linkedin.com/company/astsankhlam" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:opacity-80 transition-colors" style={{ color: colors.foreground }}>
                  <LinkedInIcon size={20} />
                </a>
                <a href="mailto:hello@astsankhlam.com" aria-label="Email" className="hover:opacity-80 transition-colors" style={{ color: colors.foreground }}>
                  <EmailIcon size={20} />
                </a>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <HeaderAuthBadge primaryColor={colors.primary} isMobile onNavigate={() => setIsMenuOpen(false)} />
                <Link
                  href="/book"
                  className="rounded-lg px-6 py-3 text-sm font-semibold lowercase tracking-wide transition-colors hover:opacity-90 w-full text-center block"
                  style={{ backgroundColor: colors.primary, color: colors.secondary }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  book now
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 mt-auto" style={{ backgroundColor: 'rgba(255, 253, 245, 0.9)' }}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:gap-12 md:grid-cols-3 lg:gap-16">
          <div className="flex flex-col gap-6 sm:gap-8 items-center md:items-start">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-lg">
                <Image
                  src="https://res.cloudinary.com/df01whs60/image/upload/v1781904502/logo_1_ffsttc.png"
                  alt="Astsankhlam logo"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <span className="font-serif text-lg sm:text-xl font-bold" style={{ color: colors.primary }}>Astsankhlam</span>
            </div>
            <div className="flex gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded hover:opacity-90 transition-opacity"
                aria-label="Instagram"
                style={{ backgroundColor: colors.primary, color: colors.secondary }}
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded hover:opacity-90 transition-opacity"
                aria-label="TikTok"
                style={{ backgroundColor: colors.primary, color: colors.secondary }}
              >
                <TikTokIcon size={16} />
              </a>
              <a
                href="https://www.linkedin.com/company/astsankhlam"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded hover:opacity-90 transition-opacity"
                aria-label="LinkedIn"
                style={{ backgroundColor: colors.primary, color: colors.secondary }}
              >
                <LinkedInIcon size={16} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Services</h3>
              <Link href="/services" className="text-sm hover:underline" style={{ color: colors.foreground }}>
                Therapy & Counseling
              </Link>
              <Link href="/services" className="text-sm hover:underline" style={{ color: colors.foreground }}>
                Yoga for Mental Health
              </Link>
              <Link href="/services" className="text-sm hover:underline" style={{ color: colors.foreground }}>
                Chakra Healing
              </Link>
              <Link href="/services" className="text-sm hover:underline" style={{ color: colors.foreground }}>
                Mindfulness & Meditation
              </Link>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Company</h3>
              <Link href="/about" className="text-sm hover:underline" style={{ color: colors.foreground }}>
                About Us
              </Link>
              <Link href="/blog" className="text-sm hover:underline" style={{ color: colors.foreground }}>
                Blog
              </Link>
              <Link href="/contact" className="text-sm hover:underline" style={{ color: colors.foreground }}>
                Contact
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:gap-6">
            <h3 className="text-lg sm:text-xl font-serif font-black" style={{ color: colors.foreground }}>
              Astsankhlam Journal
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: colors.mutedForeground }}>
              Dedicated to exploring the intersections of mindfulness, psychotherapy, and yogic science.
            </p>
          </div>
        </div>

        <div className="my-8 sm:my-12 border-t" style={{ borderColor: 'rgba(26, 26, 26, 0.2)' }} />

        <div className="space-y-4 sm:space-y-6 text-center">
          <p className="text-[10px] sm:text-xs" style={{ color: colors.mutedForeground }}>
            © 2026 Astsankhlam | Founded by{' '}
            <Link href="/about" className="hover:underline" style={{ color: colors.primary }}>
              Dipanita Biswas
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return

    async function fetchBlog() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/blogs/${encodeURIComponent(slug)}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Blog not found')
        }

        setBlog(data.blog)
      } catch (err) {
        console.error('Error fetching blog:', err)
        setError(err instanceof Error ? err.message : 'Blog not found')
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [slug])

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch {
      // ignore clipboard write failure
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col" style={{ backgroundColor: colors.secondary }}>
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
          <p className="text-sm font-medium" style={{ color: colors.mutedForeground }}>
            Loading reflection...
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="w-full min-h-screen flex flex-col" style={{ backgroundColor: colors.secondary }}>
        <Header />
        <div className="flex-1 max-w-2xl mx-auto px-4 py-24 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" style={{ color: colors.primary }} />
          <h1 className="font-serif text-3xl font-bold mb-3" style={{ color: colors.foreground }}>
            Reflection Not Found
          </h1>
          <p className="text-sm mb-6" style={{ color: colors.mutedForeground }}>
            The reflection you are looking for does not exist or may have been archived.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: colors.primary }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Reflections
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const featuredImage = blog.featured_image || DEFAULT_FEATURED_IMAGE

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ backgroundColor: colors.secondary }}>
      <Header />

      <main className="flex-1">
        {/* Article Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
          {/* Breadcrumbs & Back Link */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider hover:opacity-80 transition-opacity"
              style={{ color: colors.primary }}
            >
              <ArrowLeft className="w-4 h-4" />
              All Reflections
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border border-black/10 hover:bg-black/5 transition-colors"
              style={{ color: colors.foreground }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? 'Link Copied' : 'Share'}
            </button>
          </div>

          {/* Category & Read Time */}
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: colors.primary }}>
            <span className="px-3 py-1 rounded-full bg-white border border-black/5 shadow-xs">
              {blog.category}
            </span>
            <span className="flex items-center gap-1 font-normal lowercase tracking-normal" style={{ color: colors.mutedForeground }}>
              <Clock className="w-3.5 h-3.5" />
              {blog.read_time} min read
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-balance mb-6" style={{ color: colors.foreground }}>
            {blog.title}
          </h1>

          {/* Author & Date */}
          <div className="flex items-center gap-4 py-4 border-y border-black/10 text-xs sm:text-sm" style={{ color: colors.mutedForeground }}>
            <div className="flex items-center gap-2">
              {blog.author_image ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image src={blog.author_image} alt={blog.author_name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                  <User className="w-4 h-4" style={{ color: colors.primary }} />
                </div>
              )}
              <span className="font-medium text-black">{blog.author_name}</span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.published_at)}
            </span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-10">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-md">
            <Image
              src={featuredImage}
              alt={blog.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Excerpt Lead */}
        {blog.excerpt && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <p className="text-lg sm:text-xl font-serif italic leading-relaxed pl-4 border-l-4" style={{ borderColor: colors.primary, color: colors.foreground }}>
              {blog.excerpt}
            </p>
          </div>
        )}

        {/* Content Body */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <div className="space-y-6 text-base sm:text-lg leading-relaxed font-sans" style={{ color: 'rgba(26, 26, 26, 0.88)' }}>
            {blog.content.split('\n\n').map((paragraph, idx) => {
              const trimmed = paragraph.trim()
              if (!trimmed) return null

              // Subheading ###
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={idx} className="font-serif text-2xl font-bold pt-4 pb-1" style={{ color: colors.foreground }}>
                    {trimmed.replace(/^###\s+/, '')}
                  </h3>
                )
              }

              // Subheading ##
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={idx} className="font-serif text-2xl sm:text-3xl font-bold pt-6 pb-2" style={{ color: colors.foreground }}>
                    {trimmed.replace(/^##\s+/, '')}
                  </h2>
                )
              }

              // Unordered list
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const items = trimmed.split('\n').filter(Boolean)
                return (
                  <ul key={idx} className="space-y-2 pl-5 list-disc marker:text-[#66948a]">
                    {items.map((item, itemIdx) => {
                      const cleanItem = item.replace(/^[-*]\s+/, '')
                      return <li key={itemIdx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cleanItem) }} />
                    })}
                  </ul>
                )
              }

              // Numbered list
              if (/^\d+\.\s+/.test(trimmed)) {
                const items = trimmed.split('\n').filter(Boolean)
                return (
                  <ol key={idx} className="space-y-2 pl-5 list-decimal marker:text-[#66948a] font-medium">
                    {items.map((item, itemIdx) => {
                      const cleanItem = item.replace(/^\d+\.\s+/, '')
                      return (
                        <li key={itemIdx} className="font-normal" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cleanItem) }} />
                      )
                    })}
                  </ol>
                )
              }

              // Regular paragraph
              return (
                <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
              )
            })}
          </div>

          {/* Bottom Actions */}
          <div className="mt-12 pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:underline"
              style={{ color: colors.primary }}
            >
              <ArrowLeft className="w-4 h-4" />
              Return to reflections
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-black/10 hover:bg-black/5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Link Copied to Clipboard' : 'Share this Reflection'}
            </button>
          </div>
        </article>
      </main>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center" style={{ backgroundColor: colors.primary }}>
        <div className="mx-auto max-w-3xl text-white">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to Begin Your Personal Journey?
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed opacity-90 max-w-xl mx-auto">
            Whether you are navigating emotional overwhelm or seeking somatic alignment, our compassionate team is here to support you.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/book"
              className="rounded-lg px-8 py-3.5 text-sm font-semibold lowercase tracking-wide transition-opacity hover:opacity-90 w-full sm:w-auto"
              style={{ backgroundColor: colors.secondary, color: colors.primary }}
            >
              book an appointment
            </Link>
            <Link
              href="/services"
              className="rounded-lg px-8 py-3.5 text-sm font-semibold lowercase tracking-wide border border-white/40 transition-colors hover:bg-white/10 w-full sm:w-auto"
            >
              explore all services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function formatInlineMarkdown(text: string): string {
  // Bold **text**
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // Italic *text*
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
  return formatted
}
