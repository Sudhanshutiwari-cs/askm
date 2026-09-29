import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendTherapistWelcomeEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

async function generateUniqueTherapistUsername(name: string, supabase: any): Promise<string> {
  const letters = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase().padEnd(4, 'X')
  let candidate = `${letters}ASKM`
  let counter = 1
  while (true) {
    const { data } = await supabase.from('therapists').select('id').ilike('username', candidate).maybeSingle()
    if (!data) return candidate
    candidate = `${letters}${counter}ASKM`
    counter++
  }
}

function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$'
  let pass = ''
  for (let i = 0; i < 9; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pass
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: applications, error } = await admin
      .from('professional_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ applications })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payload = await request.json()
    const { applicationId, action, adminNotes, consultationFee } = payload

    if (!applicationId || !action) {
      return NextResponse.json({ error: 'Missing applicationId or action' }, { status: 400 })
    }

    const { data: appRecord, error: fetchErr } = await admin
      .from('professional_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchErr || !appRecord) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (action === 'reject') {
      await admin
        .from('professional_applications')
        .update({
          status: 'rejected',
          admin_notes: adminNotes || 'Credentials verification did not meet platform guidelines.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)

      return NextResponse.json({ success: true, message: 'Application rejected.' })
    }

    if (action === 'approve') {
      // 1. Generate unique Astsankhlam ID
      const prefix = appRecord.tier === 'intern' ? 'AST-IN-' : 'AST-TH-'
      const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString()
      const astsankhlamId = `${prefix}${randomSuffix}`

      const nameParts = appRecord.full_name.trim().split(/\s+/)
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || ''
      const username = await generateUniqueTherapistUsername(firstName, admin)
      const password = generateRandomPassword()

      // Default fee: intern 1000, psychologist 2500 if not specified
      const fee = consultationFee ? Number(consultationFee) : appRecord.tier === 'intern' ? 1000 : 2500

      // 2. Insert into therapists table
      const { data: therapist, error: therapistErr } = await admin
        .from('therapists')
        .insert({
          username,
          first_name: firstName,
          last_name: lastName,
          email: appRecord.email,
          phone: appRecord.phone,
          bio: appRecord.bio,
          qualifications: appRecord.degree_title ? [appRecord.degree_title] : [],
          specializations: appRecord.domains?.length ? appRecord.domains : ['Counseling'],
          verified_domains: appRecord.domains || [],
          experience_years: appRecord.experience_years || 0,
          consultation_fee: fee,
          languages: appRecord.languages || ['English'],
          tier: appRecord.tier || 'professional',
          registration_no: appRecord.license_number || appRecord.degree_serial_no,
          commission_rate: 25.0,
          astsankhlam_id: astsankhlamId,
          is_verified: true,
          is_active: true,
        })
        .select()
        .single()

      if (therapistErr) {
        return NextResponse.json({ error: `Therapist record error: ${therapistErr.message}` }, { status: 500 })
      }

      // 3. Create Auth user account
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: appRecord.email,
        password,
        email_confirm: true,
        user_metadata: { role: 'therapist', first_name: firstName, last_name: lastName },
      })

      if (authData?.user?.id) {
        const userId = authData.user.id
        await admin.from('therapists').update({ user_id: userId }).eq('id', therapist.id)

        await admin.from('profiles').upsert({
          id: userId,
          email: appRecord.email,
          role: 'therapist',
          first_name: firstName,
          last_name: lastName,
          phone: appRecord.phone || null,
          is_active: true,
        }, { onConflict: 'id' })
      }

      // 4. Update application record to approved
      await admin
        .from('professional_applications')
        .update({
          status: 'approved',
          admin_notes: adminNotes || `Approved with Astsankhlam ID ${astsankhlamId}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)

      // 5. Send welcome email with credentials
      try {
        await sendTherapistWelcomeEmail({
          toEmail: appRecord.email,
          therapistName: `${appRecord.tier === 'intern' ? '' : 'Dr. '}${appRecord.full_name}`,
          username,
          password,
        })
      } catch {}

      return NextResponse.json({
        success: true,
        astsankhlamId,
        credentials: {
          username,
          password,
          email: appRecord.email,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
