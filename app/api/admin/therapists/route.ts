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

  const username = (payload.username?.trim() || generateUsername(payload.firstName)).toUpperCase()
  const password = payload.password?.trim() || username

  const { data: existing } = await supabase
    .from('therapists')
    .select('id')
    .eq('email', payload.email)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ therapist: null, credentials: null, error: 'A therapist with this email already exists.' }, { status: 400 })
  }

  // Check username uniqueness in therapists table
  const { data: existingUsername } = await supabase
    .from('therapists')
    .select('id')
    .ilike('username', username)
    .maybeSingle()

  if (existingUsername) {
    return NextResponse.json({ therapist: null, credentials: null, error: `The username "${username}" is already taken. Please choose another.` }, { status: 400 })
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
      error: `Therapist added to database, but login account creation failed: ${authError.message}`,
    })
  }

  if (authData?.user?.id) {
    const userId = authData.user.id
    // Link user_id to therapist record
    await supabase.from('therapists').update({ user_id: userId }).eq('id', therapist.id)

    // Ensure profiles table has therapist role for layout & route authorization
    await supabase.from('profiles').upsert({
      id: userId,
      email: payload.email,
      role: 'therapist',
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone || null,
      is_active: true,
    }, { onConflict: 'id' })
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
    therapist: { ...therapist, user_id: authData?.user?.id },
    credentials: { username, password, email: payload.email },
    error: null,
  })
}

// Update an existing therapist or reset login credentials
export async function PATCH(request: Request) {
  const payload = await request.json()
  const supabase = createAdminClient()

  // Case 1: Reset / Create Login Credentials
  if (payload.action === 'reset_credentials') {
    const { id, password } = payload
    if (!id || !password?.trim()) {
      return NextResponse.json({ error: 'Therapist ID and new password are required' }, { status: 400 })
    }

    const { data: therapist, error: fetchErr } = await supabase
      .from('therapists')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }

    let userId = therapist.user_id

    // If therapist doesn't have a linked user_id, check if auth account exists or create one
    if (!userId) {
      const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      const existingUser = users.find((u) => u.email?.toLowerCase() === therapist.email?.toLowerCase())

      if (existingUser) {
        userId = existingUser.id
      } else {
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email: therapist.email,
          password: password.trim(),
          email_confirm: true,
          user_metadata: { role: 'therapist', first_name: therapist.first_name, last_name: therapist.last_name },
        })
        if (createErr) {
          return NextResponse.json({ error: `Failed to create auth account: ${createErr.message}` }, { status: 500 })
        }
        userId = newUser.user.id
      }

      await supabase.from('therapists').update({ user_id: userId }).eq('id', therapist.id)
    }

    // Update password
    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
      password: password.trim(),
      email_confirm: true,
      user_metadata: { role: 'therapist', first_name: therapist.first_name, last_name: therapist.last_name },
    })

    if (updateErr) {
      return NextResponse.json({ error: `Failed to update password: ${updateErr.message}` }, { status: 500 })
    }

    // Ensure profiles table has therapist role
    await supabase.from('profiles').upsert({
      id: userId,
      email: therapist.email,
      role: 'therapist',
      first_name: therapist.first_name,
      last_name: therapist.last_name,
      phone: therapist.phone || null,
      is_active: therapist.is_active,
    }, { onConflict: 'id' })

    return NextResponse.json({
      success: true,
      credentials: {
        username: therapist.username,
        email: therapist.email,
        password: password.trim(),
      },
      error: null,
    })
  }

  // Case 2: Update regular profile info
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

  // Also sync active status in profiles table if linked
  const { data: therapist } = await supabase.from('therapists').select('user_id').eq('id', id).maybeSingle()
  if (therapist?.user_id) {
    await supabase.from('profiles').update({ is_active: !isActive }).eq('id', therapist.user_id)
  }

  return NextResponse.json({ error: null })
}
