"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    label: "Overview",
    href: "/admin",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.12 0L3.1 8.84A2 2 0 0 0 2 10.76V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8.24a2 2 0 0 0-1.09-1.92Z" />
        <path d="M12 22v-9" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    label: "Custom Requests",
    href: "/admin/custom-requests",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-150 min-h-screen pt-8 px-4 flex flex-col">
      {/* Brand */}
      <div className="mb-8 px-2">
        <p className="font-space text-sm font-medium text-[#0a0a0a] tracking-tight">
          NEPASET
        </p>
        <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5">
          Admin
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
              isActive(item.href)
                ? "bg-[#0a0a0a] text-white"
                : "text-neutral-500 hover:text-[#0a0a0a] hover:bg-neutral-50",
            ].join(" ")}
          >
            <span className={isActive(item.href) ? "text-white" : "text-neutral-400"}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Back to site */}
      <div className="pb-6 pt-4 border-t border-neutral-150 mt-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-2 py-2 text-[12px] text-neutral-400 hover:text-[#0a0a0a] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to site
        </Link>
      </div>
    </aside>
  );
}
