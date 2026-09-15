'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeaderAuthBadge } from '@/components/public/header-auth-badge'

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Astsankhlam logo" width={36} height={36} className="rounded-lg object-contain" />
          <span className={`font-bold text-lg ${scrolled ? 'text-foreground' : 'text-white'}`}>Astsankhlam</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-[#66948a] ${
                scrolled ? 'text-muted-foreground' : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <HeaderAuthBadge primaryColor="#66948a" />
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className={scrolled ? '' : 'text-white hover:text-white hover:bg-white/10'}>
              Sign in
            </Button>
          </Link>
          <Link href="/book">
            <Button size="sm" className="bg-[#66948a] hover:bg-[#4d7068] text-white">
              Book Appointment
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className={`w-5 h-5 ${scrolled ? 'text-foreground' : 'text-white'}`} />
          ) : (
            <Menu className={`w-5 h-5 ${scrolled ? 'text-foreground' : 'text-white'}`} />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-border px-4 py-4 space-y-3">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-sm font-medium text-foreground hover:text-[#66948a] py-1.5"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <HeaderAuthBadge primaryColor="#66948a" isMobile onNavigate={() => setMobileOpen(false)} />
            <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full">Sign in</Button>
            </Link>
            <Link href="/book" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full bg-[#66948a] hover:bg-[#4d7068] text-white">Book Appointment</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
