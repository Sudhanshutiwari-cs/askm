'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Plus, Search, Pencil, Trash2, ExternalLink,
  BookOpen, CheckCircle2, Clock, FileText, AlertCircle, Eye
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Blog, BlogStatus } from '@/types/blog'

const DEFAULT_CATEGORIES = [
  'Psychotherapy',
  'Yoga & Movement',
  'Mindfulness & Meditation',
  'Holistic Health',
  'Breathwork & Alignment',
  'Mental Wellness',
]

const DEFAULT_FEATURED_IMAGE =
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [autoSlug, setAutoSlug] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newSlug, setNewSlug] = useState('')

  // Edit modal state
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete modal state
  const [deletingBlog, setDeletingBlog] = useState<Blog | null>(null)
  const [deleteSaving, setDeleteSaving] = useState(false)

  // Fetch blogs
  async function loadBlogs() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blogs')
      const data = await res.json()
      if (data.blogs) {
        setBlogs(data.blogs)
      }
    } catch (err) {
      console.error('Failed to load blogs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBlogs()
  }, [])

  // Auto slug generation on create
  function handleTitleChange(val: string) {
    setNewTitle(val)
    if (autoSlug) {
      setNewSlug(slugify(val))
    }
  }

  // Handle Create Blog
  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreateSaving(true)
    setCreateError(null)

    const fd = new FormData(e.currentTarget)
    const title = (fd.get('title') as string) || ''
    const slug = (fd.get('slug') as string) || slugify(title)
    const category = (fd.get('category') as string) || ''
    const customCategory = (fd.get('custom_category') as string) || ''
    const finalCategory = customCategory.trim() || category.trim()
    const author_name = (fd.get('author_name') as string) || 'Dipanita Biswas'
    const author_image = (fd.get('author_image') as string) || null
    const featured_image = (fd.get('featured_image') as string) || null
    const excerpt = (fd.get('excerpt') as string) || null
    const content = (fd.get('content') as string) || ''
    const read_time = Number(fd.get('read_time')) || undefined
    const status = (fd.get('status') as BlogStatus) || 'draft'

    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          category: finalCategory,
          author_name,
          author_image,
          featured_image,
          excerpt,
          content,
          read_time,
          status,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setCreateError(data.error || 'Failed to create blog post')
        setCreateSaving(false)
        return
      }

      if (data.blog) {
        setBlogs((prev) => [data.blog, ...prev])
      }
      setCreateOpen(false)
      setNewTitle('')
      setNewSlug('')
      setAutoSlug(true)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setCreateSaving(false)
    }
  }

  // Handle Update Blog
  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingBlog) return

    setEditSaving(true)
    setEditError(null)

    const fd = new FormData(e.currentTarget)
    const title = (fd.get('title') as string) || ''
    const slug = (fd.get('slug') as string) || slugify(title)
    const category = (fd.get('category') as string) || ''
    const customCategory = (fd.get('custom_category') as string) || ''
    const finalCategory = customCategory.trim() || category.trim()
    const author_name = (fd.get('author_name') as string) || 'Dipanita Biswas'
    const author_image = (fd.get('author_image') as string) || null
    const featured_image = (fd.get('featured_image') as string) || null
    const excerpt = (fd.get('excerpt') as string) || null
    const content = (fd.get('content') as string) || ''
    const read_time = Number(fd.get('read_time')) || undefined
    const status = (fd.get('status') as BlogStatus) || 'draft'

    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingBlog.id,
          title,
          slug,
          category: finalCategory,
          author_name,
          author_image,
          featured_image,
          excerpt,
          content,
          read_time,
          status,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setEditError(data.error || 'Failed to update blog post')
        setEditSaving(false)
        return
      }

      if (data.blog) {
        setBlogs((prev) => prev.map((b) => (b.id === data.blog.id ? data.blog : b)))
      }
      setEditingBlog(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setEditSaving(false)
    }
  }

  // Quick toggle status between published and draft
  async function handleToggleStatus(blog: Blog) {
    const nextStatus: BlogStatus = blog.status === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: blog.id, status: nextStatus }),
      })
      const data = await res.json()
      if (data.blog) {
        setBlogs((prev) => prev.map((b) => (b.id === data.blog.id ? data.blog : b)))
      }
    } catch (err) {
      console.error('Failed to toggle blog status:', err)
    }
  }

  // Handle Delete Blog
  async function handleDelete() {
    if (!deletingBlog) return
    setDeleteSaving(true)
    try {
      const res = await fetch(`/api/admin/blogs?id=${deletingBlog.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok && !data.error) {
        setBlogs((prev) => prev.filter((b) => b.id !== deletingBlog.id))
        setDeletingBlog(null)
      } else {
        alert(data.error || 'Failed to delete blog')
      }
    } catch (err) {
      console.error('Failed to delete blog:', err)
      alert('An error occurred while deleting blog')
    } finally {
      setDeleteSaving(false)
    }
  }

  // Dynamic list of all categories from DB + defaults
  const allCategories = useMemo(() => {
    const set = new Set([...DEFAULT_CATEGORIES, ...blogs.map((b) => b.category).filter(Boolean)])
    return Array.from(set)
  }, [blogs])

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesSearch =
        search === '' ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        (b.excerpt && b.excerpt.toLowerCase().includes(search.toLowerCase())) ||
        b.author_name.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === 'all' || b.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [blogs, search, statusFilter, categoryFilter])

  // Stats
  const publishedCount = blogs.filter((b) => b.status === 'published').length
  const draftCount = blogs.filter((b) => b.status === 'draft').length
  const archivedCount = blogs.filter((b) => b.status === 'archived').length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#66948a]" />
            Blog Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, publish, and update wellness articles and resources.
          </p>
        </div>

        <Button
          onClick={() => {
            setNewTitle('')
            setNewSlug('')
            setAutoSlug(true)
            setCreateError(null)
            setCreateOpen(true)
          }}
          className="bg-[#66948a] hover:bg-[#4d7068] text-white shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Write New Blog
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Articles</div>
          <div className="text-2xl font-bold text-foreground mt-1">{blogs.length}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Published</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{publishedCount}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-amber-600 uppercase tracking-wider">Drafts</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{draftCount}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Archived</div>
          <div className="text-2xl font-bold text-gray-500 mt-1">{archivedCount}</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, category, or excerpt..."
            className="pl-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex h-9 w-full md:w-36 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex h-9 w-full md:w-44 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Blogs List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#66948a] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading blog posts...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <FileText className="w-10 h-10 mx-auto opacity-40 text-[#66948a]" />
            <p className="font-medium text-foreground">No blog posts found</p>
            <p className="text-sm">
              {search || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Click "Write New Blog" above to create your first article.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Published</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-muted/20 transition-colors">
                    {/* Article Thumbnail & Title */}
                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                          <Image
                            src={blog.featured_image || DEFAULT_FEATURED_IMAGE}
                            alt={blog.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate">{blog.title}</div>
                          <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono">/{blog.slug}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {blog.read_time} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant="secondary" className="font-normal text-xs bg-[#66948a]/10 text-[#66948a] border-none">
                        {blog.category}
                      </Badge>
                    </td>

                    {/* Author */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-xs font-medium text-foreground">{blog.author_name}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {blog.status === 'published' ? (
                        <button
                          onClick={() => handleToggleStatus(blog)}
                          title="Click to unpublish / convert to draft"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Published
                        </button>
                      ) : blog.status === 'draft' ? (
                        <button
                          onClick={() => handleToggleStatus(blog)}
                          title="Click to publish article"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          Draft
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                          Archived
                        </span>
                      )}
                    </td>

                    {/* Published Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {blog.status === 'published' && (
                          <Link
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Preview on website"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingBlog(blog)
                            setEditError(null)
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-[#66948a]"
                          title="Edit blog post"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingBlog(blog)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete blog post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE BLOG DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#66948a]" />
              Write New Blog Post
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            {createError && (
              <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="create-title">Title *</Label>
              <Input
                id="create-title"
                name="title"
                required
                value={newTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. 5 Mindfulness Exercises to Reduce Anxiety"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="create-slug">URL Slug *</Label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-xs text-[#66948a] hover:underline"
                >
                  {autoSlug ? 'Customize slug manually' : 'Auto-generate from title'}
                </button>
              </div>
              <Input
                id="create-slug"
                name="slug"
                required
                value={newSlug}
                onChange={(e) => {
                  setAutoSlug(false)
                  setNewSlug(e.target.value)
                }}
                placeholder="5-mindfulness-exercises-to-reduce-anxiety"
              />
              <p className="text-[11px] text-muted-foreground">
                Public URL will be: <code className="bg-muted px-1 py-0.5 rounded">/blog/{newSlug || 'your-slug'}</code>
              </p>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-category">Category *</Label>
                <select
                  id="create-category"
                  name="category"
                  defaultValue={DEFAULT_CATEGORIES[0]}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-custom-category">Or Custom Category</Label>
                <Input
                  id="create-custom-category"
                  name="custom_category"
                  placeholder="Optional custom category"
                />
              </div>
            </div>

            {/* Status & Read Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-status">Publication Status</Label>
                <select
                  id="create-status"
                  name="status"
                  defaultValue="draft"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="draft">Draft (Visible only to admins)</option>
                  <option value="published">Published (Live on website)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-readtime">Read Time (minutes)</Label>
                <Input
                  id="create-readtime"
                  name="read_time"
                  type="number"
                  min="1"
                  placeholder="Leave empty to auto-calculate"
                />
              </div>
            </div>

            {/* Author Name & Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-author">Author Name *</Label>
                <Input
                  id="create-author"
                  name="author_name"
                  defaultValue="Dipanita Biswas"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-author-img">Author Image URL</Label>
                <Input
                  id="create-author-img"
                  name="author_image"
                  placeholder="https://... (optional)"
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-1.5">
              <Label htmlFor="create-featured-img">Featured Image URL</Label>
              <Input
                id="create-featured-img"
                name="featured_image"
                placeholder="https://images.unsplash.com/... (optional)"
              />
              <p className="text-[11px] text-muted-foreground">
                High resolution landscape image recommended (e.g. Unsplash URL).
              </p>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <Label htmlFor="create-excerpt">Excerpt / Short Summary</Label>
              <Textarea
                id="create-excerpt"
                name="excerpt"
                rows={2}
                placeholder="Brief summary appearing on blog cards and social previews..."
              />
            </div>

            {/* Full Content */}
            <div className="space-y-1.5">
              <Label htmlFor="create-content">Article Content *</Label>
              <Textarea
                id="create-content"
                name="content"
                rows={10}
                required
                placeholder="Write your article here. Supports paragraphs and markdown formatting..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#66948a] hover:bg-[#4d7068] text-white"
                disabled={createSaving}
              >
                {createSaving ? 'Saving...' : 'Create Post'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT BLOG DIALOG */}
      <Dialog
        open={!!editingBlog}
        onOpenChange={(open) => {
          if (!open) setEditingBlog(null)
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#66948a]" />
              Edit Blog Post
            </DialogTitle>
          </DialogHeader>

          {editingBlog && (
            <form onSubmit={handleEdit} className="space-y-4 mt-2">
              {editError && (
                <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  name="title"
                  required
                  defaultValue={editingBlog.title}
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-slug">URL Slug *</Label>
                <Input
                  id="edit-slug"
                  name="slug"
                  required
                  defaultValue={editingBlog.slug}
                />
                <p className="text-[11px] text-muted-foreground">
                  Public URL: <code className="bg-muted px-1 py-0.5 rounded">/blog/{editingBlog.slug}</code>
                </p>
              </div>

              {/* Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-category">Category *</Label>
                  <select
                    id="edit-category"
                    name="category"
                    defaultValue={editingBlog.category}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    {allCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-custom-category">Or Custom Category</Label>
                  <Input
                    id="edit-custom-category"
                    name="custom_category"
                    placeholder="Override with new category"
                  />
                </div>
              </div>

              {/* Status & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-status">Publication Status</Label>
                  <select
                    id="edit-status"
                    name="status"
                    defaultValue={editingBlog.status}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="draft">Draft (Visible only to admins)</option>
                    <option value="published">Published (Live on website)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-readtime">Read Time (minutes)</Label>
                  <Input
                    id="edit-readtime"
                    name="read_time"
                    type="number"
                    min="1"
                    defaultValue={editingBlog.read_time}
                  />
                </div>
              </div>

              {/* Author Name & Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-author">Author Name *</Label>
                  <Input
                    id="edit-author"
                    name="author_name"
                    defaultValue={editingBlog.author_name}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-author-img">Author Image URL</Label>
                  <Input
                    id="edit-author-img"
                    name="author_image"
                    defaultValue={editingBlog.author_image || ''}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Featured Image */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-featured-img">Featured Image URL</Label>
                <Input
                  id="edit-featured-img"
                  name="featured_image"
                  defaultValue={editingBlog.featured_image || ''}
                  placeholder="https://..."
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-excerpt">Excerpt / Short Summary</Label>
                <Textarea
                  id="edit-excerpt"
                  name="excerpt"
                  rows={2}
                  defaultValue={editingBlog.excerpt || ''}
                />
              </div>

              {/* Full Content */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-content">Article Content *</Label>
                <Textarea
                  id="edit-content"
                  name="content"
                  rows={10}
                  required
                  defaultValue={editingBlog.content}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingBlog(null)}
                  disabled={editSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#66948a] hover:bg-[#4d7068] text-white"
                  disabled={editSaving}
                >
                  {editSaving ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={!!deletingBlog}
        onOpenChange={(open) => {
          if (!open) setDeletingBlog(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Blog Post
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong className="text-foreground">{deletingBlog?.title}</strong>? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingBlog(null)}
              disabled={deleteSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSaving}
            >
              {deleteSaving ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
