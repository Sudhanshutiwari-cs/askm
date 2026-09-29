"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import {
  FileText,
  Star,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  CheckSquare,
  ListFilter,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

type SessionNote = {
  id: string
  notes?: string | null
  prescription?: string | null
  follow_up_date?: string | null
  core_concerns?: string | null
  observations?: string | null
  tools_journals?: string | null
  homework?: string | null
  dos_donts?: string | null
  next_session_focus?: string | null
  client_visible: boolean
}

type Booking = {
  id: string
  booking_ref: string
  booking_date: string
  start_time: string
  status: string
  amount: number
  therapist_id: string
  therapists: { id: string; first_name: string; last_name: string; tier?: string } | null
  session_notes?: SessionNote[] | null
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

  // Modal states
  const [selectedReport, setSelectedReport] = useState<{ booking: Booking; note: SessionNote } | null>(null)
  const [feedbackBooking, setFeedbackBooking] = useState<Booking | null>(null)
  const [rematchBooking, setRematchBooking] = useState<Booking | null>(null)

  // Feedback form state
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [isComplaint, setIsComplaint] = useState(false)
  const [complaintDetails, setComplaintDetails] = useState("")
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)

  // Rematch form state
  const [rematchReason, setRematchReason] = useState("Need a different therapeutic modality")
  const [desiredAttributes, setDesiredAttributes] = useState("")
  const [submittingRematch, setSubmittingRematch] = useState(false)
  const [rematchSuccess, setRematchSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = "/auth/login"
        return
      }

      const { data } = await supabase
        .from("bookings")
        .select(`
          *,
          therapists(id, first_name, last_name, tier),
          session_notes(
            id,
            notes,
            prescription,
            follow_up_date,
            core_concerns,
            observations,
            tools_journals,
            homework,
            dos_donts,
            next_session_focus,
            client_visible
          )
        `)
        .eq("patient_email", user.email ?? "")
        .in("status", ["completed", "cancelled", "no_show", "confirmed"])
        .order("booking_date", { ascending: false })

      setAllBookings((data as unknown as Booking[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!feedbackBooking) return
    setSubmittingFeedback(true)

    try {
      const res = await fetch("/api/patient/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: feedbackBooking.id,
          therapistId: feedbackBooking.therapist_id,
          rating,
          reviewText,
          isComplaint,
          complaintDetails: isComplaint ? complaintDetails : null,
        }),
      })

      if (res.ok) {
        setFeedbackSuccess(true)
        setTimeout(() => {
          setFeedbackBooking(null)
          setFeedbackSuccess(false)
          setReviewText("")
          setIsComplaint(false)
          setComplaintDetails("")
        }, 1500)
      }
    } finally {
      setSubmittingFeedback(false)
    }
  }

  async function handleRematchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rematchBooking) return
    setSubmittingRematch(true)

    try {
      const res = await fetch("/api/patient/rematch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: rematchBooking.id,
          previousTherapistId: rematchBooking.therapist_id,
          reason: rematchReason,
          desiredAttributes,
          preferredTier: rematchBooking.therapists?.tier || "professional",
        }),
      })

      if (res.ok) {
        setRematchSuccess(true)
        setTimeout(() => {
          setRematchBooking(null)
          setRematchSuccess(false)
          setDesiredAttributes("")
        }, 1500)
      }
    } finally {
      setSubmittingRematch(false)
    }
  }

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
      <DashboardHeader title="Session History & Clinical Reports" subtitle="Your past appointments and structured session records" />

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
              label: "Active / Upcoming",
              value: allBookings.filter((b) => b.status === "confirmed").length,
              color: "text-blue-700 bg-blue-100",
            },
            { label: "Total Invested", value: `₹${totalSpent.toLocaleString()}`, color: "text-emerald-700 bg-emerald-100" },
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
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Practitioner</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date & Time</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Clinical Report</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allBookings.map((b) => {
                    const note = b.session_notes && b.session_notes[0]
                    const hasReport = Boolean(note && (note.client_visible !== false))

                    return (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">
                            {b.therapists ? `Dr. ${b.therapists.first_name} ${b.therapists.last_name}` : "—"}
                          </div>
                          <span className="text-[11px] font-mono text-muted-foreground">{b.booking_ref}</span>
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          <div>{format(new Date(b.booking_date), "MMM d, yyyy")}</div>
                          <div className="text-xs text-muted-foreground">{b.start_time.slice(0, 5)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              b.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : b.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {b.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {hasReport ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReport({ booking: b, note: note! })}
                              className="text-xs h-7 border-[#66948a] text-[#66948a] hover:bg-[#66948a]/10"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1" /> View Report
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pending notes</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFeedbackBooking(b)}
                            className="text-xs h-7 text-muted-foreground hover:text-foreground"
                          >
                            <Star className="w-3.5 h-3.5 mr-1 text-amber-500" /> Rate
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRematchBooking(b)}
                            className="text-xs h-7 text-[#66948a] hover:text-[#4d7068]"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-Match
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: STRUCTURED CLINICAL REPORT */}
      <Dialog open={Boolean(selectedReport)} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedReport && (
            <div>
              <DialogHeader className="border-b pb-3 mb-4">
                <DialogTitle className="text-lg font-bold text-foreground flex items-center justify-between">
                  <span>Structured Clinical Session Report</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {selectedReport.booking.booking_ref}
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Practitioner: Dr. {selectedReport.booking.therapists?.first_name} {selectedReport.booking.therapists?.last_name} &middot;{" "}
                  {format(new Date(selectedReport.booking.booking_date), "MMMM d, yyyy")}
                </p>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                {/* Core concerns */}
                {selectedReport.note.core_concerns && (
                  <div className="bg-muted/40 p-4 rounded-xl border border-border">
                    <span className="text-xs uppercase font-semibold text-muted-foreground block mb-1">
                      Problems / Core Concerns Addressed
                    </span>
                    <p className="text-foreground leading-relaxed">{selectedReport.note.core_concerns}</p>
                  </div>
                )}

                {/* Observations */}
                {selectedReport.note.observations && (
                  <div className="bg-muted/40 p-4 rounded-xl border border-border">
                    <span className="text-xs uppercase font-semibold text-muted-foreground block mb-1">
                      Therapist Clinical Observations & Considerations
                    </span>
                    <p className="text-foreground leading-relaxed">{selectedReport.note.observations}</p>
                  </div>
                )}

                {/* Homework */}
                {selectedReport.note.homework && (
                  <div className="bg-emerald-50/60 border border-emerald-200/60 p-4 rounded-xl">
                    <span className="text-xs uppercase font-semibold text-emerald-900 flex items-center gap-1.5 mb-1">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-700" /> Prescribed Homework & Exercises
                    </span>
                    <p className="text-emerald-950 leading-relaxed">{selectedReport.note.homework}</p>
                  </div>
                )}

                {/* Tools & Journals */}
                {selectedReport.note.tools_journals && (
                  <div className="bg-sky-50/60 border border-sky-200/60 p-4 rounded-xl">
                    <span className="text-xs uppercase font-semibold text-sky-900 flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-sky-700" /> Recommended Tools & Reflective Journals
                    </span>
                    <p className="text-sky-950 leading-relaxed">{selectedReport.note.tools_journals}</p>
                  </div>
                )}

                {/* Do's and Don'ts */}
                {selectedReport.note.dos_donts && (
                  <div className="bg-amber-50/60 border border-amber-200/60 p-4 rounded-xl">
                    <span className="text-xs uppercase font-semibold text-amber-900 block mb-1">
                      Do's and Don'ts For Your Well-being
                    </span>
                    <p className="text-amber-950 leading-relaxed whitespace-pre-line">{selectedReport.note.dos_donts}</p>
                  </div>
                )}

                {/* Next Meeting Reminder */}
                {selectedReport.note.follow_up_date && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#66948a]/10 border border-[#66948a]/20 text-xs">
                    <span className="font-semibold text-foreground">Recommended Next Meeting / Check-in</span>
                    <span className="font-medium text-[#66948a]">
                      {format(new Date(selectedReport.note.follow_up_date), "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 2: POST-SESSION FEEDBACK (STEP 10) */}
      <Dialog open={Boolean(feedbackBooking)} onOpenChange={(open) => !open && setFeedbackBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Session Feedback</DialogTitle>
            <p className="text-xs text-muted-foreground">
              Rate your experience with Dr. {feedbackBooking?.therapists?.first_name} {feedbackBooking?.therapists?.last_name}.
            </p>
          </DialogHeader>

          {feedbackSuccess ? (
            <div className="py-8 text-center text-emerald-600 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto" />
              <p className="font-semibold">Thank you for your valuable feedback!</p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-semibold block mb-2">How was your session?</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-border"}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-muted-foreground ml-2 font-medium">{rating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <Label htmlFor="review" className="text-xs font-semibold block mb-1">
                  Comments & Reflections (Optional)
                </Label>
                <Textarea
                  id="review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share what worked well or what could be improved..."
                  rows={3}
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-2 border border-border">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isComplaint}
                    onChange={(e) => setIsComplaint(e.target.checked)}
                    className="rounded border-border text-[#66948a] focus:ring-[#66948a]"
                  />
                  <span>Flag a quality grievance or professional concern</span>
                </label>

                {isComplaint && (
                  <Textarea
                    value={complaintDetails}
                    onChange={(e) => setComplaintDetails(e.target.value)}
                    placeholder="Please explain the issue so the clinical director can address it..."
                    rows={2}
                    required={isComplaint}
                    className="text-xs"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setFeedbackBooking(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingFeedback} className="bg-[#66948a] text-white hover:bg-[#4d7068]">
                  {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 3: 1-CLICK RE-MATCH REQUEST (STEP 11) */}
      <Dialog open={Boolean(rematchBooking)} onOpenChange={(open) => !open && setRematchBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#66948a]" />
              Request a Therapist Re-Match
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Finding the right human connection is central to healing. If you feel this therapist wasn't the right fit, we will match you with another specialist at no penalty.
            </p>
          </DialogHeader>

          {rematchSuccess ? (
            <div className="py-8 text-center text-emerald-600 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto" />
              <p className="font-semibold">Re-match request received!</p>
              <p className="text-xs text-muted-foreground">
                Our clinical director will review your preferences and provide personalized recommendations within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRematchSubmit} className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-semibold block mb-1">Reason for Re-match</Label>
                <select
                  value={rematchReason}
                  onChange={(e) => setRematchReason(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#66948a]"
                >
                  <option value="Need a different therapeutic modality">Need a different therapeutic modality (e.g. CBT, Somatic, Mindfulness)</option>
                  <option value="Communication style mismatch">Communication or conversational style didn't feel comfortable</option>
                  <option value="Looking for someone with more experience in my specific issue">Looking for deeper specialization in my issue</option>
                  <option value="Preferred gender or language change">Prefer a different gender or language</option>
                  <option value="Scheduling constraints">Scheduling availability didn't align</option>
                  <option value="Other">Other personal preference</option>
                </select>
              </div>

              <div>
                <Label htmlFor="attributes" className="text-xs font-semibold block mb-1">
                  What qualities are you looking for in your new practitioner? (Optional)
                </Label>
                <Textarea
                  id="attributes"
                  value={desiredAttributes}
                  onChange={(e) => setDesiredAttributes(e.target.value)}
                  placeholder="e.g. Someone gentle with trauma, or someone more structured with action items..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setRematchBooking(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingRematch} className="bg-[#66948a] text-white hover:bg-[#4d7068]">
                  {submittingRematch ? "Processing..." : "Confirm Re-Match Request"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
