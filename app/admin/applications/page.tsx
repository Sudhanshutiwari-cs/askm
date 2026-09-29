'use client'

import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  UserCheck, ShieldCheck, Search, CheckCircle2, XCircle,
  Clock, FileText, ExternalLink, Copy, Check, Eye
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ProfessionalApplication } from '@/types/phase2'

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ProfessionalApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<ProfessionalApplication | null>(null)

  // Approval state
  const [processing, setProcessing] = useState(false)
  const [consultationFee, setConsultationFee] = useState('2000')
  const [adminNotes, setAdminNotes] = useState('')
  const [approvedCreds, setApprovedCreds] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const loadApplications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/applications')
      const data = await res.json()
      setApplications(data.applications || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const filtered = applications.filter((a) =>
    `${a.full_name} ${a.email} ${a.degree_title} ${a.degree_serial_no || ''}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleApprove = async () => {
    if (!selectedApp) return
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          action: 'approve',
          consultationFee,
          adminNotes,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setApprovedCreds(data)
        loadApplications()
      } else {
        alert(data.error || 'Approval failed')
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedApp) return
    if (!confirm('Are you sure you want to reject this application?')) return
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          action: 'reject',
          adminNotes,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSelectedApp(null)
        loadApplications()
      } else {
        alert(data.error || 'Rejection failed')
      }
    } finally {
      setProcessing(false)
    }
  }

  const copyCreds = () => {
    if (!approvedCreds?.credentials) return
    const text = `Astsankhlam ID: ${approvedCreds.astsankhlamId}\nUsername: ${approvedCreds.credentials.username}\nPassword: ${approvedCreds.credentials.password}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Practitioner Onboarding Queue</h1>
          <p className="text-sm text-muted-foreground">
            Verify academic degree serial numbers, licenses, and approve practitioners with Astsankhlam IDs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs">
            {applications.filter((a) => a.status === 'pending').length} Pending Review
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, degree, or serial number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-xs"
        />
      </div>

      {/* Applications Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading applications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No applications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Applicant</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium">Degree & Serial No.</th>
                  <th className="px-4 py-3 font-medium">Experience</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Applied Date</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground text-sm">{app.full_name}</div>
                      <div className="text-muted-foreground">{app.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-[10px] capitalize ${
                          app.tier === 'intern'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {app.tier === 'intern' ? 'Supervised Intern' : 'Licensed Psychologist'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      <div className="font-medium">{app.degree_title}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {app.degree_serial_no ? `S/N: ${app.degree_serial_no}` : 'No serial provided'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{app.experience_years} years</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${
                          app.status === 'approved'
                            ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                            : app.status === 'rejected'
                              ? 'border-rose-500 text-rose-700 bg-rose-50'
                              : 'border-amber-500 text-amber-700 bg-amber-50'
                        }`}
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(app.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedApp(app)
                          setApprovedCreds(null)
                          setConsultationFee(app.tier === 'intern' ? '1000' : '2500')
                          setAdminNotes('')
                        }}
                        className="text-xs h-7 gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Verification Dialog */}
      <Dialog open={Boolean(selectedApp)} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          {selectedApp && (
            <div>
              <DialogHeader className="border-b pb-3 mb-4">
                <DialogTitle className="text-lg font-bold flex items-center justify-between">
                  <span>Application Review</span>
                  <Badge variant="outline" className="font-mono text-xs capitalize">
                    {selectedApp.tier}
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Applied by {selectedApp.full_name} &middot; {selectedApp.email}
                </p>
              </DialogHeader>

              {approvedCreds ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground text-base">Practitioner Approved & Activated!</h3>

                  <div className="bg-muted p-4 rounded-xl text-left space-y-2 font-mono text-xs max-w-sm mx-auto border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Astsankhlam ID:</span>
                      <span className="font-bold text-[#66948a]">{approvedCreds.astsankhlamId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Portal Username:</span>
                      <span className="font-bold text-foreground">{approvedCreds.credentials.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Password:</span>
                      <span className="font-bold text-foreground">{approvedCreds.credentials.password}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2 pt-2">
                    <Button size="sm" onClick={copyCreds} variant="outline" className="text-xs gap-1.5">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy Credentials'}
                    </Button>
                    <Button size="sm" onClick={() => setSelectedApp(null)} className="bg-[#66948a] text-white">
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Credentials Checklist */}
                  <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-2.5">
                    <span className="font-bold text-foreground text-xs uppercase tracking-wide block">
                      Credentialing Details
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Degree:</span>
                        <span className="font-semibold text-foreground">{selectedApp.degree_title}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Degree Serial No.:</span>
                        <span className="font-mono font-semibold text-foreground">
                          {selectedApp.degree_serial_no || 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">University / Institution:</span>
                        <span className="text-foreground">{selectedApp.university || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">RCI / License No.:</span>
                        <span className="font-mono text-foreground">{selectedApp.license_number || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Phone:</span>
                        <span className="text-foreground">{selectedApp.phone}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Experience:</span>
                        <span className="text-foreground">{selectedApp.experience_years} years</span>
                      </div>
                    </div>

                    {selectedApp.domains?.length > 0 && (
                      <div className="pt-1">
                        <span className="text-muted-foreground block text-[11px] mb-1">Domains / Modalities:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedApp.domains.map((d) => (
                            <Badge key={d} variant="secondary" className="text-[10px]">
                              {d}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedApp.bio && (
                      <div className="pt-1">
                        <span className="text-muted-foreground block text-[11px] mb-0.5">Philosophy:</span>
                        <p className="text-muted-foreground italic leading-relaxed">{selectedApp.bio}</p>
                      </div>
                    )}

                    {selectedApp.resume_url && (
                      <div className="pt-2">
                        <a
                          href={selectedApp.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#66948a] font-semibold hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> View Submitted Resume / Documents
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Verification Controls */}
                  {selectedApp.status === 'pending' && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs mb-1 block">Assigned Consultation Fee (₹)</Label>
                          <Input
                            type="number"
                            value={consultationFee}
                            onChange={(e) => setConsultationFee(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Decision Notes</Label>
                          <Input
                            placeholder="Optional notes for audit..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={processing}
                          onClick={handleReject}
                          className="text-rose-700 border-rose-200 hover:bg-rose-50 text-xs"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          disabled={processing}
                          onClick={handleApprove}
                          className="bg-[#66948a] hover:bg-[#4d7068] text-white text-xs gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {processing ? 'Processing...' : 'Approve & Issue Astsankhlam ID'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
