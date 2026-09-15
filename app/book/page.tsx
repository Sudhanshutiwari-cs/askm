"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BookingWizard, type Therapist } from "@/components/booking/booking-wizard"
import { PublicNavbar } from "@/components/public/navbar"
import { PublicFooter } from "@/components/public/footer"

function BookPageContent() {
  const searchParams = useSearchParams()
  const preselectedTherapistId = searchParams.get("therapist") ?? undefined
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/therapists")
        const { data } = await res.json()
        setTherapists(data ?? [])
      } catch {
        setTherapists([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Book an Appointment</h1>
            <p className="text-muted-foreground">Choose your therapist, select a time, and confirm your booking.</p>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading therapists...</p>
          ) : (
            <BookingWizard therapists={therapists} preselectedTherapistId={preselectedTherapistId} />
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-label="Loading booking page" />}>
      <BookPageContent />
    </Suspense>
  )
}
