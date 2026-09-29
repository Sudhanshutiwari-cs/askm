'use client'

import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { GraduationCap, Plus, Calendar, Clock, Video, FileText, Trash2, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Workshop } from '@/types/phase2'

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)

  // New workshop form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [speakerName, setSpeakerName] = useState('')
  const [tierTarget, setTierTarget] = useState<'all' | 'professional' | 'intern'>('all')
  const [scheduledDate, setScheduledDate] = useState('')
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('19:30')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [materialsUrl, setMaterialsUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const loadWorkshops = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/workshops')
      const data = await res.json()
      setWorkshops(data.workshops || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkshops()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          speakerName,
          tierTarget,
          scheduledDate,
          startTime,
          endTime,
          meetingUrl,
          materialsUrl,
        }),
      })

      const data = await res.json()
      if (data.workshop) {
        setOpenModal(false)
        setTitle('')
        setDescription('')
        setSpeakerName('')
        setScheduledDate('')
        setMeetingUrl('')
        setMaterialsUrl('')
        loadWorkshops()
      } else {
        alert(data.error || 'Failed to schedule workshop')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and remove this workshop?')) return
    await fetch('/api/admin/workshops', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadWorkshops()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Workshops & Intern Training Scheduler</h1>
          <p className="text-sm text-muted-foreground">
            Schedule weekly peer supervision, masterclasses, case reviews, and intern training webinars
          </p>
        </div>

        <Button
          onClick={() => setOpenModal(true)}
          className="bg-[#66948a] hover:bg-[#4d7068] text-white text-xs gap-1.5 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" /> Schedule New Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-sm text-muted-foreground">
            Loading scheduled sessions...
          </div>
        ) : workshops.length === 0 ? (
          <div className="col-span-full p-12 text-center text-sm text-muted-foreground bg-card border border-border rounded-xl">
            No workshops scheduled. Click &quot;Schedule New Session&quot; to plan weekly case studies or intern training.
          </div>
        ) : (
          workshops.map((w) => (
            <div key={w.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    className={`text-[10px] capitalize ${
                      w.tier_target === 'intern'
                        ? 'bg-amber-100 text-amber-800'
                        : w.tier_target === 'professional'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {w.tier_target === 'all' ? 'All Practitioners' : `${w.tier_target}s Only`}
                  </Badge>

                  <button
                    onClick={() => handleDelete(w.id)}
                    className="text-muted-foreground hover:text-rose-600 transition-colors p-1"
                    title="Cancel Workshop"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-bold text-foreground text-sm leading-snug">{w.title}</h3>
                <p className="text-xs text-[#66948a] font-medium mt-1">Facilitator: {w.speaker_name}</p>

                {w.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">{w.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-border space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#66948a]" />
                    {format(new Date(w.scheduled_date), 'EEE, MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {w.start_time.slice(0, 5)} - {w.end_time.slice(0, 5)}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {w.meeting_url && (
                    <a
                      href={w.meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1 bg-[#66948a]/10 hover:bg-[#66948a]/20 text-[#426b62] py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Link
                    </a>
                  )}

                  {w.materials_url && (
                    <a
                      href={w.materials_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1 border border-border hover:bg-muted py-1.5 px-3 rounded-lg text-xs text-muted-foreground transition-colors"
                      title="Materials & Slides"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#66948a]" /> Schedule Workshop or Training
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Notify practitioners and post training details to the collective calendar.
            </p>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3.5 text-xs pt-1">
            <div>
              <Label className="text-xs mb-1 block">Session Title</Label>
              <Input
                placeholder="e.g. Somatic Trauma Interventions & Peer Supervision"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Speaker / Supervisor</Label>
                <Input
                  placeholder="Dr. Dipanita Biswas"
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label className="text-xs mb-1 block">Target Audience</Label>
                <select
                  value={tierTarget}
                  onChange={(e: any) => setTierTarget(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#66948a]"
                >
                  <option value="all">All Practitioners</option>
                  <option value="professional">Licensed Psychologists Only</option>
                  <option value="intern">Supervised Interns Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Date</Label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">End Time</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-xs mb-1 block">Meeting Video URL (Google Meet / Zoom / Jitsi)</Label>
              <Input
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs mb-1 block">Case Study / Materials Link (Optional)</Label>
              <Input
                type="url"
                placeholder="https://drive.google.com/..."
                value={materialsUrl}
                onChange={(e) => setMaterialsUrl(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs mb-1 block">Session Description & Agenda</Label>
              <Textarea
                rows={2}
                placeholder="Key clinical objectives and discussion topics..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-[#66948a] hover:bg-[#4d7068] text-white">
                {saving ? 'Scheduling...' : 'Schedule Workshop'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
