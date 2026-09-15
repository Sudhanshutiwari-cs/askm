'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Heart,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Calendar,
  Sparkles,
  ShieldCheck,
  Video,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function PatientLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawNext = searchParams.get('next')
  const nextParam = rawNext && !rawNext.includes('login') && !rawNext.includes('sign-up') ? rawNext : null

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFillDemo = () => {
    setError(null)
    setIdentifier('patient@example.com')
    setPassword('Patient@2024')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      const result = await res.json()

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Navigate to patient dashboard or requested destination with full cookie propagation
      const target = nextParam || result.redirectTo || '/patient'
      window.location.href = target
    } catch {
      setError('A connection error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fffdf5]">
      {/* ── Left Hero Panel ── */}
      <div className="relative hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#66948a] text-[#fffdf5]">
        {/* Background visual with soft overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1600&q=80"
            alt="Astsankhlam peaceful sanctuary"
            fill
            className="object-cover opacity-25"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#66948a]/95 via-[#66948a]/90 to-[#4d7068]" />
        </div>

        {/* Top brand header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white/15 p-1 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
              <Image
                src="https://res.cloudinary.com/df01whs60/image/upload/v1781904502/logo_1_ffsttc.png"
                alt="Astsankhlam logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-[#fffdf5]">
                Astsankhlam
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-[#fffdf5]/75">
                Patient & Client Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Center narrative */}
        <div className="relative z-10 my-auto py-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold uppercase tracking-wider mb-5 backdrop-blur-sm">
            <Heart className="w-3.5 h-3.5 text-[#fffdf5]" />
            Your Healing Pathway
          </div>

          <h1 className="font-serif text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-[#fffdf5]">
            Welcome to Your Personal Wellness Sanctuary
          </h1>

          <p className="mt-4 text-sm xl:text-base leading-relaxed text-[#fffdf5]/85">
            Sign in to view your upcoming therapy appointments, join virtual video sessions, review personal wellness reflections, and stay connected with your care team.
          </p>

          {/* Patient benefits grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 xl:gap-4">
            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-[#fffdf5]" />
                <span className="text-xs font-bold text-[#fffdf5]">Upcoming Sessions</span>
              </div>
              <p className="text-[11px] text-[#fffdf5]/75">Manage bookings & reschedule with ease</p>
            </div>

            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-4 h-4 text-[#fffdf5]" />
                <span className="text-xs font-bold text-[#fffdf5]">Teletherapy Links</span>
              </div>
              <p className="text-[11px] text-[#fffdf5]/75">One-click secure video room access</p>
            </div>

            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#fffdf5]" />
                <span className="text-xs font-bold text-[#fffdf5]">Holistic Guidance</span>
              </div>
              <p className="text-[11px] text-[#fffdf5]/75">Therapy, breathwork & yoga practices</p>
            </div>

            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#fffdf5]" />
                <span className="text-xs font-bold text-[#fffdf5]">100% Confidential</span>
              </div>
              <p className="text-[11px] text-[#fffdf5]/75">Private, stigma-free and protected</p>
            </div>
          </div>
        </div>

        {/* Bottom footnote */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-[#fffdf5]/70">
          <span>© 2026 Astsankhlam</span>
          <Link href="/auth/login" className="hover:underline">
            Admin or Staff? Click here
          </Link>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: '#66948a' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to website
          </Link>

          <Link
            href="/auth/login"
            className="text-xs sm:text-sm font-medium hover:underline text-[#1a1a1a]/70"
          >
            Admin Sign In →
          </Link>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md mx-auto my-8 sm:my-10">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#66948a]/10 text-[#66948a] mb-2">
              <Heart className="w-3.5 h-3.5" />
              Patient Portal
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1a1a1a]">
              Patient Sign In
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#1a1a1a]/70">
              Enter your email or username to access your therapy sessions and bookings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email / Username */}
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="text-xs sm:text-sm font-semibold text-[#1a1a1a]">
                Email Address or Username
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/40" />
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="patient@example.com"
                  required
                  autoComplete="username"
                  className="pl-10 h-11 bg-white border-black/10 focus-visible:border-[#66948a] focus-visible:ring-[#66948a]/25 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-[#1a1a1a]">
                  Password
                </Label>
                <Link
                  href="/contact"
                  className="text-xs text-[#66948a] hover:underline font-medium"
                >
                  Need help?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/40" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-11 bg-white border-black/10 focus-visible:border-[#66948a] focus-visible:ring-[#66948a]/25 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs sm:text-sm text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#66948a] hover:bg-[#52776e] text-white font-medium text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <span>Sign In to Patient Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Demo Login Helper */}
          <div className="mt-6 rounded-xl border border-black/10 bg-white/70 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#66948a] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Demo Patient Account
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs font-semibold px-2.5 py-1 rounded bg-[#66948a]/10 hover:bg-[#66948a]/20 text-[#66948a] transition-colors"
              >
                Auto-fill
              </button>
            </div>
            <div className="space-y-1 text-xs text-[#1a1a1a]/70 font-mono">
              <p>
                <span className="text-[#1a1a1a]/50">Email: </span>
                patient@example.com
              </p>
              <p>
                <span className="text-[#1a1a1a]/50">Password: </span>
                Patient@2024
              </p>
            </div>
          </div>

          {/* Create Account Link */}
          <p className="mt-6 text-center text-xs sm:text-sm text-[#1a1a1a]/70">
            First time at Astsankhlam?{' '}
            <Link href="/auth/sign-up" className="text-[#66948a] font-semibold hover:underline">
              Create a free account
            </Link>
          </p>

          <div className="mt-4 text-center">
            <Link href="/book" className="text-xs text-[#66948a] hover:underline">
              Book a new appointment without an account →
            </Link>
          </div>
        </div>

        {/* Bottom clinic info */}
        <div className="text-center text-xs text-[#1a1a1a]/40">
          Astsankhlam Holistic Wellness Initiative • Mind, Body & Spirit
        </div>
      </div>
    </div>
  )
}

export default function PatientLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fffdf5]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#66948a]/30 border-t-[#66948a] rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#66948a]">Loading Patient Portal...</p>
          </div>
        </div>
      }
    >
      <PatientLoginForm />
    </Suspense>
  )
}
