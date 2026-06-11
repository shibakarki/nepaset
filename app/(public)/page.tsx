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
    // Guard against null first
    if (!showcaseRef.current) return
    // Assert strictly as HTMLDivElement to guarantee non-null types inside nested closures
    const showcase = showcaseRef.current as HTMLDivElement

    // --- Config (matches reference) ---
    const visibleCount = 5
    const holdDuration = 2600
    const transitionDuration = 1000
    const intervalDuration = holdDuration + transitionDuration
    const swipeThreshold = 55
    const wheelCooldown = 800
    const imageFallbackUrl = ''   // blank — no external fallback needed; guard below

    let currentIndex = 0
    let intervalId: ReturnType<typeof setInterval> | null = null
    let isPaused = false
    let isDragging = false
    let hasSwiped = false
    let startX = 0
    let lastWheelTime = 0

    // Build the product list, padding to at least visibleCount items
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

    // ── Card DOM builder — maps images[0] to img src, preserves onerror ──
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
          class="hero-card-inner"
          draggable="false"
          tabindex="${positionClass === 'pos-3' ? '0' : '-1'}"
          aria-label="View ${product.name}"
        >
          <div class="hero-card-img-wrap">
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

    // ── 5A. Forward (right-to-left) ──────────────────
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
          // Only front card is focusable / linked
          const anchor = card.querySelector('a')
          if (anchor) anchor.tabIndex = i - 1 === 3 ? 0 : -1
        }
      }
      const nextProduct = getProductAt(currentIndex + visibleCount)
      const newCard = createCardDOM(nextProduct, 'entering-right')
      showcase.appendChild(newCard)
      newCard.getBoundingClientRect() // force reflow
      newCard.className = 'hero-product-card pos-5'
      currentIndex++
    }

    // ── 5B. Backward (left-to-right) ─────────────────
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
      newCard.getBoundingClientRect() // force reflow
      newCard.className = 'hero-product-card pos-1'
      currentIndex--
    }

    // ── Timers ────────────────────────────────────────
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

    // ── 4. Init ───────────────────────────────────────
    showcase.innerHTML = ''
    for (let i = 0; i < visibleCount; i++) {
      const card = createCardDOM(getProductAt(i), `pos-${i + 1}`)
      showcase.appendChild(card)
    }
    startTimer()

    // ── Hover pause ───────────────────────────────────
    function onMouseEnter() { isPaused = true; stopTimer() }
    function onMouseLeave() { isPaused = false; if (!isDragging) startTimer() }

    // ── Pointer (drag / touch swipe) ─────────────────
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

    // ── Wheel — only intercept horizontal-dominant ───
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
      {/* ── Scoped card styles injected once ── */}
      <style>{`
        /* --- Card Base --- */
        .hero-product-card {
          position: absolute;
          top: 50%;
          width: clamp(140px, 16vw, 230px);
          height: clamp(190px, 22vw, 320px);
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.06);
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

        /* --- Position Nodes (horizontal depth queue) --- */
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

        /* --- Off-screen enter states --- */
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

        /* --- Exit states — gravity easing (ease-in) --- */
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

        /* --- Inner card layout --- */
        .hero-card-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          text-decoration: none;
          border-radius: 10px;
          outline-offset: 3px;
        }
        .hero-card-inner:focus-visible {
          outline: 2px solid #0a0a0a;
        }
        .hero-card-img-wrap {
          width: 100%;
          flex: 1;
          background-color: #f4f4f4;
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
          background: #ebebeb;
        }
        .hero-card-details {
          padding-top: 10px;
        }
        .hero-card-category {
          display: block;
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #999;
          margin-bottom: 3px;
          font-family: var(--font-inter, sans-serif);
        }
        .hero-card-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #0a0a0a;
          line-height: 1.3;
          font-family: var(--font-space, sans-serif);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* --- Mobile Breakpoints & 3-Card layout Re-optimization --- */
        @media (max-width: 991px) {
          .hero-product-card {
            width: clamp(72px, 18vw, 110px);
            height: clamp(100px, 25vw, 155px);
            border-radius: 10px;
            padding: 8px;
          }
          .hero-card-details {
            padding-top: 5px;
          }
          .hero-card-category {
            display: none;
          }
          .hero-card-title {
            font-size: 0.6rem;
          }
        }

        @media (max-width: 767px) {
          /* 1. Hide outer-edge cards (pos-1, pos-5, and exit nodes) entirely to leave exactly 3 visible cards */
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

          /* 2. Position the remaining 3 cards, making background ones much smaller and layered */
          .hero-product-card.pos-2 {
            left: 16%;
            transform: translate(-50%, -50%) scale(0.66) rotate(-3deg);
            opacity: 0.5;
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
            left: 84%;
            transform: translate(-50%, -50%) scale(0.66) rotate(3deg);
            opacity: 0.5;
            z-index: 3;
          }
        }
      `}</style>

      <section className="relative overflow-hidden border-b border-neutral-200 bg-[#ebebeb]">
        {/* ── Split-screen flex container ── */}
        <div
          className="flex flex-col lg:flex-row w-full"
          style={{ minHeight: 'calc(100svh - 56px)' }}
        >
          {/* LEFT PANE — existing copy & CTAs */}
          <div
            className="
              flex flex-col justify-center min-w-0
              w-full lg:w-1/2
              px-6 sm:px-8 md:px-12 lg:px-16
              py-10 lg:py-20
              order-2 lg:order-1
              text-center lg:text-left
              border-r-0 lg:border-r border-neutral-200
            "
          >
            {/* Pill badge */}
            <div className="inline-flex items-center justify-center lg:justify-start mb-5">
              <span className="inline-flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 bg-black rounded-full" />
                <span className="font-inter text-[10px] tracking-[0.12em] uppercase text-neutral-500">
                  Nepal&apos;s youth brand
                </span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-space text-[2rem] sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-[#0a0a0a] leading-[1.06] mb-4">
              Wear who you{' '}
              <span className="text-neutral-400">actually</span>{' '}
              are.
            </h1>

            {/* Description */}
            <p className="font-inter text-sm md:text-base text-neutral-500 leading-relaxed max-w-sm mx-auto lg:mx-0 mb-7">
              Custom apparel and accessories made in-house — designed for
              students and young people across Nepal.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                href="/shop"
                className="w-full sm:w-auto font-space text-sm font-semibold bg-[#0a0a0a] text-white px-6 py-3 rounded-md hover:opacity-90 active:scale-[0.98] transition-all text-center"
              >
                Shop now
              </Link>
              <Link
                href="/shop"
                className="w-full sm:w-auto font-space text-sm font-medium text-[#0a0a0a] border border-neutral-200 bg-white px-6 py-3 rounded-md hover:bg-neutral-50 active:scale-[0.98] transition-all text-center"
              >
                Browse all
              </Link>
            </div>
          </div>

          {/* RIGHT PANE — interactive card queue */}
          <div
            className="
              relative w-full lg:w-1/2 shrink-0
              order-1 lg:order-2
              flex items-center justify-center
            "
            style={{
              height: 'clamp(200px, 50vw, 100svh)',
              overflow: 'hidden',
              background: 'radial-gradient(circle at 60% 50%, #e4e2de 0%, #ebebeb 70%)',
            }}
          >
            {/* Showcase container — pointer events & drag attached here */}
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

            {/* Scroll hint — fades out when products have loaded */}
            {products.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-neutral-300 rounded-lg animate-pulse"
                      style={{
                        width: `clamp(100px, 12vw, 180px)`,
                        height: `clamp(140px, 16vw, 250px)`,
                        opacity: 1 - i * 0.18,
                        transform: `scale(${1 - i * 0.06})`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
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
    <section className="bg-white px-6 py-14">
      <div className="max-w-5xl mx-auto">
        <p className="font-inter text-[10px] tracking-[0.12em] uppercase text-neutral-500 mb-1">
          Categories
        </p>
        <h2 className="font-space text-2xl font-bold tracking-tight text-[#0a0a0a] mb-1">
          What we make
        </h2>
        <p className="font-inter text-sm text-neutral-500 mb-8">
          Four product lines, fully customizable.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group bg-white border border-neutral-200 rounded-xl p-5 hover:bg-[#ebebeb] hover:border-neutral-300 transition-all"
            >
              <div className="w-10 h-10 bg-[#0a0a0a] rounded-lg flex items-center justify-center mb-4">
                <svg
                  width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="white"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  {cat.icon}
                </svg>
              </div>
              <p className="font-space text-sm font-semibold text-[#0a0a0a] mb-0.5">
                {cat.name}
              </p>
              <p className="font-inter text-xs text-neutral-500">{cat.desc}</p>
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
    <section className="bg-[#0a0a0a] px-6 py-10 border-y border-neutral-800">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="font-space text-xl font-bold text-white tracking-tight mb-1.5">
            Got a design in mind?
          </h2>
          <p className="font-inter text-sm text-neutral-400 max-w-sm leading-relaxed">
            Upload your artwork or describe what you want — we&apos;ll produce it.
            Group orders welcome.
          </p>
        </div>
        <Link
          href="/shop"
          className="font-space text-sm font-semibold bg-white text-[#0a0a0a] px-5 py-2.5 rounded-md whitespace-nowrap hover:opacity-90 active:scale-[0.98] transition-all shrink-0"
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
    <section className="bg-white px-6 py-14">
      <div className="max-w-5xl mx-auto">
        <p className="font-inter text-[10px] tracking-[0.12em] uppercase text-neutral-500 mb-1">
          How it works
        </p>
        <h2 className="font-space text-2xl font-bold tracking-tight text-[#0a0a0a] mb-1">
          Three steps
        </h2>
        <p className="font-inter text-sm text-neutral-500 mb-8">
          From idea to delivered product.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map(s => (
            <div
              key={s.num}
              className="border border-neutral-200 rounded-xl p-6 bg-white"
            >
              <p className="font-space text-3xl font-bold text-neutral-200 mb-3 select-none">
                {s.num}
              </p>
              <p className="font-space text-sm font-semibold text-[#0a0a0a] mb-1.5">
                {s.title}
              </p>
              <p className="font-inter text-xs text-neutral-500 leading-relaxed">
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
    <section className="bg-[#ebebeb] px-6 py-14">
      <div className="max-w-5xl mx-auto">
        <p className="font-inter text-[10px] tracking-[0.12em] uppercase text-neutral-500 mb-1">
          Why NEPASET
        </p>
        <h2 className="font-space text-2xl font-bold tracking-tight text-[#0a0a0a] mb-1">
          Built different
        </h2>
        <p className="font-inter text-sm text-neutral-500 mb-8">
          Not just a print shop.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map(f => (
            <div
              key={f.title}
              className="bg-white border border-neutral-200 rounded-xl p-5 flex gap-4 items-start"
            >
              <div className="w-9 h-9 bg-[#ebebeb] rounded-lg flex items-center justify-center shrink-0">
                <svg
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="#0a0a0a"
                  strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                >
                  {f.icon}
                </svg>
              </div>
              <div>
                <p className="font-space text-sm font-semibold text-[#0a0a0a] mb-1">
                  {f.title}
                </p>
                <p className="font-inter text-xs text-neutral-500 leading-relaxed">
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
    <section className="bg-[#ebebeb] px-6 py-16 text-center border-t border-neutral-200">
      <div className="max-w-lg mx-auto">
        <h2 className="font-space text-2xl md:text-3xl font-bold tracking-tight text-[#0a0a0a] mb-3">
          Ready to create something?
        </h2>
        <p className="font-inter text-sm text-neutral-500 mb-8 leading-relaxed">
          Join students across Nepal who wear what they actually believe in.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/shop"
            className="font-space text-sm font-semibold bg-[#0a0a0a] text-white px-6 py-2.5 rounded-md hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Browse products
          </Link>
          <Link
            href="/shop"
            className="font-space text-sm font-medium text-[#0a0a0a] border border-neutral-200 bg-white px-6 py-2.5 rounded-md hover:bg-neutral-50 active:scale-[0.98] transition-all"
          >
            View all categories
          </Link>
        </div>
      </div>
    </section>
  )
}