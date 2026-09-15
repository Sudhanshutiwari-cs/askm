'use client'

import React, { useEffect, useState } from 'react'
import {
  Bell, Plus, Search, ToggleLeft, ToggleRight, Copy, Check,
  KeyRound, Pencil, Eye, EyeOff, Sparkles, ExternalLink, ShieldCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Therapist {
  id: string
  user_id?: string | null
  username?: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  bio: string | null
  specializations: string[] | null
  languages: string[] | null
  experience_years: number
  consultation_fee: number
  gender: string | null
  is_active: boolean
}

interface TherapistCredentials {
  username: string
  password: string
  email: string
  portalUrl?: string
}

function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*'
  let pass = ''
  for (let i = 0; i < 10; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pass
}

function deriveUsername(firstName: string): string {
  const letters = firstName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase().padEnd(4, 'X')
  return `${letters}ASKM`
}

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<TherapistCredentials | null>(null)
  const [copied, setCopied] = useState<'username' | 'password' | 'all' | null>(null)

  // Form states for Add Therapist
  const [firstName, setFirstName] = useState('')
  const [customUsername, setCustomUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Edit therapist state
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Reset credentials state
  const [resetTherapist, setResetTherapist] = useState<Therapist | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetSaving, setResetSaving] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/therapists')
      .then((r) => r.json())
      .then((data) => {
        setTherapists(data.therapists ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = therapists.filter((t) =>
    `${t.first_name} ${t.last_name} ${t.email} ${t.username ?? ''}`.toLowerCase().includes(search.toLowerCase()),
  )

  function copyText(text: string, field: 'username' | 'password' | 'all') {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field)
      setTimeout(() => setCopied(null), 2500)
    })
  }

  function copyAllCredentials(creds: TherapistCredentials) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://astsankhlam.com'
    const portal = `${origin}/auth/login?role=therapist`
    const text = `Astsankhlam Therapist Login Credentials:
Portal URL: ${portal}
Email: ${creds.email}
Username: ${creds.username}
Password: ${creds.password}`

    copyText(text, 'all')
  }

  // Handle Add Therapist
  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData(e.currentTarget)

    const fName = (fd.get('first_name') as string) || ''
    const chosenUsername = customUsername.trim() || deriveUsername(fName)
    const chosenPassword = password.trim() || chosenUsername

    const payload = {
      firstName: fName,
      lastName: fd.get('last_name') as string,
      email: fd.get('email') as string,
      username: chosenUsername,
      password: chosenPassword,
      phone: (fd.get('phone') as string) || null,
      bio: (fd.get('bio') as string) || null,
      experienceYears: Number(fd.get('experience_years') ?? 0),
      consultationFee: Number(fd.get('consultation_fee') ?? 0),
      specializations: (fd.get('specializations') as string).split(',').map((s) => s.trim()).filter(Boolean),
      languages: (fd.get('languages') as string).split(',').map((s) => s.trim()).filter(Boolean),
      gender: (fd.get('gender') as string) || null,
    }

    const res = await fetch('/api/admin/therapists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const { therapist, credentials: creds, error: err } = await res.json()

    if (err && !therapist) {
      setError(err)
      setSaving(false)
      return
    }

    if (therapist) {
      setTherapists((prev) => [therapist as Therapist, ...prev])
    }
    setOpen(false)
    setSaving(false)
    setFirstName('')
    setCustomUsername('')
    setPassword('')
    if (creds) {
      setCredentials(creds)
    }
  }

  // Handle Edit Therapist Profile
  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingTherapist) return
    setEditSaving(true)
    setEditError(null)
    const fd = new FormData(e.currentTarget)

    const updated = {
      id: editingTherapist.id,
      firstName: fd.get('first_name') as string,
      lastName: fd.get('last_name') as string,
      email: fd.get('email') as string,
      phone: (fd.get('phone') as string) || null,
      bio: (fd.get('bio') as string) || null,
      experienceYears: Number(fd.get('experience_years') ?? 0),
      consultationFee: Number(fd.get('consultation_fee') ?? 0),
      specializations: (fd.get('specializations') as string).split(',').map((s) => s.trim()).filter(Boolean),
      languages: (fd.get('languages') as string).split(',').map((s) => s.trim()).filter(Boolean),
      gender: (fd.get('gender') as string) || null,
    }

    const res = await fetch('/api/admin/therapists', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    const { error: err } = await res.json()

    if (err) {
      setEditError(err)
      setEditSaving(false)
      return
    }

    setTherapists((prev) =>
      prev.map((t) =>
        t.id === editingTherapist.id
          ? {
              ...t,
              first_name: updated.firstName,
              last_name: updated.lastName,
              email: updated.email,
              phone: updated.phone,
              bio: updated.bio,
              experience_years: updated.experienceYears,
              consultation_fee: updated.consultationFee,
              specializations: updated.specializations,
              languages: updated.languages,
              gender: updated.gender,
            }
          : t,
      ),
    )
    setEditSaving(false)
    setEditingTherapist(null)
  }

  // Handle Reset / Issue Login Credentials
  async function handleResetCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!resetTherapist) return
    setResetSaving(true)
    setResetError(null)

    const newPass = resetPassword.trim()
    if (!newPass) {
      setResetError('Password is required')
      setResetSaving(false)
      return
    }

    try {
      const res = await fetch('/api/admin/therapists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_credentials',
          id: resetTherapist.id,
          password: newPass,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setResetError(data.error || 'Failed to update credentials')
        setResetSaving(false)
        return
      }

      setResetSaving(false)
      setResetTherapist(null)
      setResetPassword('')
      if (data.credentials) {
        setCredentials(data.credentials)
      }
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setResetSaving(false)
    }
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch('/api/admin/therapists', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: current }),
    })
    const { error } = await res.json()
    if (!error) setTherapists((prev) => prev.map((t) => (t.id === id ? { ...t, is_active: !current } : t)))
  }

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Therapists</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Provision therapist login accounts & manage practitioner credentials
          </p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-6 space-y-4">
        {/* EDIT THERAPIST PROFILE DIALOG */}
        <Dialog open={!!editingTherapist} onOpenChange={(v) => { if (!v) { setEditingTherapist(null); setEditError(null) } }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Therapist Profile</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Update practitioner bio, rates, and specializations.</p>
            </DialogHeader>
            {editingTherapist && (
              <form onSubmit={handleEdit} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>First name</Label><Input name="first_name" required defaultValue={editingTherapist.first_name} /></div>
                  <div className="space-y-1.5"><Label>Last name</Label><Input name="last_name" required defaultValue={editingTherapist.last_name} /></div>
                </div>
                <div className="space-y-1.5"><Label>Email</Label><Input name="email" type="email" required defaultValue={editingTherapist.email} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Phone</Label><Input name="phone" defaultValue={editingTherapist.phone ?? ''} /></div>
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <select name="gender" defaultValue={editingTherapist.gender ?? ''} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Experience (years)</Label><Input name="experience_years" type="number" min="0" defaultValue={editingTherapist.experience_years ?? 0} /></div>
                  <div className="space-y-1.5"><Label>Consultation Fee (&#8377;)</Label><Input name="consultation_fee" type="number" min="0" defaultValue={editingTherapist.consultation_fee ?? 0} /></div>
                </div>
                <div className="space-y-1.5">
                  <Label>Specializations (comma-separated)</Label>
                  <Input name="specializations" defaultValue={(editingTherapist.specializations ?? []).join(', ')} placeholder="Anxiety, Depression, CBT" />
                </div>
                <div className="space-y-1.5">
                  <Label>Languages (comma-separated)</Label>
                  <Input name="languages" defaultValue={(editingTherapist.languages ?? []).join(', ')} placeholder="English, Hindi" />
                </div>
                <div className="space-y-1.5"><Label>Bio</Label><Textarea name="bio" rows={3} defaultValue={editingTherapist.bio ?? ''} /></div>
                {editError && <div className="text-sm text-destructive">{editError}</div>}
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => { setEditingTherapist(null); setEditError(null) }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-[#66948a] hover:bg-[#4d7068] text-white" disabled={editSaving}>
                    {editSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* RESET / MANAGE CREDENTIALS DIALOG */}
        <Dialog open={!!resetTherapist} onOpenChange={(v) => { if (!v) { setResetTherapist(null); setResetError(null) } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#66948a]/10 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#66948a]" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">Manage Login Credentials</DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dr. {resetTherapist?.first_name} {resetTherapist?.last_name}
                  </p>
                </div>
              </div>
            </DialogHeader>

            {resetTherapist && (
              <form onSubmit={handleResetCredentials} className="space-y-4 mt-2">
                <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Username:</span>
                    <span className="font-mono font-bold text-foreground">{resetTherapist.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-mono text-foreground">{resetTherapist.email}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reset-pass">New Login Password</Label>
                    <button
                      type="button"
                      onClick={() => setResetPassword(generateRandomPassword())}
                      className="text-xs text-[#66948a] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-generate
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="reset-pass"
                      type={showResetPassword ? 'text' : 'password'}
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
                      required
                      minLength={6}
                      className="pr-10 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {resetError && <div className="text-sm text-destructive">{resetError}</div>}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setResetTherapist(null); setResetError(null) }}
                    disabled={resetSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#66948a] hover:bg-[#4d7068] text-white"
                    disabled={resetSaving}
                  >
                    {resetSaving ? 'Updating...' : 'Update & View Credentials'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* CREDENTIALS SUCCESS MODAL */}
        <Dialog open={!!credentials} onOpenChange={(v) => { if (!v) setCredentials(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-[#66948a]/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#66948a]" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">Therapist Login Credentials</DialogTitle>
                  <p className="text-xs text-muted-foreground">Account created exclusively via Admin Portal</p>
                </div>
              </div>
            </DialogHeader>

            {credentials && (
              <div className="space-y-4 mt-1">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Provide these credentials to the therapist. They can sign in at the therapist portal using either their <strong>Username</strong> or <strong>Email</strong>.
                </p>

                <div className="space-y-2.5">
                  {/* Portal Sign-In URL */}
                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                      Therapist Sign-In Portal
                    </span>
                    <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 text-xs">
                      <span className="font-mono text-muted-foreground truncate">/auth/login?role=therapist</span>
                      <a
                        href="/auth/login?role=therapist"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#66948a] hover:underline flex items-center gap-1 font-medium ml-2"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                      Email Address
                    </span>
                    <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                      <span className="font-mono text-sm text-foreground">{credentials.email}</span>
                      <button
                        type="button"
                        onClick={() => copyText(credentials.email, 'username')}
                        className="ml-2 text-[#66948a] hover:text-[#4d7068] transition-colors"
                        title="Copy email"
                      >
                        {copied === 'username' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                      Login Username
                    </span>
                    <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                      <span className="font-mono font-bold tracking-wider text-foreground">{credentials.username}</span>
                      <button
                        type="button"
                        onClick={() => copyText(credentials.username, 'username')}
                        className="ml-2 text-[#66948a] hover:text-[#4d7068] transition-colors"
                        title="Copy username"
                      >
                        {copied === 'username' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                      Temporary Password
                    </span>
                    <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                      <span className="font-mono font-bold tracking-wider text-foreground">{credentials.password}</span>
                      <button
                        type="button"
                        onClick={() => copyText(credentials.password, 'password')}
                        className="ml-2 text-[#66948a] hover:text-[#4d7068] transition-colors"
                        title="Copy password"
                      >
                        {copied === 'password' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 border-[#66948a]/30 text-[#66948a] hover:bg-[#66948a]/10"
                    onClick={() => copyAllCredentials(credentials)}
                  >
                    {copied === 'all' ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Copied All Details to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy All Details for Therapist</span>
                      </>
                    )}
                  </Button>

                  <Button
                    className="w-full bg-[#66948a] hover:bg-[#4d7068] text-white"
                    onClick={() => setCredentials(null)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
            Loading therapists...
          </div>
        ) : (
          <>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or username..."
                  className="pl-9 bg-background"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* ADD NEW THERAPIST DIALOG */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger render={<Button className="bg-[#66948a] hover:bg-[#4d7068] text-white gap-2" />}>
                  <Plus className="w-4 h-4" /> Create Therapist Account
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#66948a]" />
                      Create Therapist Account
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Therapist accounts are created exclusively from this admin portal. You can customize or auto-generate their login credentials.
                    </p>
                  </DialogHeader>

                  <form onSubmit={handleAdd} className="space-y-4 mt-2">
                    {/* Practitioner Name */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>First name *</Label>
                        <Input
                          name="first_name"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Ananya"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Last name *</Label>
                        <Input name="last_name" required placeholder="e.g. Sharma" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Official Email Address *</Label>
                      <Input name="email" type="email" required placeholder="therapist@astsankhlam.com" />
                    </div>

                    {/* DEDICATED LOGIN CREDENTIALS SECTION */}
                    <div className="border border-[#66948a]/30 bg-[#66948a]/5 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#66948a]">
                        <KeyRound className="w-4 h-4" />
                        Login Credentials Configuration
                      </div>

                      {/* Custom Username */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <Label className="text-xs">Login Username</Label>
                          <span className="text-muted-foreground">
                            Default: <code className="font-mono text-foreground font-bold">{deriveUsername(firstName)}</code>
                          </span>
                        </div>
                        <Input
                          value={customUsername}
                          onChange={(e) => setCustomUsername(e.target.value.toUpperCase())}
                          placeholder={deriveUsername(firstName)}
                          className="font-mono uppercase bg-background"
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <Label className="text-xs">Initial Password</Label>
                          <button
                            type="button"
                            onClick={() => setPassword(generateRandomPassword())}
                            className="text-[#66948a] hover:underline flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" /> Auto-generate password
                          </button>
                        </div>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={`Leave empty to default to username (${customUsername || deriveUsername(firstName)})`}
                            className="font-mono text-sm bg-background pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Login credentials will be shown upon account creation for easy copying.
                        </p>
                      </div>
                    </div>

                    {/* Practitioner Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Phone Number</Label>
                        <Input name="phone" placeholder="+91 98765 43210" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Gender</Label>
                        <select
                          name="gender"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        >
                          <option value="">Select</option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Experience (years)</Label>
                        <Input name="experience_years" type="number" min="0" defaultValue="0" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Consultation Fee (&#8377;)</Label>
                        <Input name="consultation_fee" type="number" min="0" defaultValue="0" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Specializations (comma-separated)</Label>
                      <Input name="specializations" placeholder="Anxiety, Depression, CBT, Mindfulness" />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Languages (comma-separated)</Label>
                      <Input name="languages" placeholder="English, Hindi" defaultValue="English" />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Bio / Professional Summary</Label>
                      <Textarea name="bio" rows={2} placeholder="Licensed clinical psychologist specializing in..." />
                    </div>

                    {error && <div className="text-sm text-destructive">{error}</div>}

                    <Button
                      type="submit"
                      className="w-full bg-[#66948a] hover:bg-[#4d7068] text-white"
                      disabled={saving}
                    >
                      {saving ? 'Creating Therapist & Auth Account...' : 'Create Therapist & Generate Login'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* THERAPISTS TABLE */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Therapist & Credentials</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Specializations</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Experience</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fee</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                          No therapists found. Click &quot;Create Therapist Account&quot; to add one.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((t) => (
                        <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#66948a]/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-[#66948a]">
                                  {t.first_name[0]}{t.last_name[0]}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground flex items-center gap-2">
                                  <span>Dr. {t.first_name} {t.last_name}</span>
                                  {t.username && (
                                    <span className="font-mono text-[11px] bg-[#66948a]/10 text-[#66948a] px-1.5 py-0.5 rounded font-semibold">
                                      {t.username}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">{t.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {(t.specializations ?? []).slice(0, 2).map((s) => (
                                <Badge key={s} variant="secondary" className="text-xs">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground">{t.experience_years} yrs</td>
                          <td className="px-4 py-3 text-foreground">&#8377;{t.consultation_fee}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                t.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {t.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Reset / View Login Credentials */}
                              <button
                                onClick={() => {
                                  setResetTherapist(t)
                                  setResetPassword('')
                                  setResetError(null)
                                }}
                                title="Manage / Reset Login Credentials"
                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-[#66948a] transition-colors"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              {/* Edit Profile */}
                              <button
                                onClick={() => {
                                  setEditingTherapist(t)
                                  setEditError(null)
                                }}
                                title="Edit therapist profile"
                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-[#66948a] transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              {/* Toggle Active */}
                              <button
                                onClick={() => toggleActive(t.id, t.is_active)}
                                title={t.is_active ? 'Deactivate account' : 'Activate account'}
                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {t.is_active ? (
                                  <ToggleRight className="w-5 h-5 text-[#66948a]" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
