'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Bell, FileText, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

interface Booking {
  id: string
  booking_ref: string
  patient_name: string
  booking_date: string
  start_time: string
}

interface Note {
  id: string
  booking_id: string
  notes: string | null
  prescription: string | null
  follow_up_date: string | null
  created_at: string
  bookings?: { booking_ref: string; patient_name: string; booking_date: string } | null
}

export default function TherapistNotesPage() {
  const [therapistId, setTherapistId] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [noteText, setNoteText] = useState('')
  const [prescription, setPrescription] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: therapist } = await supabase.from('therapists').select('id').eq('user_id', user.id).single()
      if (!therapist) { setLoading(false); return }
      setTherapistId(therapist.id)

      const { data: completedBookings } = await supabase
        .from('bookings')
        .select('id, booking_ref, patient_name, booking_date, start_time')
        .eq('therapist_id', therapist.id)
        .in('status', ['completed', 'confirmed'])
        .order('booking_date', { ascending: false })

      const { data: notesData } = await supabase
        .from('session_notes')
        .select('*, bookings(booking_ref, patient_name, booking_date)')
        .eq('therapist_id', therapist.id)
        .order('created_at', { ascending: false })

      setBookings(completedBookings ?? [])
      setNotes(notesData ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function saveNote() {
    if (!selectedBookingId || !noteText || !therapistId) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('session_notes')
      .insert({
        booking_id: selectedBookingId,
        therapist_id: therapistId,
        notes: noteText,
        prescription: prescription || null,
        follow_up_date: followUpDate || null,
      })
      .select('*, bookings(booking_ref, patient_name, booking_date)')
      .single()

    if (!error && data) {
      setNotes((prev) => [data, ...prev])
      setSelectedBookingId('')
      setNoteText('')
      setPrescription('')
      setFollowUpDate('')
    }
    setSaving(false)
  }

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Session Notes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Record and review session notes for your patients</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-xl p-5 space-y-4 sticky top-6">
                <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Session Note
                </h3>

                <div>
                  <Label className="text-xs mb-1.5 block">Select Session</Label>
                  <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a session..." />
                    </SelectTrigger>
                    <SelectContent>
                      {bookings.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.patient_name} — {format(new Date(b.booking_date), 'MMM d')} {b.start_time.slice(0, 5)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs mb-1.5 block">Session Notes</Label>
                  <Textarea placeholder="Write session observations, progress notes, treatment plans..." value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={5} className="resize-none text-sm" />
                </div>

                <div>
                  <Label className="text-xs mb-1.5 block">Prescription / Recommendations</Label>
                  <Textarea placeholder="Medications, exercises, or recommendations..." value={prescription} onChange={(e) => setPrescription(e.target.value)} rows={3} className="resize-none text-sm" />
                </div>

                <div>
                  <Label className="text-xs mb-1.5 block">Follow-up Date</Label>
                  <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                </div>

                <Button onClick={saveNote} disabled={saving || !selectedBookingId || !noteText} className="w-full bg-primary text-primary-foreground">
                  {saving ? 'Saving...' : 'Save Note'}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-3">
              {notes.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No session notes yet.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedId(expandedId === note.id ? null : note.id)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
                      <div className="text-left">
                        <p className="font-medium text-foreground text-sm">{note.bookings?.patient_name ?? 'Unknown Patient'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {note.bookings?.booking_date ? format(new Date(note.bookings.booking_date), 'MMM d, yyyy') : ''}
                          {' · '}Ref: {note.bookings?.booking_ref ?? '—'}
                        </p>
                      </div>
                      {expandedId === note.id ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    </button>
                    {expandedId === note.id && (
                      <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{note.notes}</p>
                        </div>
                        {note.prescription && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Prescription</p>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{note.prescription}</p>
                          </div>
                        )}
                        {note.follow_up_date && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Follow-up</p>
                            <p className="text-sm text-foreground font-medium">{format(new Date(note.follow_up_date), 'MMMM d, yyyy')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
