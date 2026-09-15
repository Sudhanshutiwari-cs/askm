'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface ClinicSettings {
  id: string
  clinic_name: string
  clinic_tagline: string
  clinic_email: string | null
  clinic_phone: string | null
  clinic_address: string | null
  about_text: string | null
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.settings ?? null)
        setLoading(false)
      })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const updates = {
      clinic_name: fd.get('clinic_name') as string,
      clinic_tagline: fd.get('clinic_tagline') as string,
      clinic_email: fd.get('clinic_email') as string,
      clinic_phone: fd.get('clinic_phone') as string,
      clinic_address: fd.get('clinic_address') as string,
      about_text: fd.get('about_text') as string,
    }

    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: settings?.id, updates }),
    })
    const { error: err } = await res.json()
    if (err) { setError(err) } else { setSuccess(true) }
    setSaving(false)
  }

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Clinic Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your clinic information</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-6 max-w-2xl">
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-xl p-6">
            <div className="space-y-1.5">
              <Label>Clinic Name</Label>
              <Input name="clinic_name" defaultValue={settings?.clinic_name ?? ''} required />
            </div>
            <div className="space-y-1.5">
              <Label>Tagline</Label>
              <Input name="clinic_tagline" defaultValue={settings?.clinic_tagline ?? ''} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input name="clinic_email" type="email" defaultValue={settings?.clinic_email ?? ''} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input name="clinic_phone" defaultValue={settings?.clinic_phone ?? ''} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input name="clinic_address" defaultValue={settings?.clinic_address ?? ''} />
            </div>
            <div className="space-y-1.5">
              <Label>About Text</Label>
              <Textarea name="about_text" rows={4} defaultValue={settings?.about_text ?? ''} />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            {success && <div className="text-sm text-green-600">Settings saved successfully.</div>}
            <Button type="submit" className="bg-[#66948a] hover:bg-[#4d7068] text-white" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
