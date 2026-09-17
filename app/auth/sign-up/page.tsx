'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const phone = formData.get('phone') as string

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          role: 'patient',
          first_name: firstName,
          last_name: lastName,
          phone,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/auth/sign-up-success')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3" aria-label="Astsankhlam">
            <div className="relative h-16 w-16 mx-auto transition-transform duration-200 hover:scale-105">
              <Image
                src="https://res.cloudinary.com/df01whs60/image/upload/v1781904502/logo_1_ffsttc.png"
                alt="Astsankhlam logo"
                width={64}
                height={64}
                priority
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create Your Account</h1>
          <p className="text-muted-foreground mt-1">Join Astsankhlam as a Patient</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" name="first_name" placeholder="John" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" name="last_name" placeholder="Doe" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full bg-[#66948a] hover:bg-[#4d7068] text-white" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#66948a] font-medium hover:underline">
            Sign In
          </Link>
        </p>

        <div className="mt-4 rounded-lg bg-muted/60 border border-border p-3 text-center text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-0.5">Are you a therapist or practitioner?</p>
          Therapist accounts cannot be registered here. They are created exclusively from the clinic admin portal. Contact clinic management for access.
        </div>
      </div>
    </div>
  )
}
