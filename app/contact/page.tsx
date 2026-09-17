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

// Header Component with mobile menu
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: colors.secondary }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-3 md:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0" aria-label="Astsankhlam">
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 transition-transform duration-200 hover:scale-105">
              <Image
                src="https://res.cloudinary.com/df01whs60/image/upload/v1781904502/logo_1_ffsttc.png"
                alt="Astsankhlam logo"
                width={80}
                height={80}
                priority
                className="h-full w-full object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link href="/about" className="text-sm font-medium hover:opacity-80 transition-colors whitespace-nowrap" style={{ color: colors.foreground }}>
              About
            </Link>
            <Link href="/services" className="text-sm font-medium hover:opacity-80 transition-colors whitespace-nowrap" style={{ color: colors.foreground }}>
              Services
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:opacity-80 transition-colors whitespace-nowrap" style={{ color: colors.foreground }}>
              Contact
            </Link>
            <Link href="/careers" className="text-sm font-medium hover:opacity-80 transition-colors whitespace-nowrap" style={{ color: colors.foreground }}>
              Careers
            </Link>
            
            <Link href="/blog" className="text-sm font-medium hover:opacity-80 transition-colors whitespace-nowrap" style={{ color: colors.foreground }}>
              Blog
            </Link>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            <HeaderAuthBadge primaryColor={colors.primary} />
            <Link
              href="/book"
              className="rounded-lg px-4 xl:px-6 py-2.5 xl:py-3 text-sm font-semibold tracking-wide transition-colors hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: colors.primary, color: colors.secondary }}
            >
              Book Now
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
                About
              </Link>
              <Link href="/services" className="text-sm font-medium py-2 hover:opacity-80 transition-colors" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>
                Services
              </Link>
              <Link href="/contact" className="text-sm font-medium py-2 hover:opacity-80 transition-colors" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              <Link href="/careers" className="text-sm font-medium py-2 hover:opacity-80 transition-colors" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>
                Careers
              </Link>
              <Link href="/blog" className="text-sm font-medium py-2 hover:opacity-80 transition-colors" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>
                Blog
              </Link>
              <div className="flex flex-col gap-2 mt-2 pt-3 border-t" style={{ borderColor: 'rgba(26, 26, 26, 0.1)' }}>
                <HeaderAuthBadge primaryColor={colors.primary} isMobile onNavigate={() => setIsMenuOpen(false)} />
                <Link
                  href="/book"
                  className="rounded-lg px-6 py-3 text-sm font-semibold tracking-wide transition-colors hover:opacity-90 w-full text-center block"
                  style={{ backgroundColor: colors.primary, color: colors.secondary }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Book Now
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

// Location & Contact Section
function LocationContactSection() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    newsletter: false,
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value
    setForm((prev) => ({ ...prev, [target.name]: value }))
    if (status) setStatus(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          newsletter_opt_in: form.newsletter,
          subject: form.subject,
          message: form.message,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to send your message. Please try again.',
        })
      } else {
        setStatus({
          type: 'success',
          message: data.message || 'Thank you! Your message has been sent successfully.',
        })
        setForm({
          firstName: '',
          lastName: '',
          email: '',
          newsletter: false,
          subject: '',
          message: '',
        })
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please check your connection and try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="contact-form"
      className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 scroll-mt-10"
      style={{ backgroundColor: colors.secondary }}
    >
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">

        {/* ── Left: Location Info ── */}
        <div className="flex-1 flex flex-col items-center text-center gap-4 sm:gap-5 w-full">
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
            style={{
              color: colors.primary,
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontStyle: "italic",
            }}
          >
            Our Location
          </h2>

          <div className="flex flex-col gap-1 mt-2">
            <p className="text-sm sm:text-base" style={{ color: colors.foreground }}>
              Holistic Wellness & Mindful Care
            </p>
            <p className="text-sm italic" style={{ color: colors.primary }}>
              Virtual & In-Person Sessions Available
            </p>
          </div>

          <a href="tel:+919876543210" className="text-sm sm:text-base hover:underline" style={{ color: colors.foreground }}>
            (+91) 98765-43210
          </a>

          {/* Social Icons */}
          <div className="flex items-center gap-5 mt-4">
            <a href="https://www.instagram.com/astsankhlam/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.5" cy="6.5" r="0.8" fill={colors.primary} stroke="none" />
              </svg>
            </a>

            <a href="mailto:hello@astsankhlam.com" aria-label="Email" className="hover:opacity-70 transition-opacity">
              <svg width="26" height="20" viewBox="0 0 26 20" fill="none"
                stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="1" width="24" height="18" rx="3" />
                <polyline points="1,1 13,11 25,1" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Right: Contact Form ── */}
        <div className="flex-1 w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">

            {/* Name row */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium" style={{ color: colors.foreground }}>
                Name
              </span>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs" style={{ color: colors.foreground }}>
                    First Name{" "}
                    <span className="font-normal" style={{ color: colors.mutedForeground }}>
                      (required)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full h-10 rounded-md border-0 outline-none px-3 text-sm"
                    style={{ backgroundColor: 'rgba(102, 148, 138, 0.15)', color: colors.foreground }}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs" style={{ color: colors.foreground }}>
                    Last Name{" "}
                    <span className="font-normal" style={{ color: colors.mutedForeground }}>
                      (required)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full h-10 rounded-md border-0 outline-none px-3 text-sm"
                    style={{ backgroundColor: 'rgba(102, 148, 138, 0.15)', color: colors.foreground }}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: colors.foreground }}>
                Email{" "}
                <span className="font-normal" style={{ color: colors.mutedForeground }}>
                  (required)
                </span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full h-10 rounded-md border-0 outline-none px-3 text-sm"
                style={{ backgroundColor: 'rgba(102, 148, 138, 0.15)', color: colors.foreground }}
              />
            </div>

            {/* Newsletter checkbox */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  id="newsletter"
                  name="newsletter"
                  checked={form.newsletter}
                  onChange={handleChange}
                  className="w-4 h-4 rounded-full cursor-pointer appearance-none border border-gray-400 checked:bg-[#66948a] checked:border-[#66948a]"
                />
                {form.newsletter && (
                  <svg className="absolute w-3 h-3 pointer-events-none" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <label htmlFor="newsletter" className="text-sm cursor-pointer" style={{ color: colors.primary }}>
                Sign up for news and updates
              </label>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: colors.foreground }}>
                Subject{" "}
                <span className="font-normal" style={{ color: colors.mutedForeground }}>
                  (required)
                </span>
              </label>
              <input
                type="text"
                name="subject"
                required
                value={form.subject}
                onChange={handleChange}
                className="w-full h-10 rounded-md border-0 outline-none px-3 text-sm"
                style={{ backgroundColor: 'rgba(102, 148, 138, 0.15)', color: colors.foreground }}
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: colors.foreground }}>
                Message{" "}
                <span className="font-normal" style={{ color: colors.mutedForeground }}>
                  (required)
                </span>
              </label>
              <textarea
                name="message"
                required
                value={form.message}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-md border-0 outline-none px-3 py-2 text-sm resize-y"
                style={{ backgroundColor: 'rgba(102, 148, 138, 0.15)', color: colors.foreground }}
              />
            </div>

            {/* Status Feedback */}
            {status && (
              <div
                className={`p-3.5 rounded-lg text-sm transition-all ${
                  status.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {status.message}
              </div>
            )}

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm font-medium hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: colors.primary, color: colors.secondary }}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </section>
  )
}

// Reels Section
function MapAndVideos() {
  return (
    <section className="w-full">
      <ReelsGallery />
    </section>
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

          {/* Right Column - Newsletter */}
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
            className="rounded-lg px-6 sm:px-8 py-3 sm:py-4 text-sm font-semibold transition-colors hover:opacity-90 inline-block"
            style={{ backgroundColor: colors.primary, color: colors.secondary }}
          >
            Book Now
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
  const { imageUrl, altText } = useHeroImage(
    'contact',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'
  )

  return (
    <div className="w-full" style={{ backgroundColor: colors.secondary }}>
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[90vh]">
        {/* Left column - image */}
        <div className="relative min-h-[40vh] sm:min-h-[50vh] lg:min-h-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={altText || "Astsankhlam sanctuary"}
            fill
            className="absolute inset-0 object-cover"
            priority
          />
        </div>

        {/* Right column - structured editorial content */}
        <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-16 py-12 sm:py-16 lg:py-12 text-left" style={{ backgroundColor: colors.secondary }}>
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit mb-5 border text-xs sm:text-sm tracking-wider uppercase font-semibold"
            style={{
              backgroundColor: 'rgba(102, 148, 138, 0.08)',
              borderColor: 'rgba(102, 148, 138, 0.25)',
              color: colors.primary,
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }} />
            Connect With Astsankhlam
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.15]" style={{ color: colors.foreground }}>
            We're Here For{' '}
            <span className="block font-serif italic font-normal mt-1" style={{ color: colors.primary }}>
              Your Healing Journey.
            </span>
          </h1>

          <p className="mt-5 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl text-pretty" style={{ color: colors.mutedForeground }}>
            Whether you are looking to manage stress, understand your emotions, navigate transitions, or reconnect with inner peace—Astsankhlam walks alongside you with compassion, one mindful step at a time.
          </p>

          {/* Contact Touchpoints Grid */}
          <div className="mt-7 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl">
            <div className="p-3.5 sm:p-4 rounded-xl border bg-white/70 shadow-sm transition-all hover:shadow-md" style={{ borderColor: 'rgba(102, 148, 138, 0.2)' }}>
              <p className="font-serif text-sm sm:text-base font-bold" style={{ color: colors.primary }}>Direct Appointments</p>
              <p className="text-[11px] sm:text-xs mt-1 leading-snug" style={{ color: colors.mutedForeground }}>
                Select your therapist and reserve your preferred time slot online.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border bg-white/70 shadow-sm transition-all hover:shadow-md" style={{ borderColor: 'rgba(102, 148, 138, 0.2)' }}>
              <p className="font-serif text-sm sm:text-base font-bold" style={{ color: colors.primary }}>Flexible Care</p>
              <p className="text-[11px] sm:text-xs mt-1 leading-snug" style={{ color: colors.mutedForeground }}>
                Secure virtual teletherapy across India and in-person sessions.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border bg-white/70 shadow-sm transition-all hover:shadow-md" style={{ borderColor: 'rgba(102, 148, 138, 0.2)' }}>
              <p className="font-serif text-sm sm:text-base font-bold" style={{ color: colors.primary }}>Email Inquiries</p>
              <a href="mailto:hello@astsankhlam.com" className="text-xs mt-1 block font-medium hover:underline" style={{ color: colors.foreground }}>
                hello@astsankhlam.com
              </a>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border bg-white/70 shadow-sm transition-all hover:shadow-md" style={{ borderColor: 'rgba(102, 148, 138, 0.2)' }}>
              <p className="font-serif text-sm sm:text-base font-bold" style={{ color: colors.primary }}>Call & WhatsApp</p>
              <a href="tel:+919876543210" className="text-xs mt-1 block font-medium hover:underline" style={{ color: colors.foreground }}>
                (+91) 98765-43210
              </a>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 sm:mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/book"
              className="rounded-md px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-medium tracking-wide transition-all duration-300 hover:opacity-90 shadow-sm"
              style={{ backgroundColor: colors.primary, color: colors.secondary }}
            >
              Book An Appointment
            </Link>
            <a
              href="#contact-form"
              className="rounded-md px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-medium tracking-wide transition-all duration-300 hover:bg-black/5 border"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              Send A Message
            </a>
          </div>

          <p className="mt-4 text-[11px] sm:text-xs italic" style={{ color: colors.mutedForeground }}>
            * All conversations and inquiries are strictly confidential.
          </p>
        </div>
      </section>

      {/* Location & Contact Section */}
      <LocationContactSection />

      {/* Map & Videos Section */}
      <MapAndVideos />

      {/* Footer */}
      <Footer />
    </div>
  )
}
