'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/hooks/useCart'

function isValidUrl(url: string | null) {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')
}

type ShippingForm = {
  name: string
  phone: string
  address: string
  city: string
  notes: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ShippingForm>({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to shop if cart is empty
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace('/shop')
    }
  }, [mounted, items.length, router])

  // Pre-fill name from profile
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/auth/login?next=/checkout'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      if (profile?.full_name) {
        setForm(prev => ({ ...prev, name: profile.full_name }))
      }
    })
  }, [router])

  function update(field: keyof ShippingForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setError(null)
    setPlacing(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // ── Stock re-check ────────────────────────────────────────────────────
      const variantItems = items.filter(i => i.variant?.id)
      const noVariantItems = items.filter(i => !i.variant?.id)

      if (variantItems.length > 0) {
        const variantIds = variantItems.map(i => i.variant!.id)
        const { data: variants, error: vErr } = await supabase
          .from('product_variants')
          .select('id, stock')
          .in('id', variantIds)
        if (vErr) throw vErr

        for (const item of variantItems) {
          const live = variants?.find(v => v.id === item.variant!.id)
          if (!live || live.stock < item.quantity) {
            throw new Error(
              `"${item.productName}" (${[item.variant?.size, item.variant?.color].filter(Boolean).join(', ')}) only has ${live?.stock ?? 0} left in stock.`
            )
          }
        }
      }

      if (noVariantItems.length > 0) {
        const productIds = noVariantItems.map(i => i.productId)
        
        // Query the products table directly for stock instead of product_variants
        const { data: products, error: pErr } = await supabase
          .from('products')
          .select('id, stock')
          .in('id', productIds)
        
        if (pErr) throw pErr

        for (const item of noVariantItems) {
          const live = products?.find(p => p.id === item.productId)
          if (!live || live.stock < item.quantity) {
            throw new Error(
              `"${item.productName}" only has ${live?.stock ?? 0} left in stock.`
            )
          }
          // Clear non-existent variant IDs so they don't break order_items insert
          if (item.variant) {
            item.variant.id = undefined
          }
        }
      }
      // ─────────────────────────────────────────────────────────────────────

      const subtotal = totalPrice()

      // Insert order with correct column name: total_amount
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total_amount: subtotal,
          shipping_address: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
          },
          custom_request: form.notes.trim() || null,
          payment_method: 'cod'
        })
        .select('id')
        .single()

      if (orderError) throw orderError

      // Insert order items - now including unit_price to fulfill the constraint
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            variant_id: item.variant?.id ?? null,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            custom_design: null,
          }))
        )

      if (itemsError) throw itemsError

      clearCart()
      router.push('/account?order=success')
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err?.message || 'Something went wrong. Please try again.')
      setPlacing(false)
    }
  }

  const subtotal = totalPrice()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link href="/shop" className="font-inter text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to shop
        </Link>
      </div>

      <h1 className="font-space text-2xl font-bold text-foreground tracking-tight mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

        {/* ── Left: Shipping form ── */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-space text-sm font-semibold text-foreground uppercase tracking-widest mb-5">
              Delivery details
            </h2>
            <div className="space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    required
                    placeholder="Shiba Sharma"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-surface-2 focus:outline-none focus:border-foreground placeholder:text-muted/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">Phone number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    required
                    placeholder="98XXXXXXXX"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-surface-2 focus:outline-none focus:border-foreground placeholder:text-muted/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1.5">Street address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => update('address', e.target.value)}
                  required
                  placeholder="Thamel, Ward 26"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-surface-2 focus:outline-none focus:border-foreground placeholder:text-muted/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1.5">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => update('city', e.target.value)}
                  required
                  placeholder="Kathmandu"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-surface-2 focus:outline-none focus:border-foreground placeholder:text-muted/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1.5">
                  Delivery notes{' '}
                  <span className="text-muted/60">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => update('notes', e.target.value)}
                  rows={3}
                  placeholder="Any special instructions, landmarks, or customization notes..."
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-surface-2 focus:outline-none focus:border-foreground placeholder:text-muted/50 transition-colors resize-none"
                />
              </div>
            </div>
          </section>

          {/* Payment method */}
          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-space text-sm font-semibold text-foreground uppercase tracking-widest mb-4">
              Payment
            </h2>
            <div className="flex items-center gap-3 p-3 border border-foreground rounded-lg bg-surface-2">
              <div className="w-4 h-4 rounded-full border-2 border-foreground flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-foreground" />
              </div>
              <div>
                <p className="font-space text-sm font-medium text-foreground">Cash on delivery</p>
                <p className="font-inter text-xs text-muted">Pay when your order arrives</p>
              </div>
            </div>
          </section>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={placing || items.length === 0}
            className="w-full py-3.5 bg-foreground text-background font-space text-sm font-semibold rounded-xl hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all"
          >
            {placing
              ? 'Placing order…'
              : mounted
                ? `Place order · Rs. ${subtotal.toLocaleString('en-NP')}`
                : 'Place order'}
          </button>
        </form>

        {/* ── Right: Order summary ── */}
        <aside className="bg-surface border border-border rounded-xl p-6 lg:sticky lg:top-20">
          <h2 className="font-space text-sm font-semibold text-foreground uppercase tracking-widest mb-5">
            Order summary
          </h2>

          <ul className="space-y-4 mb-5">
            {items.map(item => (
              <li key={item._key} className="flex gap-3">
                <div className="w-14 h-14 rounded-xl bg-surface-2 overflow-hidden flex-shrink-0 relative border border-border">
                  {isValidUrl(item.productImage) ? (
                    <Image
                      src={item.productImage!}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-space text-sm font-semibold text-foreground truncate">
                    {item.productName}
                  </p>
                  {(item.variant?.size || item.variant?.color) && (
                    <p className="font-inter text-xs text-muted mt-0.5">
                      {[item.variant.size, item.variant.color].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="font-inter text-xs text-muted mt-0.5">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-space text-sm font-medium text-foreground shrink-0">
                  Rs. {(item.unitPrice * item.quantity).toLocaleString('en-NP')}
                </p>
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="text-foreground font-medium">
                Rs. {subtotal.toLocaleString('en-NP')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Delivery</span>
              <span className="text-muted">To be confirmed</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-space text-sm font-semibold text-foreground">Total</span>
              <span className="font-space text-sm font-semibold text-foreground">
                Rs. {subtotal.toLocaleString('en-NP')}
              </span>
            </div>
          </div>

          <p className="font-inter text-[11px] text-muted mt-4 leading-relaxed">
            By placing your order you agree to pay cash upon delivery. We'll contact you to confirm.
          </p>
        </aside>

      </div>
    </div>
  )
}