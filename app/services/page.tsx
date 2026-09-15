'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { HeaderAuthBadge } from '@/components/public/header-auth-badge'
import { NewsletterForm } from '@/components/public/newsletter-form'
import { useHeroImage } from '@/lib/hooks/use-hero-image'
import { Roboto_Slab, Nunito_Sans } from "next/font/google"

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-roboto-slab",
})

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito-sans",
})

// STRICT COLOR PALETTE
const colors = {
  primary: '#66948a',
  secondary: '#fffdf5',
  foreground: '#1a1a1a',
  mutedForeground: 'rgba(26, 26, 26, 0.7)',
}

// A single daisy used to build the decorative scattered background
function Daisy({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="27"
          rx="8.5"
          ry="19"
          fill={colors.secondary}
          opacity="0.8"
          transform={`rotate(${(i * 360) / 8} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="11" fill={colors.primary} />
    </svg>
  )
}

function DaisyPattern() {
  const rows = 7
  const cols = 5
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const col = i % cols
          const shift = col % 2 === 0 ? "translate-y-3" : "-translate-y-4"
          return (
            <div key={i} className={`flex items-center justify-center ${shift}`}>
              <Daisy className="h-9 w-9 sm:h-11 sm:w-11" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Decorative flower icon that sits on top of each service card
function Flower({ petal, center }: { petal: string; center: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-14 w-14 sm:h-16 sm:w-16" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="26"
          rx="13"
          ry="19"
          fill={petal}
          transform={`rotate(${(i * 360) / 6} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="13" fill={center} />
      <circle cx="50" cy="50" r="6" fill={petal} />
    </svg>
  )
}

type Service = {
  title: string
  petal: string
  center: string
  lead: string
  rest: string
}

const services: Service[] = [
  {
    title: "Individual Therapy",
    petal: colors.primary,
    center: colors.secondary,
    lead: "Life can be overwhelming, and we all need support at times to navigate its challenges. ",
    rest: " Individual therapy can be beneficial for anyone seeking personal growth, healing, or simply a space to gain clarity and perspective. We can support you to gain a deeper understanding of yourself, create more fulfilling connections, process trauma, and work toward creating a life that feels more balanced and fulfilling. You don’t have to go through this alone - we’ve got you. Sessions can be virtual or in-person!",
  },
  {
    title: "Teen & Youth Therapy",
    petal: colors.primary,
    center: colors.secondary,
    lead: "Adolescence and teen years are some of the most complex years of our lives! ",
    rest: " It is so normal for young people to need support in dealing with relationships, emotion regulation, family dynamics, academic concerns, self-esteem and identity development, and/or social stress. We have a passion for supporting teens to feel empowered to use their innate skills by meeting them where they’re at and providing a trusting, non-judgemental space to be seen and heard. Sessions can be virtual or in-person!",
  },
  {
    title: "Couples Therapy",
    petal: colors.primary,
    center: colors.secondary,
    lead: "Every relationship has its challenges, and it’s okay to ask for help. ",
    rest: " Whether you’re feeling disconnected, struggling to communicate, or working through past wounds, couples therapy offers a space to rebuild trust and understanding. We’re here to help you navigate the ups and downs and rediscover the connection that brought you together",
  },
  {
    title: "More Affordable Therapy",
    petal: colors.primary,
    center: colors.secondary,
    lead: "We know that cost can be one of the biggest barriers to starting therapy",
    rest: " This is why we are proud to offer lower cost therapy sessions with our Intern Therapist for INR1000 (compared to the usual INR4000-INR5000 per session)!",
  },
]

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
        <Flower petal={service.petal} center={service.center} />
      </div>
      <div className="h-full rounded-[2rem] px-6 sm:px-8 md:px-10 pb-10 sm:pb-12 pt-20 sm:pt-24" style={{ backgroundColor: 'rgba(102, 148, 138, 0.08)' }}>
        <h3 className="text-center font-[family-name:var(--font-nunito-sans)] text-2xl sm:text-3xl font-normal" style={{ color: colors.foreground }}>
          {service.title}
        </h3>
        <p className="mt-6 sm:mt-8 text-center font-[family-name:var(--font-nunito-sans)] text-sm sm:text-[15px] leading-relaxed" style={{ color: colors.mutedForeground }}>
          <span className="font-bold" style={{ color: colors.primary }}>{service.lead}</span>
          {service.rest}
        </p>
      </div>
    </div>
  )
}

function StepCard({
  number,
  title,
  body,
}: {
  number: string
  title: string
  body: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border px-6 sm:px-8 md:px-12 py-8 sm:py-12 bg-transparent" style={{ borderColor: 'rgba(102, 148, 138, 0.2)' }}>
      <p className="text-center font-[family-name:var(--font-roboto-slab)] text-4xl sm:text-5xl font-extrabold" style={{ color: colors.primary }}>
        {number}
      </p>
      <p className="mt-6 sm:mt-8 text-center font-[family-name:var(--font-nunito-sans)] text-xs sm:text-sm font-bold uppercase tracking-[0.12em]" style={{ color: colors.primary }}>
        {title}
      </p>
      <div className="mt-5 sm:mt-7 text-center font-[family-name:var(--font-nunito-sans)] text-sm sm:text-[15px] leading-relaxed" style={{ color: colors.mutedForeground }}>
        {body}
      </div>
    </div>
  )
}

type Faq = {
  q: string
  a: React.ReactNode
}

const faqs: Faq[] = [
  {
    q: "Do you offer discounted or sliding scale rates?",
    a: (
      <p>
       Every therapist with 
Astsankhlam  has some capacity to take on a reduced rate client. Contact us for more information!
      </p>
    ),
  },
  {
    q: "Do you offer direct billing group insurance plans?",
    a: (
      <>
        <p>
          Yes! We offer direct billing to a selection of Group Insurance providers. If you want to know if your particular plan is one of our partners, please contact{" "}
          <a
            href="mailto:hello@astsankhlam.com"
            className="underline underline-offset-2"
            style={{ color: colors.primary, textDecorationColor: colors.primary }}
          >
            hello@astsankhlam.com
          </a>
          .
        </p>
        <p className="mt-5 font-bold" style={{ color: colors.foreground }}>
          We strongly recommend checking with your insurance company to confirm whether your plan covers the specific licensure or registration of the clinician you'd like to work with, as coverage can vary depending on title and designation.
        </p>
        <p className="mt-5">
        If your Group Plan is not on our list, you will receive an itemized receipt at the end of every session with all of the information you will need to apply for a reimbursement.
        </p>
      </>
    ),
  },
  {
    q: "How do I decide which therapist is right for me?",
    a: (
      <p>
       Finding the right therapist is a lot like dating- sometimes you have to “swipe”” a bunch before finding your perfect match. Feel free to reach out for a free 15-minute consultation with any of our time members to see if you connect.
      </p>
    ),
  },
  {
    q: "How long are appointments?",
    a: (
      <p>
      Appointment lengths vary by service and client preference. Individual Therapy sessions are generally 50-minutes in length. Couples Therapy sessions are generally 90-minutes in length, as well as some EMDR sessions. If you believe that longer or shorter appointment times would be beneficial for your needs, please get in touch to discuss.
      </p>
    ),
  },
  {
    q: "I’m in need of immediate help and am experiencing a mental health crisis. Can you help me?",
    a: (
      <p>
       Unfortunately, we do not have the resources to offer crisis intervention in emergency mental health situations. For immediate care, please call or text the Distress Centre at 108 (open 24/7) or contact your local crisis line. 
      </p>
    ),
  },
  {
    q: "What makes Astsankhlam's holistic approach unique?",
    a: (
      <p>
        What makes Astsankhlam unique is our integration of psychological understanding with yogic and holistic practices such as yoga, meditation, breathwork, and chakra healing. Every individual is different, and therefore every healing journey is personalized.
      </p>
    ),
  },
]

function FaqItem({ faq, defaultOpen }: { faq: Faq; defaultOpen?: boolean }) {
  return (
    <details
      open={defaultOpen}
      className="group border-b py-4 sm:py-5 [&_svg]:open:rotate-180"
      style={{ borderColor: 'rgba(102, 148, 138, 0.2)' }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span className="font-[family-name:var(--font-nunito-sans)] text-xs sm:text-sm font-bold uppercase tracking-[0.12em]" style={{ color: colors.foreground }}>
          {faq.q}
        </span>
        <svg
          className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          style={{ color: colors.primary }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div className="mt-4 sm:mt-5 font-[family-name:var(--font-nunito-sans)] text-sm sm:text-[15px] leading-relaxed" style={{ color: colors.mutedForeground }}>
        {faq.a}
      </div>
    </details>
  )
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
function ImagePlaceholder({ className = "", text = "Image" }: { className?: string; text?: string }) {
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
            <HeaderAuthBadge primaryColor={colors.primary} />
            <Link href="/book" className="rounded-lg px-4 xl:px-6 py-2.5 xl:py-3 text-sm font-semibold lowercase tracking-wide transition-colors hover:opacity-90 whitespace-nowrap" style={{ backgroundColor: colors.primary, color: colors.secondary }}>
              book now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button type="button" className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} style={{ color: colors.foreground }} /> : <Menu size={24} style={{ color: colors.foreground }} />}
          </button>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden border-t" style={{ borderColor: 'rgba(26, 26, 26, 0.1)' }}>
            <nav className="flex flex-col py-4 space-y-3">
              <Link href="/about" className="text-sm font-medium py-2" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>about</Link>
              <Link href="/services" className="text-sm font-medium py-2" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>services</Link>
              <Link href="/contact" className="text-sm font-medium py-2" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>contact</Link>
              <Link href="/careers" className="text-sm font-medium py-2" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>careers</Link>
              <Link href="/blog" className="text-sm font-medium py-2" style={{ color: colors.foreground }} onClick={() => setIsMenuOpen(false)}>blog</Link>
              <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: 'rgba(26, 26, 26, 0.1)' }}>
                <a href="https://www.instagram.com/astsankhlam/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: colors.foreground }}><InstagramIcon size={20} /></a>
                <a href="https://www.linkedin.com/company/astsankhlam" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: colors.foreground }}><LinkedInIcon size={20} /></a>
                <a href="mailto:hello@astsankhlam.com" aria-label="Email" style={{ color: colors.foreground }}><EmailIcon size={20} /></a>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <HeaderAuthBadge primaryColor={colors.primary} isMobile onNavigate={() => setIsMenuOpen(false)} />
                <Link href="/book" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-6 py-3 text-sm font-semibold lowercase tracking-wide transition-colors hover:opacity-90 w-full text-center block" style={{ backgroundColor: colors.primary, color: colors.secondary }}>book now</Link>
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
          <div className="flex flex-col gap-6 sm:gap-8 items-center md:items-start">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-lg">
                <Image src="https://res.cloudinary.com/df01whs60/image/upload/v1781904502/logo_1_ffsttc.png" alt="Astsankhlam logo" width={56} height={56} className="object-contain" />
              </div>
              <span className="font-serif text-lg sm:text-xl font-bold" style={{ color: colors.primary }}>Astsankhlam</span>
            </div>
            <div className="flex gap-2">
              <a href="https://www.instagram.com/astsankhlam/" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded hover:opacity-90" aria-label="Instagram" style={{ backgroundColor: colors.primary, color: colors.secondary }}><InstagramIcon size={16} /></a>
              <a href="https://www.linkedin.com/company/astsankhlam" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded hover:opacity-90" aria-label="LinkedIn" style={{ backgroundColor: colors.primary, color: colors.secondary }}><LinkedInIcon size={16} /></a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Services</h3>
              <Link href="/services" className="text-sm hover:underline" style={{ color: colors.foreground }}>Therapy & Counseling</Link>
              <Link href="/services" className="text-sm hover:underline" style={{ color: colors.foreground }}>Yoga for Mental Health</Link>
              <Link href="/services" className="text-sm hover:underline" style={{ color: colors.foreground }}>Chakra Healing</Link>
              <Link href="/services" className="text-sm hover:underline" style={{ color: colors.foreground }}>Mindfulness & Meditation</Link>
            </div>
            <div className="flex flex-col gap-3 sm:gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Company</h3>
              <Link href="/about" className="text-sm hover:underline" style={{ color: colors.foreground }}>About Us</Link>
              <Link href="/blog" className="text-sm hover:underline" style={{ color: colors.foreground }}>Blog</Link>
              <Link href="/contact" className="text-sm hover:underline" style={{ color: colors.foreground }}>Contact</Link>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-black" style={{ color: colors.foreground }}>See what the buzz is about!</h3>
              <p className="mt-2 text-xs sm:text-sm" style={{ color: colors.mutedForeground }}>Sign up with your email to receive resources, event and clinic updates! 
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
        <div className="my-8 sm:my-12 border-t" style={{ borderColor: 'rgba(26,26,26,0.2)' }} />
        <div className="flex flex-col items-center gap-4 sm:gap-6 py-6 sm:py-8">
          <p className="text-center text-xs sm:text-sm font-semibold uppercase tracking-widest" style={{ color: colors.primary }}>Book your free 15 minute consult call!</p>
          <Link href="/book" className="rounded-lg px-6 sm:px-8 py-3 sm:py-4 text-sm font-semibold lowercase inline-block" style={{ backgroundColor: colors.primary, color: colors.secondary }}>book now</Link>
        </div>
        <div className="my-8 sm:my-12 border-t" style={{ borderColor: 'rgba(26,26,26,0.2)' }} />
        <div className="space-y-4 sm:space-y-6 text-center">
          <p className="text-[10px] sm:text-xs leading-relaxed px-2" style={{ color: colors.mutedForeground }}>We gratefully acknowledge and honor that where we live and work is within the traditional territories of the people of the Treaty 7 region in Southern Alberta, which includes the Blackfoot Confederacy (comprising the Siksika, Piikani, and Kainai First Nations) as well as the Tsuut’ina First Nation, and the Stoney Nakoda (including the Chiniki, Bearspaw, and Wesley First Nations); and Métis Nation of Alberta, Region 3. The traditional Blackfoot name of this place is “Mohkinstsis”, which is also known now as the City of Calgary.</p>
          <p className="text-[10px] sm:text-xs" style={{ color: colors.mutedForeground }}>© 2026 Astsankhlam | Founded by <a href="/about" className="hover:underline" style={{ color: colors.primary }}>Dipanita Biswas</a> | Holistic Wellness Initiative</p>
        </div>
      </div>
    </footer>
  )
}

export default function AstsankhlamPage() {
  const { imageUrl: heroImageUrl, altText: heroAltText } = useHeroImage(
    'services',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1000&q=80'
  )

  return (
    <div className="w-full" style={{ backgroundColor: colors.secondary }}>
      <Header />

      <main className={`${robotoSlab.variable} ${nunitoSans.variable} min-h-screen w-full`} style={{ backgroundColor: colors.secondary }}>
        <section className="grid w-full grid-cols-1 items-center lg:grid-cols-2">
          {/* LEFT: daisy pattern + photo */}
          <div className="relative flex items-center justify-center px-4 sm:px-10 py-12 sm:py-16 lg:justify-end lg:py-24 lg:pr-0" style={{ backgroundColor: colors.secondary }}>
            <DaisyPattern />

            <div className="relative z-10 w-full max-w-[620px] lg:max-w-[640px] lg:translate-x-12">
              <div className="relative h-[350px] sm:h-[450px] md:h-[560px] lg:h-[680px] w-full overflow-hidden rounded-md shadow-md">
                <Image
                  src={heroImageUrl}
                  alt={heroAltText || "Therapy and compassionate counseling session"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: copy */}
          <div className="flex items-center px-4 sm:px-8 md:px-12 py-12 sm:py-16 lg:py-20 lg:pl-20 lg:pr-12" style={{ backgroundColor: 'rgba(102, 148, 138, 0.04)' }}>
            <div className="mx-auto max-w-xl">
              <h2 className="font-[family-name:var(--font-roboto-slab)] text-2xl sm:text-3xl md:text-4xl lg:text-[2.4rem] font-extrabold leading-tight tracking-tight">
                <span style={{ color: colors.primary }}>Our practice is based on the </span>
                <span style={{ color: colors.primary }}>healing power of human connection</span>
                <span style={{ color: colors.primary }}> and </span>
                <span style={{ color: colors.primary }}>relationships.</span>
              </h2>

              <p className="mt-6 sm:mt-8 font-[family-name:var(--font-nunito-sans)] text-sm sm:text-base leading-relaxed" style={{ color: colors.mutedForeground }}>
              We are totally not{" "}
                <span className="italic">'blank slate therapists'</span>; we will be expressive and feeling alongside you. We believe that mental health care should be accessible and that therapists best serve their clients by being real and authentic. We show up to the therapy space as our genuine human selves, and we encourage our clients to show up as their authentic selves too!
              </p>

              <h3 className="mt-8 sm:mt-10 font-[family-name:var(--font-roboto-slab)] text-xl sm:text-2xl md:text-3xl lg:text-[2.2rem] font-extrabold leading-tight" style={{ color: colors.primary }}>
                Where real{" "}
                <span className="underline decoration-2 underline-offset-4" style={{ textDecorationColor: colors.primary }}>
                  support
                </span>{" "}
                meets the{" "}
                <span className="underline decoration-2 underline-offset-4" style={{ textDecorationColor: colors.primary }}>
                 real you.
                </span>
              </h3>

              <p className="mt-6 sm:mt-8 text-center font-[family-name:var(--font-nunito-sans)] text-sm sm:text-base" style={{ color: colors.mutedForeground }}>
               Because we believe that healing begins with connection.
             
              </p>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-28" style={{ backgroundColor: colors.secondary }}>
          <div className="mx-auto max-w-6xl">
            <p className="text-center font-[family-name:var(--font-nunito-sans)] text-xs sm:text-sm font-bold uppercase tracking-[0.18em]" style={{ color: colors.primary }}>
              Astsankhlam Services
            </p>

            <h2 className="mt-4 text-center font-[family-name:var(--font-roboto-slab)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              <span style={{ color: colors.primary }}>Your path to healing starts </span>
              <span style={{ color: colors.primary }}>here.</span>
            </h2>

            <div className="mx-auto mt-16 sm:mt-20 md:mt-24 grid max-w-4xl grid-cols-1 gap-x-8 sm:gap-x-10 gap-y-20 sm:gap-y-24 sm:grid-cols-2">
              {services.map((service) => (
                <ServiceCard key={service.title} service={service} />
              ))}
            </div>
          </div>
        </section>

        {/* THE NEXT STEPS */}
        <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-28" style={{ backgroundColor: colors.secondary }}>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-[family-name:var(--font-roboto-slab)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight" style={{ color: colors.primary }}>
              The Next Steps
            </h2>

            <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
              <StepCard
                number="01"
                title="Pause & Reflect"
                body={
                  <p>
                    Take a moment to check in with yourself. Acknowledge what you are feeling and recognize your need for care.
                  </p>
                }
              />
              <StepCard
                number="02"
                title="Explore Our Services"
                body={
                  <p>
                    Browse through our psychological therapy, yoga for mental health, meditation, and chakra healing offerings.
                  </p>
                }
              />
              <StepCard
                number="03"
                title="Schedule a Session"
                body={
                  <p>
                    Choose a time that suits you for an individual consultation, virtual session, or in-person workshop.
                  </p>
                }
              />
              <StepCard
                number="04"
                title="Begin Your Journey"
                body={
                  <p>
                    Step into a supportive, compassionate space dedicated to your inner peace and lasting well-being.
                  </p>
                }
              />
            </div>
          </div>
        </section>

        {/* DAISY BANNER CTA */}
        <section className="relative w-full overflow-hidden bg-gray-200">
          <Image
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80"
            alt="Mindful wellness background"
            fill
            sizes="100vw"
            className="object-cover brightness-50"
          />
          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 sm:px-6 py-20 sm:py-24 md:py-28 lg:py-32 text-center">
            <h2 className="font-[family-name:var(--font-roboto-slab)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              <span style={{ color: colors.secondary }}>Restore your mind. </span>
              <span style={{ color: colors.primary }}>Reconnect with yourself.</span>
            </h2>
            <p className="mt-4 sm:mt-6 max-w-2xl font-[family-name:var(--font-nunito-sans)] text-lg sm:text-xl md:text-2xl leading-relaxed" style={{ color: colors.secondary }}>
              Rediscover balance—
              <span className="italic">Astsankhlam walks alongside you, one mindful step at a time.</span>
            </p>
            <Link
              href="/book"
              className="mt-8 sm:mt-10 rounded-md px-6 sm:px-8 py-3 font-[family-name:var(--font-nunito-sans)] text-sm font-bold lowercase tracking-wide transition-colors hover:opacity-90 inline-block"
              style={{ backgroundColor: colors.primary, color: colors.secondary }}
            >
              book now!
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-28" style={{ backgroundColor: colors.secondary }}>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div className="lg:pt-6">
              <h2 className="text-center font-[family-name:var(--font-roboto-slab)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight lg:text-left" style={{ color: colors.primary }}>
                FAQs
              </h2>
            </div>

            <div className="border-t" style={{ borderColor: 'rgba(102, 148, 138, 0.2)' }}>
              {faqs.map((faq, i) => (
                <FaqItem key={faq.q} faq={faq} defaultOpen={i === 1} />
              ))}
            </div>
          </div>
        </section>

        {/* Sanctuary Image Gallery Strip */}
        <section className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 overflow-hidden" aria-label="Therapy sanctuary gallery">
          {[
            { src: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=600&q=80", alt: "Therapy & Counseling" },
            { src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80", alt: "Yoga for Mental Health" },
            { src: "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?auto=format&fit=crop&w=600&q=80", alt: "Chakra Healing" },
            { src: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80", alt: "Mindfulness & Meditation" },
            { src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80", alt: "Breathwork & Alignment" },
            { src: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=600&q=80", alt: "A Journey Inward" },
          ].map((item, i) => (
            <div key={i} className="group relative aspect-[9/13] sm:aspect-[9/14] md:aspect-[9/13] overflow-hidden bg-[#66948a]/10">
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
      </main>

      <Footer />
    </div>
  )
}
