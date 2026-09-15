"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"

type Booking = {
  id: string
  booking_ref: string
  booking_date: string
  start_time: string
  status: string
  amount: number
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

export default function PatientHistoryPage() {
  const [loading, setLoading] = useState(true)
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

      const { data } = await supabase
        .from("bookings")
        .select("*, therapists(first_name, last_name)")
        .eq("patient_email", user.email ?? "")
        .in("status", ["completed", "cancelled", "no_show"])
        .order("booking_date", { ascending: false })

      setAllBookings((data as unknown as Booking[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading history...</p>
      </div>
    )
  }

  const completed = allBookings.filter((b) => b.status === "completed")
  const totalSpent = completed.reduce((s, b) => s + (b.amount ?? 0), 0)

  return (
    <div>
      <DashboardHeader title="Session History" subtitle="Your past appointments and sessions" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Completed", value: completed.length, color: "text-green-700 bg-green-100" },
            {
              label: "Cancelled",
              value: allBookings.filter((b) => b.status === "cancelled").length,
              color: "text-red-700 bg-red-100",
            },
            {
              label: "No Show",
              value: allBookings.filter((b) => b.status === "no_show").length,
              color: "text-gray-700 bg-gray-100",
            },
            { label: "Total Spent", value: `₹${totalSpent.toLocaleString()}`, color: "text-blue-700 bg-blue-100" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold mb-0.5 ${s.color.split(" ")[0]}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {allBookings.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center text-sm text-muted-foreground">
            No past sessions found.
          </div>
        ) : (
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
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-foreground">
                        {b.therapists ? `Dr. ${b.therapists.first_name} ${b.therapists.last_name}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground">{format(new Date(b.booking_date), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.start_time.slice(0, 5)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            b.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : b.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {b.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground font-medium">
                        {b.amount > 0 ? `₹${b.amount}` : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b.booking_ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
