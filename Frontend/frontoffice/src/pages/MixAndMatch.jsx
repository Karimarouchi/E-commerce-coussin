import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import {
  MIX_MATCH_MANNEQUIN_ASSETS,
  MIX_MATCH_RENDER_ORDER,
  MIX_MATCH_ROLE_LABELS,
  MIX_MATCH_SLOT_LAYOUTS,
  createSelectionItem,
  extractProductColors,
  formatCurrency,
  getAvailableSizes,
  getDisplayPrice,
  getProductMixImage,
  resolveMixMatchGender,
  resolveMixMatchRole,
  slugifyValue,
} from '../utils/mixMatch'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
const EMPTY_SELECTION = {
  top: null,
  outerwear: null,
  bottom: null,
  piece_unique: null,
  shoes: null,
  accessory: null,
}

function getRootGender(rootCategory) {
  const haystack = `${rootCategory?.nom || ''} ${rootCategory?.slug || ''}`.toLowerCase()
  if (haystack.includes('femme')) return 'femme'
  if (haystack.includes('homme')) return 'homme'
  return null
}

function isSelected(selection, productId, color) {
  return selection?.productId === productId && selection?.color === color
}

function ProductCard({ product, selected, onSelect }) {
  const colors = extractProductColors(product)
  const [activeColor, setActiveColor] = useState(colors[0]?.name || 'Standard')

  useEffect(() => {
    setActiveColor(colors[0]?.name || 'Standard')
  }, [product.id])

  const image = product.imageUrl || getProductMixImage(product, activeColor, 0)
  const price = getDisplayPrice(product)

  return (
    <article
      className={`group rounded-[28px] border overflow-hidden transition-all ${
        selected ? 'border-slate-900 bg-slate-100 shadow-sm' : 'border-white bg-white/70 hover:border-slate-200 hover:bg-white'
      }`}
    >
      <button type="button" onClick={() => onSelect(product, activeColor)} className="w-full text-left">
        <div className="aspect-square bg-[#efede9] overflow-hidden">
          {image ? (
            <img src={image} alt={product.nom} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">image</span>
            </div>
          )}
        </div>
        <div className="px-3 pt-3 pb-2 space-y-1">
          <p className="text-sm font-medium text-slate-800 line-clamp-2 min-h-[2.5rem]">{product.nom}</p>
          <p className="text-xl font-semibold tracking-tight text-slate-900">{formatCurrency(price)}</p>
        </div>
      </button>

      {colors.length > 0 && (
        <div className="px-3 pb-3 mt-2 flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={`${product.id}-${color.name}`}
              type="button"
              title={color.name}
              onClick={() => setActiveColor(color.name)}
              className={`h-7 w-7 rounded-full border-2 transition-all ${activeColor === color.name ? 'border-slate-900 scale-105' : 'border-white'}`}
              style={{ backgroundColor: color.swatch || '#d1d5db' }}
            />
          ))}
        </div>
      )}
    </article>
  )
}

function SelectedItemRow({ slot, item, onRemove, onSizeChange }) {
  const sizes = getAvailableSizes(item.product)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="h-16 w-16 rounded-2xl bg-[#efede9] overflow-hidden flex items-center justify-center flex-shrink-0">
        {(() => { const thumb = item.product.imageUrl || getProductMixImage(item.product, item.color, 0); return thumb ? (
          <img src={thumb} alt={item.product.nom} className="h-full w-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-3xl text-slate-300">image</span>
        )})()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{MIX_MATCH_ROLE_LABELS[slot] || slot}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{item.product.nom}</p>
        <p className="text-xs text-slate-500">{item.color}</p>
      </div>
      <select
        value={item.size}
        onChange={(event) => onSizeChange(slot, event.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-slate-900"
      >
        {sizes.map((size) => (
          <option key={`${item.productId}-${size}`} value={size}>{size}</option>
        ))}
      </select>
      <button type="button" onClick={() => onRemove(slot)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900">
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  )
}

export default function MixAndMatch() {
  const navigate = useNavigate()
  const { rootSlug, subCategorySlug } = useParams()
  const { addToCart } = useCart()

  const [categories, setCategories] = useState([])
  const [rootCategory, setRootCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategoryId, setActiveCategoryId] = useState(null)
  const [selection, setSelection] = useState(EMPTY_SELECTION)
  const [showLightbox, setShowLightbox] = useState(false)

  const catScrollRef = useRef(null)

  const scrollCats = (dir) => {
    if (catScrollRef.current) {
      catScrollRef.current.scrollBy({ left: dir * 170, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    axios.get(`${API}/public/categories/menu`)
      .then((response) => setCategories(response.data || []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (!categories.length) return

    const desired = slugifyValue(rootSlug)
    const matched = categories.find((category) => slugifyValue(category.slug || category.nom) === desired)
    const fallback = categories.find((category) => {
      const normalized = slugifyValue(category.nom)
      return normalized === 'homme' || normalized === 'femme'
    })

    setRootCategory(matched || fallback || categories[0])
  }, [categories, rootSlug])

  useEffect(() => {
    if (!rootCategory?.id) return

    // Reset selection when switching category (femme ↔ homme)
    setSelection(EMPTY_SELECTION)

    setLoading(true)
    axios.get(`${API}/public/products/parent-category/${rootCategory.id}`)
      .then((response) => setProducts(response.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [rootCategory?.id])

  const activeGender = useMemo(() => getRootGender(rootCategory), [rootCategory])

  const eligibleProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.mixMatchEnabled === false) return false
      const gender = resolveMixMatchGender(product)
      const role = resolveMixMatchRole(product)
      if (!role) return false
      if (!activeGender) return true
      return gender === activeGender || gender === 'unisexe'
    })
  }, [activeGender, products])

  const categoryCards = useMemo(() => {
    const rootChildren = rootCategory?.children || []
    return rootChildren
      .map((child) => {
        const childProducts = eligibleProducts.filter((product) => product.categoryId === child.id)
        if (childProducts.length === 0) return null
        return {
          ...child,
          count: childProducts.length,
          thumb: child.imageUrl || getProductMixImage(childProducts[0], extractProductColors(childProducts[0])[0]?.name, childProducts[0].mixMatchImageIndex),
        }
      })
      .filter(Boolean)
  }, [eligibleProducts, rootCategory])

  useEffect(() => {
    if (!categoryCards.length) {
      setActiveCategoryId(null)
      return
    }

    const matched = categoryCards.find((category) => slugifyValue(category.slug || category.nom) === slugifyValue(subCategorySlug))
    setActiveCategoryId(matched?.id || categoryCards[0].id)
  }, [categoryCards, subCategorySlug])

  const visibleProducts = useMemo(() => {
    if (!activeCategoryId) return eligibleProducts
    return eligibleProducts.filter((product) => product.categoryId === activeCategoryId)
  }, [activeCategoryId, eligibleProducts])

  const selectedItems = useMemo(() => {
    return MIX_MATCH_RENDER_ORDER
      .map((slot) => ({ slot, item: selection[slot] }))
      .filter(({ item }) => Boolean(item))
  }, [selection])

  const total = selectedItems.reduce((sum, { item }) => sum + item.price, 0)

  const handleSelectProduct = (product, colorName) => {
    const role = resolveMixMatchRole(product)
    if (!role) {
      toast.error('Ce produit n\'a pas de placement Mix & Match exploitable.')
      return
    }

    setSelection((prev) => {
      const next = { ...prev }
      const nextItem = createSelectionItem(product, colorName)

      if (isSelected(prev[role], product.id, nextItem.color)) {
        next[role] = null
        return next
      }

      if (role === 'piece_unique') {
        next.top = null
        next.bottom = null
        next.piece_unique = nextItem
        return next
      }

      if (role === 'top' || role === 'bottom') {
        next.piece_unique = null
      }

      next[role] = nextItem
      return next
    })
  }

  const handleRemoveSlot = (slot) => {
    setSelection((prev) => ({ ...prev, [slot]: null }))
  }

  const handleSizeChange = (slot, size) => {
    setSelection((prev) => {
      if (!prev[slot]) return prev
      return { ...prev, [slot]: { ...prev[slot], size } }
    })
  }

  const handleAddLookToCart = () => {
    if (selectedItems.length === 0) {
      toast.error('Sélectionnez au moins une pièce avant d\'ajouter le look au panier.')
      return
    }

    selectedItems.forEach(({ item }) => {
      addToCart(item.product, item.color, item.size, item.price, item.mainImage || item.product.imageUrl || item.image, 1)
    })
    toast.success('Le look complet a été ajouté au panier.')
    navigate('/panier')
  }

  const mannequinImage = MIX_MATCH_MANNEQUIN_ASSETS[activeGender] || MIX_MATCH_MANNEQUIN_ASSETS.femme

  return (
    <main className="min-h-screen bg-[#f3f0eb] pt-24 md:pt-28 pb-10">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6">
        <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white/40 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur-sm">
          <div className="grid min-h-[calc(100vh-9rem)] grid-cols-1 xl:grid-cols-[1.08fr_0.92fr]">
            <section className="relative border-b border-white/70 bg-[#f5f3ef] xl:border-b-0 xl:border-r xl:border-r-white/70">
              <div className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5">
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate(-1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-white bg-white/70 text-slate-700 hover:bg-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <div className="rounded-full border border-white bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    {rootCategory?.nom || 'Look'}
                  </div>
                </div>
                <div className="rounded-full border border-white bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Mix & Match
                </div>
              </div>

              <div className="mx-auto w-full max-w-[760px] px-6 pt-4 pb-8 md:px-10">
                <div className="relative w-full max-w-[550px] mx-auto">
                  {/* Mannequin + CSS overlay */}
                  <div className="relative overflow-hidden rounded-[34px] border border-white bg-white shadow-[0_28px_70px_rgba(15,23,42,0.12)]">
                    <div className="relative">
                      {/* Base mannequin — defines container height naturally */}
                      <img
                        src={mannequinImage}
                        alt={`Mannequin ${activeGender || 'mode'}`}
                        className="block w-full h-auto"
                        style={{ zIndex: 1, position: 'relative' }}
                      />

                      {/* Overlay each selected garment image */}
                      {selectedItems.map(({ slot, item }) => {
                        const layout = (MIX_MATCH_SLOT_LAYOUTS[activeGender || 'femme'] || {})[slot]
                        if (!item.image) return null
                        return (
                          <img
                            key={`overlay-${slot}-${item.productId}-${item.color}`}
                            src={item.image}
                            alt={`${MIX_MATCH_ROLE_LABELS[slot] || slot} — ${item.product.nom}`}
                            className="absolute inset-0 transition-opacity duration-300"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              zIndex: layout?.zIndex || 10,
                              pointerEvents: 'none',
                            }}
                          />
                        )
                      })}
                    </div>

                    {selectedItems.length > 0 && (
                      <div className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700 shadow-sm" style={{ zIndex: 100 }}>
                        {selectedItems.length} pièce{selectedItems.length > 1 ? 's' : ''}
                      </div>
                    )}

                    {/* Zoom / expand button */}
                    <button
                      type="button"
                      onClick={() => setShowLightbox(true)}
                      title="Agrandir"
                      className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-slate-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 hover:shadow-xl"
                      style={{ zIndex: 100 }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>zoom_in</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex min-h-full flex-col bg-[#f8f6f2]">
              <div className="flex items-center justify-between px-6 py-5 md:px-10">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Essayage éditorial</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Composez le look</h1>
                </div>
                <button onClick={() => setSelection({ top: null, outerwear: null, bottom: null, piece_unique: null, shoes: null, accessory: null })} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-500 hover:text-slate-900">
                  Réinitialiser
                </button>
              </div>

              <div className="border-y border-white/80 px-6 py-6 md:px-10">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sélectionnez une catégorie</h2>
                <div className="relative mt-5">
                  {/* Left arrow */}
                  {categoryCards.length > 5 && (
                    <button
                      type="button"
                      onClick={() => scrollCats(-1)}
                      className="absolute left-0 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md text-slate-600 hover:text-slate-900 transition-all hover:scale-110"
                    >
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                  )}
                  <div
                    ref={catScrollRef}
                    className={`no-scrollbar flex gap-4 overflow-x-auto pb-2 ${categoryCards.length > 5 ? 'px-11' : ''}`}
                  >
                    {categoryCards.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setActiveCategoryId(category.id)
                          navigate(`/mix-and-match/${slugifyValue(rootCategory?.slug || rootCategory?.nom)}/${slugifyValue(category.slug || category.nom)}`)
                        }}
                        className={`min-w-[150px] rounded-[28px] border p-3 text-left transition-all ${
                          activeCategoryId === category.id ? 'border-slate-300 bg-white shadow-sm' : 'border-white bg-white/60 hover:border-slate-200'
                        }`}
                      >
                        <div className={`mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-[24px] ${activeCategoryId === category.id ? 'bg-[#d8d6d2]' : 'bg-[#ebe7e2]'}`}>
                          {category.thumb ? (
                            <img src={category.thumb} alt={category.nom} className="h-full w-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-5xl text-slate-300">checkroom</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-base font-medium text-slate-900">{category.nom}</span>
                          <span className="text-xs text-slate-400">{category.count}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* Right arrow */}
                  {categoryCards.length > 5 && (
                    <button
                      type="button"
                      onClick={() => scrollCats(1)}
                      className="absolute right-0 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md text-slate-600 hover:text-slate-900 transition-all hover:scale-110"
                    >
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="grid h-full grid-cols-1 2xl:grid-cols-[1fr_360px]">
                  <div className="border-b border-white/80 px-6 py-6 md:px-10 2xl:border-b-0 2xl:border-r 2xl:border-r-white/80">
                    <div className="mb-5 flex items-center justify-between">
                      <p className="text-lg font-semibold text-slate-900">{visibleProducts.length} résultats</p>
                      {activeCategoryId && (
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          {categoryCards.find((category) => category.id === activeCategoryId)?.nom}
                        </p>
                      )}
                    </div>

                    {loading ? (
                      <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-white bg-white/50">
                        <div className="flex flex-col items-center gap-3 text-slate-500">
                          <span className="material-symbols-outlined animate-spin text-3xl">autorenew</span>
                          <p className="text-sm">Chargement du configurateur…</p>
                        </div>
                      </div>
                    ) : visibleProducts.length === 0 ? (
                      <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white/40 text-center text-slate-500">
                        <div className="space-y-2 px-6">
                          <p className="text-lg font-semibold text-slate-700">Aucun produit exploitable</p>
                          <p className="text-sm">Activez Mix & Match sur des produits de cette catégorie pour les faire apparaître ici.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {visibleProducts.map((product) => {
                          const role = resolveMixMatchRole(product)
                          const firstColor = extractProductColors(product)[0]?.name || 'Standard'
                          return (
                            <ProductCard
                              key={product.id}
                              product={product}
                              selected={isSelected(selection[role], product.id, selection[role]?.color || firstColor)}
                              onSelect={handleSelectProduct}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <aside className="flex flex-col gap-4 px-6 py-6 md:px-10">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Look sélectionné</p>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Résumé</h2>
                    </div>

                    <div className="space-y-3">
                      {selectedItems.length === 0 ? (
                        <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/50 px-5 py-8 text-center text-sm text-slate-500">
                          Sélectionnez des pièces à droite pour composer la silhouette.
                        </div>
                      ) : (
                        selectedItems.map(({ slot, item }) => (
                          <SelectedItemRow
                            key={`${slot}-${item.productId}-${item.color}`}
                            slot={slot}
                            item={item}
                            onRemove={handleRemoveSlot}
                            onSizeChange={handleSizeChange}
                          />
                        ))
                      )}
                    </div>

                    <div className="mt-auto rounded-[28px] border border-white bg-white/70 p-5 shadow-sm">
                      <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Total du look</p>
                          <p className="mt-1 text-sm text-slate-500">Ajout groupé au panier</p>
                        </div>
                        <p className="text-4xl font-light tracking-tight text-slate-900">{formatCurrency(total)}</p>
                      </div>
                      <p className="mb-5 text-xs leading-5 text-slate-500">
                        L'aperçu s'affiche instantanément sur le mannequin à gauche. Sélectionnez vos pièces et ajoutez le look complet au panier.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddLookToCart}
                        className="w-full rounded-full bg-slate-900 px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-slate-700"
                      >
                        Adoptez le look
                      </button>
                    </div>
                  </aside>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {showLightbox && (
        <div
          className="mm-lightbox-bg fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowLightbox(false)}
        >
          <div
            className="mm-lightbox-box relative flex gap-6 items-start"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '92vh' }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowLightbox(false)}
              className="absolute -right-3 -top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xl text-slate-700 hover:text-slate-900 transition-all hover:scale-110"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Mannequin + overlays — inline-block so container shrinks to img size */}
            <div className="relative inline-block overflow-hidden rounded-[28px] shadow-2xl flex-shrink-0">
              <img
                src={mannequinImage}
                alt={`Mannequin ${activeGender || 'mode'}`}
                className="block h-auto w-auto"
                style={{ maxHeight: '86vh', maxWidth: '55vw' }}
              />
              {selectedItems.map(({ slot, item }) => {
                const layout = (MIX_MATCH_SLOT_LAYOUTS[activeGender || 'femme'] || {})[slot]
                if (!item.image) return null
                return (
                  <img
                    key={`lb-${slot}-${item.productId}`}
                    src={item.image}
                    alt={item.product.nom}
                    className="absolute inset-0 w-full h-full"
                    style={{ objectFit: 'contain', zIndex: layout?.zIndex || 10, pointerEvents: 'none' }}
                  />
                )
              })}
            </div>

            {/* Right panel — résumé */}
            {selectedItems.length > 0 && (
              <div className="flex flex-col gap-4 rounded-[24px] bg-white/95 backdrop-blur-sm p-5 shadow-2xl min-w-[240px] max-w-[280px] overflow-y-auto" style={{ maxHeight: '86vh' }}>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Votre look</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{selectedItems.length} pièce{selectedItems.length > 1 ? 's' : ''} sélectionnée{selectedItems.length > 1 ? 's' : ''}</p>
                </div>

                <div className="space-y-3">
                  {selectedItems.map(({ slot, item }) => (
                    <div key={slot} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-[#f8f6f2] p-2">
                      <div className="h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden bg-white">
                        {(() => { const thumb = item.product.imageUrl || getProductMixImage(item.product, item.color, 0); return thumb ? (
                          <img src={thumb} alt={item.product.nom} className="h-full w-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-3xl text-slate-300 flex items-center justify-center h-full">image</span>
                        )})()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] uppercase tracking-[0.16em] text-slate-400">{MIX_MATCH_ROLE_LABELS[slot] || slot}</p>
                        <p className="text-xs font-semibold text-slate-900 line-clamp-2">{item.product.nom}</p>
                        <p className="text-[11px] text-slate-500">{item.color}</p>
                        {item.size && <p className="text-[11px] font-medium text-slate-700">Taille : {item.size}</p>}
                      </div>
                      <p className="text-sm font-bold text-slate-900 flex-shrink-0">{formatCurrency(item.price)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">Total look</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(total)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setShowLightbox(false); handleAddLookToCart() }}
                  className="w-full rounded-full bg-slate-900 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-slate-700"
                >
                  Adopter le look
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}