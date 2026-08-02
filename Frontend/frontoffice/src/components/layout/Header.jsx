import { Link, useNavigate } from 'react-router-dom'
import { BACKOFFICE_URL } from '../../config'
import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useFoAppearance } from '../../context/AppearanceContext'
import { useCart } from '../../context/CartContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const FEATURE_CARDS = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9xYVM3FuADOOK60wXWKmVBt7UtLc-Q0gtVBBJhuu6VmxqSLS2wa62IbOf-awKmWGx6UV8RSWf7zciBlhwvfUha42fNd5iouIwP0fZndIXid-Vv4e-GvKNNY1TaYIjdWIsp77HSuZcfFcExMTNfN9gJI43TN67xDaAERCJ1fQJL5iuht0mLawZW20wQAmUZTapwQVOX9OAa1diq5V2XMnqU7wSCBbJdHZxQbzTkTXhwSzwcKTMtjZ-',
    eyebrow: 'NOUVELLE COLLECTION',
    title: 'Découvrir les nouveautés',
    to: '/produits',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmWlSFzKcRW-aVaRv1Z4EvPGLo9VQ9e1_UhHi7q0w4vjYSZSqqgjd-LQ-casRMzIJMtm-CDOL3wWyRDsyI3_kcXJR_2vFO6tmdZkDce7nrQgo3SNzuGKZ9cpL2UwgLF7ITDdzotgSdW03KroCV41XaojShwCCH3Up8lSO3QLrT3WFVcG_x22peeC8vtlraGPdlp4PVfNJ_4yDNCIRucGhjUey48FVkZaQJ5CmifrpFAuOH5Y5pskop',
    eyebrow: 'CRÉEZ VOTRE AMBIANCE',
    title: 'Explorer nos inspirations',
    to: '/produits',
  },
]

export default function Header() {
  const navigate = useNavigate()
  const { itemCount } = useCart()
  const { brandName, logoNavbar, instagram, facebook } = useFoAppearance()

  const [showMenu, setShowMenu] = useState(false)
  const [showNav, setShowNav] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const menuRef = useRef(null)
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const [categories, setCategories] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [menuCollections, setMenuCollections] = useState([])

  useEffect(() => {
    axios
      .get(`${API}/public/categories/menu`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : []
        if (list.length > 0) {
          setCategories(list)
          setActiveIdx(0)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    axios
      .get(`${API}/public/collections/menu`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setMenuCollections(res.data)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    document.body.style.overflow = showNav ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [showNav])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setShowMenu(false)
    navigate('/login')
  }

  const active = categories[activeIdx] || null
  const children = active?.children || []
  const activeSlug = (active?.slug || '').replace(/^\//, '')
  const seasonLabel = active
    ? `COLLECTION ${new Date().getFullYear()} / ${active.nom}`.toUpperCase()
    : ''

  const categoryCollections = menuCollections.filter(
    (col) =>
      col.menuParentCategory &&
      active &&
      col.menuParentCategory.toUpperCase() === active.nom.toUpperCase(),
  )

  const featuredCollections = categoryCollections.filter((col) => col.menuFeatured)

  const displayCards = (() => {
    if (featuredCollections.length >= 2) {
      return featuredCollections.slice(0, 2).map((col, i) => ({
        src: col.imageUrl || col.bannerUrl || FEATURE_CARDS[i].src,
        eyebrow: i === 0 ? 'NOUVELLE COLLECTION' : 'CRÉEZ VOTRE AMBIANCE',
        title: col.nom,
        to: `/collection/${col.slug}`,
      }))
    }
    if (featuredCollections.length === 1) {
      return [
        {
          src: featuredCollections[0].imageUrl || featuredCollections[0].bannerUrl || FEATURE_CARDS[0].src,
          eyebrow: 'NOUVELLE COLLECTION',
          title: featuredCollections[0].nom,
          to: `/collection/${featuredCollections[0].slug}`,
        },
        FEATURE_CARDS[1],
      ]
    }
    if (active?.imageUrl) {
      return [
        {
          src: active.imageUrl,
          eyebrow: 'NOUVELLE COLLECTION',
          title: active.nom,
          to: `/produits/${activeSlug}`,
        },
        FEATURE_CARDS[1],
      ]
    }
    return FEATURE_CARDS
  })()

  const brand = brandName || 'Coussin & Co'

  const openNav = () => {
    setShowNav(true)
    setActiveIdx(0)
    setAnimKey(0)
  }

  const closeNav = () => setShowNav(false)

  const goTo = (path) => {
    closeNav()
    navigate(path)
  }

  const iconClass = 'text-on-surface-variant hover:text-primary'

  return (
    <>
      {/* Top bar */}
      <header
        className={`sticky top-0 z-50 border-b border-outline-variant/20 ${
          showNav ? 'bg-background' : 'bg-surface'
        }`}
      >
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto py-4">
          {/* Left: search */}
          <div className="flex items-center gap-3 flex-1">
            <button
              type="button"
              className={`transition-colors duration-300 hover:scale-105 active:scale-95 ${iconClass}`}
              aria-label="Rechercher"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>

          {/* Center: brand */}
          <div className="flex-1 flex justify-center">
            <Link
              to="/"
              onClick={closeNav}
              className="font-display text-2xl md:text-[32px] font-bold tracking-tight text-primary transition-opacity hover:opacity-80"
            >
              {logoNavbar ? (
                <img
                  src={logoNavbar}
                  alt={brand}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                brand
              )}
            </Link>
          </div>

          {/* Right: icons */}
          <div className="flex-1 flex justify-end items-center gap-4">
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className={`transition-colors duration-300 hover:scale-105 active:scale-95 ${iconClass}`}
                onClick={() => {
                  if (!user) {
                    navigate('/login')
                    return
                  }
                  setShowMenu((v) => !v)
                }}
                aria-label="Compte"
              >
                <span className="material-symbols-outlined">person</span>
              </button>

              {showMenu && user && (
                <div className="absolute right-0 top-full mt-4 w-64 z-[60] bg-surface-container-lowest/95 backdrop-blur-xl border border-outline-variant/40 rounded-2xl soft-shadow overflow-hidden">
                  <div className="px-5 pt-5 pb-4">
                    <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-on-surface-variant mb-1">
                      Mon compte
                    </p>
                    <p className="font-display text-[15px] text-on-surface leading-none">{user.name}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">{user.email}</p>
                  </div>
                  <div className="mx-5 border-t border-outline-variant/30" />
                  <div className="py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false)
                        navigate('/profil')
                      }}
                      className="w-full text-left px-5 py-3 font-label text-label-md text-on-surface-variant hover:text-primary"
                    >
                      Mon profil
                    </button>
                    {user.roleName && user.roleName !== 'CLIENT' && (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowMenu(false)
                          const t = localStorage.getItem('accessToken')
                          const r = localStorage.getItem('refreshToken')
                          const u = localStorage.getItem('user')
                          if (t && r) {
                            window.location.href = `${BACKOFFICE_URL}/auth-callback?accessToken=${encodeURIComponent(t)}&refreshToken=${encodeURIComponent(r)}&user=${encodeURIComponent(u || '')}`
                          } else {
                            window.location.href = BACKOFFICE_URL
                          }
                        }}
                        className="block w-full text-left px-5 py-3 font-label text-label-md text-on-surface-variant hover:text-primary"
                      >
                        Backoffice
                      </a>
                    )}
                  </div>
                  <div className="mx-5 border-t border-outline-variant/30" />
                  <div className="py-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 font-label text-label-md text-on-surface-variant hover:text-error"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className={`relative transition-colors duration-300 hover:scale-105 active:scale-95 ${iconClass}`}
              onClick={() => navigate('/panier')}
              aria-label="Panier"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className={`transition-colors duration-300 hover:scale-105 active:scale-95 ${iconClass}`}
              onClick={() => (showNav ? closeNav() : openNav())}
              aria-label={showNav ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              <span className="material-symbols-outlined text-[28px]">
                {showNav ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Full-screen mega menu ── */}
      <div
        className={`fixed inset-0 z-40 bg-background transition-opacity duration-500 ease-in-out ${
          showNav ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`h-full flex flex-col pt-24 md:pt-28 transition-all duration-500 ${
            showNav ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
          }`}
        >
          <div className="flex-1 max-w-container-max w-full mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-8 overflow-y-auto">
            {/* Col 1 — Nos collections */}
            <section className="lg:col-span-3 flex flex-col">
              <p className="font-label text-[11px] tracking-[0.2em] uppercase text-on-surface-variant mb-6">
                Nos collections
              </p>
              <nav className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => goTo('/produits')}
                  className="text-left font-display text-2xl md:text-[28px] leading-tight text-on-surface hover:text-primary transition-colors"
                >
                  Tous les coussins
                </button>
                {categories.map((cat, i) => {
                  const isActive = i === activeIdx
                  return (
                    <button
                      key={cat.id || cat.slug}
                      type="button"
                      onMouseEnter={() => {
                        if (i !== activeIdx) {
                          setActiveIdx(i)
                          setAnimKey((k) => k + 1)
                        }
                      }}
                      onClick={() => goTo(`/produits/${(cat.slug || '').replace(/^\//, '')}`)}
                      className={`text-left font-display text-2xl md:text-[28px] leading-tight transition-colors flex items-center gap-3 ${
                        isActive ? 'text-primary' : 'text-on-surface hover:text-primary'
                      }`}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      )}
                      {cat.nom}
                    </button>
                  )
                })}
              </nav>
            </section>

            {/* Col 2 — Subcategories */}
            <section className="lg:col-span-3 pt-1">
              {active ? (
                <div key={animKey} className="animate-nav-fade-in">
                  <p className="font-label text-[11px] tracking-[0.18em] uppercase text-on-surface-variant mb-6">
                    {seasonLabel}
                  </p>
                  <nav className="flex flex-col gap-3.5">
                    {children.length > 0 ? (
                      children.map((sub) => (
                        <button
                          key={sub.id || sub.slug}
                          type="button"
                          onClick={() =>
                            goTo(
                              `/produits/${activeSlug}/${(sub.slug || '').replace(/^\//, '')}`,
                            )
                          }
                          className="text-left font-body text-[15px] text-on-surface/80 hover:text-primary transition-colors"
                        >
                          {sub.nom}
                        </button>
                      ))
                    ) : (
                      <button
                        type="button"
                        onClick={() => goTo(`/produits/${activeSlug}`)}
                        className="text-left font-body text-[15px] text-on-surface/80 hover:text-primary transition-colors"
                      >
                        Tout voir
                      </button>
                    )}

                    {categoryCollections.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => goTo(`/collection/${col.slug}`)}
                        className="text-left font-body text-[15px] text-on-surface/80 hover:text-primary transition-colors"
                      >
                        {col.nom}
                      </button>
                    ))}
                  </nav>
                  <div className="pt-10">
                    <button
                      type="button"
                      onClick={() => goTo(`/produits/${activeSlug}`)}
                      className="font-label text-[11px] tracking-[0.18em] uppercase text-primary border-b-2 border-primary pb-1 hover:opacity-80 transition-opacity"
                    >
                      Voir tous les {active.nom}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-body text-on-surface-variant text-sm">
                  Aucune catégorie pour le moment.
                </p>
              )}
            </section>

            {/* Cols 3–4 — Featured cards */}
            <section className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayCards.map((card, i) => (
                <button
                  key={`${animKey}-${i}`}
                  type="button"
                  onClick={() => goTo(card.to)}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden group text-left soft-shadow-hover animate-nav-image-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <img
                    src={card.src}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="font-label text-[10px] tracking-[0.18em] uppercase text-white/85 mb-1">
                        {card.eyebrow}
                      </p>
                      <h3 className="font-display text-xl md:text-2xl text-white leading-tight">
                        {card.title}
                      </h3>
                    </div>
                    <span className="w-10 h-10 rounded-full border border-white/70 flex items-center justify-center text-white shrink-0 group-hover:bg-white group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </span>
                  </div>
                </button>
              ))}
            </section>
          </div>

          {/* Bottom utility bar */}
          <div className="border-t border-outline-variant/30">
            <div className="max-w-container-max mx-auto px-gutter py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <button
                  type="button"
                  className="font-body text-caption text-on-surface-variant hover:text-primary"
                >
                  Aide &amp; Contact
                </button>
                <button
                  type="button"
                  onClick={() => goTo(user ? '/profil' : '/login')}
                  className="font-body text-caption text-on-surface-variant hover:text-primary"
                >
                  Mon compte
                </button>
                <button
                  type="button"
                  className="font-body text-caption text-on-surface-variant hover:text-primary"
                >
                  Livraison &amp; Retours
                </button>
                <button
                  type="button"
                  className="font-body text-caption text-on-surface-variant hover:text-primary"
                >
                  Personnalisation
                </button>
              </div>
              <div className="flex items-center gap-3">
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  </a>
                )}
                {facebook && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
                    aria-label="Facebook"
                  >
                    <span className="material-symbols-outlined text-[16px]">public</span>
                  </a>
                )}
                {!instagram && !facebook && (
                  <>
                    <span className="w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    </span>
                    <span className="w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">public</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
