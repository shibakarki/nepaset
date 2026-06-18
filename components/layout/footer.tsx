import Link from 'next/link'

export function Footer() {
  const shop = [
    { href: '/shop', label: 'All Products' },
    { href: '/shop?category=tshirt', label: 'T-Shirts' },
    { href: '/shop?category=shirt', label: 'Shirts' },
    { href: '/shop?category=phone-case', label: 'Phone Cases' },
    { href: '/shop?category=earbuds', label: 'Earbuds' },
  ]
  const company = [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]
  const account = [
    { href: '/auth/login', label: 'Sign In' },
    { href: '/account', label: 'My Account' },
  ]

  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-8">

          {/* Brand info */}
          <div className="space-y-3">
            <Link
              href="/"
              className="font-space text-base font-bold tracking-tight text-foreground flex items-center gap-0.5"
            >
              NEPASET
              <span className="inline-block w-1.5 h-1.5 bg-foreground rounded-full mb-0.5 ml-0.5" />
            </Link>
            <p className="font-inter text-xs text-muted max-w-xs leading-relaxed">
              Nepal&apos;s youth customization &amp; lifestyle brand.
            </p>
          </div>

          {/* Responsive link columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:flex sm:gap-16 md:gap-20">
            <FooterCol title="Shop" links={shop} />
            <FooterCol title="Company" links={company} />
            <FooterCol title="Account" links={account} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-inter text-[11px] text-muted text-center sm:text-left">
            © {new Date().getFullYear()} NEPASET. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <SocialLink href="https://www.instagram.com/nepaset/?utm_source=ig_web_button_share_sheet" label="Instagram">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
            </SocialLink>
            <SocialLink href="https://www.facebook.com/share/18gks8VFnH/" label="Facebook">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </SocialLink>
            <SocialLink href="https://www.tiktok.com/@nepaset?is_from_webapp=1&sender_device=pc" label="TikTok">
              <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" />
            </SocialLink>
          </div>
        </div>

      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) {
  return (
    <div>
      <p className="font-space text-xs font-semibold tracking-widest uppercase text-foreground mb-4">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map(l => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="font-inter text-xs text-muted hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 border border-border rounded-md flex items-center justify-center hover:border-muted transition-colors text-foreground"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </a>
  )
}