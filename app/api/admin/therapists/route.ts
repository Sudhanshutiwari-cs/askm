import { createAdminClient } from '@/lib/supabase/server'
import { sendTherapistWelcomeEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

function generateUsername(name: string): string {
  const letters = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase().padEnd(4, 'X')
  return `${letters}ASKM`
}

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('therapists').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ therapists: data })
}

// Create a new therapist + auth account
export async function POST(request: Request) {
  const payload = await request.json()
  const supabase = createAdminClient()

  const username = generateUsername(payload.firstName)
  const password = username

  const { data: existing } = await supabase
    .from('therapists')
    .select('id')
    .eq('email', payload.email)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ therapist: null, credentials: null, error: 'A therapist with this email already exists.' }, { status: 400 })
  }

  const { data: therapist, error: therapistError } = await supabase
    .from('therapists')
    .insert({
      username,
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      bio: payload.bio,
      experience_years: payload.experienceYears,
      consultation_fee: payload.consultationFee,
      specializations: payload.specializations,
      languages: payload.languages?.length ? payload.languages : ['English'],
      gender: payload.gender,
      is_active: true,
    })
    .select()
    .single()

  if (therapistError) {
    return NextResponse.json({ therapist: null, credentials: null, error: therapistError.message }, { status: 500 })
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: payload.email,
    password,
    email_confirm: true,
    user_metadata: { role: 'therapist', first_name: payload.firstName, last_name: payload.lastName },
  })

  if (authError) {
    return NextResponse.json({
      therapist,
      credentials: null,
      error: `Therapist added but login account failed: ${authError.message}`,
    })
  }

  if (authData?.user?.id) {
    await supabase.from('therapists').update({ user_id: authData.user.id }).eq('id', therapist.id)
  }

  const { sent, error: emailError } = await sendTherapistWelcomeEmail({
    toEmail: payload.email,
    therapistName: `Dr. ${payload.firstName} ${payload.lastName}`,
    username,
    password,
  })

  if (!sent) {
    console.log('[v0] Therapist welcome email not sent:', emailError)
  }

  return NextResponse.json({
    therapist,
    credentials: { username, password, email: payload.email },
    error: null,
  })
}

// Update an existing therapist
export async function PATCH(request: Request) {
  const payload = await request.json()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('therapists')
    .update({
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      bio: payload.bio,
      experience_years: payload.experienceYears,
      consultation_fee: payload.consultationFee,
      specializations: payload.specializations,
      languages: payload.languages?.length ? payload.languages : ['English'],
      gender: payload.gender,
    })
    .eq('id', payload.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ error: null })
}

// Toggle active status: { id, isActive }
export async function PUT(request: Request) {
  const { id, isActive } = await request.json()
  const supabase = createAdminClient()
  const { error } = await supabase.from('therapists').update({ is_active: !isActive }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ error: null })
}
