"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, CheckCircle } from "lucide-react"

type FormState = {
  first_name: string
  last_name: string
  phone: string
  date_of_birth: string
  gender: string
  address: string
  emergency_contact: string
  notes: string
}

function DashboardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-border px-6 py-5">
      <h1 className="font-heading text-xl font-bold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

export default function PatientProfilePage() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState("")
  const [email, setEmail] = useState("")
  const [patientId, setPatientId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    emergency_contact: "",
    notes: "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        window.location.href = "/auth/login"
        return
      }
      setUserId(user.id)
      setEmail(user.email ?? "")

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      const { data: patient } = await supabase.from("patients").select("*").eq("user_id", user.id).single()

      setPatientId(patient?.id ?? null)
      setForm({
        first_name: profile?.first_name ?? "",
        last_name: profile?.last_name ?? "",
        phone: profile?.phone ?? "",
        date_of_birth: patient?.date_of_birth ?? "",
        gender: patient?.gender ?? "",
        address: patient?.address ?? "",
        emergency_contact: patient?.emergency_contact ?? "",
        notes: patient?.notes ?? "",
      })
      setLoading(false)
    }
    load()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ first_name: form.first_name, last_name: form.last_name, phone: form.phone || null })
      .eq("id", userId)

    if (profileErr) {
      setError(profileErr.message)
      setSaving(false)
      return
    }

    if (patientId) {
      const { error: patientErr } = await supabase
        .from("patients")
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone || null,
          date_of_birth: form.date_of_birth || null,
          gender: form.gender || null,
          address: form.address || null,
          emergency_contact: form.emergency_contact || null,
          notes: form.notes || null,
        })
        .eq("id", patientId)
      if (patientErr) {
        setError(patientErr.message)
        setSaving(false)
        return
      }
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader title="My Profile" subtitle="Manage your personal information" />
      <div className="p-6">
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
              <Label>Email</Label>
              <Input value={email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact support.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <h3 className="font-heading font-semibold text-foreground">Health & Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>
                <Input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input name="address" value={form.address} onChange={handleChange} placeholder="123 Main St, Mumbai" />
            </div>
            <div className="space-y-1.5">
              <Label>Emergency Contact</Label>
              <Input
                name="emergency_contact"
                value={form.emergency_contact}
                onChange={handleChange}
                placeholder="Name — +91 98765 43210"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes for therapist (optional)</Label>
              <Textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="resize-none"
                placeholder="Anything your therapist should know..."
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground">
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
