'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Bell, CalendarCheck, Users, Clock, CheckCircle, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
  amount: number
}

interface Therapist {
  id: string
  first_name: string
  last_name: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-700',
  rescheduled: 'bg-purple-100 text-purple-800',
}

function StatCard({ title, value, subtitle, icon: Icon, color }: { title: string; value: string | number; subtitle?: string; icon: LucideIcon; color: 'blue' | 'green' | 'amber' | 'purple' }) {
  const colorMap = {
    blue: 'bg-[#66948a]/10 text-[#66948a]',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
  }
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', colorMap[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-foreground mb-0.5">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
    </div>
  )
}

export default function TherapistDashboard() {
  const [therapist, setTherapist] = useState<Therapist | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [noProfile, setNoProfile] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: t } = await supabase.from('therapists').select('*').eq('user_id', user.id).single()
      if (!t) { setNoProfile(true); setLoading(false); return }
      setTherapist(t)

      const { data: b } = await supabase
        .from('bookings')
        .select('*')
        .eq('therapist_id', t.id)
        .order('booking_date', { ascending: false })
      setBookings(b ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>
    )
  }

  if (noProfile) {
    return (
      <div>
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
          <div>
            <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Therapist Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your practice overview</p>
          </div>
        </header>
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-800">
            Your therapist profile has not been set up yet. Please contact the admin to complete your profile setup.
          </div>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  const todayBookings = bookings.filter((b) => b.booking_date === today)
  const upcomingBookings = bookings.filter((b) => b.booking_date > today && ['confirmed', 'pending'].includes(b.status))
  const completedBookings = bookings.filter((b) => b.status === 'completed')
  const uniquePatients = new Set(bookings.map((b) => b.patient_email)).size
  const recentBookings = [...bookings].slice(0, 8)

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">
            Dr. {therapist?.first_name} {therapist?.last_name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your practice overview</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Today's Appointments" value={todayBookings.length} icon={CalendarCheck} color="blue" subtitle={`${todayBookings.filter((b) => b.status === 'confirmed').length} confirmed`} />
          <StatCard title="Upcoming" value={upcomingBookings.length} icon={Clock} color="purple" subtitle="Next 30 days" />
          <StatCard title="Total Patients" value={uniquePatients} icon={Users} color="green" />
          <StatCard title="Completed Sessions" value={completedBookings.length} icon={CheckCircle} color="amber" />
        </div>

        {todayBookings.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">Today&apos;s Schedule</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...todayBookings].sort((a, b) => a.start_time.localeCompare(b.start_time)).map((b) => (
                <div key={b.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{b.patient_name}</p>
                      <p className="text-xs text-muted-foreground">{b.patient_email}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[b.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    {b.start_time.slice(0, 5)} – {b.end_time.slice(0, 5)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Recent Appointments</h2>
          {recentBookings.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">No bookings yet.</div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ref</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date & Time</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b.booking_ref}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{b.patient_name}</div>
                          <div className="text-xs text-muted-foreground">{b.patient_email}</div>
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          <div>{format(new Date(b.booking_date), 'MMM d, yyyy')}</div>
                          <div className="text-xs text-muted-foreground">{b.start_time?.slice(0, 5)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[b.status] ?? 'bg-gray-100 text-gray-700'}`}>
                            {b.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">{b.amount > 0 ? `₹${b.amount}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
