import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rawEmail = body.email

    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const email = rawEmail.trim().toLowerCase()

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if email already exists
    const { data: existing, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_subscribed')
      .eq('email', email)
      .maybeSingle()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error querying newsletter_subscribers:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const now = new Date().toISOString()

    if (existing) {
      if (existing.is_subscribed) {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed! Thank you for being part of our community.",
          alreadySubscribed: true,
        })
      }

      // Re-subscribe
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          is_subscribed: true,
          subscribed_at: now,
          unsubscribed_at: null,
          updated_at: now,
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating subscriber:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Welcome back! Your subscription has been reactivated.',
      })
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        is_subscribed: true,
        subscribed_at: now,
        created_at: now,
        updated_at: now,
      })

    if (insertError) {
      console.error('Error inserting subscriber:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to Astsankhlam updates!',
    })
  } catch (err) {
    console.error('Unexpected error in POST /api/newsletter:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
