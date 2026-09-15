'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Activity,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type RolePortal = 'admin' | 'therapist' | 'patient'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const nextParam = searchParams.get('next') || ''
  const initialRole: RolePortal =
    nextParam.startsWith('/admin') || searchParams.get('role') === 'admin'
      ? 'admin'
      : nextParam.startsWith('/therapist') || searchParams.get('role') === 'therapist'
      ? 'therapist'
      : 'patient'

  const [activePortal, setActivePortal] = useState<RolePortal>(initialRole)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgotPasswordNote, setShowForgotPasswordNote] = useState(false)

  // Sync if URL params change
  useEffect(() => {
    if (nextParam.startsWith('/admin') || searchParams.get('role') === 'admin') {
      setActivePortal('admin')
    } else if (nextParam.startsWith('/therapist') || searchParams.get('role') === 'therapist') {
      setActivePortal('therapist')
    }
  }, [nextParam, searchParams])

  const handleFillDemo = (role: RolePortal) => {
    setError(null)
    if (role === 'admin') {
      setIdentifier('admin@askmclinic.com')
      setPassword('Admin@ASKM2024')
    } else if (role === 'therapist') {
      setIdentifier('ananya.sharma@astsankhlam.com')
      setPassword('Therapist@2024')
    } else {
      setIdentifier('patient@example.com')
      setPassword('Patient@2024')
    }
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

      // If a specific next destination was requested, prioritize it
      const destination = nextParam || result.redirectTo || '/'
      window.location.href = destination
    } catch {
      setError('An unexpected connection error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fffdf5]">
      {/* ── Left Hero / Brand Panel ── */}
      <div className="relative hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#66948a] text-[#fffdf5]">
        {/* Background Sanctuary Image with soft dark overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
            alt="Astsankhlam clinic sanctuary"
            fill
            className="object-cover opacity-20"
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
                Holistic Wellness Initiative
              </span>
            </div>
          </Link>
        </div>

        {/* Center narrative content */}
        <div className="relative z-10 my-auto py-10 max-w-lg">
          {activePortal === 'admin' ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold uppercase tracking-wider mb-5 backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-[#fffdf5]" />
                Administrative Console
              </div>
              <h2 className="font-serif text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-[#fffdf5]">
                Clinic Leadership & Operations Management
              </h2>
              <p className="mt-4 text-sm xl:text-base leading-relaxed text-[#fffdf5]/85">
                Coordinate practitioner schedules, oversee patient records, manage holistic offerings, and maintain compliance across Astsankhlam's therapy collective.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold uppercase tracking-wider mb-5 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#fffdf5]" />
                Holistic Healing Portal
              </div>
              <h2 className="font-serif text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-[#fffdf5]">
                Restore Your Mind. Reconnect With Balance.
              </h2>
              <p className="mt-4 text-sm xl:text-base leading-relaxed text-[#fffdf5]/85">
                A safe, compassionate space where modern psychotherapy meets yogic and chakra practices, guided by Dipanita Biswas and our dedicated practitioners.
              </p>
            </>
          )}

          {/* Feature Highlights Grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 xl:gap-4">
            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#fffdf5]" />
                <span className="text-xs font-bold text-[#fffdf5]">DPDP Compliant</span>
              </div>
              <p className="text-[11px] text-[#fffdf5]/75">256-bit encrypted medical & clinical records</p>
            </div>

            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-[#fffdf5]" />
                <span className="text-xs font-bold text-[#fffdf5]">Live Insights</span>
              </div>
              <p className="text-[11px] text-[#fffdf5]/75">Real-time scheduling & analytics tracking</p>
            </div>

            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <HeartHandshake className="w-4 h-4 text-[#fffdf5]" />
                <span className="text-xs font-bold text-[#fffdf5]">Practitioner Care</span>
              </div>
              <p className="text-[11px] text-[#fffdf5]/75">Supervised therapy & multidisciplinary tools</p>
            </div>

            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#fffdf5]" />
                <span className="text-xs font-bold text-[#fffdf5]">Instant Booking</span>
              </div>
              <p className="text-[11px] text-[#fffdf5]/75">Virtual teletherapy and in-person care</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright footnote */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-[#fffdf5]/70">
          <span>© 2026 Astsankhlam Collective</span>
          <span>Founder: Dipanita Biswas</span>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16">
        {/* Top bar: Back to site link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: '#66948a' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to website
          </Link>

          {/* Mobile Logo View */}
          <div className="lg:hidden flex items-center gap-2">
            <Image
              src="https://res.cloudinary.com/df01whs60/image/upload/v1781904502/logo_1_ffsttc.png"
              alt="Astsankhlam logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="font-serif font-bold text-sm" style={{ color: '#66948a' }}>
              Astsankhlam
            </span>
          </div>
        </div>

        {/* Centered Login Card */}
        <div className="w-full max-w-md mx-auto my-8 sm:my-10">
          {/* Portal Switcher Tabs */}
          <div className="p-1 rounded-xl bg-black/5 border border-black/5 flex items-center gap-1 mb-8">
            <button
              type="button"
              onClick={() => {
                setActivePortal('admin')
                setError(null)
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activePortal === 'admin'
                  ? 'bg-white text-[#1a1a1a] shadow-sm'
                  : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${activePortal === 'admin' ? 'text-[#66948a]' : ''}`} />
              Admin Portal
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePortal('patient')
                setError(null)
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activePortal === 'patient'
                  ? 'bg-white text-[#1a1a1a] shadow-sm'
                  : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
              }`}
            >
              Patient
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePortal('therapist')
                setError(null)
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activePortal === 'therapist'
                  ? 'bg-white text-[#1a1a1a] shadow-sm'
                  : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
              }`}
            >
              Therapist
            </button>
          </div>

          {/* Header Title and Context */}
          <div className="mb-6">
            {activePortal === 'admin' ? (
              <>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#66948a]/10 text-[#66948a] mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Management Console
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1a1a1a]">
                  Admin Sign In
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#1a1a1a]/70">
                  Authenticate with authorized administrative credentials to manage clinic operations.
                </p>
              </>
            ) : activePortal === 'therapist' ? (
              <>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#66948a]/10 text-[#66948a] mb-2">
                  Therapist Workspace
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1a1a1a]">
                  Therapist Sign In
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#1a1a1a]/70">
                  Access your appointment calendar, client sessions, and clinical notes.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1a1a1a]">
                  Welcome Back
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#1a1a1a]/70">
                  Sign in to view your bookings, intake history, and wellness pathways.
                </p>
              </>
            )}
          </div>

          {/* Sign-in Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Identifier Input */}
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="text-xs sm:text-sm font-semibold text-[#1a1a1a]">
                {activePortal === 'admin' ? 'Admin Email / Username' : 'Email or Username'}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/40" />
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    activePortal === 'admin'
                      ? 'admin@askmclinic.com'
                      : activePortal === 'therapist'
                      ? 'therapist@astsankhlam.com'
                      : 'you@example.com'
                  }
                  required
                  autoComplete="username"
                  className="pl-10 h-11 bg-white border-black/10 focus-visible:border-[#66948a] focus-visible:ring-[#66948a]/25 text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-[#1a1a1a]">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordNote(!showForgotPasswordNote)}
                  className="text-xs text-[#66948a] hover:underline font-medium"
                >
                  Forgot password?
                </button>
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

            {/* Forgot password info dialog */}
            {showForgotPasswordNote && (
              <div className="rounded-lg bg-[#66948a]/10 border border-[#66948a]/25 p-3 text-xs text-[#1a1a1a] leading-relaxed">
                <p className="font-semibold text-[#66948a] mb-0.5">Password Recovery</p>
                For security compliance, administrative and practitioner credentials can be reset by contacting the lead clinic administrator at{' '}
                <a href="mailto:hello@astsankhlam.com" className="font-semibold underline">
                  hello@astsankhlam.com
                </a>
                .
              </div>
            )}

            {/* Error Message */}
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
                  Authenticating...
                </>
              ) : (
                <>
                  <span>
                    {activePortal === 'admin'
                      ? 'Sign In to Admin Console'
                      : activePortal === 'therapist'
                      ? 'Sign In to Therapist Workspace'
                      : 'Sign In to Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-6 rounded-xl border border-black/10 bg-white/70 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#66948a] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Demo Credentials ({activePortal})
              </span>
              <button
                type="button"
                onClick={() => handleFillDemo(activePortal)}
                className="text-xs font-semibold px-2.5 py-1 rounded bg-[#66948a]/10 hover:bg-[#66948a]/20 text-[#66948a] transition-colors"
              >
                Auto-fill
              </button>
            </div>
            <div className="space-y-1 text-xs text-[#1a1a1a]/70 font-mono">
              <p>
                <span className="text-[#1a1a1a]/50">Email: </span>
                {activePortal === 'admin'
                  ? 'admin@askmclinic.com'
                  : activePortal === 'therapist'
                  ? 'ananya.sharma@astsankhlam.com'
                  : 'patient@example.com'}
              </p>
              <p>
                <span className="text-[#1a1a1a]/50">Password: </span>
                {activePortal === 'admin'
                  ? 'Admin@ASKM2024'
                  : activePortal === 'therapist'
                  ? 'Therapist@2024'
                  : 'Patient@2024'}
              </p>
            </div>
          </div>

          {/* Sign up link for patients */}
          {activePortal === 'patient' && (
            <p className="mt-6 text-center text-xs sm:text-sm text-[#1a1a1a]/70">
              Don&apos;t have an account yet?{' '}
              <Link href="/auth/sign-up" className="text-[#66948a] font-semibold hover:underline">
                Create patient account
              </Link>
            </p>
          )}

          {/* Security Notice Footnote */}
          <div className="mt-8 pt-4 border-t border-black/5 text-center">
            <p className="text-[11px] text-[#1a1a1a]/50 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-[#66948a]" />
              Secured with 256-bit SSL encryption. All administrative activities are audited.
            </p>
          </div>
        </div>

        {/* Bottom clinic tagline */}
        <div className="text-center text-xs text-[#1a1a1a]/40">
          Astsankhlam Holistic Wellness Initiative • Mind, Body & Spirit
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fffdf5]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#66948a]/30 border-t-[#66948a] rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#66948a]">Loading Astsankhlam Portal...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
