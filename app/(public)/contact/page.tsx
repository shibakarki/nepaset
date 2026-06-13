'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type ContactForm = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(field: keyof ContactForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { error: insertError } = await supabase
        .from('contact_messages')
        .insert({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          subject: form.subject.trim() || null,
          message: form.message.trim(),
          status: 'unread'
        })

      if (insertError) throw insertError

      setSuccess(true)
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
    } catch (err: any) {
      console.error('Contact submit error:', err)
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link href="/shop" className="font-inter text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to shop
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 lg:gap-20 items-start">
        
        {/* ── Left Pane: Business Contact Details ── */}
        <aside className="space-y-8 lg:sticky lg:top-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-2">Contact Us</p>
            <h1 className="font-space text-3xl font-bold text-foreground tracking-tight leading-tight">
              Get in touch
            </h1>
            <p className="font-inter text-sm text-muted mt-2 leading-relaxed">
              Have a question about an order, a customization inquiry, or group orders? Send us a message and we&apos;ll get back to you shortly.
            </p>
          </div>

          <div className="border-t border-border pt-6 space-y-5">
            {/* Phone */}
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.79 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Call or WhatsApp</p>
                <p className="text-sm font-medium text-foreground mt-0.5">+977 9744421155</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Email Inquiry</p>
                <a href="mailto:nepaset21@gmail.com" className="text-sm font-medium text-foreground hover:underline mt-0.5 block">nepaset21@gmail.com</a>
              </div>
            </div>

            {/* Location */}
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Based in</p>
                <p className="text-sm font-medium text-foreground mt-0.5">Kathmandu, Nepal</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="border-t border-border pt-6">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Connect on socials</p>
            <div className="flex gap-2">
              <a
                href="https://www.instagram.com/nepaset/?utm_source=ig_web_button_share_sheet"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 border border-border bg-surface text-xs font-semibold rounded-lg text-muted hover:text-foreground hover:border-foreground transition-all flex items-center gap-1.5"
              >
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@nepaset?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 border border-border bg-surface text-xs font-semibold rounded-lg text-muted hover:text-foreground hover:border-foreground transition-all flex items-center gap-1.5"
              >
                TikTok
              </a>
              <a
                href="https://www.facebook.com/share/18gks8VFnH/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 border border-border bg-surface text-xs font-semibold rounded-lg text-muted hover:text-foreground hover:border-foreground transition-all flex items-center gap-1.5"
              >
                Facebook
              </a>
            </div>
          </div>
        </aside>

        {/* ── Right Pane: Clean Contact Form ── */}
        <section className="bg-surface border border-border rounded-xl p-6 md:p-8">
          {success ? (
            <div className="py-12 text-center max-w-sm mx-auto space-y-4">
              <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 rounded-full flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <h2 className="font-space text-lg font-bold text-foreground">Message Sent!</h2>
              <p className="font-inter text-xs text-muted leading-relaxed">
                Thank you for reaching out to NEPASET. Your inquiry has been successfully sent to our team, and we will get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-2 text-xs font-semibold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    required
                    placeholder="e.g., Shiba Sharma"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-surface-2 focus:outline-none focus:border-foreground transition-colors placeholder:text-muted/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    required
                    placeholder="e.g., support@nepaset.com"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-surface-2 focus:outline-none focus:border-foreground transition-colors placeholder:text-muted/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1.5">Phone Number <span className="text-muted/60">(optional)</span></label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="e.g., 98XXXXXXXX"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-surface-2 focus:outline-none focus:border-foreground transition-colors placeholder:text-muted/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => update('subject', e.target.value)}
                    required
                    placeholder="e.g., Custom hoodie bulk order"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-surface-2 focus:outline-none focus:border-foreground transition-colors placeholder:text-muted/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1.5">Message</label>
                <textarea
                  value={form.message}
                  onChange={e => update('message', e.target.value)}
                  required
                  rows={5}
                  placeholder="How can we help you? Please describe your query or design idea..."
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-surface-2 focus:outline-none focus:border-foreground transition-colors resize-none placeholder:text-muted/40"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-foreground text-background font-space text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all"
              >
                {sending ? 'Sending message…' : 'Send message'}
              </button>
            </form>
          )}
        </section>

      </div>
    </div>
  )
}