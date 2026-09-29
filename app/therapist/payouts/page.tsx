'use client'

import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Wallet, ArrowDownRight, Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface CompletedSession {
  id: string
  booking_ref: string
  booking_date: string
  start_time: string
  patient_name: string
  amount: number
  status: string
}

export default function TherapistPayoutsPage() {
  const [loading, setLoading] = useState(true)
  const [therapist, setTherapist] = useState<any>(null)
  const [sessions, setSessions] = useState<CompletedSession[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: t } = await supabase
        .from('therapists')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (t) {
        setTherapist(t)
        const { data: bData } = await supabase
          .from('bookings')
          .select('id, booking_ref, booking_date, start_time, patient_name, amount, status')
          .eq('therapist_id', t.id)
          .in('status', ['completed', 'confirmed'])
          .order('booking_date', { ascending: false })

        setSessions((bData as CompletedSession[]) ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading earnings and payouts...
      </div>
    )
  }

  const commissionRate = therapist?.commission_rate || 25.0 // Platform takes 25-30%
  const therapistShareRate = (100 - commissionRate) / 100 // 70-75%

  const totalGross = sessions.reduce((acc, s) => acc + (s.amount || 0), 0)
  const totalCommission = Math.round(totalGross * (commissionRate / 100))
  const netEarnings = totalGross - totalCommission

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Earnings & Payouts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track consultation earnings, platform commission breakdown, and 24-hour settlements
          </p>
        </div>
        <Badge variant="outline" className="text-xs text-[#66948a] border-[#66948a]/30">
          <Clock className="w-3.5 h-3.5 mr-1" /> 24-Hour Settlement Cycle
        </Badge>
      </header>

      <div className="p-6 space-y-6 max-w-5xl">
        {/* Tier & Commission Policy Card */}
        <div className="p-4 bg-muted/40 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-foreground block">
              Tier: {therapist?.tier === 'intern' ? 'Supervised Intern / Counselor' : 'Licensed Clinical Psychologist'}
            </span>
            <span className="text-muted-foreground">
              {therapist?.tier === 'intern'
                ? 'Supervised training tier with clinic certificates and case credit.'
                : `Professional compensation model: You retain ${(100 - commissionRate)}% of each session fee.`}
            </span>
          </div>
          <div className="font-mono text-xs bg-white px-3 py-1.5 rounded border border-border text-[#66948a] font-semibold">
            Platform Commission: {commissionRate}% &middot; Your Share: {100 - commissionRate}%
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Total Completed Sessions</span>
            <span className="text-2xl font-bold text-foreground">{sessions.length}</span>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Gross Consultation Value</span>
            <span className="text-2xl font-bold text-foreground">₹{totalGross.toLocaleString()}</span>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Platform Commission ({commissionRate}%)</span>
            <span className="text-2xl font-bold text-amber-700">₹{totalCommission.toLocaleString()}</span>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Net Disbursable</span>
            <span className="text-2xl font-bold text-emerald-600">₹{netEarnings.toLocaleString()}</span>
          </div>
        </div>

        {/* Sessions & Payout Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-sm">Consultation History & Breakdown</h3>
            <span className="text-xs text-muted-foreground">{sessions.length} records</span>
          </div>

          {sessions.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No sessions conducted yet. Once you complete sessions, your payout ledger will update here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Booking Ref</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Session Date</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Gross Fee</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Platform ({commissionRate}%)</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Your Net ({(100 - commissionRate)}%)</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Disbursement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessions.map((s) => {
                    const gross = s.amount || 0
                    const comm = Math.round(gross * (commissionRate / 100))
                    const net = gross - comm

                    return (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-foreground">{s.booking_ref}</td>
                        <td className="px-4 py-3 text-foreground">{s.patient_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(s.booking_date), 'MMM d, yyyy')} ({s.start_time.slice(0, 5)})
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">₹{gross}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">-₹{comm}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">₹{net}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Ready / Disbursed
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
