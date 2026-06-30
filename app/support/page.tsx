'use client'

import { FormEvent, useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/components/theme-selector'
import { AlertCircle, CheckCircle, MessageSquare } from 'lucide-react'

export default function SupportPage() {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setStatus('pending')

    if (!name.trim()) {
      setError('Please enter your name.')
      setStatus('error')
      return
    }

    if (!subject.trim()) {
      setError('Please enter a subject for your request.')
      setStatus('error')
      return
    }

    if (!message.trim()) {
      setError('Please describe your request or issue.')
      setStatus('error')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, subject, message }),
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          const errorMessage = body.error?.message || 'Unable to submit support request.'
          throw new Error(errorMessage)
        }

        setName('')
        setSubject('')
        setMessage('')
        setStatus('success')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to submit support request.')
        setStatus('error')
      }
    })
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <main className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex-1 rounded-3xl border border-border/50 bg-card p-10 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  <MessageSquare className="h-4 w-4" /> Support
                </div>
                <h1 className="mt-4 text-4xl font-bold">Contact support securely</h1>
                <p className="mt-3 text-muted-foreground">
                  Submit your request with your name, subject, and issue details. We will email your ticket to <span className="font-semibold text-foreground">tj1599509mail.com</span> and keep it linked to your InvestIQ account.
                </p>
              </div>
              <Button nativeButton={false} variant="secondary" render={<Link href="/pricing">Upgrade</Link>}>
                Upgrade for priority support
              </Button>
            </div>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <label htmlFor="support-name" className="text-sm font-semibold text-foreground">
                    Your name
                  </label>
                  <input
                    id="support-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-3xl border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-3">
                  <label htmlFor="support-subject" className="text-sm font-semibold text-foreground">
                    Subject
                  </label>
                  <input
                    id="support-subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className="w-full rounded-3xl border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Example: PDF export issue"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="support-message" className="text-sm font-semibold text-foreground">
                  Describe your request
                </label>
                <textarea
                  id="support-message"
                  rows={8}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full rounded-3xl border border-border bg-background/80 px-4 py-4 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Describe the issue, question, or feature request you have."
                />
              </div>

              {status === 'success' && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Your support request was submitted successfully.
                </div>
              )}

              {status === 'error' && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                  {isPending ? 'Sending...' : 'Send request'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Need immediate help? <Link href="/pricing" className="text-primary hover:underline">Upgrade for priority handling</Link>.
                </p>
              </div>
            </form>
          </div>

          <div className="space-y-6 lg:w-90">
            <div className="rounded-3xl border border-border/70 bg-background/80 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Support at a glance</p>
              <h2 className="mt-4 text-lg font-semibold text-foreground">Fast, secure, accountable</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">Secure messaging</span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900">Account-based</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">Priority routing</span>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">AI insights</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Every request is routed through InvestIQ so your issue is tracked securely and action items stay linked to your analysis activity.
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/80 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why contact us?</p>
              <h2 className="mt-4 text-lg font-semibold text-foreground">Get help faster</h2>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li className="rounded-2xl border border-border/50 bg-muted/40 p-4">
                  <strong className="text-foreground">Bug reports</strong>
                  <p className="mt-1">Tell us about issues in analysis, export, or theme rendering.</p>
                </li>
                <li className="rounded-2xl border border-border/50 bg-muted/40 p-4">
                  <strong className="text-foreground">Feature requests</strong>
                  <p className="mt-1">Share ideas for better scoring, reports, or UI improvements.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-3xl border border-border/50 bg-card p-10 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Theme library</p>
              <h2 className="mt-4 text-3xl font-bold">VS Code-style themes, fonts, and colors</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl">
                Choose your workspace vibe with modern dark, warm premium, and classic editor-inspired color palettes. Apply the theme and preview fonts used in a developer toolbar style layout.
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Preview your theme</p>
              <p className="text-xs text-muted-foreground mb-3">Try each theme from the selector below.</p>
              <ThemeSelector />
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-border/70 bg-background/80 p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Auto</p>
              <p className="mt-2 text-sm text-muted-foreground">Adaptive theme that follows your OS and browser preference.</p>
              <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-foreground">Default editor</p>
                <p className="mt-2 text-xs text-muted-foreground">Neutral, bright, and easy to read across light/dark modes.</p>
              </div>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/80 p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Midnight</p>
              <p className="mt-2 text-sm text-muted-foreground">Dark VS Code-inspired palette for focused work sessions.</p>
              <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-100">
                <p className="text-sm font-semibold">Dark editor</p>
                <p className="mt-2 text-xs text-slate-400">Rich contrast with bold syntax-like accents.</p>
              </div>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/80 p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Golden</p>
              <p className="mt-2 text-sm text-muted-foreground">Premium warm tone with accent highlights and polished typography.</p>
              <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">Luxury mode</p>
                <p className="mt-2 text-xs text-amber-700">Warm gold accents for a modern trading interface.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-border/70 bg-background/80 p-6 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Font & color preview</p>
            <div className="mt-5 space-y-4 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-border/50 bg-muted/40 p-4">
                <p className="font-semibold text-foreground">Primary UI</p>
                <p className="mt-1">Inter / Inter UI — clean, versatile, ideal for dashboards and panels.</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-muted/40 p-4">
                <p className="font-semibold text-foreground">Code-style</p>
                <p className="mt-1 font-mono">JetBrains Mono / Fira Code — readable, styled for developer workflows.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
