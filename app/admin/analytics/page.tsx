'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, subDays, eachDayOfInterval, startOfToday } from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

interface Booking {
  id: string
  status: string
  amount: number
  booking_date: string
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
  no_show: '#9ca3af',
  rescheduled: '#8b5cf6',
}

export default function AdminAnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((data) => {
        setBookings(data.bookings ?? [])
        setLoading(false)
      })
  }, [])

  const today = startOfToday()
  const last30 = eachDayOfInterval({ start: subDays(today, 29), end: today })

  const dailyData = useMemo(() => {
    return last30.map((day) => {
      const ds = format(day, 'yyyy-MM-dd')
      const dayBookings = bookings.filter((b) => b.booking_date === ds)
      return {
        date: format(day, 'MMM d'),
        bookings: dayBookings.length,
        revenue: dayBookings.filter((b) => b.status === 'completed').reduce((s, b) => s + (b.amount ?? 0), 0),
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings])

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    bookings.forEach((b) => { counts[b.status] = (counts[b.status] ?? 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [bookings])

  const totalRevenue = bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + (b.amount ?? 0), 0)
  const completionRate = bookings.length > 0
    ? Math.round((bookings.filter((b) => b.status === 'completed').length / bookings.length) * 100)
    : 0

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Clinic performance and insights</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Bookings', value: bookings.length },
                { label: 'Completion Rate', value: `${completionRate}%` },
                { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}` },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-5">
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Bookings — Last 30 Days</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#66948a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Revenue — Last 30 Days</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Booking Status Breakdown</h3>
                {statusData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={false}>
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
