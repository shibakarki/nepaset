'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/account')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full h-10 px-3 text-sm border border-neutral-200 rounded-md bg-neutral-50 text-black placeholder:text-neutral-400 focus:outline-none focus:border-black focus:bg-white transition-colors font-inter"
        />
        <div className="text-right mt-1">
  <a href="/auth/forgot-password" className="text-xs text-neutral-400 hover:text-black transition-colors font-inter">Forgot password?</a>
</div>

      </div>

      {error && (
        <p className="text-xs text-red-500 font-inter">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 bg-black text-white text-sm font-semibold rounded-md hover:bg-neutral-800 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-space tracking-wide"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}