'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useCart } from '@/hooks/useCart'
import { CartDrawer } from '@/components/layout/CartDrawer'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isFloating, setIsFloating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { openCart, totalItems } = useCart()
  const itemCount = totalItems()

  // 1. Theme and Authentication Setup
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const nextTheme = saved === 'dark' || (!saved && prefersDark) ? 'dark' : 'light'
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

  // 2. Scroll Listener for "Dynamic Island" Morphing Search Bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setIsFloating(true)
      } else {
        setIsFloating(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 3. Scroll lock when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setMobileOpen(false)
    router.push('/')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setMobileOpen(false)
    }
  }

  const links = [
    { href: '/shop', label: 'Shop All' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Support' },
  ]

  const categories = [
    { href: '/shop?category=tshirt', label: '👕 T-Shirts' },
    { href: '/shop?category=shirt', label: '👔 Shirts' },
    { href: '/shop?category=phone-case', label: '📱 Phone Cases' },
    { href: '/shop?category=earbuds', label: '🎧 Earbuds' },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <CartDrawer />

      {/* --- 1. STICKY HEADER (Slides out when scrolling down) --- */}
      <header className={`sticky top-0 z-40 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        isFloating ? '-translate-y-full' : 'translate-y-0'
      } bg-surface/95 border-b border-border backdrop-blur-sm h-14`}>
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-0.5 font-space text-lg font-bold tracking-tight text-foreground shrink-0 z-10"
          >
            NEPASET
            <span className="inline-block w-1.5 h-1.5 bg-foreground rounded-full mb-0.5 ml-0.5" />
          </Link>

          {/* Desktop Nav Links (Perfectly Centered on Desktop) */}
          <nav className="hidden md:flex items-center gap-7 shrink-0">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`font-inter text-sm transition-colors ${
                  isActive(l.href)
                    ? 'text-foreground font-semibold'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Header Controls */}
          <div className="flex items-center gap-0.5 z-10">

            {/* INTEGRATED DESKTOP SEARCH BAR (Repositioned to the Left of the Cart) */}
            {!isFloating && (
              <form 
                onSubmit={handleSearchSubmit}
                className="hidden md:flex items-center gap-2 h-9 w-[180px] lg:w-[240px] px-3.5 rounded-xl border border-white/50 dark:border-neutral-800/50 bg-white/30 dark:bg-neutral-900/30 backdrop-blur-md mr-2.5 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.02)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <input 
                  type="text"
                  placeholder="Search NEPASET..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted/60 w-full"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    className="text-muted hover:text-foreground text-xs font-semibold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </form>
            )}

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative w-10 h-10 flex items-center justify-center rounded-md hover:bg-surface-2 transition-colors text-foreground cursor-pointer"
              aria-label="Open cart"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {mounted && itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-foreground text-background text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Account (Hidden on Mobile Header, present in Drawer instead to save space) */}
            <Link
              href={user ? '/account' : '/auth/login'}
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-md hover:bg-surface-2 transition-colors text-foreground"
              title={user ? 'My account' : 'Sign in'}
            >
              {user ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </Link>

            {/* Theme toggle (Hidden on Mobile Header, present in Drawer instead) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-md hover:bg-surface-2 transition-colors text-foreground cursor-pointer focus-visible:outline-none"
              aria-label="Toggle theme"
            >
              <svg className="block dark:hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
              <svg className="hidden dark:block" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.55 1.55M17.55 17.55l1.55 1.55M2 12h2.2M19.8 12H22M4.9 19.1l1.55-1.55M17.55 6.45l1.55-1.55" />
              </svg>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(prev => !prev)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-md hover:bg-surface-2 transition-colors text-foreground cursor-pointer"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* --- 2. THE FLOATING / MOBILE INTEGRATED SEARCH BAR (With Liquid Glass sheen) --- */}
      <div className={`pointer-events-none fixed left-1/2 -translate-x-1/2 w-full max-w-6xl px-4 z-45 transition-all duration-500 ${
        isFloating ? 'top-2.5' : 'top-3 md:hidden' // Hidden on desktop when not floating (md:hidden)
      }`}>
        <div className="relative w-full h-8 flex items-center justify-center">
          <form 
            onSubmit={handleSearchSubmit}
            className={`pointer-events-auto font-space text-xs px-4 py-3 border border-border bg-surface-2 rounded-xl text-foreground font-semibold hover:bg-surface active:scale-[0.98] transition-all flex items-center justify-between ${
              isFloating 
                ? 'w-[200px] sm:w-[280px] h-9 rounded-full border border-white/50 dark:border-neutral-800/50 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-2'
                : 'w-[130px] sm:w-[180px] h-8 rounded-lg border border-white/50 dark:border-neutral-800/50 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md flex items-center gap-2'
            }`}
          >
            {/* Search Icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            
            {/* Input field */}
            <input 
              type="text"
              placeholder={isFloating ? "Search..." : "Search NEPASET..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted/60 w-full h-full focus:ring-0"
            />
            
            {/* Clear query button */}
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="text-muted hover:text-foreground text-xs font-semibold cursor-pointer"
              >
                ✕
              </button>
            )}
          </form>
        </div>
      </div>

      {/* --- 3. MOBILE MENU DRAWER (Locked at absolute highest z-index z-[9999]) --- */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 bottom-0 top-14 z-[9999] bg-black/40 dark:bg-black/70 backdrop-blur-sm">
          <div className="bg-surface border-b border-border h-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
            
            <div className="max-w-6xl mx-auto w-full px-4 py-5 space-y-6">
              
              {/* Account Card */}
              {user ? (
                <div className="bg-surface-2 border border-border rounded-xl p-4 flex flex-col gap-3">
                  <div>
                    <p className="font-inter text-[10px] tracking-wider uppercase text-muted font-bold">Logged In Account</p>
                    <p className="font-space text-sm font-semibold text-foreground truncate mt-0.5">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center font-space text-xs font-semibold bg-surface border border-border text-foreground py-2 rounded-lg hover:bg-surface-2 transition-colors active:scale-[0.98]"
                    >
                      My Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex-1 text-center font-space text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 py-2 rounded-lg active:scale-[0.98] cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0a0a0a] dark:bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-2">
                  <p className="font-space text-sm font-semibold text-white">Join the Community</p>
                  <p className="font-inter text-xs text-neutral-400">Sign in to track orders, manage addresses, and save designs.</p>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-center font-space text-xs font-semibold bg-white text-[#0a0a0a] py-2.5 rounded-lg active:scale-[0.98] transition-transform mt-1"
                  >
                    Sign In / Register
                  </Link>
                </div>
              )}

              {/* Visual Categories Grid */}
              <div className="space-y-3">
                <p className="font-space text-xs font-bold tracking-widest uppercase text-muted">Shop by Category</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setMobileOpen(false)}
                      className="font-space text-xs px-4 py-3 border border-border bg-surface-2 rounded-xl text-foreground font-semibold hover:bg-surface active:scale-[0.98] transition-all flex items-center justify-between"
                    >
                      {cat.label}
                      <span className="text-[10px] text-muted">→</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                <p className="font-space text-xs font-bold tracking-widest uppercase text-muted">Pages</p>
                <nav className="flex flex-col gap-1.5">
                  {links.map(l => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className={`font-inter text-sm px-4 py-3 rounded-xl transition-all ${
                        isActive(l.href)
                          ? 'text-foreground font-semibold bg-surface-2 border border-border/50'
                          : 'text-muted hover:text-foreground hover:bg-surface-2 border border-transparent'
                      }`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Social Links */}
              <div className="space-y-3 pt-2 border-t border-border">
                <p className="font-space text-xs font-bold tracking-widest uppercase text-muted text-center">Follow & Connect</p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href="https://www.instagram.com/nepaset/?utm_source=ig_web_button_share_sheet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-border bg-surface rounded-xl flex items-center justify-center text-foreground active:scale-[0.95]"
                    aria-label="Instagram"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/share/18gks8VFnH/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-border bg-surface rounded-xl flex items-center justify-center text-foreground active:scale-[0.95]"
                    aria-label="Facebook"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@nepaset?is_from_webapp=1&sender_device=pc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-border bg-surface rounded-xl flex items-center justify-center text-foreground active:scale-[0.95]"
                    aria-label="TikTok"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" />
                    </svg>
                  </a>
                </div>
              </div>

            </div>
            
            <div className="bg-surface-2 border-t border-border px-4 py-3 text-center">
              <p className="font-inter text-[10px] text-muted">
                © {new Date().getFullYear()} NEPASET • Kathmandu, Nepal
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  )
}