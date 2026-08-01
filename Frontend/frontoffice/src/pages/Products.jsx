import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useCart } from '../context/CartContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const HERO_FALLBACK =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD2I4cghkicOfMKLKnw56wrhh1wBHZk1hnWX-ZURMtN5-VQ4MdhEDYVMoXsQwulCdJ6zV_NsCq7kTL2NALEgTaZAYqcDhJHwKvm3FMdv-mLQwNVoSEscPJVmcKaozW2Ah7XHaCZjRw3CMCT-3IL0mADgXoXuHxeoxh5PFVgCAfDCqB94JRpAtBVvFpYtkt4o2MurNOHPWMKbKZu3ytSKX59-fk19Mp-Fh54zwXbV_sax4NT1ot0kWdU'

const ADVANTAGES = [
  {
    icon: 'local_shipping',
    title: 'Livraison Premium',
    text: 'Suivi en temps réel partout en Tunisie.',
  },
  {
    icon: 'verified_user',
    title: 'Paiement Sécurisé',
    text: 'Cartes bancaires ou à la livraison.',
  },
  {
    icon: 'replay',
    title: 'Retours Faciles',
    text: "14 jours pour changer d'avis.",
  },
  {
    icon: 'support_agent',
    title: 'Service Client',
    text: 'À votre écoute du lundi au samedi.',
  },
]

function parseColorImages(p) {
  if (!p?.colorImages) return {}
  try {
    const ci = typeof p.colorImages === 'string' ? JSON.parse(p.colorImages) : p.colorImages
    return ci && typeof ci === 'object' ? ci : {}
  } catch {
    return {}
  }
}

/** Primary image for this product only — never shared fallbacks. */
function getProductImage(product) {
  const main = typeof product?.imageUrl === 'string' ? product.imageUrl.trim() : ''
  if (main) return main

  const ci = parseColorImages(product)
  for (const arr of Object.values(ci)) {
    if (!Array.isArray(arr)) continue
    const url = arr.find((u) => typeof u === 'string' && u.trim())
    if (url) return url.trim()
  }
  return null
}

/** Optional second image for hover (same product color set only). */
function getProductHoverImage(product, mainImage) {
  const ci = parseColorImages(product)
  for (const arr of Object.values(ci)) {
    if (!Array.isArray(arr)) continue
    for (const u of arr) {
      if (typeof u === 'string' && u.trim() && u.trim() !== mainImage) return u.trim()
    }
  }
  return null
}

function resolveColorSwatches(p) {
  if (p.variants?.length) {
    return [...new Set(p.variants.map((v) => v.colorSwatch).filter(Boolean))].slice(0, 6)
  }
  if (p.colors) {
    return p.colors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .slice(0, 6)
  }
  return []
}

function hasValidPrice(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function formatPrice(value) {
  if (!hasValidPrice(value)) return null
  return `${Number(value).toLocaleString('fr-TN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} DT`
}

/** Real display price from API fields (salePrice / promoPrice / variant.price). */
function productPrice(p) {
  const sale = Number(p?.salePrice)
  const promo = Number(p?.promoPrice)
  if (p?.promoActive && hasValidPrice(promo) && (!hasValidPrice(sale) || promo < sale)) {
    return promo
  }
  if (hasValidPrice(sale)) return sale
  if (p?.variants?.length) {
    const prices = p.variants.map((v) => Number(v.price)).filter(hasValidPrice)
    if (prices.length) return Math.min(...prices)
  }
  return null
}

function isRealPromo(p) {
  const sale = Number(p?.salePrice)
  const promo = Number(p?.promoPrice)
  return Boolean(
    p?.promoActive && hasValidPrice(promo) && hasValidPrice(sale) && promo < sale,
  )
}

function stripSlug(value) {
  return value ? value.replace(/^\//, '') : ''
}

function defaultColor(p) {
  return resolveColorSwatches(p)[0] || p.colors?.split(',')[0]?.trim() || 'Standard'
}

function defaultSize(p) {
  if (p.dimensionLength && p.dimensionWidth) {
    return `${p.dimensionLength}x${p.dimensionWidth}cm`
  }
  if (p.sizes) {
    return p.sizes.split(',').map((s) => s.trim()).filter(Boolean)[0] || 'Unique'
  }
  return 'Unique'
}

export default function Products() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { categorySlug, subCategorySlug, collectionSlug } = useParams()

  const [categories, setCategories] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [collectionInfo, setCollectionInfo] = useState(null)

  const [selectedColors, setSelectedColors] = useState([])
  const [priceMax, setPriceMax] = useState(500)
  const [sortBy] = useState('nouveautes')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilterForm, setShowFilterForm] = useState(false)
  const ITEMS_PER_PAGE = 8

  useEffect(() => {
    axios
      .get(`${API}/public/categories/menu`)
      .then((res) => setCategories(res.data || []))
      .catch(() => {})
  }, [])

  const { parentCat, subCat, pageTitle, heroImage } = useMemo(() => {
    if (collectionSlug) {
      const title = collectionInfo?.nom || 'Collection'
      return {
        parentCat: null,
        subCat: null,
        pageTitle: title,
        heroImage: collectionInfo?.bannerUrl || collectionInfo?.imageUrl || HERO_FALLBACK,
      }
    }

    let parent = null
    let sub = null
    if (categories.length && categorySlug) {
      parent = categories.find((c) => stripSlug(c.slug) === categorySlug) || null
      if (parent && subCategorySlug) {
        sub = (parent.children || []).find((c) => stripSlug(c.slug) === subCategorySlug) || null
      }
    }

    return {
      parentCat: parent,
      subCat: sub,
      pageTitle: sub?.nom || parent?.nom || 'Tous nos coussins',
      heroImage: sub?.imageUrl || parent?.imageUrl || HERO_FALLBACK,
    }
  }, [categories, categorySlug, subCategorySlug, collectionSlug, collectionInfo])

  useEffect(() => {
    if (collectionSlug) {
      setLoading(true)
      setCurrentPage(1)
      Promise.all([
        axios.get(`${API}/public/products/collection/${collectionSlug}`),
        axios.get(`${API}/public/collections/slug/${collectionSlug}`),
      ])
        .then(([prodRes, colRes]) => {
          setAllProducts(prodRes.data || [])
          setCollectionInfo(colRes.data || null)
        })
        .catch(() => {
          setAllProducts([])
          setCollectionInfo(null)
        })
        .finally(() => setLoading(false))
      return
    }

    setCollectionInfo(null)
    if (!categories.length && categorySlug) return

    setLoading(true)
    setCurrentPage(1)

    let url = `${API}/public/products`
    if (subCat) url = `${API}/public/products/category/${subCat.id}`
    else if (parentCat) url = `${API}/public/products/parent-category/${parentCat.id}`

    axios
      .get(url)
      .then((res) => setAllProducts(res.data || []))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false))
  }, [parentCat, subCat, categories.length, categorySlug, collectionSlug])

  const availableColors = useMemo(() => {
    const map = new Map()
    allProducts.forEach((p) => {
      resolveColorSwatches(p).forEach((c) => {
        if (!map.has(c)) map.set(c, c)
      })
    })
    return [...map.keys()].slice(0, 12)
  }, [allProducts])

  const maxProductPrice = useMemo(() => {
    if (!allProducts.length) return 150
    const prices = allProducts.map(productPrice).filter(hasValidPrice)
    if (!prices.length) return 150
    const max = Math.max(...prices)
    return Math.max(Math.ceil(max / 10) * 10, 50)
  }, [allProducts])

  useEffect(() => {
    setPriceMax(maxProductPrice)
  }, [maxProductPrice])

  const explorerCategories = useMemo(() => {
    if (parentCat?.children?.length) return parentCat.children.slice(0, 6)
    return categories.slice(0, 6)
  }, [parentCat, categories])

  const productCountByCategoryId = useMemo(() => {
    const counts = new Map()
    allProducts.forEach((p) => {
      if (p.categoryId != null) {
        counts.set(p.categoryId, (counts.get(p.categoryId) || 0) + 1)
      }
      if (p.parentCategoryId != null && p.parentCategoryId !== p.categoryId) {
        counts.set(p.parentCategoryId, (counts.get(p.parentCategoryId) || 0) + 1)
      }
    })
    return counts
  }, [allProducts])

  const filteredProducts = useMemo(() => {
    let items = [...allProducts]

    if (selectedColors.length > 0) {
      items = items.filter((p) => {
        const swatches = resolveColorSwatches(p)
        const colorText = (p.colors || '').toLowerCase()
        return selectedColors.some(
          (c) => swatches.includes(c) || colorText.includes(String(c).toLowerCase()),
        )
      })
    }

    items = items.filter((p) => {
      const price = productPrice(p)
      if (!hasValidPrice(price)) return true
      return price <= priceMax
    })

    if (sortBy === 'prix-asc') {
      items.sort((a, b) => (productPrice(a) ?? Infinity) - (productPrice(b) ?? Infinity))
    } else if (sortBy === 'prix-desc') {
      items.sort((a, b) => (productPrice(b) ?? 0) - (productPrice(a) ?? 0))
    } else if (sortBy === 'nouveautes') {
      items.sort((a, b) => (b.badgeNouveau === a.badgeNouveau ? 0 : b.badgeNouveau ? 1 : -1))
    }

    return items
  }, [allProducts, selectedColors, priceMax, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const paginated = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    )
    setCurrentPage(1)
  }

  const goCategory = (cat) => {
    if (!cat) {
      navigate('/produits')
      return
    }
    const slug = stripSlug(cat.slug)
    if (parentCat?.children?.length) {
      navigate(`/produits/${stripSlug(parentCat.slug)}/${slug}`)
    } else {
      navigate(`/produits/${slug}`)
    }
    setCurrentPage(1)
  }

  const handleAddToCart = (e, product) => {
    e.stopPropagation()
    const price = productPrice(product)
    if (!hasValidPrice(price)) {
      toast.info('Prix sur demande — contactez-nous pour commander.')
      return
    }
    if (product.stockStatus === 'Rupture' || Number(product.stock) <= 0) {
      toast.error('Produit en rupture de stock')
      return
    }
    addToCart(
      product,
      defaultColor(product),
      defaultSize(product),
      price,
      getProductImage(product),
      1,
    )
    toast.success('Ajouté au panier')
  }

  const year = new Date().getFullYear()

  const resetFilters = () => {
    setSelectedColors([])
    setPriceMax(maxProductPrice)
    setCurrentPage(1)
  }

  return (
    <main className="bg-surface text-on-surface font-body text-body-md overflow-x-hidden">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-section-gap pt-10 pb-16">
        {/* Hero — Stitch */}
        <section className="relative h-[360px] md:h-[400px] w-full rounded-[20px] overflow-hidden group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${JSON.stringify(heroImage)})` }}
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative h-full flex flex-col justify-center px-6 md:px-12 text-white max-w-2xl space-y-6">
            <span className="inline-block bg-secondary text-on-secondary px-4 py-1 rounded-full font-label text-label-md self-start">
              Nouvelle collection {year}
            </span>
            <h1 className="font-display text-display-lg-mobile md:text-display-lg leading-tight">
              {collectionSlug || categorySlug
                ? pageTitle
                : 'Trouvez le coussin parfait pour votre intérieur'}
            </h1>
            <p className="font-body text-body-lg text-white/90">
              Découvrez notre sélection artisanale de coussins en lin, velours et fibres naturelles
              pour sublimer votre quotidien.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={() =>
                  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg"
              >
                Découvrir la collection
              </button>
              <button
                type="button"
                onClick={() => setShowFilterForm(true)}
                className="bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all active:scale-95"
              >
                Filtres
              </button>
            </div>
          </div>
        </section>

        {/* Formulaire filtres — prix + couleurs */}
        {showFilterForm && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowFilterForm(false)}
            role="presentation"
          >
            <form
              className="w-full max-w-md bg-surface rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 border border-outline-variant/30"
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault()
                setCurrentPage(1)
                setShowFilterForm(false)
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-headline-sm text-primary">Filtres</h2>
                  <p className="text-sm text-on-surface-variant font-body mt-1">
                    Affinez par prix et couleur
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilterForm(false)}
                  className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
                  aria-label="Fermer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div>
                <label className="font-bold text-on-surface mb-3 block">
                  Prix maximum
                </label>
                <input
                  type="range"
                  min={0}
                  max={maxProductPrice}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-container rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-label-md text-on-surface-variant font-label">
                  <span>0 DT</span>
                  <span>
                    {priceMax >= maxProductPrice
                      ? `${maxProductPrice}+ DT`
                      : `${priceMax} DT`}
                  </span>
                </div>
              </div>

              {availableColors.length > 0 && (
                <div>
                  <label className="font-bold text-on-surface mb-3 block">Couleurs</label>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => {
                      const active = selectedColors.includes(color)
                      return (
                        <button
                          key={color}
                          type="button"
                          title={color}
                          onClick={() => toggleColor(color)}
                          className={`w-9 h-9 rounded-full border border-outline-variant transition-all hover:scale-110 ${
                            active ? 'ring-2 ring-primary ring-offset-2' : ''
                          }`}
                          style={{
                            backgroundColor: color,
                            boxShadow:
                              String(color).toLowerCase() === '#ffffff' ||
                              String(color).toLowerCase() === 'white'
                                ? 'inset 0 0 0 1px #dcc0b9'
                                : undefined,
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface font-bold hover:bg-surface-container transition-colors"
                >
                  Réinitialiser
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-colors"
                >
                  Appliquer
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Explorer par catégorie — cercles */}
        {explorerCategories.length > 0 && (
          <section className="space-y-stack-lg">
            <div className="flex justify-between items-end gap-4">
              <div>
                <h2 className="font-headline text-headline-md text-on-surface">
                  Explorer par catégorie
                </h2>
                <p className="text-on-surface-variant font-body">
                  Des designs pensés pour chaque pièce de votre maison.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/produits')}
                className="text-primary font-bold hover:underline flex items-center gap-1 shrink-0"
              >
                Tout voir <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {explorerCategories.map((cat) => {
                const slug = stripSlug(cat.slug)
                const active = parentCat?.children?.length
                  ? stripSlug(subCat?.slug || '') === slug
                  : stripSlug(categorySlug || '') === slug
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => goCategory(cat)}
                    className="group cursor-pointer text-left"
                  >
                    <div
                      className={`aspect-square rounded-full overflow-hidden mb-4 border-2 transition-all duration-300 ${
                        active
                          ? 'border-primary'
                          : 'border-transparent group-hover:border-primary'
                      }`}
                    >
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.nom}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-outline">category</span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-on-surface line-clamp-1">{cat.nom}</h3>
                      <p className="text-caption text-on-surface-variant font-body">
                        {(() => {
                          const count =
                            productCountByCategoryId.get(cat.id) ?? cat.childrenCount ?? 0
                          return `${count} ${count === 1 ? 'produit' : 'produits'}`
                        })()}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Product grid */}
        <div id="catalog" className="product-list-container !w-full !max-w-none !px-0 !pt-4 !pb-0">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
              <div>
                <h2 className="font-headline text-headline-sm text-on-surface">
                  {collectionSlug || categorySlug ? pageTitle : 'Tous les produits'}
                </h2>
                <p className="text-sm text-on-surface-variant font-body mt-1">
                  {filteredProducts.length}{' '}
                  {filteredProducts.length === 1 ? 'produit' : 'produits'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="product-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="product-card-skeleton">
                    <div className="product-card-skeleton__media" />
                    <div className="mt-4 h-3 w-1/3 rounded bg-surface-container animate-pulse" />
                    <div className="mt-2 h-5 w-4/5 rounded bg-surface-container animate-pulse" />
                    <div className="mt-3 h-5 w-1/4 rounded bg-surface-container animate-pulse" />
                  </div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3">search_off</span>
                <p className="font-body text-sm">Aucun produit trouvé.</p>
              </div>
            ) : (
              <div className="product-grid">
                {paginated.map((product) => {
                  const mainImg = getProductImage(product)
                  const hoverImg = mainImg ? getProductHoverImage(product, mainImg) : null
                  const currentPrice = productPrice(product)
                  const priceLabel = formatPrice(currentPrice)
                  const hasPromo = isRealPromo(product)
                  const outOfStock =
                    product.stockStatus === 'Rupture' || Number(product.stock) <= 0
                  const canAdd = hasValidPrice(currentPrice) && !outOfStock

                  return (
                    <article
                      key={product.id}
                      className="product-card group cursor-pointer"
                      onClick={() => navigate(`/produit/${product.slug}`)}
                    >
                      <div className="product-card__media">
                        {mainImg ? (
                          <img
                            src={mainImg}
                            alt={product.nom || 'Produit'}
                            loading="lazy"
                            className={`product-card__img-main absolute inset-0 ${
                              hoverImg ? 'group-hover:opacity-0 transition-opacity duration-500' : ''
                            }`}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-on-surface-variant bg-[#f5f0e8] px-4 text-center">
                            <span className="material-symbols-outlined text-4xl text-outline">
                              weekend
                            </span>
                            <span className="text-xs font-body">Image bientôt disponible</span>
                          </div>
                        )}
                        {hoverImg ? (
                          <img
                            src={hoverImg}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          />
                        ) : null}

                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-[1]">
                          {product.badgeNouveau ? (
                            <span className="inline-flex items-center h-7 px-2.5 rounded-md bg-primary text-white text-[11px] font-bold uppercase tracking-wide">
                              Nouveau
                            </span>
                          ) : null}
                          {hasPromo ? (
                            <span className="inline-flex items-center h-7 px-2.5 rounded-md bg-secondary text-white text-[11px] font-bold uppercase tracking-wide">
                              Promo
                            </span>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-3 right-3 z-[1] w-[38px] h-[38px] bg-white/90 rounded-full flex items-center justify-center text-primary shadow-sm hover:bg-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                          aria-label={`Ajouter ${product.nom || 'le produit'} aux favoris`}
                        >
                          <span
                            className="material-symbols-outlined text-[19px]"
                            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
                          >
                            favorite
                          </span>
                        </button>

                        <div className="product-card__quick-view z-[1]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/produit/${product.slug}`)
                            }}
                            className="w-full h-full bg-white/95 backdrop-blur-md text-on-surface text-sm font-bold rounded-lg shadow-md hover:bg-primary hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                            aria-label={`Aperçu rapide de ${product.nom || 'produit'}`}
                          >
                            Aperçu rapide
                          </button>
                        </div>
                      </div>

                      <div className="product-card__content">
                        <p className="text-[11px] text-on-surface-variant uppercase tracking-[0.08em] font-body">
                          {product.categoryNom || pageTitle}
                        </p>
                        <h3 className="mt-1.5 font-bold text-[17px] leading-[1.3] text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                          {product.nom}
                        </h3>
                        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                          {priceLabel ? (
                            <>
                              <span className="font-bold text-lg text-on-surface">{priceLabel}</span>
                              {hasPromo ? (
                                <span className="text-on-surface-variant/70 line-through text-sm font-label">
                                  {formatPrice(Number(product.salePrice))}
                                </span>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-sm font-medium text-on-surface-variant">
                              Prix sur demande
                            </span>
                          )}
                        </div>
                        <div className="product-card__actions">
                          <button
                            type="button"
                            disabled={!canAdd}
                            onClick={(e) => handleAddToCart(e, product)}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-surface-container hover:bg-primary hover:text-white text-on-surface text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none disabled:hover:bg-surface-container disabled:hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                          >
                            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                            {outOfStock ? 'Rupture' : 'Ajouter'}
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            {/* Pagination — 8 produits / page */}
            {!loading && totalPages > 1 && (
              <nav
                className="flex flex-col items-center gap-3 py-10 border-t border-outline-variant/30 mt-10"
                aria-label="Pagination des produits"
              >
                <p className="text-sm text-on-surface-variant font-body">
                  Page {currentPage} / {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1))
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40"
                    aria-label="Page précédente"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setCurrentPage(p)
                        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-colors ${
                        currentPage === p
                          ? 'bg-primary text-white'
                          : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                      aria-label={`Page ${p}`}
                      aria-current={currentPage === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40"
                    aria-label="Page suivante"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </nav>
            )}
        </div>

        {/* Advantages */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 py-10 border-y border-outline-variant/30">
          {ADVANTAGES.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">{item.icon}</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">{item.title}</h4>
                <p className="text-caption text-on-surface-variant font-body">{item.text}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
