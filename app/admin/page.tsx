'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Bell, Users, Calendar, UserCheck, TrendingUp, Mail, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'

interface Booking {
  id: string
  booking_ref: string
  patient_name: string
  patient_email: string
  booking_date: string
  start_time: string
  status: BookingStatus
  amount: number
  created_at: string
  therapists?: { first_name: string; last_name: string } | null
}

interface Therapist {
  id: string
  is_active: boolean
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-700',
  rescheduled: 'bg-purple-100 text-purple-800',
}

function StatCard({ title, value, subtitle, icon: Icon, color }: { title: string; value: string | number; subtitle?: string; icon: LucideIcon; color: 'blue' | 'green' | 'amber' | 'purple' | 'teal' }) {
  const colorMap = {
    blue: 'bg-[#66948a]/10 text-[#66948a]',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
    teal: 'bg-emerald-100 text-emerald-700',
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

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [patientCount, setPatientCount] = useState(0)
  const [newsletterStats, setNewsletterStats] = useState<{ total: number; active: number }>({ total: 0, active: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [bookingsRes, patientsRes, therapistsRes, newsletterRes] = await Promise.all([
        fetch('/api/admin/bookings').then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/patients').then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/therapists').then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/newsletter').then((r) => r.json()).catch(() => ({})),
      ])
      setBookings(bookingsRes.bookings ?? [])
      setPatientCount((patientsRes.patients ?? []).length)
      setTherapists(therapistsRes.therapists ?? [])
      if (newsletterRes?.stats) {
        setNewsletterStats({ total: newsletterRes.stats.total ?? 0, active: newsletterRes.stats.active ?? 0 })
      }
      setLoading(false)
    }
    load()
  }, [])

  const totalBookings = bookings.length
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length
  const revenue = bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + (b.amount ?? 0), 0)
  const activeTherapists = therapists.filter((t) => t.is_active).length
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of clinic operations</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard title="Total Bookings" value={totalBookings} icon={Calendar} color="blue" subtitle={`${pendingBookings} pending`} />
          <StatCard title="Active Therapists" value={activeTherapists} icon={UserCheck} color="green" />
          <StatCard title="Total Patients" value={patientCount} icon={Users} color="purple" />
          <Link href="/admin/newsletter" className="block transition-transform hover:-translate-y-0.5">
            <StatCard title="Newsletter Subs" value={newsletterStats.total} icon={Mail} color="teal" subtitle={`${newsletterStats.active} active`} />
          </Link>
          <StatCard title="Revenue (Completed)" value={`₹${revenue.toLocaleString()}`} icon={TrendingUp} color="amber" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">Recent Bookings</h2>
          {loading ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : recentBookings.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">No bookings yet.</div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ref</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Therapist</th>
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
                          {b.therapists ? `Dr. ${b.therapists.first_name} ${b.therapists.last_name}` : '—'}
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
                        <td className="px-4 py-3 text-right font-medium text-foreground">
                          {b.amount > 0 ? `₹${b.amount}` : '—'}
                        </td>
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
