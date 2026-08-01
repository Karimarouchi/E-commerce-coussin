import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen'
import HomeCategoriesSection from '../components/home/HomeCategoriesSection'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

/** Exact content from stitch_coussin_co_boutique_premium/code.html */
const STITCH = {
  heroImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC_Boi-ukDgogAKT31nAayvSCPTF9ODZiw_UHLriLpmteDHKCQ6thv4uWKKTKLbMBNNkfKGcLIM9xtJD11Bte96NbKRisyfG4FML2nBpqFZdZJM0xmvWU5YIgvFVVJLufcye7TIg_Rr6jQj2y-gGIL2t2UCsTM9FvcXJr9--KtuUTeLruYwt46AOPvjPbJG7t0Fsu13MN5xW-_zWZQu3MM3rmEUc2QlR6FXGFWTevcjL0svoIPiA_GD',
  heroEyebrow: "L'art du confort",
  heroTitle: 'Des coussins qui donnent une âme à votre intérieur',
  heroSubtitle:
    'Explorez des univers chaleureux, des matières raffinées et des compositions pensées pour sublimer votre maison.',
  collections: [
    {
      eyebrow: 'Édition Limitée',
      nom: 'Collection Héritage',
      description:
        'Inspirée par les techniques de tissage traditionnelles, cette collection célèbre la rencontre entre le savoir-faire ancestral et le minimalisme contemporain. Des pièces uniques aux reflets profonds.',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBXZR_ieaEVEYCW-P_e7mwzPisRH-GIHIxqSScYc7nkxCwTrLqc7U3j5NOQPozC4cF4FaPoEMLA2ctafIkbPTT4lmnwMsg8Ipk8ttVjYEWAZvCKBdBs7HMjbiNN3fuZ0KzjhvO0neBgqQCEnHjCkd95hVzgee0or6sXeWthlqLWKqBAyFIIx4sIwEx2WEAST7OVBxD3KYc4kJBVhMfPilP6JBw6NhMtZvxQ_GKTtK7P_3F7eNu7YOLq',
      reverse: false,
      accent: 'primary',
    },
    {
      eyebrow: "L'Art de Vivre",
      nom: 'Collection Sérénité',
      description:
        'Une ode à la douceur avec des teintes poudrées et des textures vaporeuses. Pensée pour transformer votre chambre en un sanctuaire de paix.',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDiQs0mvXeevZlVWpBwGZtFNuyGI_n6JaZvKqH2L-MeCwRjzCNiq7VwvWpGOBkB42esc2QXFxfz-Gm-wlCRUdVmYTMxgQ2Iedcuo0EJqxFJAh9GaFrH7iWWXpFgLhiUhGOMgmm7OLDhORWc-Wa4uk95EvRQsEr1dLk4VHfoEh31sKT7-K3TDzcWAXrIDClqGgbkxgczSQPtwyJbsxXXq8-qfCjPuWbpYNNbeaT2fyP026GzPD24Dmif',
      reverse: true,
      accent: 'secondary',
    },
  ],
  manifestoImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAKS-faZ9gBlXDVsneiu_d57UHOmpZszzWlm5WqY8Vqxus7_dQjLEQyjTwJoZURAWUzBSZ0AuWokmq-lgYoab38QCXjUe_G8AHSr7_87pJF0gSNy0_iwrKfPyPPMiW8ggIF0iLGFp4nd9Y_RTCfoqrIGrmjhCZtROYAyGPqbu0k_6omnlQmp-gr4gRvApZxIM9ow9JhK6Kn6iNkWqPZRTryiJdOw4GCPxG6yzEIClsWLiVY0WCNzvTc',
}

function pickImage(item) {
  return item?.imageUrl || item?.bannerUrl || item?.mobileImageUrl || null
}

function stripSlug(slug) {
  return String(slug || '').replace(/^\//, '')
}

function mergeCollections(apiList) {
  return STITCH.collections.map((slot, i) => {
    const api = apiList[i]
    if (!api) {
      return { ...slot, key: `stitch-col-${i}`, to: '/produits' }
    }
    const nom = api.nom || slot.nom
    return {
      ...slot,
      key: api.id ?? stripSlug(api.slug) ?? `col-${i}`,
      nom: nom.startsWith('Collection') ? nom : `Collection ${nom}`,
      description: api.description || slot.description,
      image: pickImage(api) || slot.image,
      eyebrow: api.tags?.split(',')[0]?.trim() || api.type || slot.eyebrow,
      to: `/collection/${stripSlug(api.slug)}`,
    }
  })
}

function cssUrl(url) {
  if (!url) return 'none'
  return `url(${JSON.stringify(url)})`
}

export default function Home() {
  const navigate = useNavigate()
  const [heroBanners, setHeroBanners] = useState([])
  const [heroIdx, setHeroIdx] = useState(0)
  const [collections, setCollections] = useState(() => mergeCollections([]))
  const [lsGone, setLsGone] = useState(false)
  const [dataReady, setDataReady] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')

  useEffect(() => {
    let segment = ''
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) segment = JSON.parse(userStr)?.segmentName || ''
    } catch {
      /* ignore */
    }

    const bannersP = fetch(
      `${API}/public/banners?position=HOMEPAGE_HERO${segment ? `&segment=${segment}` : ''}`,
    )
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((json) => {
        const list = Array.isArray(json?.data) ? json.data : []
        if (list.length) {
          setHeroBanners([...list].sort((a, b) => (a.priorite ?? 99) - (b.priorite ?? 99)))
          setHeroIdx(0)
        }
      })
      .catch(() => {})

    const collectionsP = Promise.all([
      fetch(`${API}/public/collections/homepage`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/public/collections/menu`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([homepageData, menuData]) => {
        const homepage = Array.isArray(homepageData) ? homepageData : homepageData?.data || []
        const menu = Array.isArray(menuData) ? menuData : menuData?.data || []
        const apiList = (homepage.length > 0 ? homepage : menu).slice(0, 2)
        setCollections(mergeCollections(apiList))
      })
      .catch(() => setCollections(mergeCollections([])))

    Promise.all([bannersP, collectionsP]).finally(() => setDataReady(true))
  }, [])

  useEffect(() => {
    if (heroBanners.length <= 1) return
    const delay = (heroBanners[heroIdx]?.dureeSecondes || 5) * 1000
    const timer = setTimeout(() => setHeroIdx((i) => (i + 1) % heroBanners.length), delay)
    return () => clearTimeout(timer)
  }, [heroIdx, heroBanners])

  const heroBanner = heroBanners[heroIdx] || null
  const heroImage = heroBanner?.imageUrl || STITCH.heroImage
  const heroTitle = heroBanner?.titre || STITCH.heroTitle
  const heroSubtitle = heroBanner?.sousTitre || STITCH.heroSubtitle
  const ctaPrimaryText = heroBanner?.ctaTexte || 'Explorer les catégories'
  const ctaPrimaryLink = heroBanner?.ctaLien
    ? heroBanner.ctaLien.startsWith('http')
      ? heroBanner.ctaLien
      : heroBanner.ctaLien.startsWith('/')
        ? heroBanner.ctaLien
        : `/${heroBanner.ctaLien}`
    : '#categories'

  const goTo = (href) => {
    if (!href) return
    if (href.startsWith('http')) {
      window.location.href = href
      return
    }
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    navigate(href)
  }

  return (
    <>
      {!lsGone && <LoadingScreen onComplete={() => setLsGone(true)} dataReady={dataReady} />}
      {dataReady && (
        <>
          {/* Hero — code.html */}
          <section className="mt-8 px-margin-mobile md:px-margin-desktop">
            <div className="max-w-[1400px] mx-auto relative rounded-[20px] overflow-hidden min-h-[700px] flex items-center">
              <div className="absolute inset-0 z-0">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                  style={{ backgroundImage: cssUrl(heroImage) }}
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
              <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-desktop">
                <div className="max-w-2xl bg-white/10 backdrop-blur-md p-10 md:p-16 rounded-xl border border-white/20">
                  <span className="inline-block font-label-md text-label-md uppercase tracking-[0.2em] text-on-primary-container mb-4">
                    {STITCH.heroEyebrow}
                  </span>
                  <h1 className="font-display-lg text-display-lg text-white mb-6 text-balance">
                    {heroTitle}
                  </h1>
                  <p className="font-body-lg text-body-lg text-white/90 mb-10 text-balance leading-relaxed">
                    {heroSubtitle}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => goTo(ctaPrimaryLink)}
                      className="bg-primary text-on-primary px-10 py-5 rounded-lg font-body-md font-bold hover:bg-primary-container transition-all duration-300 shadow-lg hover:shadow-primary/20"
                    >
                      {ctaPrimaryText}
                    </button>
                    <button
                      type="button"
                      onClick={() => goTo('#collections')}
                      className="border-2 border-white text-white px-10 py-5 rounded-lg font-body-md font-bold hover:bg-white hover:text-primary transition-all duration-300"
                    >
                      Découvrir les collections
                    </button>
                  </div>
                </div>
              </div>
              {heroBanners.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {heroBanners.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setHeroIdx(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === heroIdx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Bannière ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Categories — section dédiée, design Stitch exact */}
          <HomeCategoriesSection />

          {/* Collections — code.html */}
          <section
            id="collections"
            className="bg-surface-container-low py-section-gap overflow-hidden"
          >
            <div className="max-w-container-max mx-auto px-margin-desktop">
              <h2 className="font-headline-md text-headline-md text-center mb-20 text-primary">
                Nos collections signatures
              </h2>

              {collections.map((col, index) => (
                <div
                  key={col.key}
                  className={`flex flex-col ${
                    col.reverse ? 'md:flex-row-reverse' : 'md:flex-row'
                  } items-center gap-20 ${index === 0 ? 'mb-32' : ''} group`}
                >
                  <div className="w-full md:w-1/2 relative">
                    <div
                      className={`absolute w-40 h-40 rounded-full blur-3xl transition-colors ${
                        col.reverse
                          ? '-bottom-10 -right-10 bg-secondary-fixed-dim/20 group-hover:bg-secondary-fixed-dim/40'
                          : '-top-10 -left-10 bg-primary-fixed-dim/20 group-hover:bg-primary-fixed-dim/40'
                      }`}
                    />
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl z-10">
                      <div
                        className="w-full aspect-[4/5] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                        style={{ backgroundImage: cssUrl(col.image) }}
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2">
                    <span
                      className={`font-label-md tracking-widest uppercase mb-4 block ${
                        col.accent === 'secondary' ? 'text-secondary' : 'text-primary'
                      }`}
                    >
                      {col.eyebrow}
                    </span>
                    <h3 className="font-display-lg text-[40px] mb-6 leading-tight">{col.nom}</h3>
                    <p className="font-body-lg text-on-surface-variant mb-10 leading-relaxed max-w-lg">
                      {col.description}
                    </p>
                    <Link
                      to={col.to}
                      className={`group/cta flex items-center gap-4 font-bold text-lg hover:gap-6 transition-all ${
                        col.accent === 'secondary' ? 'text-secondary' : 'text-primary'
                      }`}
                    >
                      Découvrir la collection
                      <span
                        className={`h-px w-12 transition-all group-hover/cta:w-20 ${
                          col.accent === 'secondary' ? 'bg-secondary' : 'bg-primary'
                        }`}
                      />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Manifesto — code.html */}
          <section className="py-section-gap max-w-container-max mx-auto px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-16 bg-surface-container rounded-[40px] p-12 md:p-24 overflow-hidden relative">
              <div className="relative z-10">
                <h2 className="font-display-lg text-display-lg text-primary mb-8 leading-tight">
                  Le détail qui transforme une pièce
                </h2>
                <p className="font-body-lg text-on-surface-variant mb-8 leading-relaxed">
                  Chez Coussin & Co, nous croyons qu&apos;un objet textile n&apos;est pas qu&apos;un
                  simple accessoire. C&apos;est un vecteur d&apos;émotion, une promesse de confort et
                  l&apos;expression d&apos;un style de vie.
                </p>
                <p className="font-body-lg text-on-surface-variant mb-12 italic border-l-4 border-primary-fixed-dim pl-6">
                  &ldquo;Nous créons des objets qui invitent au toucher, des matières qui racontent
                  une histoire et des couleurs qui apaisent l&apos;esprit.&rdquo;
                </p>
                <Link
                  to="/produits"
                  className="font-label-md text-primary underline underline-offset-8 hover:text-primary-container"
                >
                  Notre philosophie
                </Link>
              </div>
              <div className="relative group h-[500px]">
                <div
                  className="w-full h-full rounded-2xl shadow-lg bg-cover bg-center transition-transform duration-700 group-hover:rotate-1"
                  style={{ backgroundImage: cssUrl(STITCH.manifestoImage) }}
                />
                <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-2xl shadow-xl max-w-[240px]">
                  <p className="font-caption text-primary uppercase font-bold mb-2">
                    Artisanat de Luxe
                  </p>
                  <p className="font-body-md text-on-surface">
                    Chaque fibre est sélectionnée pour sa durabilité et sa douceur incomparable.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits — code.html */}
          <section className="py-section-gap border-t border-outline-variant">
            <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                {
                  icon: 'eco',
                  title: 'Matières raffinées',
                  text: 'Lins biologiques et velours de coton certifiés.',
                },
                {
                  icon: 'grid_view',
                  title: 'Univers inspirants',
                  text: 'Des compositions pensées par des designers.',
                },
                {
                  icon: 'lightbulb',
                  title: 'Inspiration quotidienne',
                  text: 'Pour chaque pièce de votre maison.',
                },
                {
                  icon: 'support_agent',
                  title: 'Conseil personnalisé',
                  text: 'Notre équipe vous accompagne dans vos choix.',
                },
              ].map((item) => (
                <div key={item.title} className="text-center group">
                  <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6 transition-colors group-hover:bg-primary-fixed">
                    <span className="material-symbols-outlined text-primary text-3xl">
                      {item.icon}
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-lg mb-2">{item.title}</h4>
                  <p className="font-body-md text-on-surface-variant">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Newsletter — code.html */}
          <section className="py-section-gap px-margin-mobile">
            <div className="max-w-4xl mx-auto bg-primary py-20 px-8 md:px-20 rounded-[30px] text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h2 className="font-display-lg text-white mb-6 relative z-10">
                Entrez dans l&apos;univers Coussin & Co
              </h2>
              <p className="font-body-lg text-white/80 mb-10 max-w-2xl mx-auto relative z-10">
                Rejoignez notre cercle d&apos;initiés pour recevoir nos guides de style et être
                informé en avant-première de nos nouvelles collections.
              </p>
              <form
                className="relative z-10 flex flex-col md:flex-row gap-4 max-w-lg mx-auto"
                onSubmit={(e) => {
                  e.preventDefault()
                  setNewsletterEmail('')
                }}
              >
                <input
                  className="flex-grow bg-white/10 border border-white/20 rounded-lg px-6 py-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  placeholder="Votre adresse email"
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button
                  className="bg-white text-primary font-bold px-10 py-4 rounded-lg hover:bg-surface transition-all active:scale-95 shadow-lg"
                  type="submit"
                >
                  S&apos;inscrire
                </button>
              </form>
            </div>
          </section>
        </>
      )}
    </>
  )
}
