"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Clock, Video, X } from "lucide-react"
import { format } from "date-fns"

type Booking = {
  id: string
  booking_ref: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  patient_name: string
  meet_link: string | null
  therapists: {
    first_name: string
    last_name: string
    photo_url: string | null
    specializations: string[] | null
  } | null
}

function DashboardHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-6 py-5">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {actions}
    </div>
  )
}

export default function PatientBookingsPage() {
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        window.location.href = "/auth/login"
        return
      }

      const { data } = await supabase
        .from("bookings")
        .select("*, therapists(first_name, last_name, photo_url, specializations)")
        .eq("patient_email", user.email ?? "")
        .gte("booking_date", new Date().toISOString().slice(0, 10))
        .in("status", ["pending", "confirmed"])
        .order("booking_date", { ascending: true })

      setBookings((data as unknown as Booking[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function cancelBooking(id: string) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return
    setCancelling(id)
    const supabase = createClient()
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id)
    if (!error) {
      setBookings((prev) => prev.filter((b) => b.id !== id))
    }
    setCancelling(null)
  }

  return (
    <div>
      <DashboardHeader
        title="My Appointments"
        subtitle="Your upcoming scheduled sessions"
        actions={
          <Link href="/book">
            <Button size="sm" className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-1.5" /> Book Session
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading appointments...</p>
        ) : bookings.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground mb-1">No upcoming appointments</p>
            <p className="text-sm text-muted-foreground">Your scheduled sessions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {b.therapists?.photo_url ? (
                      <img
                        src={b.therapists.photo_url || "/placeholder.svg"}
                        alt={`Dr. ${b.therapists.first_name}`}
                        className="w-12 h-12 rounded-full object-cover border border-border flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-lg">{b.therapists?.first_name?.[0] ?? "T"}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">
                        {b.therapists ? `Dr. ${b.therapists.first_name} ${b.therapists.last_name}` : b.patient_name}
                      </p>
                      {b.therapists?.specializations && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {b.therapists.specializations.slice(0, 2).join(" · ")}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(b.booking_date), "EEEE, MMMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {b.start_time.slice(0, 5)} – {b.end_time.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      b.status === "confirmed" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                  {b.meet_link && b.status === "confirmed" && (
                    <a
                      href={`/meeting/${b.id}`}
                      className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Session
                    </a>
                  )}
                  <span className="text-xs text-muted-foreground font-mono ml-auto">Ref: {b.booking_ref}</span>
                  <button
                    onClick={() => cancelBooking(b.id)}
                    disabled={cancelling === b.id}
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    {cancelling === b.id ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
