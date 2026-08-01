import { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import PageHeader from '../components/ui/PageHeader'
import KpiCard from '../components/ui/KpiCard'
import CustomSelect from '../components/ui/CustomSelect'
import Spinner from '../components/ui/Spinner'
import { promotionApi } from '../api/promotionApi'
import { categoryApi } from '../api/categoryApi'
import { productApi } from '../api/productApi'

/* ══════════════════════════════════════════════════════════════════════════════
   CONFIG MAPS
   ══════════════════════════════════════════════════════════════════════════ */
const typeConfig = {
  pourcentage:  { label: 'Pourcentage',       icon: 'percent',         badge: 'bg-blue-50 text-blue-700 border-blue-100' },
  fixe:         { label: 'Montant fixe',       icon: 'payments',        badge: 'bg-badge/5 text-badge border-badge/10' },
  livraison:    { label: 'Livraison gratuite', icon: 'local_shipping',  badge: 'bg-purple-50 text-purple-700 border-purple-100' },
  cadeau:       { label: 'Cadeau',             icon: 'redeem',          badge: 'bg-pink-50 text-pink-700 border-pink-100' },
  bogo:         { label: 'BOGO',               icon: 'shopping_bag',    badge: 'bg-amber-50 text-amber-700 border-amber-100' },
}

const statutConfig = {
  actif:    { label: 'ACTIF',    bg: 'bg-badge text-white' },
  expire:   { label: 'EXPIRÉ',   bg: 'bg-slate-400 text-white' },
  brouillon:{ label: 'BROUILLON',bg: 'bg-amber-400 text-white' },
  planifie: { label: 'PLANIFIÉ', bg: 'bg-blue-500 text-white' },
}

const segmentOptions = [
  { value: '', label: 'Tous les clients' },
  { value: 'vip', label: 'Clients VIP' },
  { value: 'nouveaux', label: 'Nouveaux clients' },
  { value: 'fideles', label: 'Clients fidèles' },
  { value: 'inactifs', label: 'Clients inactifs' },
]

const typeOptions = [
  { value: 'pourcentage', label: 'Pourcentage (%)' },
  { value: 'fixe', label: 'Montant fixe (DT)' },
  { value: 'livraison', label: 'Livraison gratuite' },
  { value: 'cadeau', label: 'Cadeau' },
  { value: 'bogo', label: 'BOGO (1 acheté = 1 offert)' },
]

const filterStatutOptions = ['Tous les statuts', 'Actif', 'Expiré', 'Brouillon', 'Planifié']
const filterTypeOptions = ['Tous les types', 'Pourcentage', 'Montant fixe', 'Livraison gratuite', 'Cadeau', 'BOGO']

const autoTriggersConfig = [
  {
    trigger: 'anniversaire',
    icon: 'cake',
    label: 'Anniversaire client',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    desc: 'Coupon offert automatiquement si l\'anniversaire du client est dans les 30 prochains jours.',
    rule: 'S\'applique uniquement aux comptes créés au moins 2 mois avant la date d\'anniversaire, pour éviter les abus.',
    defaultValeur: 10,
  },
  {
    trigger: 'premiere_commande',
    icon: 'redeem',
    label: 'Première commande',
    color: 'text-brand',
    bgColor: 'bg-brand/5',
    desc: 'Remise de bienvenue proposée automatiquement lors du premier achat.',
    rule: null,
    defaultValeur: 10,
  },
]

/* ══════════════════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════════════ */
function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let c = 'AUTO-'
  for (let i = 0; i < 5; i++) c += chars[Math.floor(Math.random() * chars.length)]
  return c
}

function InfoTip({ text }) {
  return (
    <span className="relative group inline-flex ml-1 align-middle">
      <span className="material-symbols-outlined text-slate-300 hover:text-brand cursor-help transition-colors" style={{ fontSize: '14px' }}>info</span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] leading-tight rounded-lg whitespace-normal w-52 text-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[60] shadow-lg">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </span>
    </span>
  )
}

function ProgressBar({ value, max, color = 'bg-brand' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{value}{max > 0 ? ` / ${max}` : ''}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
export default function Promotions() {
  /* ── Tab ── */
  const [tab, setTab] = useState('coupons')

  /* ── Loading ── */
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  /* ── Stats from API ── */
  const [stats, setStats] = useState(null)

  /* ── Categories from API ── */
  const [categoriesList, setCategoriesList] = useState([])

  /* ── Coupons state ── */
  const [coupons, setCoupons] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('Tous les statuts')
  const [filterType, setFilterType] = useState('Tous les types')
  const [page, setPage] = useState(1)
  const perPage = 10

  /* ── Modal create coupon ── */
  const [showCreate, setShowCreate] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newType, setNewType] = useState('pourcentage')
  const [newValeur, setNewValeur] = useState('')
  const [newMontantMin, setNewMontantMin] = useState('')
  const [newDateDebut, setNewDateDebut] = useState('')
  const [newDateFin, setNewDateFin] = useState('')
  const [newHeureDebut, setNewHeureDebut] = useState('00:00')
  const [newHeureFin, setNewHeureFin] = useState('23:59')
  const [newLimiteGlobale, setNewLimiteGlobale] = useState('')
  const [newLimiteClient, setNewLimiteClient] = useState('1')
  const [newSegment, setNewSegment] = useState('')
  const [newCategories, setNewCategories] = useState([])
  const [newAuto, setNewAuto] = useState(false)
  const [showPlanification, setShowPlanification] = useState(false)
  const [limiteMode, setLimiteMode] = useState('unique')

  /* ── Modal détail / performances ── */
  const [detailCoupon, setDetailCoupon] = useState(null)

  /* ── Auto triggers expand/config ── */
  const [expandedTrigger, setExpandedTrigger] = useState(null)
  const [autoTriggerValeurs, setAutoTriggerValeurs] = useState({ anniversaire: '10', premiere_commande: '10', hesitation: '5' })

  /* ── Discounts state ── */
  const [discounts, setDiscounts] = useState([])

  /* ── Remise rapide ── */
  const [remiseProduits, setRemiseProduits] = useState([])
  const [remisePickerOpen, setRemisePickerOpen] = useState(false)
  const [remisePickerSearch, setRemisePickerSearch] = useState('')
  const [allProducts, setAllProducts] = useState([])
  const [remiseType, setRemiseType] = useState('pourcentage')
  const [remiseValeur, setRemiseValeur] = useState('')
  const [remiseCatParent, setRemiseCatParent] = useState(null)
  const [remiseCatEnfant, setRemiseCatEnfant] = useState(null)
  const [remiseDateDebut, setRemiseDateDebut] = useState('')
  const [remiseDateFin, setRemiseDateFin] = useState('')

  /* ══════════════════════════════════════════════════════════════════════════
     DATA FETCHING
     ══════════════════════════════════════════════════════════════════════ */
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [couponsData, discountsData, statsData, catsData] = await Promise.all([
        promotionApi.getAllCoupons(),
        promotionApi.getAllDiscounts(),
        promotionApi.getStats(),
        categoryApi.getAll().catch(() => []),
      ])
      setCoupons(couponsData || [])
      setDiscounts(discountsData || [])
      setStats(statsData || null)
      setCategoriesList(catsData || [])
      productApi.getAll().then(setAllProducts).catch(() => {})
    } catch {
      toast.error('Erreur lors du chargement des promotions.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    return coupons.filter(c => {
      if (filterStatut !== 'Tous les statuts') {
        const map = { 'Actif': 'actif', 'Expiré': 'expire', 'Brouillon': 'brouillon', 'Planifié': 'planifie' }
        if (c.statut !== map[filterStatut]) return false
      }
      if (filterType !== 'Tous les types') {
        const map = { 'Pourcentage': 'pourcentage', 'Montant fixe': 'fixe', 'Livraison gratuite': 'livraison', 'Cadeau': 'cadeau', 'BOGO': 'bogo' }
        if (c.type !== map[filterType]) return false
      }
      if (search) {
        const q = search.toLowerCase()
        if (!c.code.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [coupons, filterStatut, filterType, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  /* ── Remise computed ── */
  const parentCats = useMemo(() => categoriesList.filter(c => !c.parentId), [categoriesList])
  const subCatsForParent = useMemo(() => {
    if (!remiseCatParent) return []
    return categoriesList.filter(c => c.parentId === remiseCatParent)
  }, [categoriesList, remiseCatParent])
  const productsForSubCat = useMemo(() => {
    if (!remiseCatEnfant) return []
    return allProducts.filter(p => p.categoryId === remiseCatEnfant)
  }, [allProducts, remiseCatEnfant])
  const autoNom = useMemo(() => {
    if (remiseProduits.length === 0) return ''
    const productPart = remiseProduits.length === 1
      ? remiseProduits[0].nom
      : `${remiseProduits.length} produits`
    if (!remiseValeur) return productPart
    const remisePart = remiseType === 'pourcentage' ? `−${remiseValeur}%` : `−${remiseValeur} DT`
    return `${productPart} — ${remisePart}`
  }, [remiseProduits, remiseType, remiseValeur])

  /* ── KPIs (from stats API) ── */
  const actifs = stats?.couponsActifs ?? 0
  const totalRevenus = stats?.totalRevenus ?? 0
  const totalUtilisations = stats?.totalUtilisations ?? 0
  const avgConversion = stats ? Math.round(stats.avgConversion) : 0

  /* ── Actions ── */
  const copierCode = (code) => {
    navigator.clipboard?.writeText(code)
    toast.success(`Code "${code}" copié !`)
  }

  const supprimerCoupon = async (id) => {
    try {
      await promotionApi.deleteCoupon(id)
      setCoupons(prev => prev.filter(c => c.id !== id))
      toast.success('Coupon supprimé.')
      refreshStats()
    } catch {
      toast.error('Erreur lors de la suppression.')
    }
  }

  const toggleStatut = async (id) => {
    try {
      const updated = await promotionApi.toggleCouponStatut(id)
      setCoupons(prev => prev.map(c => c.id === id ? updated : c))
      refreshStats()
    } catch {
      toast.error('Erreur lors du changement de statut.')
    }
  }

  const refreshStats = async () => {
    try {
      const s = await promotionApi.getStats()
      setStats(s)
    } catch { /* silent */ }
  }

  const openCreate = () => {
    setNewCode('')
    setNewType('pourcentage')
    setNewValeur('')
    setNewMontantMin('')
    setNewDateDebut('')
    setNewDateFin('')
    setNewHeureDebut('00:00')
    setNewHeureFin('23:59')
    setNewLimiteGlobale('')
    setNewLimiteClient('1')
    setNewSegment('')
    setNewCategories([])
    setNewAuto(false)
    setShowPlanification(false)
    setLimiteMode('unique')
    setShowCreate(true)
  }

  const submitCreate = async () => {
    if (!newCode.trim()) return toast.error('Le code est obligatoire.')
    if ((newType === 'pourcentage' || newType === 'fixe') && !newValeur) return toast.error('La valeur est obligatoire.')
    setSubmitting(true)
    try {
      const payload = {
        code: newCode.trim().toUpperCase(),
        type: newType,
        valeur: parseFloat(newValeur) || 0,
        montantMin: parseFloat(newMontantMin) || 0,
        dateDebut: showPlanification ? (newDateDebut || null) : null,
        dateFin: showPlanification ? (newDateFin || null) : null,
        heureDebut: showPlanification ? (newHeureDebut || null) : null,
        heureFin: showPlanification ? (newHeureFin || null) : null,
        limiteGlobale: limiteMode === 'unique' ? 0 : (parseInt(newLimiteGlobale) || 0),
        limiteClient: limiteMode === 'unique' ? 1 : (parseInt(newLimiteClient) || 0),
        segment: newSegment || null,
        categories: newCategories,
        produits: [],
        auto: newAuto,
      }
      const created = await promotionApi.createCoupon(payload)
      setCoupons(prev => [created, ...prev])
      setShowCreate(false)
      toast.success(`Coupon "${created.code}" créé avec succès !`)
      refreshStats()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la création du coupon.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleCatSelection = (cat) => {
    setNewCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  const resetFilters = () => {
    setSearch('')
    setFilterStatut('Tous les statuts')
    setFilterType('Tous les types')
    setPage(1)
  }

  /* ── Remise Actions ── */
  const toggleRemiseProduit = (product) => {
    setRemiseProduits(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    )
  }

  const submitRemise = async () => {
    if (!remiseType) return toast.error('Le type de remise est obligatoire.')
    if (!remiseValeur) return toast.error('La valeur est obligatoire.')
    if (remiseType === 'fixe' && remiseProduits.length > 0) {
      const tooHigh = remiseProduits.some(p => parseFloat(remiseValeur) >= p.salePrice)
      if (tooHigh) return toast.error('Le montant de remise doit être inférieur au prix du produit.')
    }
    setSubmitting(true)
    try {
      const catObj = remiseCatEnfant ? categoriesList.find(c => c.id === remiseCatEnfant) : null
      const productNames = remiseProduits.map(p => p.nom).join(', ')
      const payload = {
        nom: autoNom || productNames || 'Remise rapide',
        type: remiseType,
        valeur: parseFloat(remiseValeur) || 0,
        productName: productNames || null,
        categoryId: catObj?.id || null,
        prixOriginal: remiseProduits[0]?.salePrice || 0,
        dateDebut: remiseDateDebut || null,
        dateFin: remiseDateFin || null,
      }
      const created = await promotionApi.createDiscount(payload)
      setDiscounts(prev => [created, ...prev])
      toast.success('Remise appliquée avec succès !')
      setRemiseProduits([])
      setRemisePickerOpen(false)
      setRemiseValeur('')
      setRemiseCatParent(null)
      setRemiseCatEnfant(null)
      setRemiseDateDebut('')
      setRemiseDateFin('')
      refreshStats()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la création de la remise.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteDiscount = async (id) => {
    try {
      await promotionApi.deleteDiscount(id)
      setDiscounts(prev => prev.filter(d => d.id !== id))
      toast.success('Remise supprimée.')
      refreshStats()
    } catch {
      toast.error('Erreur lors de la suppression.')
    }
  }

  const toggleDiscountStatut = async (id) => {
    try {
      const updated = await promotionApi.toggleDiscountStatut(id)
      setDiscounts(prev => prev.map(d => d.id === id ? updated : d))
    } catch {
      toast.error('Erreur lors du changement de statut.')
    }
  }

  /* ── Auto trigger handlers ── */
  const handleCreateAutoTrigger = async (trigger, valeur) => {
    if (!valeur || parseFloat(valeur) <= 0) return toast.error('Saisissez un taux valide.')
    setSubmitting(true)
    try {
      const created = await promotionApi.createCoupon({
        code: genCode(),
        type: 'pourcentage',
        valeur: parseFloat(valeur),
        montantMin: 0,
        limiteGlobale: 0,
        limiteClient: 1,
        segment: null,
        categories: [],
        produits: [],
        auto: true,
        autoTrigger: trigger,
      })
      setCoupons(prev => [created, ...prev])
      toast.success('Déclencheur activé !')
      refreshStats()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la création.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateAutoTrigger = async (existing, valeur) => {
    setSubmitting(true)
    try {
      const updated = await promotionApi.updateCoupon(existing.id, {
        code: existing.code,
        type: existing.type,
        valeur: parseFloat(valeur) || existing.valeur,
        montantMin: existing.montantMin || 0,
        limiteGlobale: existing.limiteGlobale || 0,
        limiteClient: existing.limiteClient || 1,
        segment: existing.segment || null,
        categories: existing.categories || [],
        produits: [],
        auto: true,
        autoTrigger: existing.autoTrigger,
      })
      setCoupons(prev => prev.map(c => c.id === existing.id ? updated : c))
      toast.success('Mis à jour !')
    } catch {
      toast.error('Erreur lors de la mise à jour.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Remise preview helper ── */
  const calcRemisePreview = (salePrice) => {
    const orig = salePrice || 0
    const montant = remiseType === 'pourcentage'
      ? orig * (parseFloat(remiseValeur) || 0) / 100
      : parseFloat(remiseValeur) || 0
    return { orig, montant, final: Math.max(0, orig - montant) }
  }
  const getProductThumb = (p) => {
    if (p.imageUrl) return p.imageUrl
    try {
      const ci = JSON.parse(p.colorImages || '[]')
      return ci[0]?.images?.[0] || null
    } catch { return null }
  }

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner /></div>

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* ── Header ── */}
      <PageHeader title="Coupons & Remises">
        <PageHeader.SecondaryBtn icon="download">Exporter</PageHeader.SecondaryBtn>
        <PageHeader.PrimaryBtn icon="add" onClick={openCreate}>Ajouter un coupon</PageHeader.PrimaryBtn>
      </PageHeader>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Coupons actifs" value={actifs} sub={`${coupons.length} total`} subColor="text-slate-400" icon="sell" iconBg="bg-badge/10 text-badge" />
        <KpiCard label="Revenus générés" value={`${totalRevenus.toLocaleString('fr-FR')} DT`} sub={`${stats?.totalCoupons ?? 0} coupons total`} subColor="text-brand" icon="payments" iconBg="bg-blue-50 text-blue-600" />
        <KpiCard label="Taux d'utilisation" value={totalUtilisations} sub="utilisations totales" subColor="text-slate-400" icon="receipt_long" iconBg="bg-amber-50 text-amber-600" />
        <KpiCard label="Conversion moyenne" value={`${avgConversion}%`} sub={avgConversion >= 30 ? 'Excellent' : 'À améliorer'} subColor={avgConversion >= 30 ? 'text-brand' : 'text-amber-600'} icon="trending_up" iconBg="bg-purple-50 text-purple-600" />
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        <button onClick={() => setTab('coupons')} className={`pb-3 text-sm font-bold transition-colors ${tab === 'coupons' ? 'text-brand border-b-2 border-brand' : 'text-slate-500 hover:text-slate-800'}`}>
          Coupons
        </button>
        <button onClick={() => setTab('remise')} className={`pb-3 text-sm font-bold transition-colors ${tab === 'remise' ? 'text-brand border-b-2 border-brand' : 'text-slate-500 hover:text-slate-800'}`}>
          Remises sur Produits
        </button>
        <button onClick={() => setTab('auto')} className={`pb-3 text-sm font-bold transition-colors ${tab === 'auto' ? 'text-brand border-b-2 border-brand' : 'text-slate-500 hover:text-slate-800'}`}>
          Coupons Automatiques
        </button>
      </div>

      {/* ════════════ TAB : Coupons ════════════ */}
      {tab === 'coupons' && (
        <>
          {/* Filters */}
          <div className="bg-white p-5 rounded-custom border border-slate-200 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <span className="material-symbols-outlined text-xl">search</span>
                </span>
                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Rechercher un code coupon..."
                  className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-custom text-sm focus:ring-brand focus:border-brand transition-all placeholder:text-slate-400 outline-none" />
              </div>
              <div className="flex flex-wrap gap-3">
              <CustomSelect value={filterStatut} onChange={v => { setFilterStatut(v); setPage(1) }} options={filterStatutOptions} size="sm" className="min-w-[160px]" />
              <CustomSelect value={filterType} onChange={v => { setFilterType(v); setPage(1) }} options={filterTypeOptions} size="sm" className="min-w-[160px]" />
              <button onClick={resetFilters} className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-custom transition-colors" title="Réinitialiser">
                <span className="material-symbols-outlined text-lg">refresh</span>
              </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-custom border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Remise</th>
                    <th className="px-6 py-3">Segment</th>
                    <th className="px-6 py-3">Utilisation</th>
                    <th className="px-6 py-3">Expiration</th>
                    <th className="px-6 py-3 text-center">Statut</th>
                    <th className="px-6 py-3 text-center">Perf.</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map(c => {
                    const tc = typeConfig[c.type] || typeConfig.pourcentage
                    const sc = statutConfig[c.statut] || statutConfig.actif
                    const isInactive = c.statut === 'expire'
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                        {/* Code */}
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${isInactive ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-brand/5 text-brand border-brand/10'}`}>
                              {c.code}
                            </span>
                            {c.auto && (
                              <span className="px-1.5 py-0.5 bg-violet-50 text-violet-600 text-[9px] font-bold rounded border border-violet-100 uppercase">Auto</span>
                            )}
                            {c.conversion >= 30 && c.statut === 'actif' && (
                              <span className="material-symbols-outlined text-[14px] text-orange-500" title="Performant">local_fire_department</span>
                            )}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-badge uppercase tracking-wide border ${tc.badge}`}>
                            <span className="material-symbols-outlined text-[12px]">{tc.icon}</span>
                            {tc.label}
                          </span>
                        </td>

                        {/* Remise */}
                        <td className="px-6 py-3.5">
                          <span className={`text-sm font-bold ${isInactive ? 'text-slate-400' : 'text-slate-800'}`}>
                            {c.type === 'pourcentage' ? `${c.valeur}%` : c.type === 'fixe' ? `${c.valeur} DT` : c.type === 'livraison' ? 'Gratuite' : c.type === 'bogo' ? '1+1' : `${c.valeur} DT`}
                          </span>
                          {c.montantMin > 0 && <p className="text-[10px] text-slate-400">Min. {c.montantMin} DT</p>}
                        </td>

                        {/* Segment */}
                        <td className="px-6 py-3.5">
                          <span className="text-xs text-slate-600 font-medium">{segmentOptions.find(s => s.value === (c.segment || ''))?.label || c.segment || 'Tous les clients'}</span>
                          {c.categories?.length > 0 && <p className="text-[10px] text-slate-400">{c.categories.join(', ')}</p>}
                        </td>

                        {/* Utilisation */}
                        <td className="px-6 py-3.5 min-w-[140px]">
                          <ProgressBar value={c.utilisations} max={c.limiteGlobale} color={c.statut === 'actif' ? 'bg-brand' : 'bg-slate-300'} />
                        </td>

                        {/* Expiration */}
                        <td className="px-6 py-3.5 text-sm text-slate-500">
                          {c.dateFin ? c.dateFin : <span className="text-slate-300">—</span>}
                        </td>

                        {/* Statut */}
                        <td className="px-6 py-3.5 text-center">
                          <button onClick={() => toggleStatut(c.id)} title="Cliquer pour changer">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-badge uppercase tracking-wider ${sc.bg}`}>{sc.label}</span>
                          </button>
                        </td>

                        {/* Performance */}
                        <td className="px-6 py-3.5 text-center">
                          {c.conversion > 0 ? (
                            <div className="text-center">
                              <span className={`text-sm font-bold ${c.conversion >= 30 ? 'text-brand' : c.conversion >= 15 ? 'text-amber-600' : 'text-red-500'}`}>{c.conversion}%</span>
                              <p className="text-[10px] text-slate-400">{c.revenus.toLocaleString()} DT</p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-300 italic">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => copierCode(c.code)} className="p-1.5 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-md transition-all" title="Copier code">
                              <span className="material-symbols-outlined text-[18px]">content_copy</span>
                            </button>
                            <button onClick={() => setDetailCoupon(c)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all" title="Détails & perf.">
                              <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                            </button>
                            <button onClick={() => toast.info(`Partage du code ${c.code} par email...`)} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all" title="Envoyer par email">
                              <span className="material-symbols-outlined text-[18px]">mail</span>
                            </button>
                            <button onClick={() => supprimerCoupon(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all" title="Supprimer">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {paginated.length === 0 && (
                    <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-sm">
                      <span className="material-symbols-outlined text-4xl text-slate-200 mb-2 block">sell</span>Aucun coupon trouvé.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                <span className="font-bold text-slate-700">{filtered.length === 0 ? 0 : ((page - 1) * perPage) + 1}–{Math.min(page * perPage, filtered.length)}</span> sur <span className="font-bold text-slate-700">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30">
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30">
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Bottom: Conseil Marketing ── */}
          <div className="bg-brand/5 border border-brand/10 p-6 rounded-xl flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-brand shrink-0">
              <span className="material-symbols-outlined text-2xl">lightbulb</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Conseil Marketing</h4>
              <p className="text-slate-600 text-sm leading-relaxed mt-1">
                Les coupons avec une date d'expiration courte (&lt;48h) ont un taux de conversion <span className="font-bold text-brand">+35%</span> plus élevé.
                Essayez une <span className="font-bold">flash promo</span> ciblée sur vos clients VIP.
              </p>
            </div>
          </div>
        </>
      )}

      {/* ════════════ TAB : Remises sur Produits ════════════ */}
      {tab === 'remise' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulaire remise */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-badge/10 text-badge rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">label</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Remise Rapide sur Produit</h4>
                  <p className="text-slate-500 text-sm">Appliquez une baisse de prix à un article ou une catégorie.</p>
                </div>
              </div>

              {/* ── Auto name preview ── FIRST THING VISIBLE */}
              <div className={`rounded-xl border-2 px-5 py-4 transition-all ${autoNom ? 'border-badge/40 bg-badge/5' : 'border-dashed border-slate-200 bg-slate-50'}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nom généré automatiquement</p>
                <p className={`text-lg font-bold tracking-tight ${autoNom ? 'text-slate-900' : 'text-slate-300 italic'}`}>
                  {autoNom || '— Sélectionner un produit pour voir le nom —'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ── Catégorie parente ── */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Catégorie</label>
                  <select
                    value={remiseCatParent ?? ''}
                    onChange={e => { setRemiseCatParent(e.target.value ? Number(e.target.value) : null); setRemiseCatEnfant(null); setRemiseProduits([]); setRemisePickerOpen(false) }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                  >
                    <option value="">— Toutes les catégories —</option>
                    {parentCats.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>

                {/* ── Sous-catégorie ── */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Sous-catégorie</label>
                  <select
                    value={remiseCatEnfant ?? ''}
                    onChange={e => { setRemiseCatEnfant(e.target.value ? Number(e.target.value) : null); setRemiseProduits([]); setRemisePickerOpen(false) }}
                    disabled={!remiseCatParent || subCatsForParent.length === 0}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="">{remiseCatParent && subCatsForParent.length === 0 ? '— Aucune sous-catégorie —' : remiseCatParent ? '— Sélectionner —' : "— Choisir une catégorie d'abord —"}</option>
                    {subCatsForParent.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Produits concernés
                    {remiseProduits.length > 0 && (
                      <span className="ml-2 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {remiseProduits.length}
                      </span>
                    )}
                  </label>

                  {/* Selected tags with image */}
                  {remiseProduits.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {remiseProduits.map(p => {
                        const thumb = getProductThumb(p)
                        return (
                          <span key={p.id} className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 pl-1 pr-2.5 py-1 rounded-full text-xs font-bold text-brand">
                            {thumb
                              ? <img src={thumb} alt={p.nom} className="w-6 h-6 rounded-full object-cover border border-brand/30" />
                              : <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center"><span className="material-symbols-outlined text-[11px] text-slate-400">image</span></span>
                            }
                            {p.nom}
                            <button type="button" onClick={() => toggleRemiseProduit(p)} className="hover:text-red-500 transition-colors ml-0.5">
                              <span className="material-symbols-outlined text-[12px]">close</span>
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Toggle picker button */}
                  <button
                    type="button"
                    onClick={() => { setRemisePickerOpen(v => !v); setRemisePickerSearch('') }}
                    disabled={!remiseCatEnfant}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      remisePickerOpen
                        ? 'border-brand bg-brand/5 text-brand'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-brand hover:text-brand'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {remisePickerOpen ? 'expand_less' : 'add_circle'}
                    </span>
                    {!remiseCatEnfant ? 'Choisir une sous-catégorie pour voir les produits' : remisePickerOpen ? 'Fermer la sélection' : 'Sélectionner des produits'}
                  </button>

                  {/* Inline product picker */}
                  {remisePickerOpen && remiseCatEnfant && (
                    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                      {/* Search */}
                      <div className="p-3 border-b border-slate-100">
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                          <input
                            value={remisePickerSearch}
                            onChange={e => setRemisePickerSearch(e.target.value)}
                            placeholder="Rechercher un produit..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand outline-none"
                          />
                        </div>
                      </div>

                      {/* Product list with images */}
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                        {productsForSubCat
                          .filter(p =>
                            !remisePickerSearch ||
                            p.nom?.toLowerCase().includes(remisePickerSearch.toLowerCase()) ||
                            p.sku?.toLowerCase().includes(remisePickerSearch.toLowerCase())
                          )
                          .map(p => {
                            const selected = remiseProduits.some(r => r.id === p.id)
                            const thumb = getProductThumb(p)
                            return (
                              <label
                                key={p.id}
                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                                  selected ? 'bg-brand/5' : 'hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleRemiseProduit(p)}
                                  className="w-4 h-4 text-brand rounded border-slate-300 accent-brand cursor-pointer"
                                />
                                {thumb
                                  ? <img src={thumb} alt={p.nom} className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
                                  : <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-slate-400 text-lg">image</span></div>
                                }
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${selected ? 'text-brand' : 'text-slate-700'}`}>{p.nom}</p>
                                  {p.sku && <p className="text-[10px] text-slate-400 uppercase tracking-wider">{p.sku}</p>}
                                </div>
                                <span className="text-xs font-bold text-slate-600 flex-shrink-0">{p.salePrice?.toFixed(2)} DT</span>
                              </label>
                            )
                          })}
                        {productsForSubCat.filter(p =>
                          !remisePickerSearch ||
                          p.nom?.toLowerCase().includes(remisePickerSearch.toLowerCase()) ||
                          p.sku?.toLowerCase().includes(remisePickerSearch.toLowerCase())
                        ).length === 0 && (
                          <p className="text-center text-slate-400 text-sm py-6">Aucun produit dans cette sous-catégorie</p>
                        )}
                      </div>

                      {/* Footer */}
                      {remiseProduits.length > 0 && (
                        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500">{remiseProduits.length} produit(s) sélectionné(s)</span>
                          <button
                            type="button"
                            onClick={() => setRemisePickerOpen(false)}
                            className="text-xs font-bold text-brand hover:underline"
                          >
                            Confirmer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Type de remise</label>
                  <select
                    value={remiseType}
                    onChange={e => { setRemiseType(e.target.value); setRemiseValeur('') }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                  >
                    <option value="pourcentage">Pourcentage (%)</option>
                    <option value="fixe">Montant fixe (DT)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {remiseType === 'pourcentage' ? 'Taux de remise (%)' : 'Montant de remise (DT)'}
                  </label>
                  <div className="relative">
                    <input type="number" min="0" max={remiseType === 'pourcentage' ? 100 : undefined}
                      value={remiseValeur} onChange={e => setRemiseValeur(e.target.value)}
                      placeholder={remiseType === 'pourcentage' ? 'Ex: 15' : 'Ex: 50'}
                      className="w-full px-4 py-2.5 pr-12 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      {remiseType === 'pourcentage' ? '%' : 'DT'}
                    </span>
                  </div>
                  {remiseType === 'fixe' && remiseProduits.length > 0 && remiseValeur && parseFloat(remiseValeur) >= (remiseProduits[0]?.salePrice || Infinity) && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Montant doit être inférieur au prix du produit ({remiseProduits[0]?.salePrice?.toFixed(2)} DT)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Date début</label>
                  <input type="date" value={remiseDateDebut} onChange={e => setRemiseDateDebut(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Date fin</label>
                  <input type="date" value={remiseDateFin} onChange={e => setRemiseDateFin(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none" />
                </div>
              </div>

              <button onClick={submitRemise} disabled={submitting}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50">
                {submitting ? 'Application en cours...' : 'Appliquer la remise immédiate'}
              </button>
            </div>

            {/* Prévisualisation */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand">preview</span>
                  Prévisualisation prix
                </h4>
                {remiseProduits.length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-4">Sélectionner un produit pour voir la prévisualisation</p>
                ) : (
                  <div className="space-y-5">
                    {remiseProduits.map(p => {
                      const { orig, montant, final } = calcRemisePreview(p.salePrice)
                      return (
                        <div key={p.id} className="space-y-2">
                          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide truncate">{p.nom}</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Prix original</span>
                              <span className="font-bold text-slate-800">{orig.toFixed(2)} DT</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-red-500">
                              <span>Remise {remiseType === 'pourcentage' ? `(${remiseValeur || 0}%)` : ''}</span>
                              <span className="font-bold">−{montant.toFixed(2)} DT</span>
                            </div>
                            <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-800">Prix final</span>
                              <span className="text-base font-bold text-brand">{final.toFixed(2)} DT</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="bg-brand/5 border border-brand/10 p-5 rounded-xl text-center">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-brand">
                  <span className="material-symbols-outlined text-2xl">lightbulb</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-2">Astuce</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Remises entre 15-25% → meilleur ratio marge/conversion. Au-delà de 30%, l'impact sur la marge dépasse le gain de volume.
                </p>
              </div>
            </div>
          </div>

          {/* ── Liste des remises existantes ── */}
          {discounts.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand">list</span>
                  Remises actives ({discounts.length})
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-6 py-3">Produit / Catégorie</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Taux / Montant</th>
                      <th className="px-6 py-3">Prix</th>
                      <th className="px-6 py-3 text-center">Statut</th>
                      <th className="px-6 py-3">Expiration</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {discounts.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-3.5">
                          <p className="text-sm font-bold text-slate-800">{d.productName || d.categoryName || d.nom || '—'}</p>
                          {d.nom && d.nom !== (d.productName || d.categoryName) && (
                            <p className="text-[10px] text-slate-400">{d.nom}</p>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-xs font-bold text-slate-600 uppercase">{d.type === 'pourcentage' ? 'Pourcentage' : 'Fixe'}</span>
                        </td>
                        <td className="px-6 py-3.5 text-sm font-bold text-slate-800">
                          {d.type === 'pourcentage' ? `${d.valeur}%` : `${d.valeur} DT`}
                        </td>
                        <td className="px-6 py-3.5">
                          {d.prixOriginal > 0 ? (
                            <div>
                              <span className="text-xs text-slate-400 line-through">{d.prixOriginal.toFixed(2)} DT</span>
                              <span className="text-sm font-bold text-brand ml-2">{d.prixFinal?.toFixed(2)} DT</span>
                            </div>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <button onClick={() => toggleDiscountStatut(d.id)}>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-badge uppercase tracking-wider ${(statutConfig[d.statut] || statutConfig.actif).bg}`}>
                              {(statutConfig[d.statut] || statutConfig.actif).label}
                            </span>
                          </button>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-slate-500">{d.dateFin || '—'}</td>
                        <td className="px-6 py-3.5 text-right">
                          <button onClick={() => deleteDiscount(d.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100" title="Supprimer">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════ TAB : Coupons Automatiques ════════════ */}
      {tab === 'auto' && (
        <div className="space-y-4">
          {autoTriggersConfig.map((t) => {
            const existing = coupons.find(c => c.auto && c.autoTrigger === t.trigger)
            const isExpanded = expandedTrigger === t.trigger
            const localValeur = autoTriggerValeurs[t.trigger] ?? String(t.defaultValeur)
            const isActif = existing?.statut === 'actif'

            return (
              <div key={t.trigger} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 ${t.bgColor} rounded-xl flex items-center justify-center ${t.color} shrink-0`}>
                    <span className="material-symbols-outlined text-2xl">{t.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-sm">{t.label}</h4>
                      {existing && (
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wide ${
                          isActif ? 'bg-brand text-white' : 'bg-slate-200 text-slate-500'
                        }`}>{isActif ? 'ACTIF' : 'INACTIF'}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                    {existing && (
                      <p className="text-[10px] font-bold text-brand mt-0.5">
                        Code&nbsp;: <span className="font-mono">{existing.code}</span> · {existing.valeur}%
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {existing && (
                      <button
                        onClick={() => toggleStatut(existing.id)}
                        title={isActif ? 'Désactiver' : 'Activer'}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                          isActif ? 'bg-brand' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                          isActif ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedTrigger(isExpanded ? null : t.trigger)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                      title="Configuration"
                    >
                      <span className="material-symbols-outlined text-lg">{isExpanded ? 'expand_less' : 'tune'}</span>
                    </button>
                  </div>
                </div>

                {/* Config panel */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4">
                    {t.rule && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <span className="material-symbols-outlined text-amber-500 shrink-0" style={{ fontSize: '16px' }}>info</span>
                        <p className="text-[11px] text-amber-700 leading-relaxed">{t.rule}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Taux de remise (%)</label>
                      <div className="relative w-48">
                        <input
                          type="number" min="1" max="100"
                          value={localValeur}
                          onChange={e => setAutoTriggerValeurs(v => ({ ...v, [t.trigger]: e.target.value }))}
                          className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {existing ? (
                        <>
                          <button
                            onClick={() => handleUpdateAutoTrigger(existing, localValeur)}
                            disabled={submitting}
                            className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all"
                          >
                            Mettre à jour
                          </button>
                          <button
                            onClick={() => supprimerCoupon(existing.id)}
                            className="px-5 py-2 border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-all"
                          >
                            Supprimer
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleCreateAutoTrigger(t.trigger, localValeur)}
                          disabled={submitting}
                          className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">add_circle</span>
                          Activer ce déclencheur
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Coupons automatiques actifs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand">smart_toy</span>
              Coupons intelligents actifs
            </h4>
            <div className="space-y-3">
              {coupons.filter(c => c.auto).map(c => (
                <div key={c.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-brand/5 text-brand font-bold text-sm rounded-lg border border-brand/10 font-mono">{c.code}</span>
                    <div>
                      <span className="text-xs text-slate-600 font-medium">
                        {autoTriggersConfig.find(t => t.trigger === c.autoTrigger)?.label || c.autoTrigger || 'Manuel'}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">· {c.type === 'pourcentage' ? `${c.valeur}%` : `${c.valeur} DT`}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-brand">{c.utilisations} utilisation(s)</span>
                    <button onClick={() => toggleStatut(c.id)}>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-badge ${(statutConfig[c.statut] || statutConfig.actif).bg}`}>
                        {(statutConfig[c.statut] || statutConfig.actif).label}
                      </span>
                    </button>
                    <button onClick={() => supprimerCoupon(c.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all" title="Supprimer">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
              {coupons.filter(c => c.auto).length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">Aucun déclencheur actif pour le moment.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL : Créer coupon ══════════ */}
      {showCreate && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

            {/* ── Header ── */}
            <div className="bg-white rounded-t-2xl border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-brand" style={{ fontSize: '20px' }}>confirmation_number</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 leading-tight">Créer un coupon</h3>
                  <p className="text-[11px] text-slate-400">Configurez les détails de votre nouveau coupon</p>
                </div>
              </div>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
              {/* ── Section : Informations générales ── */}
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '16px' }}>tune</span>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Informations générales</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Code */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Code du coupon <InfoTip text="Code unique que le client saisit lors du paiement pour bénéficier de la réduction." /></label>
                    <div className="flex gap-2">
                      <input type="text" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} placeholder="Ex: PROMO20"
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none font-bold uppercase transition-all" />
                      <button onClick={() => setNewCode(genCode())} className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all whitespace-nowrap" title="Générer un code automatique">
                        <span className="material-symbols-outlined text-sm align-middle mr-1">casino</span>Auto
                      </button>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Type de coupon <InfoTip text="Détermine le type de réduction : pourcentage, montant fixe, livraison gratuite, cadeau ou BOGO (1 acheté = 1 offert)." /></label>
                    <CustomSelect value={newType} onChange={setNewType} options={typeOptions} />
                  </div>

                  {/* Valeur */}
                  {(newType === 'pourcentage' || newType === 'fixe' || newType === 'cadeau') && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Valeur {newType === 'pourcentage' ? '(%)' : '(DT)'} <InfoTip text="Montant de la réduction à appliquer. En pourcentage (%) ou en dinars (DT) selon le type choisi." /></label>
                      <input type="number" value={newValeur} onChange={e => setNewValeur(e.target.value)} placeholder="Ex: 15"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-all" />
                    </div>
                  )}

                  {/* Montant minimum */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Montant minimum (DT) <InfoTip text="Le client doit atteindre ce montant dans son panier pour utiliser le coupon. Mettez 0 pour aucun minimum requis." /></label>
                    <input type="number" value={newMontantMin} onChange={e => setNewMontantMin(e.target.value)} placeholder="0 = pas de minimum"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-all" />
                  </div>

                  {/* Segment */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Segment client <InfoTip text="Cible un groupe spécifique de clients. Sélectionnez 'Tous les clients' pour un coupon accessible à tout le monde." /></label>
                    <CustomSelect value={newSegment} onChange={setNewSegment} options={segmentOptions} />
                  </div>

                  {/* Auto */}
                  <div className="space-y-1.5 flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <button type="button" onClick={() => setNewAuto(!newAuto)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${newAuto ? 'bg-brand' : 'bg-slate-300'}`}>
                        <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${newAuto ? 'translate-x-5' : ''}`} />
                      </button>
                      <span className="text-sm font-medium text-slate-700">Coupon automatique <InfoTip text="Si activé, le coupon s'applique automatiquement au panier du client sans qu'il ait besoin de saisir un code." /></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Section : Planification ── */}
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '16px' }}>calendar_month</span>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Planification <InfoTip text="Définissez la période de validité du coupon. Sans dates, le coupon est actif immédiatement et sans limite de temps." /></p>
                  </div>
                  <button type="button" onClick={() => setShowPlanification(!showPlanification)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${showPlanification ? 'bg-brand' : 'bg-slate-300'}`}>
                    <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${showPlanification ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                {showPlanification ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">Date début <InfoTip text="Date à partir de laquelle le coupon devient actif et utilisable." /></label>
                      <input type="date" value={newDateDebut} onChange={e => setNewDateDebut(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">Heure début <InfoTip text="Heure précise d'activation du coupon le jour de début." /></label>
                      <input type="time" value={newHeureDebut} onChange={e => setNewHeureDebut(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">Date fin <InfoTip text="Date à laquelle le coupon expire et ne peut plus être utilisé." /></label>
                      <input type="date" value={newDateFin} onChange={e => setNewDateFin(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">Heure fin <InfoTip text="Heure précise d'expiration du coupon le jour de fin." /></label>
                      <input type="time" value={newHeureFin} onChange={e => setNewHeureFin(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-all" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                    <span className="italic">Aucune planification — coupon actif immédiatement</span>
                  </div>
                )}
              </div>

              {/* ── Section : Limites d'utilisation ── */}
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '16px' }}>rule</span>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Limites d'utilisation <InfoTip text="Contrôlez combien de fois ce coupon peut être utilisé au total et par client individuel." /></p>
                </div>
                <div className="inline-flex bg-white border border-slate-200 rounded-lg p-0.5 mb-4">
                  <button type="button" onClick={() => setLimiteMode('unique')}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${limiteMode === 'unique' ? 'bg-brand text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '14px' }}>person</span>
                    Utilisation unique
                  </button>
                  <button type="button" onClick={() => setLimiteMode('multiple')}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${limiteMode === 'multiple' ? 'bg-brand text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '14px' }}>group</span>
                    Utilisation multiple
                  </button>
                </div>
                {limiteMode === 'unique' ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                    <span className="italic">1 utilisation par client — limites définies automatiquement</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">Limite globale (0 = illimité) <InfoTip text="Nombre total d'utilisations autorisées pour ce coupon. Mettez 0 pour des utilisations illimitées." /></label>
                      <input type="number" value={newLimiteGlobale} onChange={e => setNewLimiteGlobale(e.target.value)} placeholder="Ex: 100"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">Limite par client (0 = illimité) <InfoTip text="Nombre maximum de fois qu'un même client peut utiliser ce coupon. Mettez 0 pour illimité." /></label>
                      <input type="number" value={newLimiteClient} onChange={e => setNewLimiteClient(e.target.value)} placeholder="Ex: 1"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-all" />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Section : Produits ciblés ── */}
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '16px' }}>category</span>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Produits ciblés (optionnel) <InfoTip text="Restreignez le coupon à certaines catégories. Si aucune n'est sélectionnée, le coupon s'applique à tous les produits." /></p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categoriesList.length > 0 ? categoriesList.map(cat => (
                    <button key={cat} type="button" onClick={() => toggleCatSelection(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${newCategories.includes(cat) ? 'border-brand bg-brand/10 text-brand shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:bg-white hover:border-slate-300'}`}>
                      {newCategories.includes(cat) && <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '12px' }}>check</span>}
                      {cat}
                    </button>
                  )) : (
                    <p className="text-xs text-slate-400 italic">Aucune catégorie disponible</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="bg-white border-t border-slate-100 rounded-b-2xl px-6 py-4 flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                Annuler
              </button>
              <button onClick={submitCreate} disabled={submitting} className="px-6 py-2.5 text-sm font-semibold text-white bg-btn rounded-lg hover:bg-btn-dark transition-colors shadow-md disabled:opacity-50 flex items-center gap-2">
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>
                    Création...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_circle</span>
                    Créer le coupon
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ══════════ MODAL : Détail & Performances ══════════ */}
      {detailCoupon && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDetailCoupon(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-brand/5 text-brand font-bold text-lg rounded-lg border border-brand/10">{detailCoupon.code}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-badge ${(statutConfig[detailCoupon.statut] || statutConfig.actif).bg}`}>{(statutConfig[detailCoupon.statut] || statutConfig.actif).label}</span>
              </div>
              <button onClick={() => setDetailCoupon(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Type</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{typeConfig[detailCoupon.type]?.label}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Valeur</p>
                <p className="text-sm font-bold text-slate-700 mt-1">
                  {detailCoupon.type === 'pourcentage' ? `${detailCoupon.valeur}%` : detailCoupon.type === 'fixe' ? `${detailCoupon.valeur} DT` : detailCoupon.type === 'livraison' ? 'Gratuite' : detailCoupon.type === 'bogo' ? '1+1' : `${detailCoupon.valeur} DT`}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Segment</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{segmentOptions.find(s => s.value === (detailCoupon.segment || ''))?.label || 'Tous les clients'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Min. commande</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{detailCoupon.montantMin > 0 ? `${detailCoupon.montantMin} DT` : 'Aucun'}</p>
              </div>
            </div>

            {/* Perf */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Performances</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center bg-brand/5 rounded-lg p-4">
                  <p className="text-2xl font-bold text-brand">{detailCoupon.revenus.toLocaleString()} DT</p>
                  <p className="text-[10px] text-brand font-bold uppercase mt-1">Revenus générés</p>
                </div>
                <div className="text-center bg-blue-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-blue-700">{detailCoupon.commandes}</p>
                  <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">Commandes</p>
                </div>
                <div className="text-center bg-purple-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-purple-700">{detailCoupon.conversion}%</p>
                  <p className="text-[10px] text-purple-600 font-bold uppercase mt-1">Conversion</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Utilisation</p>
                <ProgressBar value={detailCoupon.utilisations} max={detailCoupon.limiteGlobale} color="bg-brand" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => { copierCode(detailCoupon.code); setDetailCoupon(null) }} className="px-4 py-2 text-sm font-semibold text-brand bg-brand/10 rounded-lg hover:bg-brand/20 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">content_copy</span>Copier code
              </button>
              <button onClick={() => { toast.info(`Email envoyé avec le code ${detailCoupon.code}`); setDetailCoupon(null) }} className="px-4 py-2 text-sm font-semibold text-white bg-btn rounded-lg hover:bg-btn-dark transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">mail</span>Partager par email
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
