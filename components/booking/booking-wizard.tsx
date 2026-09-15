"use client"

import { useCallback, useEffect, useState } from "react"
import { format, addDays, startOfToday, isBefore } from "date-fns"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export type Therapist = {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
  bio: string | null
  specializations: string[] | null
  experience_years: number
  consultation_fee: number
  slot_duration_minutes: number
}

type TherapistAvailability = {
  id: string
  therapist_id: string
  day_of_week: number
  start_time: string
  end_time: string
  break_start: string | null
  break_end: string | null
  is_active: boolean
}

type BlockedSlot = {
  id: string
  therapist_id: string
  blocked_date: string
  is_full_day: boolean
}

type BookedSlotInfo = { booking_date: string; start_time: string }

export interface BookingFormData {
  therapistId: string
  date: string
  startTime: string
  endTime: string
  patientName: string
  patientEmail: string
  patientPhone: string
  notes: string
}

type PatientCredentials = { username: string; password: string; email: string } | null

interface Props {
  therapists: Therapist[]
  preselectedTherapistId?: string
}

const STEPS = [
  { id: 1, label: "Select Therapist" },
  { id: 2, label: "Choose Date & Time" },
  { id: 3, label: "Your Details" },
  { id: 4, label: "Confirmation" },
]

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface Slot {
  time: string
  booked: boolean
}

function generateSlots(
  availability: TherapistAvailability[],
  existingBookings: BookedSlotInfo[],
  blockedSlots: BlockedSlot[],
  date: Date,
  durationMins: number,
): Slot[] {
  const dow = date.getDay()
  const avail = availability.find((a) => a.day_of_week === dow && a.is_active)
  if (!avail) return []

  const dateStr = format(date, "yyyy-MM-dd")
  const isBlockedFull = blockedSlots.some((b) => b.blocked_date === dateStr && b.is_full_day)
  if (isBlockedFull) return []

  const bookedTimes = existingBookings.filter((b) => b.booking_date === dateStr).map((b) => b.start_time.slice(0, 5))

  const toMins = (t: string) => {
    const [h, m] = t.split(":").map(Number)
    return h * 60 + m
  }
  const fromMins = (m: number) => {
    const h = Math.floor(m / 60)
      .toString()
      .padStart(2, "0")
    const min = (m % 60).toString().padStart(2, "0")
    return `${h}:${min}`
  }

  const start = toMins(avail.start_time)
  const end = toMins(avail.end_time)
  const breakStart = avail.break_start ? toMins(avail.break_start) : null
  const breakEnd = avail.break_end ? toMins(avail.break_end) : null

  const slots: Slot[] = []
  for (let t = start; t + durationMins <= end; t += durationMins) {
    if (breakStart !== null && breakEnd !== null && t >= breakStart && t < breakEnd) continue
    const slotStr = fromMins(t)
    slots.push({ time: slotStr, booked: bookedTimes.includes(slotStr) })
  }
  return slots
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function StepTherapist({
  therapists,
  selectedId,
  onSelect,
}: {
  therapists: Therapist[]
  selectedId?: string
  onSelect: (id: string) => void
}) {
  if (therapists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No therapists available at this time. Please check back soon.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Choose a Therapist</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Select the therapist you&apos;d like to book a session with.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {therapists.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={cn(
              "flex gap-4 p-4 rounded-xl border text-left transition-all",
              selectedId === t.id
                ? "border-[#66948a] bg-[#66948a]/5 ring-1 ring-[#66948a]"
                : "border-border hover:border-[#66948a]/40 hover:bg-accent/50",
            )}
          >
            <div className="w-14 h-14 rounded-full bg-[#66948a]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {t.photo_url ? (
                <img
                  src={t.photo_url || "/placeholder.svg"}
                  alt={t.first_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-[#66948a]">
                  {t.first_name[0]}
                  {t.last_name[0]}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground text-sm">
                Dr. {t.first_name} {t.last_name}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {t.experience_years} yrs experience
                {t.consultation_fee > 0 && ` · ₹${t.consultation_fee}`}
              </div>
              {t.specializations && (
                <div className="flex flex-wrap gap-1">
                  {t.specializations.slice(0, 2).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs py-0">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {selectedId === t.id && (
              <div className="w-5 h-5 rounded-full bg-[#66948a] flex items-center justify-center flex-shrink-0 self-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepDateTime({
  therapist,
  selectedDate,
  selectedTime,
  onSelect,
  onBack,
}: {
  therapist: Therapist
  selectedDate?: string
  selectedTime?: string
  onSelect: (date: string, startTime: string, endTime: string) => void
  onBack: () => void
}) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [chosenDate, setChosenDate] = useState<Date | null>(selectedDate ? new Date(selectedDate) : null)
  const [chosenTime, setChosenTime] = useState<string | null>(selectedTime ?? null)
  const [availability, setAvailability] = useState<TherapistAvailability[]>([])
  const [bookings, setBookings] = useState<BookedSlotInfo[]>([])
  const [blocked, setBlocked] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [avail, bkRes, bl] = await Promise.all([
      supabase.from("therapist_availability").select("*").eq("therapist_id", therapist.id).eq("is_active", true),
      fetch(`/api/book/booked-slots?therapistId=${therapist.id}`).then((r) => r.json()),
      supabase.from("blocked_slots").select("*").eq("therapist_id", therapist.id),
    ])
    setAvailability(avail.data ?? [])
    setBookings(bkRes.slots ?? [])
    setBlocked(bl.data ?? [])
    setLoading(false)
  }, [therapist.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const today = startOfToday()
  const weekStart = addDays(today, weekOffset * 7)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const slots = chosenDate
    ? generateSlots(availability, bookings, blocked, chosenDate, therapist.slot_duration_minutes || 60)
    : []

  const handleContinue = () => {
    if (!chosenDate || !chosenTime) return
    const [h, m] = chosenTime.split(":").map(Number)
    const endMins = h * 60 + m + (therapist.slot_duration_minutes || 60)
    const endTime = `${Math.floor(endMins / 60)
      .toString()
      .padStart(2, "0")}:${(endMins % 60).toString().padStart(2, "0")}`
    onSelect(format(chosenDate, "yyyy-MM-dd"), `${chosenTime}:00`, `${endTime}:00`)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Choose Date & Time</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Booking with Dr. {therapist.first_name} {therapist.last_name} &middot;{" "}
        {therapist.slot_duration_minutes || 60} min session
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">{format(weekStart, "MMMM yyyy")}</span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setWeekOffset((w) => w - 1)}
                disabled={weekOffset === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setWeekOffset((w) => w + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-6">
            {weekDays.map((day) => {
              const isPast = isBefore(day, today)
              const dow = day.getDay()
              const hasAvail = availability.some((a) => a.day_of_week === dow && a.is_active)
              const isSelected = chosenDate && format(day, "yyyy-MM-dd") === format(chosenDate, "yyyy-MM-dd")
              return (
                <button
                  key={day.toISOString()}
                  disabled={isPast || !hasAvail}
                  onClick={() => {
                    setChosenDate(day)
                    setChosenTime(null)
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg py-2.5 text-sm transition-all",
                    isSelected
                      ? "bg-[#66948a] text-white"
                      : isPast || !hasAvail
                        ? "text-muted-foreground/40 cursor-not-allowed"
                        : "hover:bg-accent text-foreground border border-border",
                  )}
                >
                  <span className="text-xs">{DAY_LABELS[dow]}</span>
                  <span className="font-semibold">{format(day, "d")}</span>
                </button>
              )
            })}
          </div>

          {chosenDate && (
            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Available slots for {format(chosenDate, "EEEE, MMMM d")}
              </p>
              {slots.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No available slots for this day. Please choose another date.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={slot.booked}
                        aria-label={slot.booked ? `${slot.time} — already booked` : `Select ${slot.time}`}
                        onClick={() => !slot.booked && setChosenTime(slot.time)}
                        className={cn(
                          "rounded-lg border px-2 py-2 text-sm font-medium transition-all",
                          slot.booked
                            ? "border-destructive/30 bg-destructive/10 text-destructive line-through cursor-not-allowed"
                            : chosenTime === slot.time
                              ? "bg-[#66948a] text-white border-[#66948a]"
                              : "border-border hover:border-[#66948a]/50 hover:bg-accent text-foreground",
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded border border-border bg-background" /> Available
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded border border-destructive/30 bg-destructive/10" />{" "}
                      Booked
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          className="bg-[#66948a] hover:bg-[#4d7068] text-white"
          disabled={!chosenDate || !chosenTime}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

function StepDetails({
  formData,
  therapist,
  onSubmit,
  onBack,
}: {
  formData: Partial<BookingFormData>
  therapist?: Therapist
  onSubmit: (details: Partial<BookingFormData>, bookingRef: string, credentials: PatientCredentials) => void
  onBack: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const details = {
      patientName: fd.get("patient_name") as string,
      patientEmail: fd.get("patient_email") as string,
      patientPhone: fd.get("patient_phone") as string,
      notes: fd.get("notes") as string,
    }
    const amount = therapist?.consultation_fee ?? 0
    const bookingPayload = {
      therapistId: formData.therapistId,
      patientName: details.patientName,
      patientEmail: details.patientEmail,
      patientPhone: details.patientPhone || null,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: details.notes || null,
    }

    const finalizeBooking = async (payment?: {
      orderId: string
      paymentId: string
      signature: string
    }) => {
      const result = await fetch("/api/book/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bookingPayload, payment }),
      }).then((r) => r.json())

      if (result.error || !result.bookingRef || !result.bookingId) {
        throw new Error(result.error ?? "Failed to create booking. Please contact support.")
      }

      onSubmit(details, result.bookingRef, result.credentials)
    }

    if (amount <= 0) {
      try {
        await finalizeBooking()
      } catch (bookingError) {
        setError(bookingError instanceof Error ? bookingError.message : "Failed to create booking.")
      } finally {
        setLoading(false)
      }
      return
    }

    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      setError("Unable to load the payment gateway. No booking was created.")
      setLoading(false)
      return
    }

    const orderRes = await fetch("/api/book/razorpay-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ therapistId: formData.therapistId }),
    }).then((r) => r.json())

    const { orderId, amount: orderAmount, currency, error: orderError } = orderRes
    if (orderError || !orderId) {
      setError(orderError ?? "Could not start payment. No booking was created.")
      setLoading(false)
      return
    }

    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderAmount,
      currency,
      name: "Astsankhlam",
      description: `Consultation with Dr. ${therapist?.first_name} ${therapist?.last_name}`,
      order_id: orderId,
      prefill: {
        name: details.patientName,
        email: details.patientEmail,
        contact: details.patientPhone || "",
      },
      theme: { color: "#66948a" },
      handler: async (response: {
        razorpay_payment_id: string
        razorpay_order_id: string
        razorpay_signature: string
      }) => {
        try {
          await finalizeBooking({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          })
        } catch (bookingError) {
          setError(
            bookingError instanceof Error
              ? bookingError.message
              : "Payment succeeded, but the booking could not be created. Please contact support.",
          )
        } finally {
          setLoading(false)
        }
      },
      modal: {
        ondismiss: () => {
          setError("Payment was cancelled. No booking was created.")
          setLoading(false)
        },
      },
    })

    rzp.open()
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Your Details</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Please provide your contact information to complete the booking.
      </p>

      {therapist && formData.date && formData.startTime && (
        <div className="bg-[#66948a]/5 border border-[#66948a]/20 rounded-xl p-4 mb-6 text-sm">
          <div className="font-medium text-foreground mb-1">Appointment Summary</div>
          <div className="text-muted-foreground">
            Dr. {therapist.first_name} {therapist.last_name} &middot;{" "}
            {format(new Date(formData.date), "EEEE, MMMM d, yyyy")} &middot; {formData.startTime?.slice(0, 5)}
            {therapist.consultation_fee > 0 && ` · ₹${therapist.consultation_fee}`}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="patient_name">Full name</Label>
          <Input
            id="patient_name"
            name="patient_name"
            placeholder="Your full name"
            required
            defaultValue={formData.patientName}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="patient_email">Email address</Label>
            <Input
              id="patient_email"
              name="patient_email"
              type="email"
              placeholder="you@example.com"
              required
              defaultValue={formData.patientEmail}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="patient_phone">Phone number</Label>
            <Input
              id="patient_phone"
              name="patient_phone"
              type="tel"
              placeholder="+91 98765 43210"
              defaultValue={formData.patientPhone}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Any specific concerns or notes (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Briefly describe what you'd like to discuss..."
            defaultValue={formData.notes}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="bg-[#66948a] hover:bg-[#4d7068] text-white" disabled={loading}>
            {loading
              ? "Processing..."
              : (therapist?.consultation_fee ?? 0) > 0
                ? `Pay ₹${therapist?.consultation_fee} & Confirm`
                : "Confirm Booking"}
          </Button>
        </div>
      </form>
    </div>
  )
}

function StepConfirmation({
  formData,
  therapist,
  bookingRef,
  credentials,
}: {
  formData: BookingFormData
  therapist?: Therapist
  bookingRef: string | null
  credentials: PatientCredentials
}) {
  const [copied, setCopied] = useState<"username" | "password" | null>(null)

  function copyToClipboard(text: string, field: "username" | "password") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
      <p className="text-muted-foreground mb-6">Your appointment has been requested. We will confirm it shortly.</p>

      {bookingRef && (
        <div className="inline-flex items-center gap-2 bg-muted rounded-lg px-4 py-2 text-sm font-mono font-medium text-foreground mb-6">
          Booking Ref: <span className="text-[#66948a]">{bookingRef}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-6 max-w-2xl mx-auto">
        <div className="bg-muted/50 rounded-xl p-5 text-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Appointment Details
          </p>
          <div className="space-y-2.5">
            {therapist && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Therapist</span>
                <span className="font-medium text-foreground">
                  Dr. {therapist.first_name} {therapist.last_name}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium text-foreground">{format(new Date(formData.date), "EEE, MMM d, yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium text-foreground">{formData.startTime?.slice(0, 5)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Patient</span>
              <span className="font-medium text-foreground">{formData.patientName}</span>
            </div>
            {therapist && therapist.consultation_fee > 0 && (
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-semibold text-foreground">&#8377;{therapist.consultation_fee}</span>
              </div>
            )}
          </div>
        </div>

        {credentials ? (
          <div className="bg-[#66948a]/5 border border-[#66948a]/20 rounded-xl p-5 text-sm">
            <p className="text-xs font-semibold text-[#66948a] uppercase tracking-wide mb-1">Your Patient Account</p>
            <p className="text-xs text-muted-foreground mb-4">
              Use these credentials to log in and track your bookings.
            </p>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Username</span>
                <div className="flex items-center justify-between bg-white border border-border rounded-lg px-3 py-2">
                  <span className="font-mono font-semibold text-foreground tracking-wider">
                    {credentials.username}
                  </span>
                  <button
                    onClick={() => copyToClipboard(credentials.username, "username")}
                    className="text-xs text-[#66948a] hover:text-[#4d7068] font-medium ml-2 transition-colors"
                  >
                    {copied === "username" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Password</span>
                <div className="flex items-center justify-between bg-white border border-border rounded-lg px-3 py-2">
                  <span className="font-mono font-semibold text-foreground tracking-wider">
                    {credentials.password}
                  </span>
                  <button
                    onClick={() => copyToClipboard(credentials.password, "password")}
                    className="text-xs text-[#66948a] hover:text-[#4d7068] font-medium ml-2 transition-colors"
                  >
                    {copied === "password" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Save these credentials. You can change your password after logging in.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-xl p-5 text-sm flex flex-col justify-center items-center text-center gap-2">
            <svg className="w-8 h-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p className="text-muted-foreground text-xs">
              A patient account already exists for this email. Use your existing credentials to log in.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-lg bg-[#66948a] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#4d7068] transition-colors"
        >
          Sign In to Track Booking
        </Link>
      </div>
    </div>
  )
}

export function BookingWizard({ therapists, preselectedTherapistId }: Props) {
  const [step, setStep] = useState(preselectedTherapistId ? 2 : 1)
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    therapistId: preselectedTherapistId,
  })
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<PatientCredentials>(null)

  const updateForm = (data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const selectedTherapist = therapists.find((t) => t.id === formData.therapistId)

  return (
    <div>
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 right-0 top-4 h-px bg-border -z-0" />
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2 relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step > s.id
                  ? "bg-[#66948a] text-white"
                  : step === s.id
                    ? "bg-[#66948a] text-white ring-4 ring-[#66948a]/20"
                    : "bg-background border-2 border-border text-muted-foreground"
              }`}
            >
              {step > s.id ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s.id
              )}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${step === s.id ? "text-[#66948a]" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
        {step === 1 && (
          <StepTherapist
            therapists={therapists}
            selectedId={formData.therapistId}
            onSelect={(id) => {
              updateForm({ therapistId: id })
              setStep(2)
            }}
          />
        )}
        {step === 2 && selectedTherapist && (
          <StepDateTime
            therapist={selectedTherapist}
            selectedDate={formData.date}
            selectedTime={formData.startTime}
            onSelect={(date, startTime, endTime) => {
              updateForm({ date, startTime, endTime })
              setStep(3)
            }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepDetails
            formData={formData}
            therapist={selectedTherapist}
            onSubmit={(details, ref, creds) => {
              updateForm(details)
              setBookingRef(ref)
              setCredentials(creds)
              setStep(4)
            }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepConfirmation
            formData={formData as BookingFormData}
            therapist={selectedTherapist}
            bookingRef={bookingRef}
            credentials={credentials}
          />
        )}
      </div>
    </div>
  )
}
