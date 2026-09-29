import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const {
      fullName,
      email,
      phone,
      tier = 'professional',
      degreeTitle,
      degreeSerialNo,
      university,
      licenseNumber,
      experienceYears = 0,
      languages = ['English'],
      domains = [],
      bio,
      resumeUrl,
      certificateUrls = [],
    } = payload

    if (!fullName || !email || !phone || !degreeTitle) {
      return NextResponse.json({ error: 'Please provide all required credentials (Full Name, Email, Phone, Degree)' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Check if an application already exists for this email
    const { data: existing } = await admin
      .from('professional_applications')
      .select('id, status')
      .eq('email', email)
      .maybeSingle()

    if (existing && existing.status === 'pending') {
      return NextResponse.json({
        error: 'An application with this email is already pending verification by our clinical director.',
      }, { status: 400 })
    }

    const { data: application, error } = await admin
      .from('professional_applications')
      .insert({
        full_name: fullName,
        email,
        phone,
        tier,
        degree_title: degreeTitle,
        degree_serial_no: degreeSerialNo || null,
        university: university || null,
        license_number: licenseNumber || null,
        experience_years: Number(experienceYears) || 0,
        languages: languages.length > 0 ? languages : ['English'],
        domains,
        bio: bio || null,
        resume_url: resumeUrl || null,
        certificate_urls: certificateUrls,
        status: 'pending',
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Auto-create an admin helpline notification
    const ticketRef = 'APP-' + Date.now().toString(36).toUpperCase().slice(-5)
    await admin.from('helpline_tickets').insert({
      ticket_ref: ticketRef,
      user_type: 'therapist',
      user_name: fullName,
      user_email: email,
      user_phone: phone,
      subject: `New Practitioner Application (${tier === 'intern' ? 'Supervised Intern' : 'Licensed Psychologist'})`,
      category: 'onboarding',
      message: `Applicant ${fullName} submitted degree credentials (${degreeTitle}, Serial No: ${degreeSerialNo || 'Pending review'}). Awaiting 24-hour verification.`,
      priority: 'medium',
      status: 'open',
    })

    return NextResponse.json({ application, error: null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to submit application' }, { status: 500 })
  }
}
