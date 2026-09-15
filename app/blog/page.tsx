'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X, ArrowRight, Clock, User, Calendar, Search } from 'lucide-react'
import { HeaderAuthBadge } from '@/components/public/header-auth-badge'

// STRICT COLOR PALETTE
const colors = {
  primary: '#66948a',
  secondary: '#fffdf5',
  foreground: '#1a1a1a',
  mutedForeground: 'rgba(26, 26, 26, 0.7)',
}

// SVG Icons
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
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setEmail('')
    setLoading(false)
  }

  return (
    <footer className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16" style={{ backgroundColor: 'rgba(255, 253, 245, 0.9)' }}>
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
                href="https://linkedin.com"
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
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-black" style={{ color: colors.foreground }}>
                Stay Mindful & Connected
              </h3>
              <p className="mt-2 text-xs sm:text-sm" style={{ color: colors.mutedForeground }}>
                Sign up with your email to receive mindfulness resources, wellness reflections, and clinic updates.
              </p>
            </div>
            <form onSubmit={handleSignup} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="border-b px-0 py-2 text-sm focus:outline-none focus:ring-0 bg-transparent flex-1"
                style={{ borderColor: 'rgba(26, 26, 26, 0.3)', color: colors.foreground }}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-fit rounded-lg px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold lowercase transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: colors.primary, color: colors.secondary }}
              >
                {loading ? 'signing up...' : 'sign up'}
              </button>
            </form>
          </div>
        </div>

        <div className="my-8 sm:my-12 border-t" style={{ borderColor: 'rgba(26, 26, 26, 0.2)' }} />

        <div className="flex flex-col items-center gap-4 sm:gap-6 py-6 sm:py-8">
          <p className="text-center text-xs sm:text-sm font-semibold uppercase tracking-widest" style={{ color: colors.primary }}>
            Restore Your Mind. Reconnect With Yourself. Rediscover Balance.
          </p>
          <Link
            href="/book"
            className="rounded-lg px-6 sm:px-8 py-3 sm:py-4 text-sm font-semibold lowercase transition-colors hover:opacity-90 inline-block"
            style={{ backgroundColor: colors.primary, color: colors.secondary }}
          >
            book now
          </Link>
        </div>

        <div className="my-8 sm:my-12 border-t" style={{ borderColor: 'rgba(26, 26, 26, 0.2)' }} />

        <div className="space-y-4 sm:space-y-6 text-center">
          <p className="text-[10px] sm:text-xs leading-relaxed px-2" style={{ color: colors.mutedForeground }}>
            Astsankhlam is a holistic wellness initiative founded by Dipanita Biswas, dedicated to helping individuals nurture their mental, emotional, physical, and spiritual well-being through integrated psychological therapy and yogic practices.
          </p>

          <p className="text-[10px] sm:text-xs" style={{ color: colors.mutedForeground }}>
            © 2026 Astsankhlam | Founded by{' '}
            <Link href="/about" className="hover:underline" style={{ color: colors.primary }}>
              Dipanita Biswas
            </Link>{' '}
            | Holistic Wellness Initiative |{' '}
            <Link href="/services" className="hover:underline" style={{ color: colors.primary }}>
              Healing & Balance
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

interface Article {
  id: string
  title: string
  slug: string
  category: string
  readTime: string
  date: string
  excerpt: string
  author: string
  image: string
}

const articles: Article[] = [
  {
    id: '1',
    title: 'The Healing Power of the Pause: Finding Stillness in an Overstimulated World',
    slug: 'healing-power-of-the-pause',
    category: 'Mindfulness & Meditation',
    readTime: '4 min read',
    date: 'March 10, 2026',
    author: 'Dipanita Biswas',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'In a world where speed is celebrated, pausing feels counterintuitive. Yet true healing begins when we step away from constant doing and create space to simply be.',
  },
  {
    id: '2',
    title: 'Bridging Modern Psychotherapy with Yogic & Somatic Wisdom',
    slug: 'bridging-psychotherapy-and-yogic-wisdom',
    category: 'Therapy & Counseling',
    readTime: '6 min read',
    date: 'February 28, 2026',
    author: 'Dipanita Biswas',
    image: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'How integrating psychological inquiry with body-based practices like breathwork and yogic movement creates deeper, more enduring emotional balance.',
  },
  {
    id: '3',
    title: 'Understanding Your Chakras: Energy Awareness for Everyday Emotional Health',
    slug: 'understanding-your-chakras',
    category: 'Chakra Healing',
    readTime: '5 min read',
    date: 'February 15, 2026',
    author: 'Meera Patel',
    image: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'Chakras are not mystical abstractions—they represent vital intersections of physical sensation, emotional holding, and inner consciousness.',
  },
  {
    id: '4',
    title: 'Yoga for the Mind: Moving Beyond Flexibility to Nervous System Regulation',
    slug: 'yoga-for-mental-health-regulation',
    category: 'Yoga for Mental Health',
    readTime: '5 min read',
    date: 'January 29, 2026',
    author: 'Ananya Sharma',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'Why restorative postures, intentional alignment, and gentle somatic releases help release stored stress and settle the autonomic nervous system.',
  },
  {
    id: '5',
    title: 'Navigating Transitions: The Sacred Cycle from Pause to Transformation',
    slug: 'navigating-transitions-journey',
    category: 'Therapy & Counseling',
    readTime: '7 min read',
    date: 'January 14, 2026',
    author: 'Dipanita Biswas',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'Life changes often trigger disorientation. Discover how the 7-stage Astsankhlam journey guides you gently through uncertainty toward renewal.',
  },
  {
    id: '6',
    title: 'Breath as Medicine: 3 Simple Pranayama Techniques for Anxiety',
    slug: 'breath-as-medicine-pranayama',
    category: 'Mindfulness & Meditation',
    readTime: '4 min read',
    date: 'December 20, 2025',
    author: 'Arjun Nair',
    image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'Simple, grounded breathing exercises you can practice in minutes at your desk or home to shift from fight-or-flight into restorative calm.',
  },
]

const categories = [
  'All',
  'Therapy & Counseling',
  'Yoga for Mental Health',
  'Chakra Healing',
  'Mindfulness & Meditation',
]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: colors.secondary }}>
      <Header />

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-20 sm:pb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em]" style={{ color: colors.primary }}>
            Astsankhlam Journal
          </p>
          <h1 className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-balance" style={{ color: colors.foreground }}>
            Reflections on <span style={{ color: colors.primary }}>Mind, Body & Spirit</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: colors.mutedForeground }}>
            Insights, yogic wisdom, and psychological perspectives by Dipanita Biswas and the Astsankhlam team to accompany your journey toward balance.
          </p>

          {/* Search bar */}
          <div className="mt-8 sm:mt-10 relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.primary }} />
            <input
              type="text"
              placeholder="Search reflections, practices, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm rounded-full border bg-white/80 focus:outline-none focus:ring-2 shadow-sm transition-all"
              style={{ borderColor: 'rgba(102, 148, 138, 0.3)', color: colors.foreground }}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'shadow-sm text-white'
                    : 'hover:bg-black/5'
                }`}
                style={{
                  backgroundColor: selectedCategory === cat ? colors.primary : 'transparent',
                  color: selectedCategory === cat ? colors.secondary : colors.foreground,
                  border: `1px solid ${selectedCategory === cat ? colors.primary : 'rgba(26, 26, 26, 0.15)'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="mx-auto max-w-6xl">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-base sm:text-lg" style={{ color: colors.mutedForeground }}>
                No reflections found matching your search.
              </p>
              <button
                type="button"
                onClick={() => { setSelectedCategory('All'); setSearchQuery('') }}
                className="mt-4 text-sm font-semibold underline"
                style={{ color: colors.primary }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="flex flex-col rounded-2xl bg-white p-6 sm:p-8 shadow-md hover:shadow-lg transition-all border border-black/5 group"
                >
                  <div className="relative aspect-[16/10] w-full mb-5 overflow-hidden rounded-xl bg-gray-100 -mt-1">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: colors.primary }}>
                    <span>{article.category}</span>
                    <span className="flex items-center gap-1 font-normal lowercase tracking-normal" style={{ color: colors.mutedForeground }}>
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime}
                    </span>
                  </div>

                  <h2 className="font-serif text-xl sm:text-2xl font-bold leading-snug mb-3 group-hover:opacity-80 transition-opacity" style={{ color: colors.foreground }}>
                    {article.title}
                  </h2>

                  <p className="text-xs sm:text-sm leading-relaxed flex-1 mb-6" style={{ color: colors.mutedForeground }}>
                    {article.excerpt}
                  </p>

                  <div className="pt-4 border-t border-black/5 flex items-center justify-between text-xs" style={{ color: colors.mutedForeground }}>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                      {article.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.date}
                    </span>
                  </div>

                  <div className="mt-4 pt-2">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider hover:underline"
                      style={{ color: colors.primary }}
                    >
                      Connect & Reflect
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to action Banner */}
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
