'use client'

import { useEffect, useState } from 'react'
import { Bell, Plus, Trash2, Save, CalendarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface Availability {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

interface BlockedSlot {
  id: string
  blocked_date: string
  reason: string | null
}

export default function TherapistAvailabilityPage() {
  const [therapistId, setTherapistId] = useState<string | null>(null)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [newDay, setNewDay] = useState(1)
  const [newStart, setNewStart] = useState('09:00')
  const [newEnd, setNewEnd] = useState('17:00')

  const [blockDate, setBlockDate] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [blocking, setBlocking] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: therapist } = await supabase.from('therapists').select('id').eq('user_id', user.id).single()
      if (!therapist) { setLoading(false); return }
      setTherapistId(therapist.id)

      const { data: avail } = await supabase.from('therapist_availability').select('*').eq('therapist_id', therapist.id).order('day_of_week')
      const { data: blocked } = await supabase
        .from('blocked_slots')
        .select('*')
        .eq('therapist_id', therapist.id)
        .gte('blocked_date', new Date().toISOString().slice(0, 10))
        .order('blocked_date')

      setAvailability(avail ?? [])
      setBlockedSlots(blocked ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function addAvailability() {
    if (!therapistId) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('therapist_availability')
      .insert({ therapist_id: therapistId, day_of_week: newDay, start_time: newStart, end_time: newEnd })
      .select()
      .single()
    if (!error && data) {
      setAvailability((prev) => [...prev, data])
      setMessage('Availability saved.')
    }
    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  async function removeAvailability(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('therapist_availability').delete().eq('id', id)
    if (!error) setAvailability((prev) => prev.filter((a) => a.id !== id))
  }

  async function addBlockedSlot() {
    if (!blockDate || !therapistId) return
    setBlocking(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('blocked_slots')
      .insert({ therapist_id: therapistId, blocked_date: blockDate, reason: blockReason || null, is_full_day: true })
      .select()
      .single()
    if (!error && data) {
      setBlockedSlots((prev) => [...prev, data])
      setBlockDate('')
      setBlockReason('')
    }
    setBlocking(false)
  }

  async function removeBlockedSlot(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('blocked_slots').delete().eq('id', id)
    if (!error) setBlockedSlots((prev) => prev.filter((b) => b.id !== id))
  }

  const grouped = DAYS.map((day, i) => ({ day, index: i, slots: availability.filter((a) => a.day_of_week === i) }))

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Availability</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Set your weekly schedule and block time off</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-heading font-semibold text-foreground mb-4">Weekly Schedule</h3>
                <div className="space-y-3">
                  {grouped.map(({ day, slots }) => (
                    <div key={day} className="flex items-start gap-3">
                      <div className="w-24 pt-0.5 flex-shrink-0">
                        <span className="text-sm font-medium text-foreground">{day.slice(0, 3)}</span>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {slots.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Off</span>
                        ) : (
                          slots.map((s) => (
                            <div key={s.id} className="flex items-center gap-2">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">
                                {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                              </span>
                              <button onClick={() => removeAvailability(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Availability
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <Label className="text-xs mb-1 block">Day</Label>
                    <select value={newDay} onChange={(e) => setNewDay(Number(e.target.value))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Start</Label>
                    <Input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">End</Label>
                    <Input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="text-sm" />
                  </div>
                </div>
                {message && <p className="text-xs text-green-600 mb-2">{message}</p>}
                <Button onClick={addAvailability} disabled={saving} size="sm" className="w-full bg-primary text-primary-foreground">
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {saving ? 'Saving...' : 'Add Slot'}
                </Button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CalendarOff className="w-4 h-4" /> Block Time Off
                </h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <Label className="text-xs mb-1 block">Date</Label>
                    <Input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Reason (optional)</Label>
                    <Input placeholder="e.g. Holiday, Personal leave" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />
                  </div>
                  <Button onClick={addBlockedSlot} disabled={blocking || !blockDate} size="sm" className="w-full bg-primary text-primary-foreground">
                    {blocking ? 'Blocking...' : 'Block This Day'}
                  </Button>
                </div>

                {blockedSlots.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Upcoming Blocked Days</p>
                    {blockedSlots.map((b) => (
                      <div key={b.id} className="flex items-center justify-between gap-2 bg-muted/50 rounded-lg px-3 py-2">
                        <div>
                          <span className="text-sm font-medium text-foreground">{b.blocked_date}</span>
                          {b.reason && <span className="text-xs text-muted-foreground ml-2">– {b.reason}</span>}
                        </div>
                        <button onClick={() => removeBlockedSlot(b.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
