'use client'

import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import {
  MessageSquare, Search, RefreshCw, Mail, Check, Copy,
  Trash2, MailOpen, Eye, CheckCircle2, AlertCircle, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ContactMessage {
  id: string
  first_name: string
  last_name: string
  email: string
  newsletter_opt_in: boolean
  subject: string
  message: string
  created_at: string
  is_read: boolean
}

interface Stats {
  total: number
  unread: number
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchMessages = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/admin/messages')
      const data = await res.json()
      if (data.error) {
        setFeedback({ type: 'error', text: data.error })
      } else {
        setMessages(data.messages ?? [])
        setStats(data.stats ?? { total: 0, unread: 0 })
      }
    } catch {
      setFeedback({ type: 'error', text: 'Failed to fetch contact messages.' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Filter messages locally
  const filtered = messages.filter((msg) => {
    const q = search.toLowerCase().trim()
    const matchesSearch =
      !q ||
      `${msg.first_name} ${msg.last_name}`.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      msg.subject.toLowerCase().includes(q) ||
      msg.message.toLowerCase().includes(q)

    const matchesFilter =
      filter === 'all' ? true : filter === 'unread' ? !msg.is_read : msg.is_read

    return matchesSearch && matchesFilter
  })

  // Copy email
  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Toggle Read Status
  const handleToggleRead = async (msg: ContactMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setActionId(msg.id)
    const newStatus = !msg.is_read

    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id, is_read: newStatus }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setFeedback({ type: 'error', text: data.error || 'Failed to update status' })
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_read: newStatus } : m))
        )
        setStats((prev) => ({
          ...prev,
          unread: newStatus ? Math.max(0, prev.unread - 1) : prev.unread + 1,
        }))
        if (selectedMessage?.id === msg.id) {
          setSelectedMessage((prev) => (prev ? { ...prev, is_read: newStatus } : null))
        }
      }
    } catch {
      setFeedback({ type: 'error', text: 'Network error updating message.' })
    } finally {
      setActionId(null)
    }
  }

  // Delete message
  const handleDelete = async (msg: ContactMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!window.confirm(`Delete message from ${msg.first_name} ${msg.last_name}?`)) return

    setActionId(msg.id)
    try {
      const res = await fetch(`/api/admin/messages?id=${msg.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setFeedback({ type: 'error', text: data.error || 'Failed to delete message' })
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== msg.id))
        setStats((prev) => ({
          total: prev.total - 1,
          unread: !msg.is_read ? Math.max(0, prev.unread - 1) : prev.unread,
        }))
        if (selectedMessage?.id === msg.id) {
          setSelectedMessage(null)
        }
        setFeedback({ type: 'success', text: 'Message deleted.' })
        setTimeout(() => setFeedback(null), 3000)
      }
    } catch {
      setFeedback({ type: 'error', text: 'Network error deleting message.' })
    } finally {
      setActionId(null)
    }
  }

  // Open full message and automatically mark as read if unread
  const handleOpenMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg)
    if (!msg.is_read) {
      handleToggleRead(msg)
    }
  }

  return (
    <div>
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-border bg-card gap-4 flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Contact Messages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and respond to inquiries submitted from the website contact page
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMessages(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Feedback notification */}
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
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-0.5">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Messages</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-amber-100 text-amber-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-0.5">{stats.unread}</div>
            <div className="text-sm text-muted-foreground">Unread Inquiries</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-0.5">
              {Math.max(0, stats.total - stats.unread)}
            </div>
            <div className="text-sm text-muted-foreground">Read / Handled</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, subject..."
              className="pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border self-start sm:self-auto text-xs">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-md font-medium transition-colors',
                filter === 'all'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'px-3 py-1.5 rounded-md font-medium transition-colors',
                filter === 'unread'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Unread ({stats.unread})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={cn(
                'px-3 py-1.5 rounded-md font-medium transition-colors',
                filter === 'read'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Read ({Math.max(0, stats.total - stats.unread)})
            </button>
          </div>
        </div>

        {/* Messages List Table */}
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#66948a]" />
            Loading contact messages...
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="text-left px-5 py-3.5">Status</th>
                    <th className="text-left px-5 py-3.5">Sender</th>
                    <th className="text-left px-5 py-3.5">Subject & Preview</th>
                    <th className="text-left px-5 py-3.5">Date</th>
                    <th className="text-right px-5 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <div className="font-medium text-foreground">No messages found</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {search
                            ? `No message matches "${search}".`
                            : 'No contact inquiries have been submitted yet.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((msg) => (
                      <tr
                        key={msg.id}
                        onClick={() => handleOpenMessage(msg)}
                        className={cn(
                          'cursor-pointer hover:bg-muted/40 transition-colors',
                          !msg.is_read && 'bg-amber-50/40 font-medium'
                        )}
                      >
                        <td className="px-5 py-3.5 w-12">
                          {!msg.is_read ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              New
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Read
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 min-w-[200px]">
                          <div className="text-foreground">
                            {msg.first_name} {msg.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span>{msg.email}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyEmail(msg.email, msg.id)
                              }}
                              className="hover:text-foreground p-0.5"
                              title="Copy email"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          {msg.newsletter_opt_in && (
                            <span className="inline-block mt-1 text-[10px] text-[#52776e] bg-[#66948a]/10 px-1.5 py-0.5 rounded font-medium">
                              Newsletter Opt-In
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 max-w-md">
                          <div className="text-foreground font-medium truncate">{msg.subject}</div>
                          <div className="text-xs text-muted-foreground truncate line-clamp-1 mt-0.5">
                            {msg.message}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                          {format(new Date(msg.created_at), 'MMM d, yyyy, h:mm a')}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleToggleRead(msg, e)}
                              disabled={actionId === msg.id}
                              className="text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-muted transition-colors"
                              title={msg.is_read ? 'Mark as unread' : 'Mark as read'}
                            >
                              {msg.is_read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4 text-emerald-600" />}
                            </button>
                            <button
                              onClick={() => handleOpenMessage(msg)}
                              className="text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-muted transition-colors"
                              title="View full message"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(msg, e)}
                              disabled={actionId === msg.id}
                              className="text-muted-foreground hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                              title="Delete message"
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
                Showing {filtered.length} of {stats.total} message{stats.total !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-semibold text-foreground">Message Details</h3>
                  {!selectedMessage.is_read && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-medium">
                      Unread
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-border">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-semibold">From</label>
                    <div className="text-sm font-medium text-foreground">
                      {selectedMessage.first_name} {selectedMessage.last_name}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-semibold">Email</label>
                    <div className="text-sm font-medium text-foreground flex items-center gap-2">
                      <span>{selectedMessage.email}</span>
                      <a
                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                        className="text-xs text-[#66948a] hover:underline"
                      >
                        Reply
                      </a>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-semibold">Date Received</label>
                    <div className="text-sm text-foreground">
                      {format(new Date(selectedMessage.created_at), 'MMMM d, yyyy, h:mm a')}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-semibold">Newsletter Opt-in</label>
                    <div className="text-sm text-foreground">
                      {selectedMessage.newsletter_opt_in ? (
                        <span className="text-emerald-700 font-medium">Yes, opted in</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Subject</label>
                  <div className="text-base font-semibold text-foreground mt-0.5">
                    {selectedMessage.subject}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Message</label>
                  <div className="mt-2 p-4 rounded-xl bg-muted/40 text-sm text-foreground whitespace-pre-wrap leading-relaxed border border-border">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-3.5 border-t border-border bg-muted/20">
                <button
                  onClick={() => handleToggleRead(selectedMessage)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground underline"
                >
                  {selectedMessage.is_read ? 'Mark as unread' : 'Mark as read'}
                </button>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#66948a] text-white hover:bg-[#52776e] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Reply via Email
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMessage(null)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
