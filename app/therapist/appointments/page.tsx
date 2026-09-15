'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Bell, Search, Clock, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

interface Booking {
  id: string
  booking_ref: string
  patient_name: string
  patient_email: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  meet_link: string | null
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-700',
  rescheduled: 'bg-purple-100 text-purple-800',
}

export default function TherapistAppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: therapist } = await supabase.from('therapists').select('id').eq('user_id', user.id).single()
      if (!therapist) { setLoading(false); return }

      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('therapist_id', therapist.id)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: true })
      setBookings(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase()
    const matchSearch =
      b.patient_name.toLowerCase().includes(q) ||
      b.patient_email.toLowerCase().includes(q) ||
      b.booking_ref.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    const supabase = createClient()
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (!error) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
    }
    setUpdating(null)
  }

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your scheduled sessions</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search patient, email or ref..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ref</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Meeting</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No appointments found.</td>
                      </tr>
                    ) : (
                      filtered.map((b) => (
                        <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{b.patient_name}</div>
                            <div className="text-xs text-muted-foreground">{b.patient_email}</div>
                          </td>
                          <td className="px-4 py-3 text-foreground">{format(new Date(b.booking_date), 'MMM d, yyyy')}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-foreground">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              {b.start_time.slice(0, 5)}–{b.end_time.slice(0, 5)}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b.booking_ref}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[b.status] ?? ''}`}>
                              {b.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {b.meet_link ? (
                              <a href={`/meeting/${b.id}`} className="inline-flex items-center gap-1.5 text-primary text-xs font-medium hover:underline">
                                <Video className="w-3.5 h-3.5" /> Join
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Select value={b.status} onValueChange={(val) => updateStatus(b.id, val)} disabled={updating === b.id}>
                              <SelectTrigger className="h-7 text-xs w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmed">Confirm</SelectItem>
                                <SelectItem value="completed">Complete</SelectItem>
                                <SelectItem value="cancelled">Cancel</SelectItem>
                                <SelectItem value="no_show">No Show</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{filtered.length} appointment{filtered.length !== 1 ? 's' : ''} shown</p>
          </>
        )}
      </div>
    </div>
  )
}
