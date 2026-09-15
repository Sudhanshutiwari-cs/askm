'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { HeaderAuthBadge } from '@/components/public/header-auth-badge'

// SVG components for social media icons
const FacebookIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

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

const MARQUEE_ITEMS = Array.from({ length: 10 })

// STRICT COLOR PALETTE
const colors = {
  primary: '#66948a',
  secondary: '#fffdf5',
  foreground: '#1a1a1a',
  mutedForeground: 'rgba(26, 26, 26, 0.7)',
}

// Flower component
function Flower({ petal, center }: { petal: string; center: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 drop-shadow-sm"
    >
      <g fill={petal}>
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="50"
            cy="24"
            rx="15"
            ry="20"
            transform={`rotate(${angle} 50 50)`}
          />
          
        ))}
      </g>
      <circle cx="50" cy="50" r="13" fill={center} />
      <circle cx="50" cy="50" r="6" fill={petal} />
    </svg>
  )
}


function ImagePlaceholder({ className = "", text = "Image Placeholder" }: { className?: string; text?: string }) {
  return (
    <div className={`flex items-center justify-center bg-gray-300 ${className}`}>
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
                href="https://instagram.com"
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

const features = [
  {
    title: 'real & relatable',
    description:
      'We prioritize showing up as ourselves, and we want you to feel safe enough to do the same! We are humans first and therapists second- if you wouldn’t want us to be your friend, why would you want us to be your therapist?!',
  },
  {
    title: 'humor & humility',
    description:
      'We approach our sessions with warmth and a sense of humor, recognizing that while the work may be hard, it doesn’t always have to be heavy. At the same time, we stay grounded in humility, knowing that healing is a journey we walk together, and your unique experience always deserves respect, understanding, and care.',
  },
  {
    title: 'trained & tested',
    description:
      'Our therapists have truly done the work; with many hours of training, supervision and evidence-based models to pull from, you’ll have all the benefits of pro therapy without the confusing jargon.',
  },
  {
    title: 'client-centered care',
    description:
      'Experience client-centered care with our therapists, where your needs and preferences are prioritized throughout the healing process.',
  },
]

const reels = [
  { src: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=600&q=80', alt: 'Therapy & Counseling' },
  { src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80', alt: 'Yoga for Mental Health' },
  { src: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?auto=format&fit=crop&w=600&q=80', alt: 'Chakra Healing' },
  { src: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80', alt: 'Mindfulness & Meditation' },
  { src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80', alt: 'Breathwork & Energy Alignment' },
  { src: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=600&q=80', alt: 'Holistic Wellness Journey' },
]

// Footer Component
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
                See what the buzz is about!
              </h3>
              <p className="mt-2 text-xs sm:text-sm" style={{ color: colors.mutedForeground }}>
              Sign up with your email to receive resources, event and clinic updates! 
              </p>
            </div>

            <form onSubmit={handleSignup} className="flex flex-col gap-3 sm:gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="border-b px-0 py-2 text-sm focus:outline-none focus:ring-0 bg-transparent"
                style={{ borderColor: 'rgba(26, 26, 26, 0.3)', color: colors.foreground }}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-fit rounded-lg px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold lowercase transition-colors hover:opacity-90 disabled:opacity-50"
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
            Book your free 15 minute consult call!
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
            We gratefully acknowledge and honor that where we live and work is within the traditional territories of the people of the Treaty 7 region in Southern Alberta, which includes the Blackfoot Confederacy (comprising the Siksika, Piikani, and Kainai First Nations) as well as the Tsuut’ina First Nation, and the Stoney Nakoda (including the Chiniki, Bearspaw, and Wesley First Nations); and Métis Nation of Alberta, Region 3. The traditional Blackfoot name of this place is “Mohkinstsis”, which is also known now as the City of Calgary.
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
  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: colors.secondary }}>
      <Header />

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden" style={{ backgroundColor: colors.secondary }}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: image */}
          <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-auto min-h-[300px] sm:min-h-[400px] bg-gray-200 order-2 lg:order-1">
            <Image
              src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80"
              alt="Astsankhlam - Holistic Wellness & Healing"
              fill
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>

          {/* Right: copy */}
          <div className="flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20 lg:py-28 text-center order-1 lg:order-2">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight">
              <span style={{ color: colors.primary }}>We do</span>
              <br />
              <span style={{ color: colors.primary }}>therapy differently</span>
            </h1>

            <p className="mt-4 sm:mt-6 md:mt-8 max-w-md text-xs sm:text-sm md:text-base leading-relaxed" style={{ color: colors.mutedForeground }}>
              We are a modern therapy collective in Calgary, AB transforming traditional mental health care through relatable, down-to earth, expert-driven support.
            </p>

            <p className="mt-6 sm:mt-8 font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: colors.primary }}>
              Real Talk. Real Care.
            </p>

            <a
              href="/services"
              className="mt-6 sm:mt-8 md:mt-10 inline-flex items-center justify-center rounded-2xl px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-semibold lowercase tracking-wide transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.primary, color: colors.secondary }}
            >
              explore our services
            </a>
          </div>
        </div>

        {/* Marquee */}
        <div className="relative w-full overflow-hidden py-2 sm:py-3 md:py-4" style={{ backgroundColor: colors.primary }}>
          <div className="flex w-max animate-marquee whitespace-nowrap">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((_, i) => (
              <span
                key={i}
                className="mx-4 sm:mx-6 md:mx-8 font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold"
                style={{ color: colors.secondary }}
              >
                healing Together
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Healing Together Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32" style={{ backgroundColor: colors.secondary }}>
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-tight text-balance">
            <span style={{ color: colors.primary }}>Healing</span>{' '}
            <span className="relative inline-block" style={{ color: colors.primary }}>
              Together
              <svg
                aria-hidden="true"
                viewBox="0 0 220 16"
                className="absolute -bottom-1 sm:-bottom-2 left-0 h-2 sm:h-3 w-full"
                preserveAspectRatio="none"
                style={{ color: 'rgba(102, 148, 138, 0.5)' }}
              >
                <path
                  d="M3 11C40 4 90 3 130 6c30 2 60 4 86 1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="mt-4 sm:mt-6 md:mt-8 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-pretty" style={{ color: colors.mutedForeground }}>
            Therapy doesn’t have to feel clinical or intimidating. Our approach is grounded in real, down to earth, expert-driven support, because we believe healing happens best when you feel understood and valued as a whole person.
          </p>

          <div className="mt-8 sm:mt-10 md:mt-14">
            <div className="relative h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 mx-auto">
              <Image
                src="https://res.cloudinary.com/df01whs60/image/upload/v1781904502/logo_1_ffsttc.png"
                alt="Astsankhlam logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28">
        <Image
          src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1600&q=80"
          alt="Healing background"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(102, 148, 138, 0.25)' }} aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="text-center text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em]" style={{ color: colors.secondary, textShadow: '0 1px 8px rgba(0, 0, 0, 0.3)' }}>
            Astsankhlam Services
          </p>
          <h2 className="mx-auto mt-4 sm:mt-6 max-w-3xl text-center font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-tight text-balance" style={{ color: colors.secondary, textShadow: '0 2px 12px rgba(0, 0, 0, 0.35)' }}>
            Your path to healing starts here.
          </h2>

          <div className="mt-10 sm:mt-12 md:mt-16 grid gap-6 sm:gap-8 md:grid-cols-2">
            {[
              {
                title: 'Therapy & Counseling',
                description: 'Personalized support for stress, anxiety, trauma, emotional challenges, and important life transitions.',
              },
              {
                title: 'Yoga for Mental Health',
                description: 'Mindful movement, yoga, and breathwork practices designed to encourage relaxation, focus, and emotional well-being.',
              },
              {
                title: 'Chakra Healing',
                description: 'Guided practices focused on energy awareness, chakra alignment, and emotional balance.',
              },
              {
                title: 'Mindfulness & Meditation',
                description: 'Practices that encourage presence, self-awareness, calmness, and a deeper connection with oneself.',
              },
            ].map((item) => (
              <div key={item.title} className="relative pt-6 sm:pt-8">
                <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
                  <Flower petal={colors.primary} center={colors.secondary} />
                </div>
                <article className="flex h-full flex-col rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-8 md:p-10 pt-12 sm:pt-14 md:pt-16 lg:pt-20 shadow-lg sm:shadow-xl">
                  <h3 className="text-center font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal leading-snug text-gray-900 text-balance">
                    {item.title}
                  </h3>
                  <p className="mx-auto mt-4 sm:mt-6 max-w-xs flex-1 text-center text-xs sm:text-sm leading-relaxed" style={{ color: 'rgba(26, 26, 26, 0.75)' }}>
                    {item.description}
                  </p>
                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <Link
                      href="/services"
                      className="w-full sm:w-auto rounded-md px-5 sm:px-6 py-2 sm:py-2.5 text-center text-xs sm:text-sm font-medium lowercase transition-opacity hover:opacity-90"
                      style={{ backgroundColor: colors.primary, color: colors.secondary }}
                    >
                      learn more
                    </Link>
              <Link
                href="/book"
                className="w-full sm:w-auto rounded-md px-5 sm:px-6 py-2 sm:py-2.5 text-center text-xs sm:text-sm font-medium lowercase transition-opacity hover:opacity-90"
                style={{ backgroundColor: colors.primary, color: colors.secondary }}
              >
                book now
              </Link>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28" style={{ backgroundColor: colors.secondary }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-balance">
            <span style={{ color: colors.primary }}>Why Choose Us?</span>
        
          </h2>

          <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-center text-xs sm:text-sm md:text-base leading-relaxed text-pretty" style={{ color: colors.mutedForeground }}>
            We understand that choosing the right therapist is a deeply personal decision, and we want to make that choice easier for you.  Here’s why we believe you’ll feel at home with us:
          </p>

          <div className="mt-10 sm:mt-12 md:mt-16 grid gap-x-8 sm:gap-x-12 md:gap-x-16 gap-y-8 sm:gap-y-12 md:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title}>
                <h3 className="flex items-start gap-2 sm:gap-3 font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold" style={{ color: colors.primary }}>
                  <span aria-hidden="true" className="text-lg sm:text-xl md:text-2xl">{'\u2713'}</span>
                  <span>{feature.title}</span>
                </h3>
                <p className="mt-3 sm:mt-5 text-xs sm:text-sm md:text-base leading-relaxed text-pretty" style={{ color: colors.mutedForeground }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 sm:mt-16 flex justify-center">
            <button
              type="button"
              className="rounded-full px-8 sm:px-10 py-3 sm:py-4 text-xs sm:text-sm font-semibold lowercase tracking-wide transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.primary, color: colors.secondary }}
              onClick={() => { window.location.href = '/book' }}
            >
              book now
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full">
        <div className="relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
            alt="Tranquil journey horizon"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(26, 26, 26, 0.45)' }} aria-hidden="true" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-28 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-tight text-balance" style={{ color: colors.secondary }}>
              Ready to {' '}
              <span style={{ color: colors.primary }}>begin</span>
              {' '}your journey?
            </h2>
            <p className="mt-4 sm:mt-6 font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal" style={{ color: 'rgba(255, 253, 245, 0.9)' }}>
              Let’s Take the First Step Together
            </p>
            <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-pretty" style={{ color: 'rgba(255, 253, 245, 0.85)' }}>
              You don’t have to figure this out on your own. Whether you’re ready to book your first session or just need someone to talk things through, we’re here for you. Reach out today, and let’s take this step together—you’ve got this, and we’ve got you.
             
            </p>
            <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {reels.map((item) => (
            <div
              key={item.src}
              className="group relative aspect-[9/13] sm:aspect-[9/14] md:aspect-[9/13] overflow-hidden bg-[#66948a]/10"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-3 sm:p-4 transition-all duration-300 group-hover:from-black/85">
                <p className="text-xs sm:text-sm font-serif text-[#fffdf5] font-semibold tracking-wide drop-shadow-sm leading-snug">
                  {item.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        @media (max-width: 640px) {
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        }
      `}</style>
    </div>
  )
}
