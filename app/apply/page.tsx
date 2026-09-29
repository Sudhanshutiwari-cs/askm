"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { PublicNavbar } from "@/components/public/navbar"
import { PublicFooter } from "@/components/public/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  FileCheck,
} from "lucide-react"

const DOMAINS_LIST = [
  "CBT (Cognitive Behavioral)",
  "Trauma-Informed Therapy",
  "Anxiety & Panic Disorders",
  "Depression & Mood Disorders",
  "Relationship & Couples",
  "Mindfulness & Yogic Healing",
  "Grief & Bereavement",
  "Child & Adolescent",
  "Stress & Burnout",
  "Psychodynamic Therapy",
]

const LANGUAGES_LIST = ["English", "Hindi", "Bengali", "Marathi", "Tamil", "Telugu", "Gujarati", "Kannada"]

export default function ProfessionalApplyPage() {
  const [step, setStep] = useState(1)
  const [tier, setTier] = useState<"professional" | "intern">("professional")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [degreeTitle, setDegreeTitle] = useState("")
  const [degreeSerialNo, setDegreeSerialNo] = useState("")
  const [university, setUniversity] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [experienceYears, setExperienceYears] = useState("3")
  const [languages, setLanguages] = useState<string[]>(["English", "Hindi"])
  const [domains, setDomains] = useState<string[]>([])
  const [bio, setBio] = useState("")
  const [resumeUrl, setResumeUrl] = useState("")
  const [agreedToEthics, setAgreedToEthics] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submittedRef, setSubmittedRef] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toggleDomain = (d: string) => {
    setDomains((prev) => (prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]))
  }

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) => (prev.includes(lang) ? prev.filter((item) => item !== lang) : [...prev, lang]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreedToEthics) {
      setError("Please confirm adherence to the Astsankhlam Code of Clinical Ethics.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          tier,
          degreeTitle,
          degreeSerialNo,
          university,
          licenseNumber,
          experienceYears: Number(experienceYears) || 0,
          languages,
          domains,
          bio,
          resumeUrl,
        }),
      })

      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setSubmittedRef(data.application?.id?.slice(0, 8).toUpperCase() || "APP-CONFIRMED")
      }
    } catch {
      setError("Failed to submit application. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <Badge variant="outline" className="text-[#66948a] border-[#66948a]/30 mb-3 px-3 py-1">
              Join Our Care Collective
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              Practitioner & Intern Onboarding
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto mt-2">
              Empowering empathetic psychologists, trauma-informed practitioners, and supervised interns with fair
              compensation, flexible hours, and structured peer supervision.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-xs">
            {submittedRef ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-foreground">Application Received</h2>
                <div className="inline-block bg-muted px-4 py-2 rounded-lg font-mono text-xs text-foreground">
                  Reference: <span className="text-[#66948a] font-bold">{submittedRef}</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  Thank you for applying to join the Astsankhlam collective. Our clinical credentialing committee reviews
                  degree serial numbers, licenses, and background documentation within <strong>24 hours</strong>. You will
                  receive your verified Astsankhlam ID and onboarding portal instructions via email.
                </p>

                <div className="pt-6">
                  <Link href="/">
                    <Button className="bg-[#66948a] hover:bg-[#4d7068] text-white">Return to Homepage</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role / Tier Selection */}
                <div>
                  <Label className="text-sm font-semibold block mb-2">Support Level Applying For</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTier("professional")}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        tier === "professional"
                          ? "border-[#66948a] bg-[#66948a]/5 ring-1 ring-[#66948a]"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-foreground">Licensed Psychologist</span>
                        <ShieldCheck className="w-4 h-4 text-[#66948a]" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Certified RCI / M.Phil / Ph.D. practitioners. 70-75% psychologist revenue share.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTier("intern")}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        tier === "intern"
                          ? "border-[#66948a] bg-[#66948a]/5 ring-1 ring-[#66948a]"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-foreground">Supervised Intern</span>
                        <Award className="w-4 h-4 text-amber-600" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Post-graduates & trainees receiving clinical supervision, case training, and certificates.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold">
                      Full Legal Name
                    </Label>
                    <Input
                      id="name"
                      required
                      placeholder="Dr. / Ms. / Mr. Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">
                      Professional Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">
                      Phone Number (WhatsApp)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="exp" className="text-xs font-semibold">
                      Years of Clinical Experience
                    </Label>
                    <Input
                      id="exp"
                      type="number"
                      min="0"
                      max="40"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                    />
                  </div>
                </div>

                {/* Academic Credentials */}
                <div className="space-y-4 pt-2 border-t border-border">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#66948a]" /> Academic Qualifications & Verification
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="degree" className="text-xs font-semibold">
                        Highest Degree (e.g. M.Sc, M.Phil, Psy.D, Ph.D)
                      </Label>
                      <Input
                        id="degree"
                        required
                        placeholder="M.Phil in Clinical Psychology"
                        value={degreeTitle}
                        onChange={(e) => setDegreeTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="serial" className="text-xs font-semibold">
                        Degree Certificate Serial / Roll Number
                      </Label>
                      <Input
                        id="serial"
                        placeholder="e.g. DEG-2023-XXXX"
                        value={degreeSerialNo}
                        onChange={(e) => setDegreeSerialNo(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="univ" className="text-xs font-semibold">
                        University / Institution
                      </Label>
                      <Input
                        id="univ"
                        placeholder="University of Delhi / NIMHANS / etc."
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="license" className="text-xs font-semibold">
                        RCI / Clinical Registration Number (if applicable)
                      </Label>
                      <Input
                        id="license"
                        placeholder="CRR / RCI Number"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Domains & Specializations */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <Label className="text-xs font-semibold block">Clinical Domains & Modalities (Select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {DOMAINS_LIST.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDomain(d)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          domains.includes(d)
                            ? "bg-[#66948a] border-[#66948a] text-white"
                            : "bg-background border-border text-muted-foreground hover:border-[#66948a]"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold block">Languages Fluent in for Therapy</Label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES_LIST.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                          languages.includes(lang)
                            ? "bg-[#66948a]/15 border-[#66948a] text-[#426b62]"
                            : "bg-background border-border text-muted-foreground"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bio & Resume */}
                <div className="space-y-4 pt-2 border-t border-border">
                  <div className="space-y-1.5">
                    <Label htmlFor="bio" className="text-xs font-semibold">
                      Short Professional Bio / Therapeutic Philosophy
                    </Label>
                    <Textarea
                      id="bio"
                      rows={3}
                      placeholder="Briefly describe your approach to client well-being and therapeutic boundaries..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="resume" className="text-xs font-semibold">
                      Link to Resume / Drive Portfolio / Certificates
                    </Label>
                    <Input
                      id="resume"
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* Ethics Agreement */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={agreedToEthics}
                      onChange={(e) => setAgreedToEthics(e.target.checked)}
                      className="mt-0.5 rounded border-border text-[#66948a] focus:ring-[#66948a]"
                    />
                    <span className="text-muted-foreground leading-relaxed">
                      I certify that all degrees, serial numbers, and licenses provided are authentic and verifiable. I
                      agree to abide by the <strong>Astsankhlam Code of Clinical Ethics</strong>, strict client confidentiality,
                      and mandatory supervision standards.
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting || !agreedToEthics}
                  className="w-full bg-[#66948a] hover:bg-[#4d7068] text-white py-3"
                >
                  {submitting ? "Submitting Application..." : "Submit Application for Verification"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
