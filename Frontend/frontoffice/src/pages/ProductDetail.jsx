import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useCart } from '../context/CartContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

function strip(value) {
  return value ? value.replace(/^\//, '') : ''
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days < 1) return "Aujourd'hui"
  if (days === 1) return 'Il y a 1 jour'
  if (days < 7) return `Il y a ${days} jours`
  if (days < 14) return 'Il y a 1 semaine'
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`
  if (days < 60) return 'Il y a 1 mois'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function StarRow({ note, className = '', filledFill = '1' }) {
  const value = Math.max(0, Math.min(5, Number(note) || 0))
  return (
    <div className={`flex text-[#f5bf22] ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="material-symbols-outlined"
          style={{ fontVariationSettings: n <= value ? `"FILL" ${filledFill}` : '"FILL" 0' }}
        >
          star
        </span>
      ))}
    </div>
  )
}

function parseColorImages(raw) {
  if (!raw) return {}
  try {
    const ci = typeof raw === 'string' ? JSON.parse(raw) : raw
    return ci && typeof ci === 'object' ? ci : {}
  } catch {
    return {}
  }
}

function getImagesForColor(colorImagesMap, colorName) {
  if (!colorName) return null
  if (colorImagesMap[colorName]) return colorImagesMap[colorName]
  const lower = colorName.toLowerCase()
  for (const [key, val] of Object.entries(colorImagesMap)) {
    if (key.toLowerCase() === lower) return val
  }
  return null
}

function extractColors(variants, colorsStr) {
  const map = new Map()
  for (const v of variants || []) {
    const name = v.label?.split(' - ')[0]?.trim()
    if (name && v.colorSwatch && !map.has(name)) map.set(name, v.colorSwatch)
  }
  if (map.size === 0 && colorsStr) {
    colorsStr.split(',').forEach((c, i) => {
      const name = c.trim()
      if (name && !map.has(name)) {
        map.set(name, name.startsWith('#') ? name : `hsl(${(i * 47) % 360} 32% 42%)`)
      }
    })
  }
  return [...map.entries()].map(([name, swatch]) => ({ name, swatch }))
}

function parseDimensions(sizesStr, product) {
  const fromSizes = (sizesStr || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (fromSizes.length > 0) return fromSizes
  if (product?.dimensionLength && product?.dimensionWidth) {
    return [`${product.dimensionLength}x${product.dimensionWidth}`]
  }
  return []
}

function isVariantInStock(variants, colorName, sizeName) {
  if (!variants?.length) return true
  const v = variants.find((vt) => {
    const parts = vt.label?.split(' - ')
    return parts?.[0]?.trim() === colorName && parts?.[1]?.trim() === sizeName
  })
  if (!v) {
    const byColor = variants.find((vt) => vt.label?.split(' - ')[0]?.trim() === colorName)
    return byColor ? byColor.stock > 0 : true
  }
  return v.stock > 0
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('fr-TN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} DT`
}

function resolveThumb(p) {
  if (p.imageUrl) return p.imageUrl
  const ci = parseColorImages(p.colorImages)
  for (const arr of Object.values(ci)) {
    if (Array.isArray(arr) && arr[0]) return arr[0]
  }
  return null
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedColorIdx, setSelectedColorIdx] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [similarProducts, setSimilarProducts] = useState([])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    setLoading(true)
    setError(null)
    setSelectedColorIdx(0)
    setSelectedSize(null)
    setActiveImageIdx(0)
    setQuantity(1)
    setReviews([])
    axios
      .get(`${API}/public/products/${slug}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError('Produit introuvable.'))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!product?.id) return
    axios
      .get(`${API}/public/reviews/product/${product.id}`)
      .then((res) => setReviews(Array.isArray(res.data) ? res.data : []))
      .catch(() => setReviews([]))
  }, [product?.id])

  useEffect(() => {
    if (!product) return
    const catId = product.parentCategoryId || product.categoryId
    if (!catId) return
    axios
      .get(`${API}/public/products/parent-category/${catId}`)
      .then((res) => {
        setSimilarProducts((res.data || []).filter((p) => p.id !== product.id).slice(0, 4))
      })
      .catch(() => {})
  }, [product])

  const colors = useMemo(
    () => (product ? extractColors(product.variants, product.colors) : []),
    [product],
  )
  const dimensions = useMemo(
    () => (product ? parseDimensions(product.sizes, product) : []),
    [product],
  )
  const colorImagesMap = useMemo(
    () => (product ? parseColorImages(product.colorImages) : {}),
    [product],
  )
  const selectedColor = colors[selectedColorIdx] || null

  const images = useMemo(() => {
    const overlayIndex = product?.mixMatchEnabled ? (product.mixMatchImageIndex ?? 2) : -1
    const filterOverlay = (arr) => arr.filter(Boolean).filter((_, i) => i !== overlayIndex)
    if (selectedColor) {
      const imgs = getImagesForColor(colorImagesMap, selectedColor.name)
      if (Array.isArray(imgs) && imgs.length > 0) return filterOverlay(imgs)
    }
    for (const arr of Object.values(colorImagesMap)) {
      if (Array.isArray(arr) && arr.length > 0) return filterOverlay(arr)
    }
    return product?.imageUrl ? [product.imageUrl] : []
  }, [selectedColor, colorImagesMap, product])

  useEffect(() => {
    setSelectedSize(null)
    setActiveImageIdx(0)
  }, [selectedColorIdx])

  useEffect(() => {
    if (dimensions.length === 1) setSelectedSize(dimensions[0])
  }, [dimensions])

  const hasPromo =
    product?.promoActive && product?.promoPrice > 0 && product?.promoPrice < product?.salePrice
  const displayPrice = hasPromo ? product.promoPrice : product?.salePrice || 0
  const promoPct = hasPromo
    ? Math.round(((product.salePrice - product.promoPrice) / product.salePrice) * 100)
    : 0

  const inStock =
    product?.stockStatus !== 'rupture' && (product?.stock == null || product.stock > 0)

  const canAdd =
    (!colors.length || selectedColor) &&
    (!dimensions.length || selectedSize) &&
    inStock

  const reviewStats = useMemo(() => {
    if (!reviews.length) return null
    const total = reviews.length
    const sum = reviews.reduce((acc, r) => acc + (Number(r.note) || 0), 0)
    const average = sum / total
    const distribution = [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => Number(r.note) === star).length
      return [star, Math.round((count / total) * 100)]
    })
    return { total, average, distribution }
  }, [reviews])

  const categoryPath = product?.parentCategorySlug
    ? `/produits/${strip(product.parentCategorySlug)}`
    : product?.categorySlug
      ? `/produits/${strip(product.categorySlug)}`
      : '/produits'

  const collectionLabel = (
    product?.collections?.split(',')[0]?.trim() ||
    product?.parentCategoryNom ||
    product?.categoryNom ||
    'Collection Signature'
  ).toUpperCase()

  const handleAddToCart = () => {
    if (!product || !canAdd) return
    addToCart(
      product,
      selectedColor?.name || 'Standard',
      selectedSize || 'Standard',
      displayPrice,
      images[activeImageIdx] || product.imageUrl || '',
      quantity,
    )
    toast.success(`${product.nom} ajouté au panier`)
  }

  const goPrevImage = () => {
    if (images.length < 2) return
    setActiveImageIdx((i) => (i - 1 + images.length) % images.length)
  }
  const goNextImage = () => {
    if (images.length < 2) return
    setActiveImageIdx((i) => (i + 1) % images.length)
  }

  if (loading) {
    return (
      <main className="max-w-container-max mx-auto px-4 md:px-10 py-8 min-h-[40vh] flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-primary animate-spin">autorenew</span>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="max-w-container-max mx-auto px-4 md:px-10 py-16 flex flex-col items-center gap-4">
        <p className="text-on-surface-variant">{error || 'Produit introuvable.'}</p>
        <Link to="/produits" className="text-primary underline">Retour à la boutique</Link>
      </main>
    )
  }

  return (
    <main className="max-w-container-max mx-auto px-4 md:px-10 py-8 bg-surface text-on-surface">
      {/* Breadcrumb — exact Stitch */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-caption mb-12 flex-wrap">
        <Link className="text-on-surface-variant hover:text-primary" to="/">Accueil</Link>
        <span className="text-outline-variant">/</span>
        <Link className="text-on-surface-variant hover:text-primary" to="/produits">Boutique</Link>
        {product.categoryNom && (
          <>
            <span className="text-outline-variant">/</span>
            <Link className="text-on-surface-variant hover:text-primary" to={categoryPath}>
              {product.categoryNom}
            </Link>
          </>
        )}
        <span className="text-outline-variant">/</span>
        <span className="text-primary font-bold">{product.nom}</span>
      </nav>

      {/* Product Grid — exact Stitch: 54% / 46% */}
      <div className="grid grid-cols-1 lg:grid-cols-[54%_46%] gap-12 items-start">
        {/* Gallery */}
        <div className="flex gap-4 md:gap-6 lg:sticky lg:top-28">
          {/* Vertical Thumbnails */}
          <div className="hidden md:flex flex-col gap-4 overflow-y-auto max-h-[520px] product-gallery pr-2">
            {(images.length > 0 ? images : [null]).map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImageIdx(i)}
                className={`w-[68px] h-[76px] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 flex-shrink-0 ${
                  activeImageIdx === i
                    ? 'active-thumb border-2 border-primary'
                    : 'border border-outline-variant hover:border-primary'
                }`}
              >
                {src ? (
                  <img src={src} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-surface-container" />
                )}
              </button>
            ))}
          </div>

          {/* Main Image — aspect-square like Stitch */}
          <div className="relative flex-1 bg-surface-container-low rounded-lg overflow-hidden group">
            {product.badgeNouveau && (
              <span className="absolute top-4 left-4 bg-secondary text-on-secondary px-3 py-1 rounded-full text-label-md z-10 font-label">
                Nouveau
              </span>
            )}
            {!product.badgeNouveau && hasPromo && (
              <span className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full text-label-md z-10 font-label">
                Promo
              </span>
            )}
            <div className="aspect-square w-full flex items-center justify-center bg-surface-container-low">
              {images[activeImageIdx] || images[0] ? (
                <img
                  src={images[activeImageIdx] || images[0]}
                  alt={product.nom}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <span className="material-symbols-outlined text-6xl text-outline">image</span>
              )}
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={goPrevImage}
                    className="bg-white/80 hover:bg-white p-2 rounded-full shadow-sm text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={goNextImage}
                    className="bg-white/80 hover:bg-white p-2 rounded-full shadow-sm text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="bg-white/80 hover:bg-white p-2 rounded-full shadow-sm text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">zoom_in</span>
                  </button>
                  <button
                    type="button"
                    className="bg-white/80 hover:bg-white p-2 rounded-full shadow-sm text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">fullscreen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section — exact Stitch */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-label-md text-on-surface-variant tracking-[0.1em] font-semibold font-label">
              {collectionLabel}
            </span>
            <div className="flex justify-between items-start mt-2 gap-3">
              <h1 className="text-display-lg-mobile md:text-headline-md font-display text-on-surface">
                {product.nom}
              </h1>
              <button
                type="button"
                className="text-primary hover:scale-110 transition-transform shrink-0"
                aria-label="Favoris"
              >
                <span className="material-symbols-outlined text-[28px]">favorite</span>
              </button>
            </div>
            {reviewStats && (
              <div className="flex items-center gap-2 mt-2">
                <StarRow note={Math.round(reviewStats.average)} />
                <span className="text-label-md text-on-surface-variant font-label">
                  {reviewStats.average.toFixed(1).replace('.', ',')}/5 ·{' '}
                  <a className="underline hover:text-primary" href="#avis">
                    {reviewStats.total} avis
                  </a>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-4 flex-wrap">
            <span className="text-headline-md font-display text-primary font-bold">
              {formatPrice(displayPrice)}
            </span>
            {hasPromo && (
              <>
                <span className="text-body-lg font-body text-outline line-through">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="bg-primary-fixed text-on-primary-fixed-variant px-2 py-0.5 rounded text-label-md font-bold font-label">
                  -{promoPct}%
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-[15px] leading-relaxed text-on-surface-variant max-w-prose font-body">
              {product.description}
            </p>
          )}

          {/* Colors */}
          {colors.length > 0 && (
            <div className="space-y-3">
              <p className="text-label-md font-bold text-on-surface font-label">
                Couleur:{' '}
                <span className="font-normal text-on-surface-variant">{selectedColor?.name}</span>
              </p>
              <div className="flex gap-3">
                {colors.map((c, i) => {
                  const active = selectedColorIdx === i
                  const isLight =
                    c.swatch?.toLowerCase() === '#ffffff' ||
                    c.swatch?.toLowerCase() === '#f5f5f0'
                  return (
                    <button
                      key={c.name}
                      type="button"
                      title={c.name}
                      onClick={() => setSelectedColorIdx(i)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                        active
                          ? 'ring-2 ring-primary ring-offset-2 text-white'
                          : 'hover:scale-110'
                      } ${isLight && !active ? 'border border-outline-variant' : ''}`}
                      style={{ backgroundColor: c.swatch }}
                    >
                      {active && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sizes / Dimensions */}
          {dimensions.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-label-md font-bold text-on-surface font-label">Taille</p>
                <button
                  type="button"
                  className="text-label-md text-primary hover:underline font-medium font-label"
                >
                  Guide des tailles
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {dimensions.map((dim) => {
                  const available =
                    !selectedColor ||
                    isVariantInStock(product.variants, selectedColor.name, dim)
                  const active = selectedSize === dim
                  return (
                    <button
                      key={dim}
                      type="button"
                      disabled={!available}
                      onClick={() => available && setSelectedSize(dim)}
                      className={`py-3 text-label-md font-label rounded-lg transition-colors ${
                        !available
                          ? 'border border-outline-variant/40 text-outline cursor-not-allowed line-through'
                          : active
                            ? 'border-2 border-primary bg-primary-fixed/20 text-primary font-bold'
                            : 'border border-outline-variant text-on-surface-variant hover:border-primary'
                      }`}
                    >
                      {dim}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className={`flex items-center gap-2 ${inStock ? 'text-secondary' : 'text-error'}`}>
            <span className="material-symbols-outlined text-[20px]">
              {inStock ? 'check_circle' : 'cancel'}
            </span>
            <span className="text-label-md font-label">
              {inStock
                ? 'En stock — Expédition sous 24 à 48 h'
                : 'Rupture de stock'}
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex gap-4">
              <div className="w-[116px] h-[56px] border border-outline-variant rounded-lg flex items-center justify-between px-4 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-on-surface-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="text-on-surface-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              <button
                type="button"
                disabled={!canAdd}
                onClick={handleAddToCart}
                className={`flex-1 h-[56px] bg-primary text-white rounded-lg flex items-center justify-center gap-2 font-bold hover:shadow-lg transition-all active:scale-95 ${
                  !canAdd ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                Ajouter au panier
              </button>
            </div>
            <button
              type="button"
              disabled={!canAdd}
              onClick={() => {
                handleAddToCart()
                navigate('/panier')
              }}
              className={`w-full h-[56px] border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary/5 transition-all ${
                !canAdd ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Acheter maintenant
            </button>
          </div>
        </div>
      </div>

      {/* Avis clients — réels uniquement ; masquée s’il n’y en a pas */}
      {reviewStats && (
        <section
          className="mt-20 py-20 border-t border-outline-variant"
          id="avis"
        >
          <h2 className="text-headline-md font-display mb-8">Avis clients</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center h-fit">
              <div className="text-[56px] font-display leading-none text-on-surface">
                {reviewStats.average.toFixed(1)}
              </div>
              <StarRow note={Math.round(reviewStats.average)} className="my-2" />
              <p className="text-label-md text-on-surface-variant mb-6 font-label">
                Basé sur {reviewStats.total} avis
              </p>
              <div className="w-full space-y-2">
                {reviewStats.distribution.map(([star, pct]) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-caption w-4">{star}</span>
                    <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-caption w-6 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
              <Link
                to="/profil"
                className="mt-8 w-full py-4 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all text-center"
              >
                Donner mon avis
              </Link>
            </div>

            <div className="lg:col-span-2 space-y-8">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-outline-variant pb-8">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-on-surface">
                        {review.clientName || 'Client'}
                      </p>
                      <StarRow
                        note={review.note}
                        className="scale-75 -ml-2 origin-left"
                      />
                    </div>
                    <span className="text-caption text-on-surface-variant">
                      {formatRelativeDate(review.createdAt)}
                    </span>
                  </div>
                  {review.commentaire && (
                    <p className="text-on-surface-variant text-body-md font-body">
                      {review.commentaire}
                    </p>
                  )}
                  {review.reponse && (
                    <p className="mt-3 text-body-md text-on-surface bg-surface-container/60 p-4 rounded-lg">
                      <span className="font-bold text-primary">Réponse Coussin & Co — </span>
                      {review.reponse}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Produits récemment consultés */}
      {similarProducts.length > 0 && (
        <section className="mt-20 py-16">
          <h2 className="text-headline-md font-display mb-8">
            Produits récemment consultés
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((item) => {
              const thumb = resolveThumb(item)
              const itemPrice =
                item.promoActive && item.promoPrice > 0 && item.promoPrice < item.salePrice
                  ? item.promoPrice
                  : item.salePrice
              return (
                <Link key={item.id} to={`/produit/${item.slug}`} className="group cursor-pointer">
                  <div className="aspect-square bg-surface-container rounded-lg overflow-hidden mb-4">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={item.nom}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-4xl">image</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-label-md font-bold font-label">{item.nom}</h3>
                  <p className="text-on-surface-variant font-medium">{formatPrice(itemPrice)}</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}
