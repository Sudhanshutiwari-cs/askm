import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const firstName = (body.first_name ?? body.firstName ?? '').trim()
    const lastName = (body.last_name ?? body.lastName ?? '').trim()
    const rawEmail = (body.email ?? '').trim()
    const subject = (body.subject ?? '').trim()
    const message = (body.message ?? '').trim()
    const newsletterOptIn = Boolean(body.newsletter_opt_in ?? body.newsletter ?? false)

    // Validation
    if (!firstName) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 })
    }
    if (!lastName) {
      return NextResponse.json({ error: 'Last name is required' }, { status: 400 })
    }
    if (!rawEmail) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }
    const email = rawEmail.toLowerCase()
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }
    if (!message) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Insert contact message
    const { data: contactMessage, error: insertError } = await supabase
      .from('contact_messages')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        newsletter_opt_in: newsletterOptIn,
        subject,
        message,
        is_read: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting contact message:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // If opted into newsletter, also ensure they are subscribed in newsletter_subscribers
    if (newsletterOptIn) {
      try {
        const { data: existingSub } = await supabase
          .from('newsletter_subscribers')
          .select('id, is_subscribed')
          .eq('email', email)
          .maybeSingle()

        const now = new Date().toISOString()
        if (existingSub) {
          if (!existingSub.is_subscribed) {
            await supabase
              .from('newsletter_subscribers')
              .update({
                is_subscribed: true,
                subscribed_at: now,
                unsubscribed_at: null,
                updated_at: now,
              })
              .eq('id', existingSub.id)
          }
        } else {
          await supabase
            .from('newsletter_subscribers')
            .insert({
              email,
              is_subscribed: true,
              subscribed_at: now,
              created_at: now,
              updated_at: now,
            })
        }
      } catch (newsletterErr) {
        // Non-blocking: log but don't fail contact form submission
        console.error('Error syncing contact newsletter opt-in:', newsletterErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out! Your message has been sent successfully. We will get back to you soon.',
      id: contactMessage.id,
    })
  } catch (err) {
    console.error('Unexpected error in POST /api/contact:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
