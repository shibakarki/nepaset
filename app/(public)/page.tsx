import Link from 'next/link'

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

/* ── Hero ─────────────────────────────────────────── */
const featuredProducts = [
  { name: 'Custom Tee', price: 'Rs. 1,200', accent: 'from-pink-400 via-fuchsia-500 to-violet-600', icon: '👕' },
  { name: 'Phone Case', price: 'Rs. 900', accent: 'from-sky-400 via-cyan-500 to-blue-600', icon: '📱' },
  { name: 'Shirt Drop', price: 'Rs. 1,800', accent: 'from-amber-300 via-orange-400 to-rose-500', icon: '🧥' },
  { name: 'Earbuds', price: 'Rs. 2,200', accent: 'from-emerald-300 via-teal-400 to-cyan-500', icon: '🎧' },
]

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--surface),var(--surface-2))] px-6 py-20 md:py-28 border-b border-border">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_25%)]" />

      <div className="relative max-w-7xl mx-auto grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5 mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 bg-foreground rounded-full" />
            <span className="font-inter text-[10px] tracking-[0.12em] uppercase text-muted">
              Nepal&apos;s youth brand
            </span>
          </div>

          <h1 className="font-space text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.08] mb-5">
            Wear who you{' '}
            <span className="text-muted">actually</span>{' '}
            are.
          </h1>

          <p className="font-inter text-sm text-muted leading-relaxed max-w-sm mx-auto lg:mx-0 mb-8">
            Smooth, cinematic product visuals with custom 3D rotation — designed to make every launch feel premium.
          </p>

          <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap mb-8">
            <Link
              href="/shop"
              className="font-space text-sm font-semibold bg-foreground text-background px-6 py-2.5 rounded-md hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Shop now
            </Link>
            <Link
              href="/customize"
              className="font-space text-sm font-medium text-foreground border border-border bg-surface px-6 py-2.5 rounded-md hover:bg-surface-2 active:scale-[0.98] transition-all"
            >
              Customize yours
            </Link>
          </div>

        </div>

        <div className="relative mx-auto h-95 w-full max-w-105 perspective-[1400px]">
          <div className="absolute inset-x-0 bottom-4 top-2 rounded-[28px] border border-border/70 bg-surface/70 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl" />
          <div className="absolute inset-0 overflow-hidden rounded-[28px]">
            {featuredProducts.map((product, index) => (
              <article
                key={product.name}
                className="hero-product-card absolute left-1/2 top-1/2 h-36 w-44 rounded-3xl border border-white/10 bg-surface/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
                style={{
                  zIndex: 4 - index,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${index * -4}s`,
                }}
              >
                <div className={`h-full rounded-2xl bg-linear-to-br ${product.accent} p-px`}>
                  <div className="h-full rounded-[15px] bg-[linear-gradient(145deg,var(--surface),var(--surface-2))] p-3 text-foreground">
                    <div className="flex items-start justify-between text-[10px] uppercase tracking-[0.18em] text-muted">
                      <span className="leading-none">Featured</span>
                      <span className="leading-none">New</span>
                    </div>
                    <div className="mt-3 flex h-16 items-center justify-center rounded-2xl bg-black/5 text-3xl shadow-inner">{product.icon}</div>
                    <p className="mt-3 font-space text-sm font-semibold leading-tight text-foreground">{product.name}</p>
                    <p className="mt-1 text-[11px] text-muted">{product.price}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Categories ───────────────────────────────────── */
const categories = [
  {
    name: 'T-Shirts',
    desc: 'Custom prints & graphics',
    href: '/shop/tshirts',
    icon: (
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
    ),
  },
  {
    name: 'Shirts',
    desc: 'Logos, names & events',
    href: '/shop/shirts',
    icon: (
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
    ),
  },
  {
    name: 'Phone Cases',
    desc: 'Art, photos & designs',
    href: '/shop/phone-cases',
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
    href: '/shop/earbuds',
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
    <section className="bg-background px-6 py-14">
      <div className="max-w-5xl mx-auto">
        <p className="font-inter text-[10px] tracking-[0.12em] uppercase text-muted mb-1">
          Categories
        </p>
        <h2 className="font-space text-2xl font-bold tracking-tight text-foreground mb-1">
          What we make
        </h2>
        <p className="font-inter text-sm text-muted mb-8">
          Four product lines, fully customizable.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group bg-surface border border-border rounded-xl p-5 hover:bg-surface-2 hover:border-border transition-all shadow-sm"
            >
              <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center mb-4">
                <svg
                  width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="var(--background)"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  {cat.icon}
                </svg>
              </div>
              <p className="font-space text-sm font-semibold text-foreground mb-0.5">
                {cat.name}
              </p>
              <p className="font-inter text-xs text-muted">{cat.desc}</p>
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
    <section className="bg-[linear-gradient(135deg,var(--surface),var(--surface-2))] px-6 py-10 border-y border-border">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="font-space text-xl font-bold text-foreground tracking-tight mb-1.5">
            Got a design in mind?
          </h2>
          <p className="font-inter text-sm text-muted max-w-sm leading-relaxed">
            Upload your artwork or describe what you want — we&apos;ll produce it.
            Group orders welcome.
          </p>
        </div>
        <Link
          href="/customize"
          className="font-space text-sm font-semibold bg-foreground text-background px-5 py-2.5 rounded-md whitespace-nowrap hover:opacity-90 active:scale-[0.98] transition-all shrink-0"
        >
          Start customizing →
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
    <section className="bg-background px-6 py-14">
      <div className="max-w-5xl mx-auto">
        <p className="font-inter text-[10px] tracking-[0.12em] uppercase text-muted mb-1">
          How it works
        </p>
        <h2 className="font-space text-2xl font-bold tracking-tight text-foreground mb-1">
          Three steps
        </h2>
        <p className="font-inter text-sm text-muted mb-8">
          From idea to delivered product.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map(s => (
            <div
              key={s.num}
              className="border border-border rounded-xl p-6 bg-surface shadow-sm"
            >
              <p className="font-space text-3xl font-bold text-muted/80 mb-3 select-none">
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
    <section className="bg-surface-2 px-6 py-14">
      <div className="max-w-5xl mx-auto">
        <p className="font-inter text-[10px] tracking-[0.12em] uppercase text-muted mb-1">
          Why NEPASET
        </p>
        <h2 className="font-space text-2xl font-bold tracking-tight text-foreground mb-1">
          Built different
        </h2>
        <p className="font-inter text-sm text-muted mb-8">
          Not just a print shop.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map(f => (
            <div
              key={f.title}
              className="bg-surface border border-border rounded-xl p-5 flex gap-4 items-start shadow-sm"
            >
              <div className="w-9 h-9 bg-surface-2 rounded-lg flex items-center justify-center shrink-0">
                <svg
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor"
                  strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                >
                  {f.icon}
                </svg>
              </div>
              <div>
                <p className="font-space text-sm font-semibold text-foreground mb-1">
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
    <section className="bg-[linear-gradient(135deg,var(--surface),var(--surface-2))] px-6 py-16 text-center border-t border-border">
      <div className="max-w-lg mx-auto">
        <h2 className="font-space text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
          Ready to create something?
        </h2>
        <p className="font-inter text-sm text-muted mb-8 leading-relaxed">
          Join students across Nepal who wear what they actually believe in.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/shop"
            className="font-space text-sm font-semibold bg-foreground text-background px-6 py-2.5 rounded-md hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Browse products
          </Link>
          <Link
            href="/customize"
            className="font-space text-sm font-medium text-foreground border border-border bg-surface px-6 py-2.5 rounded-md hover:bg-surface-2 active:scale-[0.98] transition-all"
          >
            Custom order
          </Link>
        </div>
      </div>
    </section>
  )
}