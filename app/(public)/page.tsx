'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <CategoriesSection />
      <CustomizeBand />
      <HowItWorksSection />
      <WhyNepasetSection />
      <CtaBand />
    </div>
  )
}

/* ── Types ────────────────────────────────────────── */
type HeroProduct = {
  name: string
  slug: string
  image: string | null
  category?: string
}

/* ── Hero ─────────────────────────────────────────── */
function HeroSection() {
  const [products, setProducts] = useState<HeroProduct[]>([])
  const showcaseRef = useRef<HTMLDivElement>(null)

  // ── 1. Fetch live products from Supabase ──────────
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('products')
      .select('name, slug, images, category')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setProducts(
            data.map((p) => ({
              name: p.name,
              slug: p.slug,
              category: p.category ?? '',
              image:
                Array.isArray(p.images) && p.images.length > 0
                  ? p.images[0]
                  : null,
            }))
          )
        }
      })
  }, [])

  // ── 2. DOM-imperative queue animation (mirrors reference JS exactly) ──
  useEffect(() => {
    if (products.length === 0) return
    if (!showcaseRef.current) return
    const showcase = showcaseRef.current as HTMLDivElement

    const visibleCount = 5
    const holdDuration = 2600
    const transitionDuration = 1000
    const intervalDuration = holdDuration + transitionDuration
    const swipeThreshold = 45 // Lowered swipe threshold for more responsive mobile swiping
    const wheelCooldown = 800
    const imageFallbackUrl = ''

    let currentIndex = 0
    let intervalId: ReturnType<typeof setInterval> | null = null
    let isPaused = false
    let isDragging = false
    let hasSwiped = false
    let startX = 0
    let lastWheelTime = 0

    const db: HeroProduct[] =
      products.length >= visibleCount
        ? products
        : [
            ...products,
            ...Array<HeroProduct>(visibleCount - products.length).fill(
              products[0]
            ),
          ]

    function getProductAt(index: number): HeroProduct {
      const len = db.length
      return db[((index % len) + len) % len]
    }

    function createCardDOM(product: HeroProduct, positionClass: string): HTMLDivElement {
      const card = document.createElement('div')
      card.className = `hero-product-card ${positionClass}`

      const isValidUrl =
        product.image &&
        (product.image.startsWith('http://') ||
          product.image.startsWith('https://') ||
          product.image.startsWith('/'))
      const primaryImage = isValidUrl ? product.image! : imageFallbackUrl

      card.innerHTML = `
        <a
          href="/shop/${product.slug}"
          class="hero-card-inner active:scale-[0.97] transition-transform duration-150"
          draggable="false"
          tabindex="${positionClass === 'pos-3' ? '0' : '-1'}"
          aria-label="View ${product.name}"
        >
          <div class="hero-card-img-wrap shadow-inner">
            ${
              primaryImage
                ? `<img
                    src="${primaryImage}"
                    alt="${product.name}"
                    draggable="false"
                    onerror="this.style.display='none'"
                  />`
                : `<div class="hero-card-img-placeholder"></div>`
            }
          </div>
          <div class="hero-card-details">
            ${product.category ? `<span class="hero-card-category">${product.category}</span>` : ''}
            <h4 class="hero-card-title">${product.name}</h4>
          </div>
        </a>
      `
      return card
    }

    function rotateQueueForward() {
      const leftCard = showcase.querySelector('.pos-1')
      if (leftCard) {
        leftCard.className = 'hero-product-card exiting-left'
        setTimeout(() => leftCard.remove(), transitionDuration)
      }
      for (let i = 2; i <= visibleCount; i++) {
        const card = showcase.querySelector(`.pos-${i}`)
        if (card) {
          card.className = `hero-product-card pos-${i - 1}`
          const anchor = card.querySelector('a')
          if (anchor) anchor.tabIndex = i - 1 === 3 ? 0 : -1
        }
      }
      const nextProduct = getProductAt(currentIndex + visibleCount)
      const newCard = createCardDOM(nextProduct, 'entering-right')
      showcase.appendChild(newCard)
      newCard.getBoundingClientRect()
      newCard.className = 'hero-product-card pos-5'
      currentIndex++
    }

    function rotateQueueBackward() {
      const rightCard = showcase.querySelector('.pos-5')
      if (rightCard) {
        rightCard.className = 'hero-product-card exiting-right'
        setTimeout(() => rightCard.remove(), transitionDuration)
      }
      for (let i = visibleCount - 1; i >= 1; i--) {
        const card = showcase.querySelector(`.pos-${i}`)
        if (card) {
          card.className = `hero-product-card pos-${i + 1}`
          const anchor = card.querySelector('a')
          if (anchor) anchor.tabIndex = i + 1 === 3 ? 0 : -1
        }
      }
      const prevProduct = getProductAt(currentIndex - 1)
      const newCard = createCardDOM(prevProduct, 'entering-left')
      showcase.insertBefore(newCard, showcase.firstChild)
      newCard.getBoundingClientRect()
      newCard.className = 'hero-product-card pos-1'
      currentIndex--
    }

    function startTimer() {
      if (intervalId) clearInterval(intervalId)
      intervalId = setInterval(rotateQueueForward, intervalDuration)
    }
    function stopTimer() {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    showcase.innerHTML = ''
    for (let i = 0; i < visibleCount; i++) {
      const card = createCardDOM(getProductAt(i), `pos-${i + 1}`)
      showcase.appendChild(card)
    }
    startTimer()

    function onMouseEnter() { isPaused = true; stopTimer() }
    function onMouseLeave() { isPaused = false; if (!isDragging) startTimer() }

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      isDragging = true
      hasSwiped = false
      startX = e.clientX
      stopTimer()
      showcase.setPointerCapture(e.pointerId)
    }
    function onPointerMove(e: PointerEvent) {
      if (!isDragging || hasSwiped) return
      const diffX = e.clientX - startX
      if (diffX < -swipeThreshold) {
        rotateQueueForward()
        hasSwiped = true
      } else if (diffX > swipeThreshold) {
        rotateQueueBackward()
        hasSwiped = true
      }
    }
    function onPointerUp(e: PointerEvent) {
      isDragging = false
      showcase.releasePointerCapture(e.pointerId)
      if (!isPaused) startTimer()
    }
    function onPointerCancel() {
      isDragging = false
      if (!isPaused) startTimer()
    }

    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault()
        const now = Date.now()
        if (now - lastWheelTime < wheelCooldown) return
        if (e.deltaX > 0) { rotateQueueForward(); lastWheelTime = now }
        else if (e.deltaX < 0) { rotateQueueBackward(); lastWheelTime = now }
      }
    }

    showcase.addEventListener('mouseenter', onMouseEnter)
    showcase.addEventListener('mouseleave', onMouseLeave)
    showcase.addEventListener('pointerdown', onPointerDown)
    showcase.addEventListener('pointermove', onPointerMove)
    showcase.addEventListener('pointerup', onPointerUp)
    showcase.addEventListener('pointercancel', onPointerCancel)
    showcase.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      stopTimer()
      showcase.removeEventListener('mouseenter', onMouseEnter)
      showcase.removeEventListener('mouseleave', onMouseLeave)
      showcase.removeEventListener('pointerdown', onPointerDown)
      showcase.removeEventListener('pointermove', onPointerMove)
      showcase.removeEventListener('pointerup', onPointerUp)
      showcase.removeEventListener('pointercancel', onPointerCancel)
      showcase.removeEventListener('wheel', onWheel)
      showcase.innerHTML = ''
    }
  }, [products])

  return (
    <>
      <style>{`
        .hero-product-card {
          position: absolute;
          top: 50%;
          width: clamp(140px, 16vw, 230px);
          height: clamp(190px, 22vw, 320px);
          background: var(--background, #ffffff);
          border-radius: 14px;
          border: 1px solid var(--border, rgba(0,0,0,0.06));
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          pointer-events: none;
          transition:
            left  1.3s cubic-bezier(0.175, 0.885, 0.32, 1.1),
            transform 1.3s cubic-bezier(0.175, 0.885, 0.32, 1.1),
            opacity 1.3s ease-out,
            box-shadow 1.3s ease-out;
        }

        .hero-product-card.pos-1 {
          left: 10%;
          transform: translate(-50%, -50%) scale(0.72);
          opacity: 0.2;
          z-index: 1;
          box-shadow: 0 5px 15px rgba(0,0,0,0.02);
        }
        .hero-product-card.pos-2 {
          left: 30%;
          transform: translate(-50%, -50%) scale(0.88);
          opacity: 0.6;
          z-index: 3;
          box-shadow: 0 10px 25px rgba(0,0,0,0.04);
        }
        .hero-product-card.pos-3 {
          left: 50%;
          transform: translate(-50%, -50%) scale(1.06);
          opacity: 1;
          z-index: 5;
          box-shadow: 0 28px 50px rgba(0,0,0,0.08);
          pointer-events: auto;
        }
        .hero-product-card.pos-4 {
          left: 70%;
          transform: translate(-50%, -50%) scale(0.88);
          opacity: 0.6;
          z-index: 3;
          box-shadow: 0 10px 25px rgba(0,0,0,0.04);
        }
        .hero-product-card.pos-5 {
          left: 90%;
          transform: translate(-50%, -50%) scale(0.72);
          opacity: 0.2;
          z-index: 1;
          box-shadow: 0 5px 15px rgba(0,0,0,0.02);
        }

        .hero-product-card.entering-right {
          left: 120%;
          transform: translate(-50%, -50%) scale(0.6);
          opacity: 0;
          z-index: 0;
        }
        .hero-product-card.entering-left {
          left: -20%;
          transform: translate(-50%, -50%) scale(0.6);
          opacity: 0;
          z-index: 0;
        }

        .hero-product-card.exiting-left {
          transition:
            left  1s cubic-bezier(0.32, 0, 0.67, 0),
            transform 1s cubic-bezier(0.32, 0, 0.67, 0),
            opacity 1s ease-in;
          left: -20%;
          transform: translate(-50%, -50%) scale(0.6) rotate(-4deg);
          opacity: 0;
          z-index: 0;
        }
        .hero-product-card.exiting-right {
          transition:
            left  1s cubic-bezier(0.32, 0, 0.67, 0),
            transform 1s cubic-bezier(0.32, 0, 0.67, 0),
            opacity 1s ease-in;
          left: 120%;
          transform: translate(-50%, -50%) scale(0.6) rotate(4deg);
          opacity: 0;
          z-index: 0;
        }

        .hero-card-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          text-decoration: none;
          border-radius: 10px;
          outline-offset: 3px;
        }
        .hero-card-inner:focus-visible {
          outline: 2px solid var(--foreground);
        }
        .hero-card-img-wrap {
          width: 100%;
          flex: 1;
          background-color: var(--surface-2, #f4f4f4);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-card-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
          mix-blend-mode: multiply;
        }
        .hero-card-img-placeholder {
          width: 100%;
          height: 100%;
          background: var(--border, #ebebeb);
        }
        .hero-card-details {
          padding-top: 10px;
        }
        .hero-card-category {
          display: block;
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--muted);
          margin-bottom: 3px;
          font-family: var(--font-inter, sans-serif);
        }
        .hero-card-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--foreground);
          line-height: 1.3;
          font-family: var(--font-space, sans-serif);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Responsive spacing for dark and light modes on mobile */
        @media (max-width: 991px) {
          .hero-product-card {
            width: clamp(90px, 22vw, 130px);
            height: clamp(125px, 30vw, 180px);
            border-radius: 12px;
            padding: 10px;
          }
          .hero-card-details {
            padding-top: 6px;
          }
          .hero-card-category {
            display: none;
          }
          .hero-card-title {
            font-size: 0.65rem;
          }
        }

        @media (max-width: 767px) {
          .hero-product-card.pos-1,
          .hero-product-card.pos-5,
          .hero-product-card.entering-left,
          .hero-product-card.entering-right,
          .hero-product-card.exiting-left,
          .hero-product-card.exiting-right {
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }

          .hero-product-card.pos-2 {
            left: 15%;
            transform: translate(-50%, -50%) scale(0.68) rotate(-3deg);
            opacity: 0.45;
            z-index: 3;
          }
          .hero-product-card.pos-3 {
            left: 50%;
            transform: translate(-50%, -50%) scale(1.15);
            opacity: 1;
            z-index: 5;
            pointer-events: auto;
            box-shadow: 0 15px 35px rgba(0,0,0,0.12);
          }
          .hero-product-card.pos-4 {
            left: 85%;
            transform: translate(-50%, -50%) scale(0.68) rotate(3deg);
            opacity: 0.45;
            z-index: 3;
          }
        }
      `}</style>

      <section className="relative overflow-hidden border-b border-border bg-surface-2">
        <div
          className="flex flex-col lg:flex-row w-full"
          style={{ minHeight: 'calc(100svh - 56px)' }}
        >
          {/* LEFT PANE — Content */}
          <div
            className="
              flex flex-col justify-center min-w-0
              w-full lg:w-1/2
              px-6 sm:px-8 md:px-12 lg:px-16
              py-12 lg:py-20
              order-2 lg:order-1
              text-center lg:text-left
              border-r-0 lg:border-r border-border
            "
          >
            {/* Pill badge */}
            <div className="inline-flex items-center justify-center lg:justify-start mb-6">
              <span className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-3.5 py-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-ping" />
                <span className="font-inter text-[10px] font-semibold tracking-[0.12em] uppercase text-muted">
                  Nepal&apos;s youth brand
                </span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-space text-3xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-[1.06] mb-5">
              Wear who you{' '}
              <span className="text-muted/60 font-normal">actually</span>{' '}
              are.
            </h1>

            {/* Description */}
            <p className="font-inter text-sm md:text-base text-muted leading-relaxed max-w-sm mx-auto lg:mx-0 mb-8">
              Custom apparel and accessories made in-house — designed for
              students and young people across Nepal.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full max-w-md mx-auto lg:mx-0">
              <Link
                href="/shop"
                className="w-full sm:w-auto font-space text-sm font-semibold bg-foreground text-background px-8 py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-center shadow-md shadow-foreground/5 cursor-pointer"
              >
                Shop now
              </Link>
              <Link
                href="/shop"
                className="w-full sm:w-auto font-space text-sm font-medium text-foreground border border-border bg-surface px-8 py-3.5 rounded-xl hover:bg-surface-2 active:scale-[0.98] transition-all text-center cursor-pointer"
              >
                Browse all
              </Link>
            </div>
          </div>

          {/* RIGHT PANE — Interactive floating card queue */}
          <div
            className="
              relative w-full lg:w-1/2 shrink-0
              order-1 lg:order-2
              flex items-center justify-center
              h-[300px] sm:h-[380px] lg:h-auto
              overflow-hidden
            "
            style={{
              background: 'radial-gradient(circle at 50% 50%, var(--surface-3, #e4e2de) 0%, var(--surface-2, #ebebeb) 80%)',
            }}
          >
            <div
              ref={showcaseRef}
              className="relative w-full h-full"
              style={{
                overflow: 'hidden',
                touchAction: 'pan-y',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                cursor: 'grab',
              }}
              onMouseDown={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.cursor = 'grabbing'
              }}
              onMouseUp={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.cursor = 'grab'
              }}
            />

            {/* Scroll hint loader */}
            {products.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-border/60 rounded-xl animate-pulse"
                      style={{
                        width: `clamp(90px, 20vw, 150px)`,
                        height: `clamp(120px, 25vw, 210px)`,
                        opacity: 1 - i * 0.25,
                        transform: `scale(${1 - i * 0.1})`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Swipe prompt for touch screens */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none md:hidden">
              <span className="bg-surface/75 backdrop-blur-md border border-border text-[10px] text-muted rounded-full px-3 py-1 font-inter tracking-wider uppercase">
                ← Swipe to browse →
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

/* ── Categories ───────────────────────────────────── */
const categories = [
  {
    name: 'T-Shirts',
    desc: 'Custom prints & graphics',
    href: '/shop?category=tshirt',
    icon: (
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
    ),
  },
  {
    name: 'Shirts',
    desc: 'Logos, names & events',
    href: '/shop?category=shirt',
    icon: (
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
    ),
  },
  {
    name: 'Phone Cases',
    desc: 'Art, photos & designs',
    href: '/shop?category=phone-case',
    icon: (
      <>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </>
    ),
  },
  {
    name: 'Earbuds',
    desc: 'Special edition packaging',
    href: '/shop?category=earbuds',
    icon: (
      <>
        <path d="M3 18v-6a9 9 0 0118 0v6" />
        <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
      </>
    ),
  },
]

function CategoriesSection() {
  return (
    <section className="bg-surface px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <p className="font-inter text-[10px] tracking-[0.12em] uppercase text-muted mb-1 font-semibold">
          Categories
        </p>
        <h2 className="font-space text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-1">
          What we make
        </h2>
        <p className="font-inter text-sm text-muted mb-8">
          Four product lines, fully customizable.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {categories.map(cat => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group bg-surface border border-border rounded-2xl p-5 hover:bg-surface-2 hover:border-muted transition-all active:scale-[0.98] cursor-pointer duration-200"
            >
              <div className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <svg
                  width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  {cat.icon}
                </svg>
              </div>
              <p className="font-space text-sm font-semibold text-foreground mb-0.5">
                {cat.name}
              </p>
              <p className="font-inter text-xs text-muted leading-normal">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Customize Band ───────────────────────────────── */
function CustomizeBand() {
  return (
    <section className="bg-foreground text-background px-6 py-12 border-y border-border">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="font-space text-xl font-bold text-background tracking-tight mb-2">
            Got a design in mind?
          </h2>
          <p className="font-inter text-sm text-background/70 max-w-sm leading-relaxed">
            Upload your artwork or describe what you want — we&apos;ll produce it.
            Group orders welcome.
          </p>
        </div>
        <Link
          href="/shop"
          className="font-space text-sm font-semibold bg-background text-foreground px-6 py-3 rounded-xl whitespace-nowrap hover:opacity-90 active:scale-[0.98] transition-all shrink-0 cursor-pointer shadow-md"
        >
          Browse products →
        </Link>
      </div>
    </section>
  )
}

/* ── How It Works ─────────────────────────────────── */
const steps = [
  {
    num: '01',
    title: 'Pick your product',
    desc: 'Choose from tees, shirts, cases, or earbuds.',
  },
  {
    num: '02',
    title: 'Send your design',
    desc: 'Upload artwork or describe exactly what you want.',
  },
  {
    num: '03',
    title: 'We deliver',
    desc: 'In-house production, quality check, and fast delivery.',
  },
]

function HowItWorksSection() {
  return (
    <section className="bg-surface px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <p className="font-inter text-[10px] tracking-[0.12em] uppercase text-muted mb-1 font-semibold">
          How it works
        </p>
        <h2 className="font-space text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-1">
          Three steps
        </h2>
        <p className="font-inter text-sm text-muted mb-8">
          From idea to delivered product.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map(s => (
            <div
              key={s.num}
              className="border border-border rounded-2xl p-6 bg-surface hover:bg-surface-2 transition-colors duration-200"
            >
              <p className="font-space text-3xl font-bold text-muted/30 mb-3 select-none">
                {s.num}
              </p>
              <p className="font-space text-sm font-semibold text-foreground mb-1.5">
                {s.title}
              </p>
              <p className="font-inter text-xs text-muted leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Why NEPASET ──────────────────────────────────── */
const features = [
  {
    title: 'In-house production',
    desc: 'We design and make everything — no middlemen, full quality control.',
    icon: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    ),
  },
  {
    title: 'Group orders',
    desc: 'Clubs, events, friend groups — bulk pricing always available.',
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </>
    ),
  },
  {
    title: 'Quality guaranteed',
    desc: 'Every product is checked before it leaves — or we redo it.',
    icon: (
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    ),
  },
  {
    title: 'Fast turnaround',
    desc: 'Quick production for time-sensitive events and deadlines.',
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
  },
]

function WhyNepasetSection() {
  return (
    <section className="bg-surface-2 px-6 py-16 border-y border-border">
      <div className="max-w-5xl mx-auto">
        <p className="font-inter text-[10px] tracking-[0.12em] uppercase text-muted mb-1 font-semibold">
          Why NEPASET
        </p>
        <h2 className="font-space text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-1">
          Built different
        </h2>
        <p className="font-inter text-sm text-muted mb-8">
          Not just a print shop.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {features.map(f => (
            <div
              key={f.title}
              className="bg-surface border border-border rounded-2xl p-6 flex gap-4 items-start hover:border-muted transition-colors duration-200"
            >
              <div className="w-10 h-10 bg-surface-2 rounded-xl flex items-center justify-center shrink-0">
                <svg
                  width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor"
                  strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                >
                  {f.icon}
                </svg>
              </div>
              <div className="space-y-1">
                <p className="font-space text-sm font-semibold text-foreground">
                  {f.title}
                </p>
                <p className="font-inter text-xs text-muted leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Bottom CTA ───────────────────────────────────── */
function CtaBand() {
  return (
    <section className="bg-surface px-6 py-20 text-center">
      <div className="max-w-lg mx-auto">
        <h2 className="font-space text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4">
          Ready to create something?
        </h2>
        <p className="font-inter text-sm text-muted mb-8 leading-relaxed">
          Join students across Nepal who wear what they actually believe in.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm mx-auto">
          <Link
            href="/shop"
            className="w-full sm:w-auto font-space text-sm font-semibold bg-foreground text-background px-8 py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            Browse products
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto font-space text-sm font-medium text-foreground border border-border bg-surface px-8 py-3 rounded-xl hover:bg-surface-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            View all categories
          </Link>
        </div>
      </div>
    </section>
  )
}