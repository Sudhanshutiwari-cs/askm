import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function resolveEmailFromUsername(username: string): Promise<{ email: string | null; error: string | null }> {
  const admin = createAdminClient()

  const { data: patient } = await admin.from('patients').select('email').ilike('username', username).maybeSingle()
  if (patient?.email) return { email: patient.email, error: null }

  const { data: therapist } = await admin.from('therapists').select('email').ilike('username', username).maybeSingle()
  if (therapist?.email) return { email: therapist.email, error: null }

  return { email: null, error: 'No account found for that username.' }
}

export async function POST(request: Request) {
  const { identifier, password } = await request.json()
  const supabase = await createClient()
  const admin = createAdminClient()

  let email = (identifier ?? '').trim()
  if (!email.includes('@')) {
    const { email: resolvedEmail, error: resolveError } = await resolveEmailFromUsername(email)
    if (resolveError || !resolvedEmail) {
      return NextResponse.json({ error: resolveError ?? 'No account found for that username.' }, { status: 400 })
    }
    email = resolvedEmail
  }

  const { error, data } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return NextResponse.json({ error: error.message }, { status: 401 })

  let role = 'patient'
  const userId = data.user?.id
  if (userId) {
    const { data: profile } = await admin.from('profiles').select('role').eq('id', userId).single()
    if (profile?.role) role = profile.role
  }

  const redirectTo = role === 'admin' ? '/admin' : role === 'therapist' ? '/therapist' : '/patient'
  return NextResponse.json({ redirectTo, error: null })
}
