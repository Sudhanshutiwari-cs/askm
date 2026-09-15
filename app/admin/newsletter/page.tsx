'use client'

import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import {
  Mail, Search, Download, RefreshCw, CheckCircle2,
  XCircle, Copy, Check, Trash2, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Subscriber {
  id: string
  email: string
  is_subscribed: boolean
  subscribed_at: string
  unsubscribed_at: string | null
  created_at: string
  updated_at: string
}

interface Stats {
  total: number
  active: number
  unsubscribed: number
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, unsubscribed: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchSubscribers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/admin/newsletter')
      const data = await res.json()
      if (data.error) {
        setFeedback({ type: 'error', text: data.error })
      } else {
        setSubscribers(data.subscribers ?? [])
        setStats(data.stats ?? { total: 0, active: 0, unsubscribed: 0 })
      }
    } catch {
      setFeedback({ type: 'error', text: 'Failed to load newsletter subscribers.' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  // Filter subscribers locally based on search and status
  const filtered = subscribers.filter((sub) => {
    const matchesSearch = sub.email.toLowerCase().includes(search.toLowerCase().trim())
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? sub.is_subscribed
        : !sub.is_subscribed
    return matchesSearch && matchesStatus
  })

  // Copy email to clipboard
  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Toggle subscriber status (Active <-> Unsubscribed)
  const handleToggleStatus = async (sub: Subscriber) => {
    setActionId(sub.id)
    const newStatus = !sub.is_subscribed
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub.id, is_subscribed: newStatus }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setFeedback({ type: 'error', text: data.error || 'Failed to update subscriber status' })
      } else {
        setSubscribers((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, is_subscribed: newStatus, unsubscribed_at: newStatus ? null : new Date().toISOString() } : s))
        )
        setStats((prev) => ({
          ...prev,
          active: newStatus ? prev.active + 1 : prev.active - 1,
          unsubscribed: newStatus ? prev.unsubscribed - 1 : prev.unsubscribed + 1,
        }))
        setFeedback({
          type: 'success',
          text: `Marked ${sub.email} as ${newStatus ? 'active' : 'unsubscribed'}.`,
        })
        setTimeout(() => setFeedback(null), 4000)
      }
    } catch {
      setFeedback({ type: 'error', text: 'Network error updating subscriber status.' })
    } finally {
      setActionId(null)
    }
  }

  // Delete subscriber
  const handleDeleteSubscriber = async (sub: Subscriber) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${sub.email}" from the subscribers list?`)) {
      return
    }

    setActionId(sub.id)
    try {
      const res = await fetch(`/api/admin/newsletter?id=${sub.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setFeedback({ type: 'error', text: data.error || 'Failed to delete subscriber' })
      } else {
        setSubscribers((prev) => prev.filter((s) => s.id !== sub.id))
        setStats((prev) => ({
          total: prev.total - 1,
          active: sub.is_subscribed ? prev.active - 1 : prev.active,
          unsubscribed: sub.is_subscribed ? prev.unsubscribed : prev.unsubscribed - 1,
        }))
        setFeedback({ type: 'success', text: `Subscriber "${sub.email}" deleted successfully.` })
        setTimeout(() => setFeedback(null), 4000)
      }
    } catch {
      setFeedback({ type: 'error', text: 'Network error deleting subscriber.' })
    } finally {
      setActionId(null)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) return
    const headers = ['Email', 'Status', 'Subscribed At', 'Unsubscribed At']
    const rows = filtered.map((s) => [
      `"${s.email.replace(/"/g, '""')}"`,
      s.is_subscribed ? 'Active' : 'Unsubscribed',
      `"${s.subscribed_at ? format(new Date(s.subscribed_at), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
      `"${s.unsubscribed_at ? format(new Date(s.unsubscribed_at), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `newsletter_subscribers_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-border bg-card gap-4 flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Newsletter Subscribers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your newsletter audience, monitor signups, and export email lists
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSubscribers(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 text-xs bg-[#66948a] hover:bg-[#52776e] text-white"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Status / Alert Banner */}
        {feedback && (
          <div
            className={cn(
              'px-4 py-3 rounded-lg text-sm flex items-center justify-between transition-all',
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            )}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs font-semibold underline ml-4 hover:opacity-75"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-[#66948a]/10 text-[#66948a]">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-0.5">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Subscribers</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-0.5">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active Subscribers</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-amber-100 text-amber-700">
              <XCircle className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-0.5">{stats.unsubscribed}</div>
            <div className="text-sm text-muted-foreground">Unsubscribed</div>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search subscriber by email..."
              className="pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border self-start sm:self-auto text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-md font-medium transition-colors',
                statusFilter === 'all'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={cn(
                'px-3 py-1.5 rounded-md font-medium transition-colors',
                statusFilter === 'active'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setStatusFilter('unsubscribed')}
              className={cn(
                'px-3 py-1.5 rounded-md font-medium transition-colors',
                statusFilter === 'unsubscribed'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Unsubscribed ({stats.unsubscribed})
            </button>
          </div>
        </div>

        {/* Subscribers Table */}
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#66948a]" />
            Loading subscribers...
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="text-left px-5 py-3.5">Email Address</th>
                    <th className="text-left px-5 py-3.5">Status</th>
                    <th className="text-left px-5 py-3.5">Subscribed Date</th>
                    <th className="text-left px-5 py-3.5">Unsubscribed Date</th>
                    <th className="text-right px-5 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                        <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <div className="font-medium text-foreground">No subscribers found</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {search
                            ? `No subscriber matches "${search}".`
                            : 'No one has subscribed to the newsletter yet.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((sub) => (
                      <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{sub.email}</span>
                            <button
                              onClick={() => handleCopyEmail(sub.email, sub.id)}
                              className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors"
                              title="Copy email"
                            >
                              {copiedId === sub.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
                              sub.is_subscribed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700'
                            )}
                          >
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                sub.is_subscribed ? 'bg-emerald-500' : 'bg-gray-400'
                              )}
                            />
                            {sub.is_subscribed ? 'Active' : 'Unsubscribed'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs">
                          {sub.subscribed_at
                            ? format(new Date(sub.subscribed_at), 'MMM d, yyyy, h:mm a')
                            : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs">
                          {sub.unsubscribed_at
                            ? format(new Date(sub.unsubscribed_at), 'MMM d, yyyy, h:mm a')
                            : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(sub)}
                              disabled={actionId === sub.id}
                              className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors border',
                                sub.is_subscribed
                                  ? 'border-amber-200 text-amber-800 hover:bg-amber-50'
                                  : 'border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                              )}
                              title={sub.is_subscribed ? 'Mark as unsubscribed' : 'Mark as active'}
                            >
                              {sub.is_subscribed ? (
                                <>
                                  <ToggleRight className="w-3.5 h-3.5 text-amber-600" />
                                  Unsubscribe
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-3.5 h-3.5 text-emerald-600" />
                                  Reactivate
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteSubscriber(sub)}
                              disabled={actionId === sub.id}
                              className="text-muted-foreground hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Delete subscriber permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filtered.length} of {stats.total} subscriber{stats.total !== 1 ? 's' : ''}
              </span>
              {filtered.length > 0 && (
                <span className="text-[11px]">
                  Tip: Click &quot;Export CSV&quot; to download the filtered email list for campaigns.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
