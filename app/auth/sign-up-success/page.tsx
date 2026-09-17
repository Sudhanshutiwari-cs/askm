import Link from 'next/link'
import Image from 'next/image'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        <Link href="/" className="inline-block mb-4" aria-label="Astsankhlam">
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
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
        <p className="text-muted-foreground mb-6">
          We sent a confirmation link to your email address. Click the link to activate your account and start booking appointments.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-lg bg-[#66948a] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#4d7068] transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
