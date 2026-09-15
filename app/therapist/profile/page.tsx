'use client'

import { useEffect, useState } from 'react'
import { Bell, Save, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

interface Therapist {
  id: string
  first_name: string
  last_name: string
  phone: string | null
  bio: string | null
  experience_years: number
  consultation_fee: number
  slot_duration_minutes: number
  qualifications: string[] | null
  specializations: string[] | null
  languages: string[] | null
}

export default function TherapistProfilePage() {
  const [therapist, setTherapist] = useState<Therapist | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', bio: '',
    experience_years: '0', consultation_fee: '0', slot_duration_minutes: '60',
    qualifications: '', specializations: '', languages: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: t } = await supabase.from('therapists').select('*').eq('user_id', user.id).single()
      if (!t) { setLoading(false); return }
      setTherapist(t)
      setForm({
        first_name: t.first_name,
        last_name: t.last_name,
        phone: t.phone ?? '',
        bio: t.bio ?? '',
        experience_years: String(t.experience_years),
        consultation_fee: String(t.consultation_fee),
        slot_duration_minutes: String(t.slot_duration_minutes),
        qualifications: (t.qualifications ?? []).join(', '),
        specializations: (t.specializations ?? []).join(', '),
        languages: (t.languages ?? []).join(', '),
      })
      setLoading(false)
    }
    load()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!therapist) return
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('therapists')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || null,
        bio: form.bio || null,
        experience_years: Number(form.experience_years) || 0,
        consultation_fee: Number(form.consultation_fee) || 0,
        slot_duration_minutes: Number(form.slot_duration_minutes) || 60,
        qualifications: form.qualifications ? form.qualifications.split(',').map((s) => s.trim()).filter(Boolean) : [],
        specializations: form.specializations ? form.specializations.split(',').map((s) => s.trim()).filter(Boolean) : [],
        languages: form.languages ? form.languages.split(',').map((s) => s.trim()).filter(Boolean) : [],
      })
      .eq('id', therapist.id)

    if (err) setError(err.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Update your public therapist profile</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <form onSubmit={handleSave} className="max-w-2xl space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h3 className="font-heading font-semibold text-foreground">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input name="first_name" value={form.first_name} onChange={handleChange} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input name="last_name" value={form.last_name} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-1.5">
                <Label>Bio</Label>
                <Textarea name="bio" value={form.bio} onChange={handleChange} rows={4} placeholder="Describe your approach, background, and specialties..." className="resize-none" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h3 className="font-heading font-semibold text-foreground">Practice Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Years of Experience</Label>
                  <Input name="experience_years" type="number" min="0" value={form.experience_years} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                  <Label>Consultation Fee (₹)</Label>
                  <Input name="consultation_fee" type="number" min="0" value={form.consultation_fee} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Session Duration (minutes)</Label>
                <Input name="slot_duration_minutes" type="number" min="15" step="15" value={form.slot_duration_minutes} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label>Qualifications (comma-separated)</Label>
                <Input name="qualifications" value={form.qualifications} onChange={handleChange} placeholder="MBBS, MD Psychiatry, CBT Certified" />
              </div>
              <div className="space-y-1.5">
                <Label>Specializations (comma-separated)</Label>
                <Input name="specializations" value={form.specializations} onChange={handleChange} placeholder="Anxiety, Depression, Trauma" />
              </div>
              <div className="space-y-1.5">
                <Label>Languages (comma-separated)</Label>
                <Input name="languages" value={form.languages} onChange={handleChange} placeholder="English, Hindi, Marathi" />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
            )}

            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground">
              {saved ? (<><CheckCircle className="w-4 h-4 mr-2" /> Saved!</>) : (<><Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}</>)}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
