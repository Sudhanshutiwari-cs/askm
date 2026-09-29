'use client'

import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Bell, FileText, Plus, ChevronDown, ChevronUp, CheckSquare, BookOpen, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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
  core_concerns?: string | null
  observations?: string | null
  tools_journals?: string | null
  homework?: string | null
  dos_donts?: string | null
  next_session_focus?: string | null
  client_visible?: boolean
  created_at: string
  bookings?: { booking_ref: string; patient_name: string; booking_date: string } | null
}

export default function TherapistNotesPage() {
  const [therapistId, setTherapistId] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  // Structured form states
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [coreConcerns, setCoreConcerns] = useState('')
  const [observations, setObservations] = useState('')
  const [homework, setHomework] = useState('')
  const [toolsJournals, setToolsJournals] = useState('')
  const [dosDonts, setDosDonts] = useState('')
  const [nextSessionFocus, setNextSessionFocus] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [prescription, setPrescription] = useState('')
  const [clientVisible, setClientVisible] = useState(true)

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
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
    if (!selectedBookingId || !therapistId || (!coreConcerns && !observations && !homework)) return
    setSaving(true)
    setSuccess(false)
    const supabase = createClient()

    const summaryNotes = [coreConcerns, observations].filter(Boolean).join('\n\n')

    const { data, error } = await supabase
      .from('session_notes')
      .insert({
        booking_id: selectedBookingId,
        therapist_id: therapistId,
        notes: summaryNotes,
        core_concerns: coreConcerns || null,
        observations: observations || null,
        homework: homework || null,
        tools_journals: toolsJournals || null,
        dos_donts: dosDonts || null,
        next_session_focus: nextSessionFocus || null,
        prescription: prescription || null,
        follow_up_date: followUpDate || null,
        client_visible: clientVisible,
      })
      .select('*, bookings(booking_ref, patient_name, booking_date)')
      .single()

    if (!error && data) {
      setNotes((prev) => [data, ...prev])
      setSelectedBookingId('')
      setCoreConcerns('')
      setObservations('')
      setHomework('')
      setToolsJournals('')
      setDosDonts('')
      setNextSessionFocus('')
      setPrescription('')
      setFollowUpDate('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Clinical Session Documentation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Structured 30-minute post-session record: issues, observations, homework, tools, and reminders
          </p>
        </div>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
            Loading clinical notes...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Documentation Form */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#66948a]" /> Post-Session Clinical Record Form
                  </h3>
                  <Badge variant="outline" className="text-xs text-[#66948a] border-[#66948a]/30">
                    Client Portal Sync Enabled
                  </Badge>
                </div>

                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Clinical report recorded successfully and synced to patient takeaways!</span>
                  </div>
                )}

                <div className="space-y-4 text-xs">
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Select Client Session</Label>
                    <Select value={selectedBookingId} onValueChange={(val) => setSelectedBookingId(val ?? '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an appointment..." />
                      </SelectTrigger>
                      <SelectContent>
                        {bookings.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.patient_name} &middot; {format(new Date(b.booking_date), 'MMM d, yyyy')} ({b.start_time.slice(0, 5)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">1. Problems / Core Concerns Explored</Label>
                    <Textarea
                      rows={2}
                      placeholder="e.g. Discussed root causes of acute workplace burnout and boundaries with superiors..."
                      value={coreConcerns}
                      onChange={(e) => setCoreConcerns(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">2. Therapist Clinical Observations & Considerations</Label>
                    <Textarea
                      rows={3}
                      placeholder="e.g. Client displayed somatic tension; cognitive distortions centered on catastrophizing..."
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> Prescribed Homework / Actions
                      </Label>
                      <Textarea
                        rows={3}
                        placeholder="e.g. 10-minute progressive muscle relaxation before bed; daily thought record..."
                        value={homework}
                        onChange={(e) => setHomework(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-sky-600" /> Prescribed Tools / Reflective Journals
                      </Label>
                      <Textarea
                        rows={3}
                        placeholder="e.g. Astsankhlam Gratitude & Trigger Journal; 4-7-8 breathing practice..."
                        value={toolsJournals}
                        onChange={(e) => setToolsJournals(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Do's & Don'ts for the Client</Label>
                    <Textarea
                      rows={2}
                      placeholder="DO: Take mindful pauses when overwhelmed. DON'T: Suppress emotional responses or over-isolate..."
                      value={dosDonts}
                      onChange={(e) => setDosDonts(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold mb-1.5 block">Next Meeting / Follow-up Date</Label>
                      <Input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold mb-1.5 block">Next Session Roadmap Focus</Label>
                      <Input
                        placeholder="e.g. Review cognitive restructuring exercises"
                        value={nextSessionFocus}
                        onChange={(e) => setNextSessionFocus(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <span className="font-semibold block text-foreground">Make Takeaways Visible to Client</span>
                      <span className="text-muted-foreground text-[11px]">
                        Allows patient to view homework, journals, and do's/don'ts on their portal.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={clientVisible}
                      onChange={(e) => setClientVisible(e.target.checked)}
                      className="rounded border-border text-[#66948a] focus:ring-[#66948a] w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <Button
                    onClick={saveNote}
                    disabled={saving || !selectedBookingId}
                    className="w-full bg-[#66948a] hover:bg-[#4d7068] text-white"
                  >
                    {saving ? 'Saving Clinical Record...' : 'Save & Publish Session Report'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Past Records List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-heading font-semibold text-foreground text-sm">Past Clinical Reports ({notes.length})</h3>

              {notes.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-xs">
                  No session reports recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((n) => {
                    const isExpanded = expandedId === n.id
                    return (
                      <div key={n.id} className="bg-card border border-border rounded-xl p-4 text-xs space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-foreground text-sm block">
                              {n.bookings?.patient_name || 'Patient'}
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                              {n.bookings?.booking_date ? format(new Date(n.bookings.booking_date), 'MMM d, yyyy') : format(new Date(n.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedId(isExpanded ? null : n.id)}
                            className="h-7 px-2 text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </Button>
                        </div>

                        {n.core_concerns && (
                          <div className="text-muted-foreground line-clamp-2">
                            <span className="font-semibold text-foreground">Core Concerns:</span> {n.core_concerns}
                          </div>
                        )}

                        {isExpanded && (
                          <div className="pt-2 border-t border-border space-y-2 mt-2">
                            {n.observations && (
                              <div>
                                <span className="font-semibold text-foreground block">Observations:</span>
                                <p className="text-muted-foreground leading-relaxed">{n.observations}</p>
                              </div>
                            )}

                            {n.homework && (
                              <div className="p-2 bg-emerald-50 rounded border border-emerald-100 text-emerald-900">
                                <span className="font-semibold block text-[11px]">Homework Prescribed:</span>
                                <p>{n.homework}</p>
                              </div>
                            )}

                            {n.tools_journals && (
                              <div className="p-2 bg-sky-50 rounded border border-sky-100 text-sky-900">
                                <span className="font-semibold block text-[11px]">Tools / Journals:</span>
                                <p>{n.tools_journals}</p>
                              </div>
                            )}

                            {n.dos_donts && (
                              <div className="p-2 bg-amber-50 rounded border border-amber-100 text-amber-900">
                                <span className="font-semibold block text-[11px]">Do's and Don'ts:</span>
                                <p className="whitespace-pre-line">{n.dos_donts}</p>
                              </div>
                            )}

                            {n.follow_up_date && (
                              <div className="text-[11px] text-muted-foreground pt-1">
                                Follow-up: <strong>{format(new Date(n.follow_up_date), 'MMM d, yyyy')}</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
