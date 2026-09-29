"use client"

import React, { useEffect, useState } from "react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { LifeBuoy, PhoneCall, Send, CheckCircle2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

function DashboardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-border px-6 py-5">
      <h1 className="font-heading text-xl font-bold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

export default function PatientHelplinePage() {
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("general")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myTickets, setMyTickets] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || "")
        const { data: patient } = await supabase
          .from("patients")
          .select("first_name, last_name")
          .eq("user_id", user.id)
          .maybeSingle()
        if (patient) {
          setUserName(`${patient.first_name} ${patient.last_name}`.trim())
        }
      }

      const res = await fetch("/api/tickets")
      const data = await res.json()
      if (data.tickets) {
        setMyTickets(data.tickets)
      }
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userType: "client",
          userName: userName || userEmail || "Client",
          userEmail,
          subject,
          category,
          message,
          priority,
        }),
      })

      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(true)
        setSubject("")
        setMessage("")
        setMyTickets((prev) => [data.ticket, ...prev])
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch {
      setError("Failed to submit request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <DashboardHeader title="Client Support & Helpline" subtitle="Direct touchpoint for questions, scheduling assistance, and concerns" />

      <div className="p-6 max-w-4xl space-y-6">
        {/* Emergency Callout */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-950">In immediate distress or crisis?</span>
            <span>
              If you or someone you know is in acute danger, please contact national 24/7 crisis lines directly:{" "}
              <strong>Tele-MANAS (14416)</strong> or <strong>KIRAN (1800-599-0019)</strong>.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Ticket Form */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-bold text-base text-foreground flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-[#66948a]" /> Submit Support Inquiry
            </h2>

            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ticket submitted! Our care team will respond within 24 hours.</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <Label className="text-xs mb-1 block">Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question about my upcoming session or rematch"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Category</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#66948a]"
                  >
                    <option value="general">General Support</option>
                    <option value="scheduling">Scheduling / Reschedule</option>
                    <option value="technical">Technical / Video Link</option>
                    <option value="billing">Payment / Receipt</option>
                    <option value="clinical_quality">Therapist Feedback</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs mb-1 block">Priority</Label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#66948a]"
                  >
                    <option value="low">Low (General)</option>
                    <option value="medium">Medium (Regular)</option>
                    <option value="high">High (Urgent Attention)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs mb-1 block">Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry or concern with detail..."
                  rows={4}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#66948a] hover:bg-[#4d7068] text-white"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {submitting ? "Submitting..." : "Send Request"}
              </Button>
            </form>
          </div>

          {/* Ticket History */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-bold text-base text-foreground">Your Recent Requests</h2>

            {myTickets.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">No active support inquiries.</p>
            ) : (
              <div className="space-y-3">
                {myTickets.map((t) => (
                  <div key={t.id} className="p-3 bg-muted/40 rounded-xl border border-border text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{t.subject}</span>
                      <Badge
                        className={`text-[10px] px-1.5 py-0 ${
                          t.status === "open"
                            ? "bg-amber-100 text-amber-800"
                            : t.status === "resolved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {t.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{t.message}</p>
                    <div className="text-[10px] text-muted-foreground pt-1 flex justify-between font-mono">
                      <span>Ref: {t.ticket_ref}</span>
                      <span>{format(new Date(t.created_at), "MMM d, yyyy")}</span>
                    </div>
                    {t.admin_notes && (
                      <div className="mt-2 p-2 bg-white rounded border border-border text-slate-800">
                        <span className="font-bold block text-[10px] uppercase text-[#66948a]">Team Response:</span>
                        {t.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
