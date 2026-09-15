'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Image as ImageIcon, RefreshCw, Pencil, ExternalLink,
  RotateCcw, Check, AlertCircle, Eye, Sparkles
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

interface HeroConfig {
  id?: string
  page_key: string
  page_name: string
  image_url: string
  secondary_image_url?: string | null
  alt_text?: string | null
  updated_at?: string
}

const PAGE_ROUTES: Record<string, string> = {
  home: '/',
  about: '/about',
  services: '/services',
  careers: '/careers',
  contact: '/contact',
}

export default function AdminHeroesPage() {
  const [heroes, setHeroes] = useState<HeroConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHero, setEditingHero] = useState<HeroConfig | null>(null)
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formSecondaryImageUrl, setFormSecondaryImageUrl] = useState('')
  const [formAltText, setFormAltText] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchHeroes = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/admin/heroes')
      const data = await res.json()
      if (data.error) {
        setFeedback({ type: 'error', text: data.error })
      } else {
        setHeroes(data.heroes ?? [])
      }
    } catch {
      setFeedback({ type: 'error', text: 'Failed to load hero images.' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchHeroes()
  }, [fetchHeroes])

  const openEdit = (hero: HeroConfig) => {
    setEditingHero(hero)
    setFormImageUrl(hero.image_url || '')
    setFormSecondaryImageUrl(hero.secondary_image_url || '')
    setFormAltText(hero.alt_text || '')
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHero) return

    if (!formImageUrl.trim()) {
      setFeedback({ type: 'error', text: 'Image URL is required.' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/heroes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_key: editingHero.page_key,
          image_url: formImageUrl.trim(),
          secondary_image_url: formSecondaryImageUrl.trim() || null,
          alt_text: formAltText.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setFeedback({ type: 'error', text: data.error || 'Failed to update hero image' })
      } else {
        setHeroes((prev) =>
          prev.map((h) =>
            h.page_key === editingHero.page_key
              ? {
                  ...h,
                  image_url: formImageUrl.trim(),
                  secondary_image_url: formSecondaryImageUrl.trim() || null,
                  alt_text: formAltText.trim() || null,
                  updated_at: new Date().toISOString(),
                }
              : h
          )
        )
        setDialogOpen(false)
        setFeedback({
          type: 'success',
          text: `Hero image for ${editingHero.page_name} updated successfully!`,
        })
        setTimeout(() => setFeedback(null), 3500)
      }
    } catch {
      setFeedback({ type: 'error', text: 'Network error updating hero image.' })
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all page hero images to their default sanctuary photos?')) return
    setRefreshing(true)
    try {
      const res = await fetch('/api/admin/heroes?action=reset', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || data.error) {
        setFeedback({ type: 'error', text: data.error || 'Failed to reset hero images' })
      } else {
        fetchHeroes()
        setFeedback({ type: 'success', text: 'Hero images reset to default images.' })
        setTimeout(() => setFeedback(null), 3500)
      }
    } catch {
      setFeedback({ type: 'error', text: 'Network error resetting hero images.' })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-border bg-card gap-4 flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Page Hero Images</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage the hero section images across all pages of your website
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore All Defaults
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchHeroes(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Feedback Alert */}
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

        {/* Info Banner */}
        <div className="p-4 rounded-xl border border-[#66948a]/20 bg-[#66948a]/5 flex items-start gap-3 text-xs sm:text-sm text-foreground">
          <Sparkles className="w-5 h-5 text-[#66948a] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#66948a]">Dynamic Hero Control: </span>
            Update the hero section image for any page below. Any image URL (Unsplash, Cloudinary, or custom CDN) will immediately update on the public website.
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#66948a]" />
            Loading page hero images...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {heroes.map((hero) => {
              const route = PAGE_ROUTES[hero.page_key] || '/'
              return (
                <div
                  key={hero.page_key}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Card Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                      <div>
                        <h3 className="font-heading font-bold text-foreground text-base">
                          {hero.page_name}
                        </h3>
                        <span className="font-mono text-xs text-muted-foreground">
                          {route}
                        </span>
                      </div>
                      <a
                        href={route}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-muted transition-colors"
                        title="View page live"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Image Preview */}
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                          {hero.secondary_image_url ? 'Primary Hero Image' : 'Hero Image'}
                        </span>
                        <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-muted/50 border border-border">
                          <Image
                            src={hero.image_url}
                            alt={hero.alt_text || hero.page_name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </div>

                      {hero.secondary_image_url && (
                        <div>
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                            Secondary Hero Image
                          </span>
                          <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-muted/50 border border-border">
                            <Image
                              src={hero.secondary_image_url}
                              alt="Secondary photo"
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </div>
                      )}

                      {hero.alt_text && (
                        <p className="text-xs text-muted-foreground line-clamp-1 italic">
                          &quot;{hero.alt_text}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 pt-0">
                    <Button
                      onClick={() => openEdit(hero)}
                      className="w-full text-xs font-semibold bg-[#66948a] hover:bg-[#52776e] text-white flex items-center justify-center gap-2"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Change Hero Image
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">
                Change Hero Image &mdash; {editingHero?.page_name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Primary Image URL (required)
                </label>
                <Input
                  placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  required
                  className="text-xs font-mono"
                />
                {formImageUrl && (
                  <div className="mt-2 relative aspect-[16/9] rounded-lg overflow-hidden border border-border bg-muted/30">
                    <Image
                      src={formImageUrl}
                      alt="Primary Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              {editingHero?.page_key === 'careers' && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Secondary Image URL (optional)
                  </label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={formSecondaryImageUrl}
                    onChange={(e) => setFormSecondaryImageUrl(e.target.value)}
                    className="text-xs font-mono"
                  />
                  {formSecondaryImageUrl && (
                    <div className="mt-2 relative aspect-[16/9] rounded-lg overflow-hidden border border-border bg-muted/30">
                      <Image
                        src={formSecondaryImageUrl}
                        alt="Secondary Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Alt Text / Description (optional)
                </label>
                <Input
                  placeholder="Descriptive text for accessibility and SEO"
                  value={formAltText}
                  onChange={(e) => setFormAltText(e.target.value)}
                  className="text-xs"
                />
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
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
