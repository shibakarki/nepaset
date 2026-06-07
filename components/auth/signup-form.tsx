'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignupForm() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: `${firstName} ${lastName}`.trim() },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="font-space font-semibold text-black mb-1">Check your email</h3>
        <p className="text-sm text-neutral-500 font-inter">
          We sent a confirmation link to <span className="text-black font-medium">{email}</span>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1.5 font-inter">
            First name
          </label>
          <input
            type="text"
            required
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Aryan"
            className="w-full h-10 px-3 text-sm border border-neutral-200 rounded-md bg-neutral-50 text-black placeholder:text-neutral-400 focus:outline-none focus:border-black focus:bg-white transition-colors font-inter"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1.5 font-inter">
            Last name
          </label>
          <input
            type="text"
            required
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Thapa"
            className="w-full h-10 px-3 text-sm border border-neutral-200 rounded-md bg-neutral-50 text-black placeholder:text-neutral-400 focus:outline-none focus:border-black focus:bg-white transition-colors font-inter"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1.5 font-inter">
          Email address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full h-10 px-3 text-sm border border-neutral-200 rounded-md bg-neutral-50 text-black placeholder:text-neutral-400 focus:outline-none focus:border-black focus:bg-white transition-colors font-inter"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1.5 font-inter">
          Password
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full h-10 px-3 text-sm border border-neutral-200 rounded-md bg-neutral-50 text-black placeholder:text-neutral-400 focus:outline-none focus:border-black focus:bg-white transition-colors font-inter"
        />
        <p className="text-xs text-neutral-400 mt-1 font-inter">Min. 8 characters</p>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-inter">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 bg-black text-white text-sm font-semibold rounded-md hover:bg-neutral-800 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-space tracking-wide"
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}