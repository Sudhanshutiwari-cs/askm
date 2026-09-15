'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Film, Plus, RefreshCw, Trash2, Pencil, ExternalLink,
  CheckCircle2, XCircle, Eye, EyeOff, RotateCcw, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Reel {
  id: string
  title: string
  image_url: string
  link_url: string | null
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AdminReelsPage() {
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReel, setEditingReel] = useState<Reel | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formLinkUrl, setFormLinkUrl] = useState('')
  const [formOrder, setFormOrder] = useState(1)
  const [formActive, setFormActive] = useState(true)

  const fetchReels = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/admin/reels')
      const data = await res.json()
      if (data.error) {
        setFeedback({ type: 'error', text: data.error })
      } else {
        setReels(data.reels ?? [])
      }
    } catch {
      setFeedback({ type: 'error', text: 'Failed to fetch reels.' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchReels()
  }, [fetchReels])

  const openCreateDialog = () => {
    setEditingReel(null)
    setFormTitle('')
    setFormImageUrl('')
    setFormLinkUrl('')
    setFormOrder(reels.length + 1)
    setFormActive(true)
    setDialogOpen(true)
  }

  const openEditDialog = (reel: Reel) => {
    setEditingReel(reel)
    setFormTitle(reel.title)
    setFormImageUrl(reel.image_url)
    setFormLinkUrl(reel.link_url || '')
    setFormOrder(reel.order_index)
    setFormActive(reel.is_active)
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formImageUrl.trim()) {
      setFeedback({ type: 'error', text: 'Title and image URL are required.' })
      return
    }

    setSaving(true)
    try {
      if (editingReel) {
        // Update
        const res = await fetch('/api/admin/reels', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingReel.id,
            title: formTitle.trim(),
            image_url: formImageUrl.trim(),
            link_url: formLinkUrl.trim() || null,
            order_index: Number(formOrder),
            is_active: formActive,
          }),
        })
        const data = await res.json()
        if (!res.ok || data.error) {
          setFeedback({ type: 'error', text: data.error || 'Failed to update reel' })
        } else {
          setReels((prev) =>
            prev.map((r) => (r.id === editingReel.id ? data.reel : r)).sort((a, b) => a.order_index - b.order_index)
          )
          setDialogOpen(false)
          setFeedback({ type: 'success', text: `Reel "${formTitle}" updated successfully.` })
          setTimeout(() => setFeedback(null), 3000)
        }
      } else {
        // Create
        const res = await fetch('/api/admin/reels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle.trim(),
            image_url: formImageUrl.trim(),
            link_url: formLinkUrl.trim() || null,
            order_index: Number(formOrder),
            is_active: formActive,
          }),
        })
        const data = await res.json()
        if (!res.ok || data.error) {
          setFeedback({ type: 'error', text: data.error || 'Failed to create reel' })
        } else {
          setReels((prev) => [...prev, data.reel].sort((a, b) => a.order_index - b.order_index))
          setDialogOpen(false)
          setFeedback({ type: 'success', text: `Reel "${formTitle}" created successfully.` })
          setTimeout(() => setFeedback(null), 3000)
        }
      }
    } catch {
      setFeedback({ type: 'error', text: 'Network error saving reel.' })
    } finally {
      setSaving(false)
    }
  }

  // Toggle active status
  const handleToggleActive = async (reel: Reel) => {
    const newStatus = !reel.is_active
    try {
      const res = await fetch('/api/admin/reels', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reel.id, is_active: newStatus }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setFeedback({ type: 'error', text: data.error || 'Failed to update status' })
      } else {
        setReels((prev) => prev.map((r) => (r.id === reel.id ? { ...r, is_active: newStatus } : r)))
        setFeedback({
          type: 'success',
          text: `Reel "${reel.title}" is now ${newStatus ? 'active' : 'hidden'}.`,
        })
        setTimeout(() => setFeedback(null), 3000)
      }
    } catch {
      setFeedback({ type: 'error', text: 'Network error updating reel.' })
    }
  }

  // Delete reel
  const handleDelete = async (reel: Reel) => {
    if (!window.confirm(`Are you sure you want to delete the reel "${reel.title}"?`)) return
    try {
      const res = await fetch(`/api/admin/reels?id=${reel.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || data.error) {
        setFeedback({ type: 'error', text: data.error || 'Failed to delete reel' })
      } else {
        setReels((prev) => prev.filter((r) => r.id !== reel.id))
        setFeedback({ type: 'success', text: `Reel "${reel.title}" deleted.` })
        setTimeout(() => setFeedback(null), 3000)
      }
    } catch {
      setFeedback({ type: 'error', text: 'Network error deleting reel.' })
    }
  }

  // Restore initial 6 default reels
  const handleRestoreDefaults = async () => {
    if (!window.confirm('Restore initial 6 wellness gallery reels into the database?')) return
    setRefreshing(true)
    try {
      const res = await fetch('/api/admin/reels?action=seed', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || data.error) {
        setFeedback({ type: 'error', text: data.error || 'Failed to restore default reels' })
      } else {
        fetchReels()
        setFeedback({ type: 'success', text: 'Default reels successfully added to the database!' })
        setTimeout(() => setFeedback(null), 3000)
      }
    } catch {
      setFeedback({ type: 'error', text: 'Network error restoring defaults.' })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-border bg-card gap-4 flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Reel Section Images</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage images, captions, and links for the sanctuary gallery reels section across the site
          </p>
        </div>
        <div className="flex items-center gap-2">
          {reels.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestoreDefaults}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-[#66948a] border-[#66948a]/30 hover:bg-[#66948a]/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Load Default Reels
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReels(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={openCreateDialog}
            className="flex items-center gap-1.5 text-xs bg-[#66948a] hover:bg-[#52776e] text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Reel
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Feedback alert */}
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

        {/* Info banner */}
        <div className="p-4 rounded-xl border border-[#66948a]/20 bg-[#66948a]/5 flex items-start gap-3 text-xs sm:text-sm text-foreground">
          <Film className="w-5 h-5 text-[#66948a] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#66948a]">Live Sync: </span>
            Reels configured here are displayed in the 6-column gallery strip across the website
            (Home, About, Careers, and Contact pages). You can change image URLs, edit captions, reorder items, or toggle visibility.
          </div>
        </div>

        {/* Reel Grid / Cards */}
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#66948a]" />
            Loading reels...
          </div>
        ) : reels.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
            <Film className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <div className="font-medium text-foreground text-base">No reels found in database</div>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              You can add custom reels or click &quot;Load Default Reels&quot; to populate the initial 6 wellness gallery items.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button
                size="sm"
                onClick={handleRestoreDefaults}
                className="bg-[#66948a] hover:bg-[#52776e] text-white text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Load Default 6 Reels
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openCreateDialog}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Custom Reel
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {reels.map((reel) => (
              <div
                key={reel.id}
                className={cn(
                  'bg-card rounded-xl border overflow-hidden flex flex-col shadow-sm transition-all hover:shadow-md',
                  !reel.is_active && 'opacity-60 border-dashed border-gray-300'
                )}
              >
                {/* Image card preview */}
                <div className="relative aspect-[9/13] overflow-hidden bg-gray-100">
                  <Image
                    src={reel.image_url}
                    alt={reel.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                    <p className="text-xs font-serif text-[#fffdf5] font-semibold tracking-wide drop-shadow leading-snug">
                      {reel.title}
                    </p>
                  </div>
                  {/* Order badge */}
                  <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    #{reel.order_index}
                  </span>
                  {/* Active status pill */}
                  <span
                    className={cn(
                      'absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm',
                      reel.is_active
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-gray-800/80 text-gray-300'
                    )}
                  >
                    {reel.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>

                {/* Details and Actions */}
                <div className="p-3 flex-1 flex flex-col justify-between gap-2 text-xs">
                  <div>
                    <div className="font-semibold text-foreground truncate" title={reel.title}>
                      {reel.title}
                    </div>
                    {reel.link_url && (
                      <a
                        href={reel.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#66948a] hover:underline flex items-center gap-1 mt-0.5 truncate"
                        title={reel.link_url}
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{reel.link_url}</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
                    <button
                      onClick={() => handleToggleActive(reel)}
                      className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted"
                      title={reel.is_active ? 'Hide reel' : 'Show reel'}
                    >
                      {reel.is_active ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditDialog(reel)}
                        className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted"
                        title="Edit reel"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(reel)}
                        className="text-muted-foreground hover:text-red-600 p-1 rounded hover:bg-red-50"
                        title="Delete reel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialog for Add / Edit */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editingReel ? 'Edit Reel Image' : 'Add New Reel Image'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Title / Caption (required)
                </label>
                <Input
                  placeholder="e.g. Therapy & Counseling"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Image URL (required)
                </label>
                <Input
                  placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  required
                  className="text-sm font-mono text-xs"
                />
                {formImageUrl && (
                  <div className="mt-2 relative aspect-[9/13] max-h-36 rounded-lg overflow-hidden border border-border bg-muted/40">
                    <Image
                      src={formImageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                      <span className="text-xs text-white font-serif">{formTitle || 'Preview'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Link URL (optional)
                </label>
                <Input
                  placeholder="https://www.instagram.com/p/... or /services"
                  value={formLinkUrl}
                  onChange={(e) => setFormLinkUrl(e.target.value)}
                  className="text-sm font-mono text-xs"
                />
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  Optional: If set, users clicking this card will navigate to this link.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col justify-end pb-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#66948a] focus:ring-[#66948a]"
                    />
                    Active & Visible
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="text-xs bg-[#66948a] hover:bg-[#52776e] text-white"
                >
                  {saving ? 'Saving...' : editingReel ? 'Update Reel' : 'Add Reel'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
