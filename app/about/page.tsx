'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { HeaderAuthBadge } from '@/components/public/header-auth-badge'
import { NewsletterForm } from '@/components/public/newsletter-form'
import { ReelsGallery } from '@/components/public/reels-gallery'
import { useHeroImage } from '@/lib/hooks/use-hero-image'

// STRICT COLOR PALETTE
const colors = {
  primary: '#66948a',
  secondary: '#fffdf5',
  foreground: '#1a1a1a',
  mutedForeground: 'rgba(26, 26, 26, 0.7)',
}

// SVG components for social media icons
const InstagramIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const TikTokIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.498 3h-3.496a.5.5 0 0 0-.5.5v10.524H8.423V3.5a.5.5 0 0 0-.5-.5H4.427a.5.5 0 0 0-.5.5v15.424c0 .276.224.5.5.5h3.496a.5.5 0 0 0 .5-.5V13.39h6.577v5.534c0 .276.224.5.5.5h3.496a.5.5 0 0 0 .5-.5V3.5a.5.5 0 0 0-.5-.5z"/>
  </svg>
)

const LinkedInIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const EmailIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
)

// Image Placeholder component
function ImagePlaceholder({ className = "", text = "Image Placeholder" }: { className?: string; text?: string }) {
  return (
    <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
      <div className="text-center px-2">
        <svg 
          className="mx-auto h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" 
          />
        </svg>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">{text}</p>
      </div>
    </div>
  )
}

const VALUES = [
  "Pause",
  "Breathe",
  "Reconnect",
  "Heal",
  "Align",
  "Grow",
  "Transform",
]

const reels = [
  { src: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=600&q=80', alt: 'Therapy & Counseling' },
  { src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80', alt: 'Yoga for Mental Health' },
  { src: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?auto=format&fit=crop&w=600&q=80', alt: 'Chakra Healing' },
  { src: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80', alt: 'Mindfulness & Meditation' },
  { src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80', alt: 'Breathwork & Energy Alignment' },
  { src: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=600&q=80', alt: 'Holistic Wellness Journey' },
]

// Header Component with mobile menu
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: colors.secondary }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4 md:py-6">
          {/* Logo */}
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

          {/* Desktop Navigation */}
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
           
            <Link href="/blog" className="text-sm font-medium hover:opacity-80 transition-colors whitespace-nowrap" style={{ color: colors.foreground }}>
              blog
            </Link>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            <div className="flex items-center gap-3 xl:gap-4">
              <a
                href="https://www.instagram.com/astsankhlam/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:opacity-80 transition-colors"
                style={{ color: colors.foreground }}
              >
                <InstagramIcon size={20} />
              </a>
              <a
                href="https://www.linkedin.com/company/astsankhlam"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:opacity-80 transition-colors"
                style={{ color: colors.foreground }}
              >
                <LinkedInIcon size={20} />
              </a>
              <a
                href="mailto:hello@astsankhlam.com"
                aria-label="Email"
                className="hover:opacity-80 transition-colors"
                style={{ color: colors.foreground }}
              >
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

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} style={{ color: colors.foreground }} /> : <Menu size={24} style={{ color: colors.foreground }} />}
          </button>
        </div>

        {/* Mobile Navigation Overlay */}
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
             
              <Link href="/blog" className="text-sm font-medium py-2 hover:opacity-80 transition-colors" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>
                blog
              </Link>
              <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: 'rgba(26, 26, 26, 0.1)' }}>
                <a href="https://www.instagram.com/astsankhlam/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-80 transition-colors" style={{ color: colors.foreground }}>
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

// Footer Component
function Footer() {
  return (
    <footer className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16" style={{ backgroundColor: 'rgba(255, 253, 245, 0.9)' }}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:gap-12 md:grid-cols-3 lg:gap-16">
          {/* Left Column - Logo and Social */}
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
                href="https://www.instagram.com/astsankhlam/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded hover:opacity-90 transition-opacity"
                aria-label="Instagram"
                style={{ backgroundColor: colors.primary, color: colors.secondary }}
              >
                <InstagramIcon size={16} />
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

          {/* Center Column - Navigation Links */}
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

          {/* Right Column - Newsletter Signup */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-black" style={{ color: colors.foreground }}>
                Stay Mindful & Connected
              </h3>
              <p className="mt-2 text-xs sm:text-sm" style={{ color: colors.mutedForeground }}>
                Sign up with your email to receive mindfulness resources, wellness reflections, and clinic updates.
              </p>
            </div>
            <NewsletterForm
              primaryColor={colors.primary}
              secondaryColor={colors.secondary}
              foregroundColor={colors.foreground}
              layout="row"
            />
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
            <a href="/about" className="hover:underline" style={{ color: colors.primary }}>
              Dipanita Biswas
            </a>{' '}
            | Holistic Wellness Initiative |{' '}
            <a href="/services" className="hover:underline" style={{ color: colors.primary }}>
              Healing & Balance
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function AstsankhlamPage() {
  const { imageUrl: heroImageUrl, altText: heroAltText } = useHeroImage(
    'about',
    'https://res.cloudinary.com/doficc2yl/image/upload/v1789452549/20260814_182755_0000.jpg_mv7oq3.jpg'
  )

  return (
    <div className="w-full" style={{ backgroundColor: colors.secondary }}>
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden" style={{ backgroundColor: colors.secondary }}>
        {/* Left column - hero image */}
        <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:h-full min-h-[380px] sm:min-h-[480px] lg:min-h-[580px] overflow-hidden bg-[#f6f3eb]">
          <Image
            src={heroImageUrl}
            alt={heroAltText || "Astsankhlam - Find the right support for your healing journey"}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top"
          />
        </div>

        {/* Right column - structured editorial content */}
        <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-12 xl:px-16 py-10 sm:py-12 lg:py-14 text-left">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit mb-5 border text-xs sm:text-sm tracking-wider uppercase font-semibold"
            style={{
              backgroundColor: 'rgba(102, 148, 138, 0.08)',
              borderColor: 'rgba(102, 148, 138, 0.25)',
              color: colors.primary,
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }} />
            Holistic Wellness Initiative
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.15]" style={{ color: colors.foreground }}>
            Restore Your Mind.{' '}
            <span className="block font-serif italic font-normal mt-1" style={{ color: colors.primary }}>
              Reconnect With Yourself.
            </span>
          </h1>

          <p className="mt-5 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl text-pretty" style={{ color: colors.mutedForeground }}>
            Founded by <span className="font-semibold" style={{ color: colors.primary }}>Dipanita Biswas</span>, Astsankhlam offers a compassionate sanctuary to pause, reflect, and heal. Rooted in the belief that true healing begins from within, we blend modern psychotherapy with ancient yogic wisdom to guide your personalized path toward balance.
          </p>

          {/* 4 Holistic Pillars */}
          <div className="mt-7 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 max-w-xl">
            <div className="p-3.5 sm:p-4 rounded-xl border bg-white/70 shadow-sm transition-all hover:shadow-md" style={{ borderColor: 'rgba(102, 148, 138, 0.2)' }}>
              <p className="font-serif text-sm sm:text-base font-bold" style={{ color: colors.primary }}>Psychotherapy</p>
              <p className="text-[11px] sm:text-xs mt-1 leading-snug" style={{ color: colors.mutedForeground }}>Evidence-informed compassionate counseling</p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl border bg-white/70 shadow-sm transition-all hover:shadow-md" style={{ borderColor: 'rgba(102, 148, 138, 0.2)' }}>
              <p className="font-serif text-sm sm:text-base font-bold" style={{ color: colors.primary }}>Yogic Healing</p>
              <p className="text-[11px] sm:text-xs mt-1 leading-snug" style={{ color: colors.mutedForeground }}>Somatic movement & nervous system regulation</p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl border bg-white/70 shadow-sm transition-all hover:shadow-md" style={{ borderColor: 'rgba(102, 148, 138, 0.2)' }}>
              <p className="font-serif text-sm sm:text-base font-bold" style={{ color: colors.primary }}>Chakra Healing</p>
              <p className="text-[11px] sm:text-xs mt-1 leading-snug" style={{ color: colors.mutedForeground }}>Energy alignment & intuitive emotional release</p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl border bg-white/70 shadow-sm transition-all hover:shadow-md" style={{ borderColor: 'rgba(102, 148, 138, 0.2)' }}>
              <p className="font-serif text-sm sm:text-base font-bold" style={{ color: colors.primary }}>Breath & Stillness</p>
              <p className="text-[11px] sm:text-xs mt-1 leading-snug" style={{ color: colors.mutedForeground }}>Pranayama techniques for grounded presence</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 sm:mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/services"
              className="rounded-md px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-medium lowercase tracking-wide transition-all duration-300 hover:opacity-90 shadow-sm"
              style={{ backgroundColor: colors.primary, color: colors.secondary }}
            >
              explore services
            </Link>
            <Link
              href="/contact"
              className="rounded-md px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-medium lowercase tracking-wide transition-all duration-300 hover:bg-black/5 border"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              contact us
            </Link>
          </div>
        </div>
      </section>

      {/* How it all began section */}
      <section className="w-full" style={{ backgroundColor: colors.secondary }}>
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 sm:gap-10 px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-24 lg:grid-cols-2 lg:gap-16">
          {/* Left column - text */}
          <div className="order-2 lg:order-1">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              <span style={{ color: colors.primary }}>Meet the Founder — </span>
              <span style={{ color: colors.primary }}>Dipanita Biswas</span>
            </h2>

            <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 text-sm sm:text-base md:text-lg leading-relaxed" style={{ color: colors.mutedForeground }}>
              <p>
                <span className="italic">Dipanita Biswas, founder of Astsankhlam,</span> is a trained psychologist and therapist with a deep commitment to mental health, holistic healing, and conscious living. Her approach combines therapeutic conversations with mindfulness, meditation, breathwork, yogic wisdom, energy alignment, and intuitive healing practices.
              </p>
              <p>
                <span className="italic">Through thoughtfully designed sessions,</span> she creates a supportive environment where individuals can explore themselves without judgment. Her vision is to make emotional and mental well-being more accessible, compassionate, and stigma-free.
              </p>
            </div>

            <p className="mt-6 sm:mt-8 font-serif text-base sm:text-lg md:text-xl leading-tight" style={{ color: colors.foreground }}>
              A safe, compassionate space to pause, reflect, heal, and reconnect.
            </p>

            <div className="mt-6 sm:mt-8">
              <Link href="/book" className="rounded-md px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-medium lowercase tracking-wide transition-colors duration-300 hover:opacity-90 inline-block" style={{ backgroundColor: colors.primary, color: colors.secondary }}>
                book now
              </Link>
            </div>
          </div>

          {/* Right column - portrait */}
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-[2/3] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl border border-black/5 bg-[#f6f3eb]">
              <Image
                src="https://res.cloudinary.com/doficc2yl/image/upload/v1789452617/Untitled_design_20260814_113529_0000.jpg_zbjc7s.jpg"
                alt="Dipanita Biswas - Founder of Astsankhlam"
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 450px, 520px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="w-full py-8 sm:py-10 lg:py-14" style={{ backgroundColor: 'rgba(102, 148, 138, 0.08)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-4 sm:mb-5" style={{ color: colors.primary }}>
            Core Values
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-1 sm:gap-y-2">
            {VALUES.map((value, index) => (
              <React.Fragment key={value}>
                <span className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl font-bold" style={{ color: colors.primary }}>
                  {value}
                </span>
                {index < VALUES.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="font-serif text-sm sm:text-base md:text-lg lg:text-xl"
                    style={{ color: colors.primary }}
                  >
                    {"\u2733"}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Begin Your Journey CTA Section */}
      <section className="w-full">
        <div className="relative overflow-hidden bg-gray-200">
          <Image
            src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1600&q=80"
            alt="Serene nature horizon"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20 md:py-28 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-tight text-balance" style={{ color: colors.secondary }}>
              Your Journey{' '}
              <span style={{ color: colors.primary }}>Begins</span>
              {' '}Here
            </h2>
            <p className="mt-4 sm:mt-6 font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal" style={{ color: 'rgba(255, 253, 245, 0.9)' }}>
              A journey inward, toward a healthier and more conscious you.
            </p>
            <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-pretty" style={{ color: 'rgba(255, 253, 245, 0.85)' }}>
              Healing isn't about perfection. It's about showing up, connecting, and taking the next step forward.
              <em className="font-serif"> —Astsankhlam</em>
            </p>
            <div className="mt-8 sm:mt-10 flex justify-center">
              <Link
                href="/book"
                className="rounded-2xl px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-semibold lowercase tracking-wide transition-colors hover:opacity-90 inline-block"
                style={{ backgroundColor: colors.primary, color: colors.secondary }}
              >
                book now!
              </Link>
            </div>
          </div>
        </div>

        {/* Sanctuary Image Gallery Grid */}
        <ReelsGallery />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}