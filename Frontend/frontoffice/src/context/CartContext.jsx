import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext({ items: [], addToCart: () => {}, removeFromCart: () => {}, updateQuantity: () => {}, clearCart: () => {}, itemCount: 0 })

const CART_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/** Returns the localStorage key scoped to the current user's email (or guest). */
function getStorageKey() {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const email = user?.email || 'guest'
    return `cart_items_${email}`
  } catch {
    return 'cart_items_guest'
  }
}

function loadCart() {
  try {
    const key = getStorageKey()
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    // Check TTL — if savedAt older than 24h, discard
    const meta = localStorage.getItem(`${key}_meta`)
    if (meta) {
      const { savedAt } = JSON.parse(meta)
      if (Date.now() - savedAt > CART_TTL_MS) {
        localStorage.removeItem(key)
        localStorage.removeItem(`${key}_meta`)
        return []
      }
    }

    // Validate items have the expected shape
    const valid = parsed.filter(i => i.key && i.productId && i.nom && typeof i.price === 'number')
    if (valid.length !== parsed.length) {
      localStorage.removeItem(key)
      return valid
    }
    return valid
  } catch {
    return []
  }
}

function saveCart(items) {
  try {
    const key = getStorageKey()
    localStorage.setItem(key, JSON.stringify(items))
    localStorage.setItem(`${key}_meta`, JSON.stringify({ savedAt: Date.now() }))
  } catch {
    // Quota exceeded — silently ignore
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [storageKey, setStorageKey] = useState(getStorageKey)

  // Reload cart whenever the logged-in user changes (login / logout)
  useEffect(() => {
    const handleUserChange = () => {
      const newKey = getStorageKey()
      setStorageKey(newKey)
      setItems(loadCart())
    }
    window.addEventListener('userChanged', handleUserChange)
    return () => window.removeEventListener('userChanged', handleUserChange)
  }, [])

  useEffect(() => { saveCart(items) }, [items])

  // Sync across tabs for the same user
  useEffect(() => {
    const handler = (e) => {
      if (e.key === storageKey) setItems(e.newValue ? JSON.parse(e.newValue) : [])
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [storageKey])

  // Auto-expire: check TTL every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const key = getStorageKey()
      const meta = localStorage.getItem(`${key}_meta`)
      if (meta) {
        const { savedAt } = JSON.parse(meta)
        if (Date.now() - savedAt > CART_TTL_MS) {
          localStorage.removeItem(key)
          localStorage.removeItem(`${key}_meta`)
          setItems([])
        }
      }
    }, 60_000)
    return () => clearInterval(timer)
  }, [])

  const addToCart = useCallback((product, color, size, price, image, quantity = 1) => {
    setItems(prev => {
      const key = `${product.id}-${color}-${size}`
      const existing = prev.find(i => i.key === key)
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i)
      }
      return [...prev, {
        key,
        productId: product.id,
        nom: product.nom,
        slug: product.slug,
        color,
        size,
        price,
        image,
        imageUrl: product.imageUrl || image,
        quantity,
      }]
    })
  }, [])

  const removeFromCart = useCallback((key) => {
    setItems(prev => prev.filter(i => i.key !== key))
  }, [])

  const updateQuantity = useCallback((key, quantity) => {
    if (quantity < 1) return
    setItems(prev => prev.map(i => i.key === key ? { ...i, quantity } : i))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

