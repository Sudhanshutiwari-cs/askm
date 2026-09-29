'use client'

import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { LifeBuoy, AlertTriangle, CheckCircle2, Clock, Send, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { HelplineTicket } from '@/types/phase2'

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<HelplineTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<HelplineTicket | null>(null)
  const [status, setStatus] = useState<string>('resolved')
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  const loadTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tickets')
      const data = await res.json()
      setTickets(data.tickets || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleUpdate = async () => {
    if (!selectedTicket) return
    setProcessing(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status,
          adminNotes,
        }),
      })

      const data = await res.json()
      if (data.ticket) {
        setSelectedTicket(null)
        loadTickets()
      } else {
        alert(data.error || 'Failed to update ticket')
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Helpline & Quality Complaints Desk</h1>
          <p className="text-sm text-muted-foreground">
            Clinical quality monitoring, client inquiries, and professional grievance management
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {tickets.filter((t) => t.status === 'open').length} Open Tickets
        </Badge>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No support tickets or quality flags recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Ref & Subject</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground text-sm">{t.subject}</div>
                      <span className="font-mono text-[11px] text-muted-foreground">{t.ticket_ref}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{t.user_name}</div>
                      <div className="text-muted-foreground">{t.user_email}</div>
                    </td>
                    <td className="px-4 py-3 capitalize text-foreground">{t.category.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-[10px] capitalize ${
                          t.priority === 'urgent' || t.priority === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-[10px] capitalize ${
                          t.status === 'open'
                            ? 'bg-amber-100 text-amber-800'
                            : t.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(t.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTicket(t)
                          setStatus(t.status === 'open' ? 'in_progress' : t.status)
                          setAdminNotes(t.admin_notes || '')
                        }}
                        className="text-xs h-7 gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Resolve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Resolution Dialog */}
      <Dialog open={Boolean(selectedTicket)} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-md">
          {selectedTicket && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center justify-between">
                  <span>Ticket: {selectedTicket.ticket_ref}</span>
                  <Badge variant="outline" className="capitalize text-xs">
                    {selectedTicket.priority} Priority
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  From {selectedTicket.user_name} ({selectedTicket.user_email})
                </p>
              </DialogHeader>

              <div className="bg-muted/40 p-3.5 rounded-xl border border-border text-xs space-y-2">
                <span className="font-bold text-foreground block">{selectedTicket.subject}</span>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <Label className="text-xs font-semibold block mb-1">Update Status</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#66948a]"
                  >
                    <option value="open">Open (Needs Attention)</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved & Closed</option>
                    <option value="closed">Closed Without Action</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold block mb-1">Administrative Response / Resolution Notes</Label>
                  <Textarea
                    rows={3}
                    placeholder="Provide response notes explaining how the issue was resolved..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={processing}
                  onClick={handleUpdate}
                  className="bg-[#66948a] hover:bg-[#4d7068] text-white text-xs"
                >
                  {processing ? 'Saving...' : 'Update Ticket'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
