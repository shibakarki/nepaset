import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProductVariant } from '@/types/product'

export type CartItem = {
  _key: string          // unique: productId + variantId (or productId alone)
  productId: string
  productName: string
  productSlug: string
  productImage: string | null
  variant: ProductVariant | null
  quantity: number
  unitPrice: number     // base_price + price_delta at time of add
  maxStock: number      // stock at time of add — caps qty
}

type CartStore = {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, '_key' | 'quantity'>) => void
  removeItem: (key: string) => void
  updateQty: (key: string, qty: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

function makeKey(productId: string, variantId?: string) {
  return variantId ? `${productId}__${variantId}` : productId
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (incoming) => {
        const key = makeKey(incoming.productId, incoming.variant?.id)
        set((state) => {
          const existing = state.items.find((i) => i._key === key)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i._key === key
                  ? { ...i, quantity: Math.min(i.quantity + 1, i.maxStock) }
                  : i
              ),
              isOpen: true,
            }
          }
          return {
            items: [...state.items, { ...incoming, _key: key, quantity: 1 }],
            isOpen: true,
          }
        })
      },

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i._key !== key) })),

      updateQty: (key, qty) => {
        if (qty < 1) {
          get().removeItem(key)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i._key === key
              ? { ...i, quantity: Math.min(qty, i.maxStock) }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    { name: 'nepaset-cart' }
  )
)