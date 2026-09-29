"use client"

import React, { useCallback, useEffect, useState } from "react"
import { format, addDays, startOfToday, isBefore } from "date-fns"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Award,
  Clock,
  Globe,
  UserCheck,
  ArrowRight,
  AlertTriangle,
} from "lucide-react"
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
  photo_url?: string | null
  bio?: string | null
  qualifications?: string | null
  specializations: string[] | null
  experience_years: number
  consultation_fee: number
  slot_duration_minutes?: number
  tier?: "professional" | "intern"
  verified_domains?: string[] | null
  session_count?: number
  registration_no?: string | null
  commission_rate?: number
  astsankhlam_id?: string | null
  is_verified?: boolean
  languages?: string[] | null
  gender?: string | null
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
  intakeId?: string | null
  intakeData?: {
    supportTier: "professional" | "intern"
    primaryConcerns: string[]
    distressDuration: string
    priorTherapyExperience: string
    preferredLanguage: string
    preferredGender: string
  }
}

type PatientCredentials = { username: string; password: string; email: string } | null

interface Props {
  therapists: Therapist[]
  preselectedTherapistId?: string
}

const STEPS = [
  { id: 1, label: "Safety & Care" },
  { id: 2, label: "Support Tier" },
  { id: 3, label: "Needs Intake" },
  { id: 4, label: "Match & Choose" },
  { id: 5, label: "Select Slot" },
  { id: 6, label: "Confirm Booking" },
]

const CONCERNS_LIST = [
  "Anxiety & Panic",
  "Depression & Low Mood",
  "Trauma & PTSD",
  "Relationship & Couples",
  "Stress & Burnout",
  "Grief & Loss",
  "Self-Growth & Mindfulness",
  "Family & Parenting",
  "Anger Management",
  "Sleep & Insomnia",
]

const LANGUAGES_LIST = ["English", "Hindi", "Bengali", "Marathi", "Tamil", "Telugu", "Gujarati"]

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
  durationMins: number = 50,
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

// ==========================================
// STEP 1: SAFETY & EMERGENCY SCREENING
// ==========================================
function StepSafetyScreening({
  onSafe,
  onFlagCrisis,
}: {
  onSafe: () => void
  onFlagCrisis: () => void
}) {
  const [inCrisis, setInCrisis] = useState<boolean | null>(null)
  const [medicalCrisis, setMedicalCrisis] = useState<boolean | null>(null)
  const [showHelplines, setShowHelplines] = useState(false)

  const handleContinue = () => {
    if (inCrisis === true || medicalCrisis === true) {
      setShowHelplines(true)
      onFlagCrisis()
    } else if (inCrisis === false && medicalCrisis === false) {
      onSafe()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Safety & Care Assessment</h2>
          <p className="text-sm text-muted-foreground">
            We ensure you receive the safest and most appropriate care tailored to your current state.
          </p>
        </div>
      </div>

      <div className="space-y-5 bg-card/50 rounded-xl p-5 border border-border">
        <div>
          <Label className="text-sm font-semibold text-foreground">
            1. Are you currently experiencing thoughts of self-harm, suicide, or severe despair?
          </Label>
          <div className="grid grid-cols-2 gap-3 mt-2.5">
            <button
              type="button"
              onClick={() => setInCrisis(false)}
              className={cn(
                "p-3.5 rounded-lg border text-sm font-medium transition-all text-center",
                inCrisis === false
                  ? "border-[#66948a] bg-[#66948a]/10 text-foreground ring-1 ring-[#66948a]"
                  : "border-border hover:bg-muted text-muted-foreground",
              )}
            >
              No, I am safe
            </button>
            <button
              type="button"
              onClick={() => setInCrisis(true)}
              className={cn(
                "p-3.5 rounded-lg border text-sm font-medium transition-all text-center",
                inCrisis === true
                  ? "border-rose-500 bg-rose-50 text-rose-800 ring-1 ring-rose-500"
                  : "border-border hover:bg-muted text-muted-foreground",
              )}
            >
              Yes, I am in distress
            </button>
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-foreground">
            2. Are you experiencing an acute medical emergency or active psychiatric psychosis?
          </Label>
          <div className="grid grid-cols-2 gap-3 mt-2.5">
            <button
              type="button"
              onClick={() => setMedicalCrisis(false)}
              className={cn(
                "p-3.5 rounded-lg border text-sm font-medium transition-all text-center",
                medicalCrisis === false
                  ? "border-[#66948a] bg-[#66948a]/10 text-foreground ring-1 ring-[#66948a]"
                  : "border-border hover:bg-muted text-muted-foreground",
              )}
            >
              No, not in acute medical crisis
            </button>
            <button
              type="button"
              onClick={() => setMedicalCrisis(true)}
              className={cn(
                "p-3.5 rounded-lg border text-sm font-medium transition-all text-center",
                medicalCrisis === true
                  ? "border-rose-500 bg-rose-50 text-rose-800 ring-1 ring-rose-500"
                  : "border-border hover:bg-muted text-muted-foreground",
              )}
            >
              Yes, urgent emergency
            </button>
          </div>
        </div>
      </div>

      {showHelplines && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base text-rose-900">Immediate Crisis Support Resources</h3>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                Online scheduled appointments are designed for non-emergency psychological care. If you are experiencing
                acute thoughts of self-harm or distress, compassionate human support is available 24/7 free of cost:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-white/90 p-3.5 rounded-xl border border-rose-100 flex items-center justify-between">
              <div>
                <span className="font-semibold block text-slate-900">Tele-MANAS (Govt. of India)</span>
                <span className="text-xs text-slate-700">National 24/7 Toll-Free Mental Health Helpline</span>
              </div>
              <a
                href="tel:14416"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 text-white font-mono text-xs font-semibold hover:bg-rose-800"
              >
                <PhoneCall className="w-3.5 h-3.5" /> 14416
              </a>
            </div>

            <div className="bg-white/90 p-3.5 rounded-xl border border-rose-100 flex items-center justify-between">
              <div>
                <span className="font-semibold block text-slate-900">KIRAN Helpline</span>
                <span className="text-xs text-slate-700">24x7 Mental Health Helpline</span>
              </div>
              <a
                href="tel:18005990019"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 text-white font-mono text-xs font-semibold hover:bg-rose-800"
              >
                <PhoneCall className="w-3.5 h-3.5" /> 1800-599-0019
              </a>
            </div>

            <div className="bg-white/90 p-3.5 rounded-xl border border-rose-100 flex items-center justify-between">
              <div>
                <span className="font-semibold block text-slate-900">Vandrevala Foundation</span>
                <span className="text-xs text-slate-700">Free Crisis Counseling</span>
              </div>
              <a
                href="tel:9999666555"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 text-white font-mono text-xs font-semibold hover:bg-rose-800"
              >
                <PhoneCall className="w-3.5 h-3.5" /> 9999 666 555
              </a>
            </div>

            <div className="bg-white/90 p-3.5 rounded-xl border border-rose-100 flex items-center justify-between">
              <div>
                <span className="font-semibold block text-slate-900">National Emergency Services</span>
                <span className="text-xs text-slate-700">Ambulance / Immediate Police</span>
              </div>
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 text-white font-mono text-xs font-semibold hover:bg-rose-800"
              >
                <PhoneCall className="w-3.5 h-3.5" /> 112
              </a>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-rose-800">
            <span>If you are currently accompanied and safe to proceed with therapy:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSafe}
              className="border-rose-300 text-rose-900 hover:bg-rose-100"
            >
              I am safe to proceed
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-3">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={inCrisis === null || medicalCrisis === null}
          className="bg-[#66948a] hover:bg-[#4d7068] text-white px-8"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ==========================================
// STEP 2: SUPPORT LEVEL & PRICING TIER
// ==========================================
function StepTierSelection({
  selectedTier,
  onSelectTier,
  onBack,
}: {
  selectedTier: "professional" | "intern"
  onSelectTier: (tier: "professional" | "intern") => void
  onBack: () => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Choose Your Support Level & Pricing Tier</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select the modality that aligns with your therapeutic goals, depth of need, and budget.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tier 1: Supervised Intern */}
        <div
          onClick={() => onSelectTier("intern")}
          className={cn(
            "p-6 rounded-2xl border text-left cursor-pointer transition-all relative flex flex-col justify-between",
            selectedTier === "intern"
              ? "border-[#66948a] bg-[#66948a]/5 ring-2 ring-[#66948a]"
              : "border-border hover:border-[#66948a]/40 hover:bg-accent/40",
          )}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs px-2.5 py-0.5 border-0">
                Supervised & Affordable
              </Badge>
              <span className="text-sm font-semibold text-[#66948a]">₹800 – ₹1,200</span>
            </div>
            <h3 className="text-lg font-bold text-foreground">Supervised Intern / Counselor</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Trained counseling trainees & Master's in Psychology candidates practicing under strict supervision by
              senior licensed clinical psychologists.
            </p>

            <ul className="space-y-2 mt-4 text-xs text-muted-foreground border-t pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#66948a] shrink-0" />
                Stress management & daily work/study pressure
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#66948a] shrink-0" />
                Emotional venting & guided reflections
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#66948a] shrink-0" />
                Supervised clinical review on case protocols
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs font-semibold">
            <span className={selectedTier === "intern" ? "text-[#66948a]" : "text-muted-foreground"}>
              {selectedTier === "intern" ? "Selected Tier" : "Select Intern Tier"}
            </span>
            <div
              className={cn(
                "w-5 h-5 rounded-full border flex items-center justify-center",
                selectedTier === "intern" ? "bg-[#66948a] border-[#66948a] text-white" : "border-border",
              )}
            >
              {selectedTier === "intern" && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </div>
        </div>

        {/* Tier 2: Professional Licensed Psychologist */}
        <div
          onClick={() => onSelectTier("professional")}
          className={cn(
            "p-6 rounded-2xl border text-left cursor-pointer transition-all relative flex flex-col justify-between",
            selectedTier === "professional"
              ? "border-[#66948a] bg-[#66948a]/5 ring-2 ring-[#66948a]"
              : "border-border hover:border-[#66948a]/40 hover:bg-accent/40",
          )}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-[#66948a]/15 text-[#426b62] hover:bg-[#66948a]/20 text-xs px-2.5 py-0.5 border-0">
                Recommended · Full Clinical
              </Badge>
              <span className="text-sm font-semibold text-[#66948a]">₹2,000 – ₹4,500</span>
            </div>
            <h3 className="text-lg font-bold text-foreground">Licensed Clinical Psychologist</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Certified, RCI-registered or senior M.Phil/Ph.D. practitioners with deep clinical diagnostic experience
              and evidence-based modalities.
            </p>

            <ul className="space-y-2 mt-4 text-xs text-muted-foreground border-t pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#66948a] shrink-0" />
                Complex trauma, PTSD & deep-rooted grief
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#66948a] shrink-0" />
                Clinical anxiety, depression, OCD & personality concerns
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#66948a] shrink-0" />
                Couples, relationship & specialized family therapy
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs font-semibold">
            <span className={selectedTier === "professional" ? "text-[#66948a]" : "text-muted-foreground"}>
              {selectedTier === "professional" ? "Selected Tier" : "Select Professional Tier"}
            </span>
            <div
              className={cn(
                "w-5 h-5 rounded-full border flex items-center justify-center",
                selectedTier === "professional" ? "bg-[#66948a] border-[#66948a] text-white" : "border-border",
              )}
            >
              {selectedTier === "professional" && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button className="bg-[#66948a] hover:bg-[#4d7068] text-white px-8" onClick={() => onSelectTier(selectedTier)}>
          Continue to Intake
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ==========================================
// STEP 3: CONFIDENTIAL INTAKE & PREFERENCES
// ==========================================
function StepConfidentialIntake({
  initialData,
  onSubmitIntake,
  onBack,
}: {
  initialData: {
    primaryConcerns: string[]
    distressDuration: string
    priorTherapyExperience: string
    preferredLanguage: string
    preferredGender: string
  }
  onSubmitIntake: (data: typeof initialData) => void
  onBack: () => void
}) {
  const [concerns, setConcerns] = useState<string[]>(initialData.primaryConcerns || [])
  const [duration, setDuration] = useState(initialData.distressDuration || "1-6 months")
  const [priorExperience, setPriorExperience] = useState(initialData.priorTherapyExperience || "First time")
  const [language, setLanguage] = useState(initialData.preferredLanguage || "English")
  const [gender, setGender] = useState(initialData.preferredGender || "any")

  const toggleConcern = (concern: string) => {
    setConcerns((prev) => (prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]))
  }

  const handleNext = () => {
    onSubmitIntake({
      primaryConcerns: concerns,
      distressDuration: duration,
      priorTherapyExperience: priorExperience,
      preferredLanguage: language,
      preferredGender: gender,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Confidential Needs Assessment</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Help us match you with the right specialist based on your specific life concerns and preferences.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <Label className="text-sm font-semibold text-foreground block mb-2">
            What concerns would you like support with? (Select all that apply)
          </Label>
          <div className="flex flex-wrap gap-2">
            {CONCERNS_LIST.map((c) => {
              const active = concerns.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleConcern(c)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    active
                      ? "bg-[#66948a] border-[#66948a] text-white shadow-xs"
                      : "bg-background border-border text-muted-foreground hover:border-[#66948a]/50 hover:text-foreground",
                  )}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold text-foreground block mb-1.5">
              How long have you been experiencing this?
            </Label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#66948a]"
            >
              <option value="Less than 1 month">Less than 1 month</option>
              <option value="1 to 6 months">1 to 6 months</option>
              <option value="6 months to 1 year">6 months to 1 year</option>
              <option value="More than 1 year / Ongoing">More than 1 year / Ongoing</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-semibold text-foreground block mb-1.5">
              Have you been to therapy before?
            </Label>
            <select
              value={priorExperience}
              onChange={(e) => setPriorExperience(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#66948a]"
            >
              <option value="First time">This is my first time</option>
              <option value="A few sessions previously">I've had a few sessions before</option>
              <option value="Experienced with therapy">I have long-term therapy experience</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold text-foreground block mb-1.5">Preferred Language for Sessions</Label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#66948a]"
            >
              {LANGUAGES_LIST.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs font-semibold text-foreground block mb-1.5">Preferred Practitioner Gender</Label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#66948a]"
            >
              <option value="any">No preference</option>
              <option value="female">Female Practitioner</option>
              <option value="male">Male Practitioner</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button className="bg-[#66948a] hover:bg-[#4d7068] text-white px-8" onClick={handleNext}>
          View Matched Practitioners
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ==========================================
// STEP 4: SMART MATCH & RECOMMENDATION GRID
// ==========================================
function StepSmartMatch({
  therapists,
  selectedTier,
  intakeData,
  selectedTherapistId,
  onSelect,
  onBack,
}: {
  therapists: Therapist[]
  selectedTier: "professional" | "intern"
  intakeData: {
    primaryConcerns: string[]
    preferredLanguage: string
    preferredGender: string
  }
  selectedTherapistId?: string
  onSelect: (id: string) => void
  onBack: () => void
}) {
  // Filter by tier
  let filtered = therapists.filter((t) => {
    const tTier = t.tier || "professional"
    return tTier === selectedTier
  })

  // If no practitioners in that tier, fallback gracefully so user isn't blocked
  if (filtered.length === 0) {
    filtered = therapists
  }

  // Score matching
  const scored = filtered.map((t) => {
    let score = 10
    if (t.languages && t.languages.some((l) => l.toLowerCase() === intakeData.preferredLanguage.toLowerCase())) {
      score += 15
    }
    if (intakeData.preferredGender !== "any" && t.gender?.toLowerCase() === intakeData.preferredGender.toLowerCase()) {
      score += 10
    }
    const specs = (t.specializations || []).map((s) => s.toLowerCase())
    intakeData.primaryConcerns.forEach((c) => {
      if (specs.some((s) => s.includes(c.toLowerCase()) || c.toLowerCase().includes(s))) {
        score += 12
      }
    })
    return { ...t, score }
  })

  scored.sort((a, b) => b.score - a.score || b.experience_years - a.experience_years)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-foreground">Matched Practitioners</h2>
          <p className="text-sm text-muted-foreground">
            Ranked based on your concerns ({intakeData.primaryConcerns.length || "general"}), language (
            {intakeData.preferredLanguage}), and {selectedTier === "intern" ? "Supervised Intern" : "Licensed Psychologist"}{" "}
            tier.
          </p>
        </div>
        <Badge variant="outline" className="text-xs text-[#66948a] border-[#66948a]/30 self-start sm:self-center">
          <Sparkles className="w-3 h-3 mr-1 text-[#66948a]" /> Smart Recommendations
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scored.map((t) => {
          const isSelected = selectedTherapistId === t.id
          const astId = t.astsankhlam_id || `AST-${t.id.slice(0, 5).toUpperCase()}`

          return (
            <div
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={cn(
                "p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between",
                isSelected
                  ? "border-[#66948a] bg-[#66948a]/5 ring-2 ring-[#66948a]"
                  : "border-border hover:border-[#66948a]/40 hover:bg-accent/40",
              )}
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-14 h-14 rounded-full bg-[#66948a]/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-foreground text-sm">
                        {t.tier === "intern" ? "" : "Dr. "}
                        {t.first_name} {t.last_name}
                      </span>
                      {t.is_verified !== false && (
                        <span title="Verified Practitioner">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 inline-block" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 font-mono">
                      <span>ID: {astId}</span>
                      <span>·</span>
                      <span className="capitalize">{t.tier || "Professional"}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-[#66948a]" />
                        {t.experience_years} yrs exp
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#66948a]" />
                        {t.session_count || 12}+ sessions
                      </span>
                    </div>
                  </div>
                </div>

                {t.bio && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.bio}</p>}

                {t.specializations && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {t.specializations.slice(0, 3).map((s) => (
                      <Badge key={s} variant="secondary" className="text-[11px] py-0 px-2 font-normal">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Session Fee</span>
                  <span className="text-sm font-bold text-foreground">
                    {t.consultation_fee > 0 ? `₹${t.consultation_fee}` : "Complimentary"}
                  </span>
                </div>

                <Button
                  size="sm"
                  className={cn(
                    "h-8 text-xs font-semibold px-4",
                    isSelected
                      ? "bg-[#66948a] text-white hover:bg-[#4d7068]"
                      : "bg-secondary text-foreground hover:bg-[#66948a] hover:text-white",
                  )}
                >
                  {isSelected ? "Selected" : "Select Slot"}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          className="bg-[#66948a] hover:bg-[#4d7068] text-white px-8"
          disabled={!selectedTherapistId}
          onClick={() => {
            if (selectedTherapistId) onSelect(selectedTherapistId)
          }}
        >
          Proceed to Time Slots
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ==========================================
// STEP 5: DATE & TIME SELECTION
// ==========================================
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
      fetch(`/api/book/booked-slots?therapistId=${therapist.id}`).then((r) => r.json()).catch(() => ({ slots: [] })),
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
    ? generateSlots(availability, bookings, blocked, chosenDate, therapist.slot_duration_minutes ?? 50)
    : []

  const handleContinue = () => {
    if (!chosenDate || !chosenTime) return
    const dateStr = format(chosenDate, "yyyy-MM-dd")
    const [h, m] = chosenTime.split(":").map(Number)
    const dur = therapist.slot_duration_minutes ?? 50
    const endM = h * 60 + m + dur
    const endH = Math.floor(endM / 60)
      .toString()
      .padStart(2, "0")
    const endMin = (endM % 60).toString().padStart(2, "0")
    onSelect(dateStr, chosenTime, `${endH}:${endMin}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Select Date & Time</h2>
          <p className="text-muted-foreground text-sm">
            Booking session with {therapist.tier === "intern" ? "" : "Dr. "}
            {therapist.first_name} {therapist.last_name}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((p) => Math.max(0, p - 1))}
            disabled={weekOffset === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-6">
        {weekDays.map((d) => {
          const isPast = isBefore(d, today)
          const isSelected = chosenDate ? format(chosenDate, "yyyy-MM-dd") === format(d, "yyyy-MM-dd") : false
          const hasAvail = availability.some((a) => a.day_of_week === d.getDay() && a.is_active)

          return (
            <button
              key={d.toISOString()}
              disabled={isPast}
              onClick={() => {
                setChosenDate(d)
                setChosenTime(null)
              }}
              className={cn(
                "flex flex-col items-center p-2 sm:p-3 rounded-xl border text-center transition-all",
                isPast && "opacity-30 cursor-not-allowed",
                !isPast && !isSelected && "hover:border-[#66948a]/50 hover:bg-accent/50",
                isSelected && "border-[#66948a] bg-[#66948a]/10 ring-1 ring-[#66948a]",
                !hasAvail && !isPast && "border-dashed",
              )}
            >
              <span className="text-[11px] sm:text-xs text-muted-foreground">{DAY_LABELS[d.getDay()]}</span>
              <span className="text-sm sm:text-base font-semibold text-foreground mt-0.5">{format(d, "d")}</span>
              <span className="text-[10px] text-muted-foreground">{format(d, "MMM")}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="text-center py-8 text-sm text-muted-foreground">Checking availability...</div>
      ) : !chosenDate ? (
        <div className="text-center py-8 border border-dashed rounded-xl text-sm text-muted-foreground">
          Please select a date above to see available session times.
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-xl text-sm text-muted-foreground">
          No available slots on this day. Please select another date.
        </div>
      ) : (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Available Slots for {format(chosenDate, "MMMM d, yyyy")}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {slots.map((s) => (
              <button
                key={s.time}
                disabled={s.booked}
                onClick={() => setChosenTime(s.time)}
                className={cn(
                  "py-2 px-3 rounded-lg border text-xs sm:text-sm font-medium transition-all text-center",
                  s.booked && "opacity-30 cursor-not-allowed bg-muted line-through",
                  !s.booked && chosenTime !== s.time && "border-border hover:border-[#66948a]/50 hover:bg-accent/50",
                  chosenTime === s.time && "border-[#66948a] bg-[#66948a] text-white",
                )}
              >
                {s.time}
              </button>
            ))}
          </div>
        </div>
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
          Continue to Details
        </Button>
      </div>
    </div>
  )
}

// ==========================================
// STEP 6: PATIENT DETAILS & CONFIRMATION
// ==========================================
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
      intakeData: formData.intakeData,
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

      if (result.error) {
        throw new Error(result.error)
      }

      onSubmit(details, result.bookingRef, result.credentials)
    }

    if (amount === 0) {
      try {
        await finalizeBooking()
      } catch (err: any) {
        setError(err.message || "Failed to confirm booking.")
        setLoading(false)
      }
      return
    }

    // Razorpay flow
    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      setError("Failed to load payment gateway. Please check your internet connection.")
      setLoading(false)
      return
    }

    const orderRes = await fetch("/api/book/razorpay-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, receipt: `rcpt_${Date.now()}` }),
    }).then((r) => r.json())

    if (orderRes.error || !orderRes.order) {
      setError(orderRes.error || "Failed to initiate payment.")
      setLoading(false)
      return
    }

    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
      amount: orderRes.order.amount,
      currency: "INR",
      name: "Astsankhlam Wellness",
      description: `Therapy Session with ${therapist?.first_name} ${therapist?.last_name}`,
      order_id: orderRes.order.id,
      prefill: {
        name: details.patientName,
        email: details.patientEmail,
        contact: details.patientPhone,
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
        } catch (bookingError: any) {
          setError(bookingError?.message || "Payment processed, but booking creation failed. Please contact support.")
        } finally {
          setLoading(false)
        }
      },
      modal: {
        ondismiss: () => {
          setError("Payment was cancelled.")
          setLoading(false)
        },
      },
    })

    rzp.open()
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Your Details & Final Review</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Please provide your contact information to finalize your appointment.
      </p>

      {therapist && formData.date && formData.startTime && (
        <div className="bg-[#66948a]/5 border border-[#66948a]/20 rounded-xl p-4 mb-6 text-sm">
          <div className="font-semibold text-foreground mb-1">Appointment Summary</div>
          <div className="text-muted-foreground space-y-0.5">
            <div>
              {therapist.tier === "intern" ? "" : "Dr. "}
              {therapist.first_name} {therapist.last_name} ({therapist.tier === "intern" ? "Supervised Intern" : "Licensed Psychologist"})
            </div>
            <div>
              {format(new Date(formData.date), "EEEE, MMMM d, yyyy")} &middot; {formData.startTime?.slice(0, 5)}
              {therapist.consultation_fee > 0 && ` · ₹${therapist.consultation_fee}`}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="patient_name">Full Name</Label>
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
            <Label htmlFor="patient_email">Email Address</Label>
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
            <Label htmlFor="patient_phone">Phone Number</Label>
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
          <Label htmlFor="notes">Additional notes for the practitioner (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Anything specific you'd like your practitioner to know in advance..."
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

// ==========================================
// CONFIRMED VIEW WITH PORTAL CREDENTIALS
// ==========================================
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
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
      <p className="text-muted-foreground mb-6">
        Your appointment is locked. A secure session link has been reserved for your appointment time.
      </p>

      {bookingRef && (
        <div className="inline-flex items-center gap-2 bg-muted rounded-lg px-4 py-2 text-sm font-mono font-medium text-foreground mb-6">
          Booking Ref: <span className="text-[#66948a] font-bold">{bookingRef}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-6 max-w-2xl mx-auto">
        <div className="bg-muted/50 rounded-xl p-5 text-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Appointment Summary
          </p>
          <div className="space-y-2.5">
            {therapist && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Practitioner</span>
                <span className="font-medium text-foreground">
                  {therapist.tier === "intern" ? "" : "Dr. "}
                  {therapist.first_name} {therapist.last_name}
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
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold text-foreground">₹{therapist.consultation_fee}</span>
              </div>
            )}
          </div>
        </div>

        {credentials ? (
          <div className="bg-[#66948a]/5 border border-[#66948a]/20 rounded-xl p-5 text-sm">
            <p className="text-xs font-semibold text-[#66948a] uppercase tracking-wide mb-1">Your Patient Portal Access</p>
            <p className="text-xs text-muted-foreground mb-4">
              Log in to view structured session reports, homework, and request re-matches anytime.
            </p>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Username</span>
                <div className="flex items-center justify-between bg-white border border-border rounded-lg px-3 py-2">
                  <span className="font-mono font-semibold text-foreground tracking-wider">{credentials.username}</span>
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
                  <span className="font-mono font-semibold text-foreground tracking-wider">{credentials.password}</span>
                  <button
                    onClick={() => copyToClipboard(credentials.password, "password")}
                    className="text-xs text-[#66948a] hover:text-[#4d7068] font-medium ml-2 transition-colors"
                  >
                    {copied === "password" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-xl p-5 text-sm flex flex-col justify-center items-center text-center gap-2">
            <UserCheck className="w-8 h-8 text-[#66948a]" />
            <p className="text-foreground font-medium text-xs">Patient Account Active</p>
            <p className="text-muted-foreground text-xs">
              This session has been linked to your existing patient account. Sign in to view your session takeaways.
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
          Sign In to Patient Portal
        </Link>
      </div>
    </div>
  )
}

// ==========================================
// MAIN BOOKING WIZARD (PHASE 2 WORKFLOW)
// ==========================================
export function BookingWizard({ therapists, preselectedTherapistId }: Props) {
  const [step, setStep] = useState(preselectedTherapistId ? 5 : 1)
  const [selectedTier, setSelectedTier] = useState<"professional" | "intern">("professional")
  const [intakeData, setIntakeData] = useState({
    primaryConcerns: [] as string[],
    distressDuration: "1 to 6 months",
    priorTherapyExperience: "First time",
    preferredLanguage: "English",
    preferredGender: "any",
  })
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
      {/* 6-Step Indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 right-0 top-4 h-px bg-border -z-0" />
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-1.5 relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                step > s.id
                  ? "bg-[#66948a] text-white"
                  : step === s.id
                    ? "bg-[#66948a] text-white ring-4 ring-[#66948a]/20"
                    : "bg-background border-2 border-border text-muted-foreground"
              }`}
            >
              {step > s.id ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s.id
              )}
            </div>
            <span
              className={`text-[11px] font-medium hidden md:block ${step === s.id ? "text-[#66948a] font-bold" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
        {step === 1 && (
          <StepSafetyScreening
            onSafe={() => setStep(2)}
            onFlagCrisis={() => {
              // Safety flag triggered; modal shows automatically
            }}
          />
        )}

        {step === 2 && (
          <StepTierSelection
            selectedTier={selectedTier}
            onSelectTier={(tier) => {
              setSelectedTier(tier)
              setStep(3)
            }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepConfidentialIntake
            initialData={intakeData}
            onSubmitIntake={(data) => {
              setIntakeData(data)
              updateForm({
                intakeData: {
                  supportTier: selectedTier,
                  ...data,
                },
              })
              setStep(4)
            }}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepSmartMatch
            therapists={therapists}
            selectedTier={selectedTier}
            intakeData={intakeData}
            selectedTherapistId={formData.therapistId}
            onSelect={(id) => {
              updateForm({ therapistId: id })
              setStep(5)
            }}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && selectedTherapist && (
          <StepDateTime
            therapist={selectedTherapist}
            selectedDate={formData.date}
            selectedTime={formData.startTime}
            onSelect={(date, startTime, endTime) => {
              updateForm({ date, startTime, endTime })
              setStep(6)
            }}
            onBack={() => setStep(4)}
          />
        )}

        {step === 6 && (
          <StepDetails
            formData={formData}
            therapist={selectedTherapist}
            onSubmit={(details, ref, creds) => {
              updateForm(details)
              setBookingRef(ref)
              setCredentials(creds)
              setStep(7)
            }}
            onBack={() => setStep(5)}
          />
        )}

        {step === 7 && (
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
