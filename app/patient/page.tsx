"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CalendarCheck, Clock, CheckCircle, Calendar, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

type Booking = {
  id: string
  booking_date: string
  start_time: string
  status: string
  amount: number
  meet_link: string | null
  therapists: { first_name: string; last_name: string } | null
}

function DashboardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-border px-6 py-5">
      <h1 className="font-heading text-xl font-bold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  icon: LucideIcon
  color: "blue" | "green" | "purple"
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
  }
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{title}</p>
      </div>
    </div>
  )
}

export default function PatientDashboard() {
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState("")
  const [allBookings, setAllBookings] = useState<Booking[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        window.location.href = "/auth/login"
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single()

      setFirstName(profile?.first_name ?? "")

      const { data: bookings } = await supabase
        .from("bookings")
        .select("*, therapists(first_name, last_name)")
        .eq("patient_email", user.email ?? "")
        .order("booking_date", { ascending: false })

      setAllBookings((bookings as unknown as Booking[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = allBookings.filter((b) => b.booking_date >= today && ["confirmed", "pending"].includes(b.status))
  const completed = allBookings.filter((b) => b.status === "completed")
  const nextAppointment = upcoming[0]

  return (
    <div>
      <DashboardHeader title={`Welcome${firstName ? `, ${firstName}` : ""}!`} subtitle="Your mental health journey" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Upcoming Sessions" value={upcoming.length} icon={CalendarCheck} color="blue" />
          <StatCard title="Completed Sessions" value={completed.length} icon={CheckCircle} color="green" />
          <StatCard title="Total Bookings" value={allBookings.length} icon={Clock} color="purple" />
        </div>

        {nextAppointment && (
          <div className="bg-primary rounded-xl p-5 text-primary-foreground">
            <p className="text-sm text-primary-foreground/70 mb-1">Next Appointment</p>
            <p className="font-heading font-bold text-lg mb-0.5">
              {nextAppointment.therapists
                ? `Dr. ${nextAppointment.therapists.first_name} ${nextAppointment.therapists.last_name}`
                : "Therapist"}
            </p>
            <div className="flex items-center gap-4 text-sm text-primary-foreground/80">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(nextAppointment.booking_date), "EEEE, MMMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {nextAppointment.start_time.slice(0, 5)}
              </span>
            </div>
            <div className="mt-3 flex gap-3">
              {nextAppointment.meet_link && (
                <a
                  href={nextAppointment.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-white text-primary text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Join Session
                </a>
              )}
              <Link
                href="/patient/bookings"
                className="inline-flex items-center gap-1.5 bg-white/20 text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors"
              >
                View All Bookings
              </Link>
            </div>
          </div>
        )}

        {!nextAppointment && (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <CalendarCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground mb-1">No upcoming appointments</p>
            <p className="text-sm text-muted-foreground mb-4">
              Book a session with one of our therapists to get started.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Book a Session
            </Link>
          </div>
        )}

        {allBookings.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">Recent Bookings</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Therapist</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allBookings.slice(0, 5).map((b) => (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-foreground">
                          {b.therapists ? `Dr. ${b.therapists.first_name} ${b.therapists.last_name}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {format(new Date(b.booking_date), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{b.start_time.slice(0, 5)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              b.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : b.status === "confirmed"
                                  ? "bg-blue-100 text-blue-800"
                                  : b.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {b.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-foreground font-medium">
                          {b.amount > 0 ? `₹${b.amount}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
