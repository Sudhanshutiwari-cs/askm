'use client'

import { useEffect, useState } from 'react'
import { Bell, Plus, Search, ToggleLeft, ToggleRight, Copy, Check, KeyRound, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Therapist {
  id: string
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
}

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<TherapistCredentials | null>(null)
  const [copied, setCopied] = useState<'username' | 'password' | null>(null)

  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/therapists')
      .then((r) => r.json())
      .then((data) => {
        setTherapists(data.therapists ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = therapists.filter((t) =>
    `${t.first_name} ${t.last_name} ${t.email}`.toLowerCase().includes(search.toLowerCase()),
  )

  function copyText(text: string, field: 'username' | 'password') {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData(e.currentTarget)

    const payload = {
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const { therapist, credentials: creds, error: err } = await res.json()

    if (err && !therapist) { setError(err); setSaving(false); return }
    if (therapist) setTherapists((prev) => [...prev, therapist as Therapist])
    setOpen(false)
    setSaving(false)
    if (creds) setCredentials(creds)
  }

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

    if (err) { setEditError(err); setEditSaving(false); return }

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
          <p className="text-sm text-muted-foreground mt-0.5">Manage clinic therapists</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-6 space-y-4">
        {/* Edit therapist dialog */}
        <Dialog open={!!editingTherapist} onOpenChange={(v) => { if (!v) { setEditingTherapist(null); setEditError(null) } }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Therapist</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Update the therapist&apos;s profile details.</p>
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
                    <select name="gender" defaultValue={editingTherapist.gender ?? ''} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
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

        {/* Credentials modal shown after therapist creation */}
        <Dialog open={!!credentials} onOpenChange={(v) => { if (!v) setCredentials(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-[#66948a]/10 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#66948a]" />
                </div>
                <DialogTitle>Therapist Account Created</DialogTitle>
              </div>
            </DialogHeader>
            {credentials && (
              <div className="space-y-4 mt-1">
                <p className="text-sm text-muted-foreground">
                  Share these login credentials with the therapist. They can use either their username or email to sign in.
                </p>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Email</span>
                    <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2.5">
                      <span className="font-mono text-sm text-foreground">{credentials.email}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Username</span>
                    <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2.5">
                      <span className="font-mono font-semibold tracking-wider text-foreground">{credentials.username}</span>
                      <button onClick={() => copyText(credentials.username, 'username')} className="ml-2 text-[#66948a] hover:text-[#4d7068] transition-colors">
                        {copied === 'username' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Password</span>
                    <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2.5">
                      <span className="font-mono font-semibold tracking-wider text-foreground">{credentials.password}</span>
                      <button onClick={() => copyText(credentials.password, 'password')} className="ml-2 text-[#66948a] hover:text-[#4d7068] transition-colors">
                        {copied === 'password' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 text-xs text-amber-700">
                  <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Save these credentials. The password cannot be retrieved again after closing this dialog.
                </div>
                <Button className="w-full bg-[#66948a] hover:bg-[#4d7068] text-white" onClick={() => setCredentials(null)}>
                  Done
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search therapists..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger render={<Button className="bg-[#66948a] hover:bg-[#4d7068] text-white gap-2" />}>
                  <Plus className="w-4 h-4" /> Add Therapist
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Therapist</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">Login credentials will be auto-generated and shown after creation.</p>
                  </DialogHeader>
                  <form onSubmit={handleAdd} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>First name</Label><Input name="first_name" required /></div>
                      <div className="space-y-1.5"><Label>Last name</Label><Input name="last_name" required /></div>
                    </div>
                    <div className="space-y-1.5"><Label>Email</Label><Input name="email" type="email" required /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Phone</Label><Input name="phone" /></div>
                      <div className="space-y-1.5"><Label>Gender</Label>
                        <select name="gender" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Experience (years)</Label><Input name="experience_years" type="number" min="0" defaultValue="0" /></div>
                      <div className="space-y-1.5"><Label>Consultation Fee (&#8377;)</Label><Input name="consultation_fee" type="number" min="0" defaultValue="0" /></div>
                    </div>
                    <div className="space-y-1.5"><Label>Specializations (comma-separated)</Label><Input name="specializations" placeholder="Anxiety, Depression, CBT" /></div>
                    <div className="space-y-1.5"><Label>Languages (comma-separated)</Label><Input name="languages" placeholder="English, Hindi" defaultValue="English" /></div>
                    <div className="space-y-1.5"><Label>Bio</Label><Textarea name="bio" rows={3} /></div>
                    {error && <div className="text-sm text-destructive">{error}</div>}
                    <Button type="submit" className="w-full bg-[#66948a] hover:bg-[#4d7068] text-white" disabled={saving}>
                      {saving ? 'Creating account...' : 'Add Therapist & Create Login'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Therapist</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Specializations</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Experience</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fee</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No therapists found.</td></tr>
                    ) : (
                      filtered.map((t) => (
                        <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#66948a]/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-[#66948a]">{t.first_name[0]}{t.last_name[0]}</span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">Dr. {t.first_name} {t.last_name}</div>
                                <div className="text-xs text-muted-foreground">{t.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {(t.specializations ?? []).slice(0, 2).map((s) => (
                                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground">{t.experience_years} yrs</td>
                          <td className="px-4 py-3 text-foreground">₹{t.consultation_fee}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${t.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                              {t.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => { setEditingTherapist(t); setEditError(null) }} title="Edit therapist" className="text-muted-foreground hover:text-[#66948a] transition-colors">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => toggleActive(t.id, t.is_active)} title={t.is_active ? 'Deactivate' : 'Activate'} className="text-muted-foreground hover:text-foreground transition-colors">
                                {t.is_active ? <ToggleRight className="w-5 h-5 text-[#66948a]" /> : <ToggleLeft className="w-5 h-5" />}
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
