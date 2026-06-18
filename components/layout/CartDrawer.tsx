'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { useCart } from '@/hooks/useCart'

function isValidUrl(url: string | null) {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')
}

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice } = useCart()

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeCart])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Drawer (Supports Dark Mode) */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-surface border-l border-border flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-space text-sm font-semibold text-foreground">Cart</span>
            {items.length > 0 && (
              <span className="font-inter text-xs text-muted">
                ({items.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-2 transition-colors text-muted hover:text-foreground"
            aria-label="Close cart"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center border border-border">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <div>
                <p className="font-space text-sm font-semibold text-foreground mb-1">Your cart is empty</p>
                <p className="font-inter text-xs text-muted">Add something from the shop</p>
              </div>
              <Link
                href="/shop"
                onClick={closeCart}
                className="font-space text-xs font-semibold bg-foreground text-background px-5 py-2.5 rounded-md hover:opacity-90 transition-all"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="space-y-4" suppressHydrationWarning>
              {items.map((item) => (
                <li key={item._key} className="flex gap-3">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl bg-surface-2 overflow-hidden flex-shrink-0 relative border border-border">
                    {isValidUrl(item.productImage) ? (
                      <Image
                        src={item.productImage!}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-space text-sm font-semibold text-foreground truncate">
                      {item.productName}
                    </p>
                    {(item.variant?.size || item.variant?.color) && (
                      <p className="font-inter text-xs text-muted mt-0.5">
                        {[item.variant.size, item.variant.color].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="font-space text-sm font-medium text-foreground mt-1">
                      Rs. {(item.unitPrice * item.quantity).toLocaleString('en-NP')}
                    </p>
                  </div>

                  {/* Qty + remove */}
                  <div className="flex flex-col items-end justify-between gap-1">
                    <button
                      onClick={() => removeItem(item._key)}
                      className="text-muted/40 hover:text-red-500 transition-colors cursor-pointer"
                      aria-label="Remove"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Qty stepper */}
                    <div className="flex items-center border border-border bg-surface-2 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(item._key, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-muted hover:bg-border transition-colors text-base leading-none"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-7 text-center font-inter text-xs font-medium text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item._key, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="w-7 h-7 flex items-center justify-center text-muted hover:bg-border transition-colors text-base leading-none disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — only when items exist */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3 bg-surface-2/50">
            <div className="flex items-center justify-between">
              <span className="font-inter text-sm text-muted">Subtotal</span>
              <span className="font-space text-sm font-semibold text-foreground">
                Rs. {totalPrice().toLocaleString('en-NP')}
              </span>
            </div>
            <p className="font-inter text-[11px] text-muted">
              Delivery charges calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center font-space text-sm font-semibold bg-foreground text-background py-3 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all"
            >
              Proceed to checkout
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-center font-inter text-xs text-muted hover:text-foreground transition-colors py-1 cursor-pointer"
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  )
}