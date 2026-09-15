'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { HeaderAuthBadge } from '@/components/public/header-auth-badge'
import { NewsletterForm } from '@/components/public/newsletter-form'
import type { CSSProperties } from "react"

// STRICT COLOR PALETTE
const colors = {
  primary: '#66948a',
  secondary: '#fffdf5',
  foreground: '#1a1a1a',
  mutedForeground: 'rgba(26, 26, 26, 0.7)',
}

// Tiled floral SVG pattern updated with primary colors
const floralPattern = `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <rect width="320" height="320" fill="${colors.secondary}"/>
  <g fill="none" stroke="${colors.secondary}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
    <path d="M160 40 C120 60 100 110 120 150 C90 150 60 180 60 220 C60 260 100 290 150 280 C150 300 180 320 210 310 C250 300 270 260 250 220 C290 210 310 170 290 130 C270 90 220 80 190 100 C180 60 160 40 160 40 Z"/>
    <path d="M0 80 C30 100 40 140 20 170 C50 180 70 220 50 250 C40 270 10 280 -10 270" />
    <path d="M320 80 C290 100 280 140 300 170 C270 180 250 220 270 250 C280 270 310 280 330 270" />
    <path d="M0 -40 C40 -20 60 30 40 70 C10 70 -20 100 -20 140" />
    <path d="M320 -40 C280 -20 260 30 280 70 C310 70 340 100 340 140" />
  </g>
  <g fill="${colors.primary}">
    <ellipse cx="60" cy="40" rx="18" ry="30" transform="rotate(-20 60 40)"/>
    <ellipse cx="240" cy="30" rx="17" ry="29" transform="rotate(15 240 30)"/>
    <ellipse cx="150" cy="60" rx="16" ry="28" transform="rotate(-5 150 60)"/>
    <ellipse cx="30" cy="180" rx="18" ry="30" transform="rotate(25 30 180)"/>
    <ellipse cx="120" cy="200" rx="16" ry="27" transform="rotate(-15 120 200)"/>
    <ellipse cx="270" cy="170" rx="17" ry="29" transform="rotate(10 270 170)"/>
    <ellipse cx="200" cy="120" rx="15" ry="26" transform="rotate(-25 200 120)"/>
    <ellipse cx="90" cy="280" rx="17" ry="28" transform="rotate(20 90 280)"/>
    <ellipse cx="250" cy="280" rx="16" ry="27" transform="rotate(-10 250 280)"/>
  </g>
</svg>
`

const patternUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(floralPattern)}")`

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

// Placeholder Video component
function PlaceholderVideo({ text = "", imageSrc }: { text?: string; imageSrc?: string }) {
  return (
    <div 
      style={{ 
        width: "100%", 
        height: "100%", 
        backgroundColor: "#d1d5db", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        flexDirection: "column",
        gap: "0.5rem",
        position: "absolute",
        inset: 0
      }}
      className="group"
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={text || "Therapy and wellness video reel"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors duration-300" />
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(4px)",
          border: "1.5px solid rgba(255, 255, 255, 0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
        className="sm:w-[38px] sm:h-[38px]"
      >
        <svg width="12" height="14" viewBox="0 0 14 16" fill="#fffdf5">
          <path d="M1 1l12 7-12 7V1z" />
        </svg>
      </div>
      {text && (
        <span 
          style={{ 
            fontSize: "0.65rem", 
            color: "#fffdf5", 
            fontWeight: 600, 
            textShadow: "0 1px 4px rgba(0,0,0,0.8)", 
            padding: "0 6px", 
            textAlign: "center",
            zIndex: 10,
          }} 
          className="sm:text-[0.7rem]"
        >
          {text}
        </span>
      )}
    </div>
  );
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

// Careers Page Content Component
function CareersContent() {
  const bgStyle: CSSProperties = {
    backgroundColor: colors.secondary,
    backgroundImage: patternUrl,
    backgroundRepeat: "repeat-x",
    backgroundSize: "320px 320px",
    backgroundPosition: "top center",
  }

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden font-serif"
      style={bgStyle}
    >
      {/* Bottom fade so the pattern only lives in the top band */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px]"
        style={{
          background:
            `linear-gradient(to bottom, rgba(255,253,245,0) 55%, ${colors.secondary} 100%)`,
        }}
      />

      <div className="relative mx-auto flex max-w-[1180px] flex-col items-center px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-20 md:pb-24">
        {/* Badge button */}
        <Link
          href="/contact"
          className="z-10 w-full max-w-[420px] px-4 sm:px-6 py-3 sm:py-4 text-center font-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] shadow-sm transition-colors hover:opacity-90 inline-block"
          style={{ backgroundColor: colors.primary, color: colors.secondary }}
        >
          Join The Astsankhlam Collective
        </Link>

        {/* Overlapping rounded card */}
        <section className="-mt-4 sm:-mt-6 w-full rounded-[20px] sm:rounded-[28px] px-4 sm:px-8 md:px-12 pt-16 sm:pt-20 md:pt-24 pb-24 sm:pb-32 md:pb-40 text-center" style={{ backgroundColor: 'rgba(102, 148, 138, 0.08)' }}>
          <h1 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
            <span style={{ color: colors.primary }}>A Journey </span>
            <span className="italic" style={{ color: colors.primary }}>Inward.</span>
          </h1>

          <p className="mx-auto mt-6 sm:mt-8 max-w-[820px] text-pretty font-sans text-sm sm:text-base md:text-lg leading-relaxed" style={{ color: colors.mutedForeground }}>
            <span className="font-bold" style={{ color: colors.foreground }}>
              Astsankhlam is a holistic wellness initiative founded by{" "}
              <span className="italic">Dipanita Biswas</span>.
            </span>{" "}
            Rooted in the belief that true healing begins from within, Astsankhlam brings together psychological therapy, counseling, yoga, meditation, breathwork, and chakra healing to create a personalized journey toward inner peace and balance.
          </p>
        </section>

        {/* Why join our team section */}
        <section className="mt-12 sm:mt-16 md:mt-20 grid w-full grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Left: copy */}
          <div className="font-sans">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-none">
              <span style={{ color: colors.primary }}>Why Practice </span>
              <span style={{ color: colors.primary }}>With Us?</span>
            </h2>

            <div className="mt-6 sm:mt-8 space-y-5 sm:space-y-6 text-sm sm:text-base leading-relaxed" style={{ color: colors.mutedForeground }}>
              <div>
                <p className="font-bold" style={{ color: colors.primary }}>
                  Integrative Psychological & Yogic Wisdom
                </p>
                <p className="mt-1">
                  What makes Astsankhlam unique is our integration of psychological understanding with yogic and holistic practices—honoring that every healing journey is personal.
                </p>
              </div>

              <div>
                <p className="font-bold" style={{ color: colors.primary }}>
                  Accessible, Compassionate & Stigma-Free
                </p>
                <p className="mt-1">
                  Dipanita's vision is to make emotional and mental well-being{" "}
                  <span className="font-bold" style={{ color: colors.foreground }}>
                    accessible, compassionate, and stigma-free
                  </span>{" "}
                  within a safe space to pause, reflect, heal, and reconnect.
                </p>
              </div>

              <div>
                <p className="font-bold" style={{ color: colors.primary }}>
                  Collaborative Healing Community
                </p>
                <p className="mt-1">
                  <span className="font-bold" style={{ color: colors.foreground }}>
                    Work alongside dedicated practitioners supporting clients&ndash;
                  </span>{" "}
                  to manage stress, release emotional blockages, cultivate balance, resilience, and conscious living.
                </p>
                <p className="mt-4">
                  Every journey begins with a moment of awareness{" "}
                  <span className="font-bold" style={{ color: colors.primary }}>and every mindful step</span>{" "}
                  brings you closer to balance.
                </p>
              </div>
            </div>
          </div>

          {/* Right: images + heading */}
          <div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="relative h-[300px] sm:h-[380px] md:h-[480px] w-full rounded-sm overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=800&q=80"
                  alt="Mindful Therapy Session"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative h-[300px] sm:h-[380px] md:h-[480px] w-full rounded-sm overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
                  alt="Holistic Healing and Meditation"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <h2 className="mt-4 sm:mt-6 text-balance text-center font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-none">
              <span style={{ color: colors.primary }}>Conscious </span>
              <span style={{ color: colors.primary }}>Living</span>
            </h2>

            <div className="mt-4 sm:mt-6 font-sans text-sm sm:text-base leading-relaxed" style={{ color: colors.mutedForeground }}>
              <p className="font-bold" style={{ color: colors.primary }}>
                Restore Mind, Body & Spirit
              </p>
              <p className="mt-1">
                We empower individuals to develop greater self-awareness, improve focus, and reconnect with their{" "}
                <span className="font-bold" style={{ color: colors.foreground }}>
                  inner clarity and peace
                </span>
                , fostering long-term emotional <span className="italic">well-being and resilience</span>.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* "At home here" band */}
      <section className="relative w-full overflow-hidden px-4 pt-10 sm:pt-12 pb-16 sm:pb-20" style={{ backgroundColor: 'rgba(102, 148, 138, 0.1)' }}>
        {/* Retro curved line decoration (top-left) - hidden on small screens */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -left-4 top-0 h-[200px] w-[260px] sm:h-[250px] sm:w-[300px] md:h-[300px] md:w-[360px] hidden sm:block"
          viewBox="0 0 360 300"
          fill="none"
        >
          <g stroke={colors.secondary} strokeWidth="10" fill="none" strokeLinecap="round">
            <path d="M-40 10 H170 a90 90 0 0 1 90 90 v200" />
            <path d="M-40 40 H170 a60 60 0 0 1 60 60 v200" />
            <path d="M-40 70 H170 a30 30 0 0 1 30 30 v200" />
          </g>
        </svg>

        <div className="relative mx-auto max-w-[1180px] text-center">
          <p className="font-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: colors.primary }}>
            More Than A Wellness Space,
          </p>
          <h2 className="mx-auto mt-3 sm:mt-4 max-w-[900px] text-balance font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight" style={{ color: colors.primary }}>
            A journey inward <span className="italic">toward balance</span> and growth!
          </h2>
        </div>
      </section>

      {/* Signup band */}
      <section className="w-full px-4 py-16 sm:py-20" style={{ backgroundColor: colors.primary }}>
        <div className="mx-auto max-w-[1180px] text-center">
          <p className="font-sans text-sm sm:text-base" style={{ color: colors.secondary }}>
            Pause • Breathe • Reconnect • Heal • Align • Grow • Transform
          </p>
          <h2 className="mx-auto mt-4 sm:mt-6 max-w-[820px] text-balance font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight" style={{ color: colors.secondary }}>
            Join Our Mindful Community
          </h2>

          <form className="mx-auto mt-8 sm:mt-12 max-w-[760px] text-left font-sans">
            <label htmlFor="email" className="text-sm" style={{ color: colors.secondary }}>
              <span className="font-semibold">Email</span> (required)
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-2 block w-full rounded-sm px-4 py-3 text-sm outline-none focus:ring-2"
              style={{ backgroundColor: 'rgba(255, 253, 245, 0.2)', color: colors.foreground }}
              placeholder="you@example.com"
            />
            <p className="mt-2 text-sm" style={{ color: colors.secondary }}>
              Sign up for wellness resources, event and clinic updates
            </p>
            <button
              type="submit"
              className="mt-4 sm:mt-6 rounded-md px-6 sm:px-8 py-3 sm:py-4 text-sm tracking-wide transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.secondary, color: colors.foreground }}
            >
              submit
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default function AstsankhlamPage() {
  const reels = [
    { src: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=500&q=80", alt: "Therapy & Counseling", caption: "Therapy &\nCounseling" },
    { src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80", alt: "Yoga for Mental Health", caption: "Yoga for\nMental Health" },
    { src: "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?auto=format&fit=crop&w=500&q=80", alt: "Chakra Healing", caption: "Chakra\nHealing" },
    { src: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=500&q=80", alt: "Mindfulness & Meditation", caption: "Mindfulness &\nMeditation" },
    { src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80", alt: "Breathwork & Alignment", caption: "Breathwork &\nEnergy Alignment" },
    { src: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=500&q=80", alt: "A Journey Inward", caption: "A Journey\nInward" },
  ];

  return (
    <div className="w-full" style={{ backgroundColor: colors.secondary }}>
      {/* Header */}
      <Header />

      {/* Careers Content Section */}
      <CareersContent />

      {/* Sanctuary Image Gallery Strip */}
      <section
        className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 overflow-hidden"
        aria-label="Therapy sanctuary gallery"
      >
        {reels.map((item, i) => (
          <div
            key={i}
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
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
