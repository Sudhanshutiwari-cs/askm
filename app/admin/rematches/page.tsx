'use client'

import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { RefreshCw, UserCheck, CheckCircle2, Clock, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { RematchRequest, Therapist } from '@/types/phase2'

export default function AdminRematchesPage() {
  const [rematches, setRematches] = useState<RematchRequest[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRematch, setSelectedRematch] = useState<RematchRequest | null>(null)
  const [newTherapistId, setNewTherapistId] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [rRes, tRes] = await Promise.all([
        fetch('/api/admin/rematches').then((r) => r.json()),
        fetch('/api/therapists').then((r) => r.json()),
      ])
      setRematches(rRes.rematches || [])
      setTherapists(tRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleResolve = async (status: 'matched' | 'resolved') => {
    if (!selectedRematch) return
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/rematches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rematchId: selectedRematch.id,
          newTherapistId: newTherapistId || null,
          status,
          adminResolutionNotes: resolutionNotes,
        }),
      })

      const data = await res.json()
      if (data.rematch) {
        setSelectedRematch(null)
        loadData()
      } else {
        alert(data.error || 'Failed to update rematch')
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Matching Oversight & Re-matches</h1>
          <p className="text-sm text-muted-foreground">
            Manage Step 11 client therapist transitions and smart reassignment protocols
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {rematches.filter((r) => r.status === 'pending').length} Pending Requests
        </Badge>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading rematch requests...</div>
        ) : rematches.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No active rematch requests found. Clients who request a new therapist will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Previous Therapist</th>
                  <th className="px-4 py-3 font-medium">Reason for Transition</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Requested</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rematches.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">
                        {r.patients ? `${r.patients.first_name} ${r.patients.last_name}` : 'Client'}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{r.patients?.email}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground font-medium">
                      {r.therapists ? `Dr. ${r.therapists.first_name} ${r.therapists.last_name}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{r.reason}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-[10px] capitalize ${
                          r.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'matched'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(r.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRematch(r)
                          setNewTherapistId(r.new_therapist_id || '')
                          setResolutionNotes(r.admin_resolution_notes || '')
                        }}
                        className="text-xs h-7 gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Reassign
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reassign Dialog */}
      <Dialog open={Boolean(selectedRematch)} onOpenChange={(open) => !open && setSelectedRematch(null)}>
        <DialogContent className="max-w-md">
          {selectedRematch && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#66948a]" /> Reassign Client to Therapist
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Client: {selectedRematch.patients?.first_name} {selectedRematch.patients?.last_name}
                </p>
              </DialogHeader>

              <div className="bg-muted/40 p-3.5 rounded-xl border border-border text-xs space-y-2">
                <div>
                  <span className="font-semibold block text-foreground">Stated Reason:</span>
                  <p className="text-muted-foreground">{selectedRematch.reason}</p>
                </div>
                {selectedRematch.desired_attributes && (
                  <div>
                    <span className="font-semibold block text-foreground">Desired Qualities:</span>
                    <p className="text-muted-foreground italic">{selectedRematch.desired_attributes}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <Label className="text-xs font-semibold block mb-1">Select New Matched Practitioner</Label>
                  <select
                    value={newTherapistId}
                    onChange={(e) => setNewTherapistId(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#66948a]"
                  >
                    <option value="">Choose a practitioner...</option>
                    {therapists.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tier === 'intern' ? '' : 'Dr. '}{t.first_name} {t.last_name} ({t.tier || 'Professional'} · {t.experience_years}y exp)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold block mb-1">Resolution Notes for Patient / Clinical Log</Label>
                  <Input
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="e.g. Reassigned to specialist in mindfulness and trauma care."
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setSelectedRematch(null)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={processing}
                  onClick={() => handleResolve(newTherapistId ? 'matched' : 'resolved')}
                  className="bg-[#66948a] hover:bg-[#4d7068] text-white text-xs"
                >
                  {processing ? 'Saving...' : 'Confirm Reassignment'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
