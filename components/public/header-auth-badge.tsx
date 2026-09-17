'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface HeaderAuthBadgeProps {
  primaryColor?: string
  isMobile?: boolean
  onNavigate?: () => void
}

export function HeaderAuthBadge({
  primaryColor = '#66948a',
  isMobile = false,
  onNavigate,
}: HeaderAuthBadgeProps) {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string; role?: string } | null>(null)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()

    async function loadUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        setUser(currentUser)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, role')
          .eq('id', currentUser.id)
          .maybeSingle()

        if (profileData) {
          setProfile(profileData)
        } else if (currentUser.user_metadata) {
          setProfile({
            first_name: currentUser.user_metadata.first_name,
            last_name: currentUser.user_metadata.last_name,
            role: currentUser.user_metadata.role || 'patient',
          })
        }
      } else {
        setUser(null)
        setProfile(null)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, role')
          .eq('id', session.user.id)
          .maybeSingle()
        if (profileData) {
          setProfile(profileData)
        } else if (session.user.user_metadata) {
          setProfile({
            first_name: session.user.user_metadata.first_name,
            last_name: session.user.user_metadata.last_name,
            role: session.user.user_metadata.role || 'patient',
          })
        }
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    window.location.href = '/'
  }

  // Fallback while mounting
  if (!mounted) {
    if (isMobile) {
      return (
        <Link
          href="/patient-login"
          className="rounded-lg px-6 py-3 text-sm font-semibold tracking-wide transition-all border text-center block"
          style={{ borderColor: primaryColor, color: primaryColor }}
          onClick={onNavigate}
        >
          Patient Login
        </Link>
      )
    }
    return (
      <Link
        href="/patient-login"
        className="rounded-lg px-3.5 xl:px-4 py-2 xl:py-2.5 text-xs sm:text-sm font-semibold tracking-wide transition-all border hover:bg-black/5 whitespace-nowrap"
        style={{ borderColor: primaryColor, color: primaryColor }}
      >
        Patient Login
      </Link>
    )
  }

  // If user is logged in
  if (user) {
    const role = profile?.role || 'patient'
    const portalHref = role === 'admin' ? '/admin' : role === 'therapist' ? '/therapist' : '/patient'
    const firstName = profile?.first_name || user.email?.split('@')[0] || 'Patient'
    const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
    const initial = capitalizedName.charAt(0).toUpperCase()

    if (isMobile) {
      return (
        <div className="flex flex-col gap-2">
          <Link
            href={portalHref}
            onClick={onNavigate}
            className="rounded-lg px-4 py-3 text-sm font-semibold tracking-wide transition-all border flex items-center justify-between shadow-sm"
            style={{
              borderColor: primaryColor,
              backgroundColor: `${primaryColor}10`,
              color: primaryColor,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {initial}
              </div>
              <div className="text-left leading-tight">
                <p className="font-bold">{capitalizedName}</p>
                <p className="text-[11px] opacity-75 font-normal">View Dashboard</p>
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs text-muted-foreground hover:text-red-600 transition-colors py-1 flex items-center justify-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out ({user.email})</span>
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <Link
          href={portalHref}
          className="rounded-lg px-3 xl:px-4 py-1.5 xl:py-2 text-xs sm:text-sm font-semibold tracking-wide transition-all border hover:shadow-sm flex items-center gap-2 whitespace-nowrap group"
          style={{
            borderColor: primaryColor,
            backgroundColor: `${primaryColor}0d`,
            color: primaryColor,
          }}
          title={`Logged in as ${capitalizedName} (${user.email}). Click to view dashboard`}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            {initial}
          </div>
          <span className="font-medium group-hover:underline">
            {capitalizedName}
          </span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          title="Sign out"
          className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-black/5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  // Not logged in: Show Patient Login button
  if (isMobile) {
    return (
      <Link
        href="/patient-login"
        className="rounded-lg px-6 py-3 text-sm font-semibold tracking-wide transition-all border text-center block"
        style={{ borderColor: primaryColor, color: primaryColor }}
        onClick={onNavigate}
      >
        Patient Login
      </Link>
    )
  }

  return (
    <Link
      href="/patient-login"
      className="rounded-lg px-3.5 xl:px-4 py-2 xl:py-2.5 text-xs sm:text-sm font-semibold tracking-wide transition-all border hover:bg-black/5 whitespace-nowrap"
      style={{ borderColor: primaryColor, color: primaryColor }}
    >
      Patient Login
    </Link>
  )
}
