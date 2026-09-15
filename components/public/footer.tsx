import Link from 'next/link'
import Image from 'next/image'

export function PublicFooter() {
  return (
    <footer className="bg-[#0f2d56] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.png" alt="Astsankhlam logo" width={36} height={36} className="rounded-lg object-contain" />
              <span className="font-bold text-lg">Astsankhlam</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
              Restore Your Mind. Reconnect With Yourself. Rediscover Balance. A holistic wellness initiative founded by Dipanita Biswas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-blue-200">Services</h4>
            <ul className="space-y-2 text-sm text-blue-100">
              {['Therapy & Counseling', 'Yoga for Mental Health', 'Chakra Healing', 'Mindfulness & Meditation', 'Breathwork & Alignment'].map((s) => (
                <li key={s}><Link href="/services" className="hover:text-white transition-colors">{s}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-blue-200">Contact</h4>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>Astsankhlam Holistic Wellness</li>
              <li>Virtual & In-Person Sessions</li>
              <li><a href="mailto:hello@astsankhlam.com" className="hover:text-white transition-colors">hello@astsankhlam.com</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-blue-200 text-xs">
            &copy; {new Date().getFullYear()} Astsankhlam. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-blue-200">
            <Link href="/about" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
