'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const nextTheme = saved === 'dark' || (!saved && prefersDark) ? 'dark' : 'light'

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(nextTheme)
    setMounted(true)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!mounted) return

    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [mounted, theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  const links = [
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface/95 border-b border-border backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-0.5 font-space text-lg font-bold tracking-tight text-foreground"
          >
            NEPASET
            <span className="inline-block w-1.5 h-1.5 bg-foreground rounded-full mb-0.5 ml-0.5" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`font-inter text-sm transition-colors ${
                  isActive(l.href)
                    ? 'text-foreground font-medium'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1">

            {/* Account — icon fills when logged in */}
            <Link
              href={user ? '/account' : '/auth/login'}
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-surface-2 transition-colors text-foreground"
              title={user ? 'My account' : 'Sign in'}
            >
              {user ? (
                // Filled user icon when authenticated
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </Link>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-md border border-transparent hover:border-border hover:bg-surface-2 transition-colors text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              aria-label="Toggle theme"
              aria-pressed={theme === 'dark'}
              title="Toggle theme"
            >
              <svg className="block dark:hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
              <svg className="hidden dark:block" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.55 1.55M17.55 17.55l1.55 1.55M2 12h2.2M19.8 12H22M4.9 19.1l1.55-1.55M17.55 6.45l1.55-1.55" />
              </svg>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(prev => !prev)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-surface-2 transition-colors text-foreground"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? (
                // X icon
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                // Hamburger
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>

          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-surface">
            <nav className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              {links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`font-inter text-sm px-3 py-2.5 rounded-md transition-colors ${
                    isActive(l.href)
                      ? 'text-foreground font-medium bg-surface-2'
                      : 'text-muted hover:text-foreground hover:bg-surface-2'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="border-t border-border mt-2 pt-2">
                <Link
                  href={user ? '/account' : '/auth/login'}
                  onClick={() => setMobileOpen(false)}
                  className="font-inter text-sm px-3 py-2.5 rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {user ? 'My Account' : 'Sign In'}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}