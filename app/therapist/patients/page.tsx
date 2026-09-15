'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Bell, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface PatientSummary {
  name: string
  email: string
  phone: string | null
  lastVisit: string
  sessionCount: number
  lastStatus: string
}

export default function TherapistPatientsPage() {
  const [patients, setPatients] = useState<PatientSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: therapist } = await supabase.from('therapists').select('id').eq('user_id', user.id).single()
      if (!therapist) { setLoading(false); return }

      const { data: bookings } = await supabase
        .from('bookings')
        .select('patient_name, patient_email, patient_phone, booking_date, status')
        .eq('therapist_id', therapist.id)
        .order('booking_date', { ascending: false })

      const patientMap = new Map<string, PatientSummary>()
      for (const b of bookings ?? []) {
        const existing = patientMap.get(b.patient_email)
        if (!existing) {
          patientMap.set(b.patient_email, {
            name: b.patient_name,
            email: b.patient_email,
            phone: b.patient_phone,
            lastVisit: b.booking_date,
            sessionCount: 1,
            lastStatus: b.status,
          })
        } else {
          existing.sessionCount++
          if (b.booking_date > existing.lastVisit) {
            existing.lastVisit = b.booking_date
            existing.lastStatus = b.status
          }
        }
      }
      setPatients(Array.from(patientMap.values()))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">My Patients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Patients who have booked with you</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : patients.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No patients yet. Bookings will appear here once confirmed.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{patients.length} patients</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Patient</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Phone</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Sessions</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Last Visit</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Last Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {patients.map((p) => (
                    <tr key={p.email} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </td>
                      <td className="px-5 py-3 text-foreground">{p.phone ?? '—'}</td>
                      <td className="px-5 py-3 text-foreground font-medium">{p.sessionCount}</td>
                      <td className="px-5 py-3 text-foreground">{format(new Date(p.lastVisit), 'MMM d, yyyy')}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          p.lastStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          p.lastStatus === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {p.lastStatus.replace('_', ' ')}
                        </span>
                      </td>
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
