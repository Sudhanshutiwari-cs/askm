"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => JitsiApi
  }
}

interface JitsiApi {
  addEventListener: (event: string, listener: (...args: unknown[]) => void) => void
  executeCommand: (command: string, ...args: unknown[]) => void
  dispose: () => void
}

type BookingDetail = {
  id: string
  booking_ref: string
  status: string
  meet_link: string | null
  patient_name: string
  booking_date: string
  start_time: string
  end_time: string
  therapists: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null
}

function JitsiMeeting({ meetLink, displayName, email }: { meetLink: string; displayName: string; email?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<JitsiApi | null>(null)
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  const { domain, room } = (() => {
    try {
      const url = new URL(meetLink)
      return { domain: url.host, room: decodeURIComponent(url.pathname.replace(/^\//, "")) }
    } catch {
      return { domain: "meet.jit.si", room: meetLink }
    }
  })()

  useEffect(() => {
    let cancelled = false

    function initJitsi() {
      if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return
      try {
        const api = new window.JitsiMeetExternalAPI(domain, {
          roomName: room,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: { displayName, email: email ?? "" },
          configOverwrite: {
            prejoinPageEnabled: true,
            disableDeepLinking: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
          },
        })
        apiRef.current = api
        api.addEventListener("videoConferenceJoined", () => setStatus("ready"))
        api.addEventListener("readyToClose", () => router.back())
        setStatus("ready")
      } catch {
        setStatus("error")
      }
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-jitsi]")
    if (window.JitsiMeetExternalAPI) {
      initJitsi()
    } else if (existing) {
      existing.addEventListener("load", initJitsi)
    } else {
      const script = document.createElement("script")
      script.src = "https://meet.jit.si/external_api.js"
      script.async = true
      script.dataset.jitsi = "true"
      script.onload = initJitsi
      script.onerror = () => setStatus("error")
      document.body.appendChild(script)
    }

    return () => {
      cancelled = true
      apiRef.current?.dispose()
      apiRef.current = null
    }
  }, [domain, room, displayName, email, router])

  return (
    <div className="relative w-full h-full">
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Connecting to your session...</p>
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center max-w-sm px-6">
            <p className="font-semibold text-foreground mb-1">Unable to load the video call</p>
            <p className="text-sm text-muted-foreground mb-4">You can still join directly in a new tab.</p>
            <a
              href={meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90"
            >
              Open meeting
            </a>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}

export default function MeetingPage() {
  const params = useParams<{ bookingId: string }>()
  const bookingId = params.bookingId
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [displayName, setDisplayName] = useState("Participant")
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        window.location.href = `/auth/login?redirect=/meeting/${bookingId}`
        return
      }
      setIsAuthed(true)
      setEmail(user.email ?? undefined)

      const { data: bookingData } = await supabase
        .from("bookings")
        .select(
          `id, booking_ref, status, meet_link, patient_name, booking_date, start_time, end_time,
           therapists ( first_name, last_name )`,
        )
        .eq("id", bookingId)
        .single()

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single()

      const name =
        profile?.first_name || profile?.last_name
          ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
          : (bookingData?.patient_name ?? "Participant")

      setDisplayName(name)
      setBooking(bookingData as unknown as BookingDetail)
      setLoading(false)
    }
    load()
  }, [bookingId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading session...</p>
      </main>
    )
  }

  const therapist = Array.isArray(booking?.therapists) ? booking?.therapists[0] : booking?.therapists
  const therapistName = therapist ? `Dr. ${therapist.first_name} ${therapist.last_name}` : null

  if (!booking || !booking.meet_link) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold text-foreground mb-2">Meeting not available</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This session doesn&apos;t have a meeting link yet. A link is generated automatically once payment is
            confirmed.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-border bg-card flex-shrink-0">
        <Link
          href={isAuthed ? "/patient" : "/"}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="text-center min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {therapistName ? `Session with ${therapistName}` : "Therapy Session"}
          </p>
          <div className="hidden sm:flex items-center justify-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(booking.booking_date), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {booking.start_time.slice(0, 5)}–{booking.end_time.slice(0, 5)}
            </span>
          </div>
        </div>
        <span className="font-mono text-xs text-muted-foreground hidden sm:block">{booking.booking_ref}</span>
      </header>

      <div className="flex-1 min-h-0">
        <JitsiMeeting meetLink={booking.meet_link} displayName={displayName} email={email} />
      </div>
    </main>
  )
}
