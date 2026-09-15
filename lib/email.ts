import 'server-only'

export interface BookingEmailParams {
  toEmail: string
  patientName: string
  bookingRef: string
  therapistName: string
  appointmentDate: string
  appointmentTime: string
  meetLink: string
  amount: number
  /** Login credentials — only present when a new account was just created. */
  username?: string
  password?: string
}

/**
 * Send a booking confirmation + login credentials email via the EmailJS REST API.
 *
 * Uses EmailJS's server-side (non-browser) flow, which requires the private key
 * passed as `accessToken`. You must enable
 * "Allow EmailJS API for non-browser applications" in EmailJS Account → Security.
 *
 * Returns { sent, error } and never throws, so a mail failure can't block a
 * confirmed booking.
 */
export async function sendBookingEmail(
  params: BookingEmailParams,
): Promise<{ sent: boolean; error: string | null }> {
  const serviceId = process.env.EMAILJS_SERVICE_ID
  const templateId = process.env.EMAILJS_TEMPLATE_ID
  const publicKey = process.env.EMAILJS_PUBLIC_KEY
  const privateKey = process.env.EMAILJS_PRIVATE_KEY

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    return { sent: false, error: 'EmailJS environment variables are not configured.' }
  }

  const hasCredentials = Boolean(params.username && params.password)

  // These keys map to the variables you reference in your EmailJS template,
  // e.g. {{patient_name}}, {{username}}, {{password}}, {{meet_link}}.
  const templateParams: Record<string, string> = {
    to_email: params.toEmail,
    email: params.toEmail,
    patient_name: params.patientName,
    booking_ref: params.bookingRef,
    therapist_name: params.therapistName,
    appointment_date: params.appointmentDate,
    appointment_time: params.appointmentTime,
    meet_link: params.meetLink,
    amount: String(params.amount),
    username: params.username ?? '',
    password: params.password ?? '',
    has_credentials: hasCredentials ? 'yes' : 'no',
    login_url: 'https://astsankhlam.com/auth/login',
  }

  return sendViaEmailJS({ serviceId, templateId, publicKey, privateKey, templateParams })
}

export interface TherapistWelcomeEmailParams {
  toEmail: string
  therapistName: string
  username: string
  password: string
}

/**
 * Send a welcome + login credentials email to a newly created therapist.
 *
 * Uses a dedicated EmailJS template (EMAILJS_THERAPIST_TEMPLATE_ID). If that
 * variable is not set, it falls back to the main EMAILJS_TEMPLATE_ID so emails
 * still go out. Never throws, so a mail failure can't block therapist creation.
 */
export async function sendTherapistWelcomeEmail(
  params: TherapistWelcomeEmailParams,
): Promise<{ sent: boolean; error: string | null }> {
  const serviceId = process.env.EMAILJS_SERVICE_ID
  const templateId = process.env.EMAILJS_THERAPIST_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID
  const publicKey = process.env.EMAILJS_PUBLIC_KEY
  const privateKey = process.env.EMAILJS_PRIVATE_KEY

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    return { sent: false, error: 'EmailJS environment variables are not configured.' }
  }

  const templateParams: Record<string, string> = {
    to_email: params.toEmail,
    email: params.toEmail,
    therapist_name: params.therapistName,
    // Mirror to patient_name so a shared/fallback template still renders a name.
    patient_name: params.therapistName,
    username: params.username,
    password: params.password,
    has_credentials: 'yes',
    login_url: 'https://astsankhlam.com/auth/login',
  }

  return sendViaEmailJS({ serviceId, templateId, publicKey, privateKey, templateParams })
}

/** Shared low-level EmailJS sender used by both email functions. */
async function sendViaEmailJS(args: {
  serviceId: string
  templateId: string
  publicKey: string
  privateKey: string
  templateParams: Record<string, string>
}): Promise<{ sent: boolean; error: string | null }> {
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: args.serviceId,
        template_id: args.templateId,
        user_id: args.publicKey,
        accessToken: args.privateKey,
        template_params: args.templateParams,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return { sent: false, error: `EmailJS error (${res.status}): ${text}` }
    }

    return { sent: true, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send email.'
    return { sent: false, error: message }
  }
}
