"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { Bell, BellOff, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

type Notification = {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

const typeColors: Record<string, string> = {
  booking: "bg-blue-100 text-blue-700",
  reminder: "bg-amber-100 text-amber-700",
  cancellation: "bg-red-100 text-red-700",
  system: "bg-gray-100 text-gray-700",
}

function DashboardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-border px-6 py-5">
      <h1 className="font-heading text-xl font-bold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

export default function PatientNotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        window.location.href = "/auth/login"
        return
      }
      setUserId(user.id)

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      setNotifications((data as Notification[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function markAllRead() {
    setMarking(true)
    const supabase = createClient()
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setMarking(false)
  }

  async function markRead(id: string) {
    const supabase = createClient()
    await supabase.from("notifications").update({ is_read: true }).eq("id", id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div>
      <DashboardHeader title="Notifications" subtitle="Your recent alerts and updates" />
      <div className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <BellOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground mb-1">No notifications</p>
            <p className="text-sm text-muted-foreground">{"You're all caught up!"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread` : "All read"}</p>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllRead} disabled={marking}>
                  <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                  {marking ? "Marking..." : "Mark all read"}
                </Button>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer ${
                    !n.is_read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center ${
                      typeColors[n.type] ?? typeColors.system
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-2 ml-auto" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
