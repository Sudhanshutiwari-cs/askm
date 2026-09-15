import { createAdminClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { therapistId } = await request.json()
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { orderId: null, amount: 0, currency: 'INR', error: 'Payment gateway is not configured. Please contact the clinic.' },
      { status: 500 },
    )
  }

  const supabase = createAdminClient()
  const { data: therapist } = await supabase
    .from('therapists')
    .select('consultation_fee')
    .eq('id', therapistId)
    .eq('is_active', true)
    .single()

  const amountInRupees = Number(therapist?.consultation_fee ?? 0)
  if (!therapist || amountInRupees <= 0) {
    return NextResponse.json({ orderId: null, amount: 0, currency: 'INR', error: 'Invalid payment amount.' }, { status: 400 })
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const order = await razorpay.orders.create({
      amount: Math.round(amountInRupees * 100),
      currency: 'INR',
      receipt: `ASKM-${Date.now().toString(36)}`,
    })

    return NextResponse.json({ orderId: order.id, amount: Number(order.amount), currency: order.currency, error: null })
  } catch (err) {
    const razorpayError = err as { statusCode?: number; error?: { description?: string } }
    const isAuthenticationError = razorpayError.statusCode === 401
    const message = isAuthenticationError
      ? 'Razorpay authentication failed. The Key ID and Key Secret must be a matching pair from the same Test or Live mode.'
      : razorpayError.error?.description || (err instanceof Error ? err.message : 'Failed to create payment order.')

    return NextResponse.json(
      { orderId: null, amount: 0, currency: 'INR', error: message },
      { status: isAuthenticationError ? 503 : 500 },
    )
  }
}
