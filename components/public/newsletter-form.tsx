'use client'

import React, { useState } from 'react'

interface NewsletterFormProps {
  primaryColor?: string
  secondaryColor?: string
  foregroundColor?: string
  layout?: 'row' | 'col'
}

export function NewsletterForm({
  primaryColor = '#66948a',
  secondaryColor = '#fffdf5',
  foregroundColor = '#1a1a1a',
  layout = 'row',
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setStatus(null)

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setStatus({ type: 'error', message: data.error || 'Failed to subscribe. Please try again.' })
      } else {
        setStatus({ type: 'success', message: data.message || 'Thank you for subscribing!' })
        setEmail('')
      }
    } catch {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className={`flex ${layout === 'col' ? 'flex-col' : 'flex-col sm:flex-row'} gap-3 sm:gap-4`}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status) setStatus(null)
          }}
          placeholder="Email Address"
          required
          className="border-b px-0 py-2 text-sm focus:outline-none focus:ring-0 bg-transparent flex-1"
          style={{ borderColor: 'rgba(26, 26, 26, 0.3)', color: foregroundColor }}
        />
        <button
          type="submit"
          disabled={loading}
          className={`${
            layout === 'col' ? 'w-fit' : 'w-full sm:w-fit'
          } rounded-lg px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold transition-colors hover:opacity-90 disabled:opacity-50`}
          style={{ backgroundColor: primaryColor, color: secondaryColor }}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      {status && (
        <p
          className={`text-xs mt-2 ${
            status.type === 'success' ? 'text-emerald-700 font-medium' : 'text-red-600'
          }`}
        >
          {status.message}
        </p>
      )}
    </div>
  )
}
