import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import CustomSelect from '../components/ui/CustomSelect'
import PageHeader from '../components/ui/PageHeader'
import { productApi } from '../api/productApi'
import { categoryApi } from '../api/categoryApi'
import { collectionApi } from '../api/collectionApi'
import {
  MIX_MATCH_GENDER_OPTIONS,
  MIX_MATCH_ROLE_OPTIONS,
  getMixMatchGenderLabel,
  getMixMatchRoleLabel,
  getMixMatchSuggestions,
} from '../utils/mixMatch'
import { uploadFileFromPc } from '../utils/uploadFile'

// ── Palette de couleurs françaises (79 couleurs) ─────────────────────────────
const COLOR_MAP = {
  'jaune':            '#FFCE3B',
  'citron':           '#FFD100',
  'mais':             '#FFB600',
  'maïs':             '#FFB600',
  'orange clair':     '#FF6A2D',
  'orange':           '#EE4C26',
  'orange rouge':     '#CD312E',
  'rouge':            '#B01E35',
  'fuchsia fonce':    '#B32759',
  'fuchsia foncé':    '#B32759',
  'couleur chair':    '#FFD39F',
  'jaune pastel':     '#FFC26D',
  'bronze':           '#C68D44',
  'moutard':          '#C9952E',
  'vert pastel':      '#D0B674',
  'vert olive':       '#6E6C31',
  'daim marron':      '#8D593B',
  'marron':           '#644637',
  'abricot':          '#FF9760',
  'saumon':           '#FF8A7C',
  'peche':            '#E55951',
  'pêche':            '#E55951',
  'mandarine':        '#DB7E47',
  'rouille':          '#9E5530',
  'terre':            '#A53E30',
  'vineux':           '#832A34',
  'cardinal':         '#552D35',
  'rose tendre':      '#FFA8A2',
  'rose vieux':       '#EA87A5',
  'rose vif':         '#FF727E',
  'cyclamen':         '#E53865',
  'fuchsia':          '#B8246B',
  'pourpre':          '#81265F',
  'lilas':            '#B48C9C',
  'violet':           '#632D79',
  'souris':           '#9F8F78',
  'beige':            '#9F816B',
  'beige brun':       '#846450',
  'chocolat':         '#493B35',
  'gris clair':       '#BDBFC3',
  'gris':             '#878485',
  'anthracite':       '#5E5E61',
  'noir':             '#2B2F2F',
  'avocat':           '#89884D',
  'limon':            '#BFD723',
  'vert mousse':      '#888A21',
  'vert gazon':       '#40B23D',
  'vert':             '#008A3C',
  'vert billard':     '#184D3C',
  'loden vert':       '#3F5532',
  'vert fonce':       '#274939',
  'vert foncé':       '#274939',
  'vert emeraude':    '#50BB85',
  "vert d'emeraude":  '#50BB85',
  "vert d'émeraude":  '#50BB85',
  'vert glace':       '#009C85',
  'vert glacé':       '#009C85',
  'turquoise':        '#007993',
  'bleu violet':      '#4FA9B0',
  'bleu clair':       '#3488A0',
  'bleu barbeau':     '#0067A3',
  'bleu marine':      '#36384D',
  'blanc':            '#FFFFF1',
  'gris bleu':        '#87B1C1',
  'aigue marine':     '#6487B0',
  'bleu royal':       '#17478E',
  'bleu cobalt':      '#303C82',
  'blue de cobalt':   '#303C82',
  'lavande fonce':    '#58518E',
  'lavande foncé':    '#58518E',
  'lavande':          '#7C76AA',
  'reseda':           '#8A927D',
  'réseda':           '#8A927D',
  'rose':             '#C77BA7',
  'babyrose':         '#FFCCC9',
  'baby rose':        '#FFCCC9',
  'jaune canari':     '#FFEA3C',
  "jaune d'or":       '#D4741A',
  'vert tendre':      '#86B487',
  'couleur de peau':  '#FFD5B3',
  'vert de cart':     '#007F50',
  'aubergine':        '#401B3C',
  'hyacinthe':        '#D94DA0',
  'chameau':          '#9C7551',
  'baby jaune':       '#FFEBAA',
  'baby bleu':        '#89A9D0',
  'rose pastel':      '#F1B2BB',
  'beige clair':      '#C2A88C',
  'chameau clair':    '#D8B291',
  'vert grenouille':  '#5B6C3D',
  'ecru':             '#FFFBE4',
  'écru':             '#FFFBE4',
}

// Résout un nom français ou hex/rgb en hex valide
function resolveColor(val) {
  if (!val) return '#cccccc'
  const trimmed = val.trim().toLowerCase()
  if (COLOR_MAP[trimmed]) return COLOR_MAP[trimmed]
  if (/^#([0-9a-f]{3}){1,2}$/i.test(val.trim())) return val.trim()
  if (/^rgb/i.test(val.trim())) return val.trim()
  return '#cccccc'
}

// ── Catalogue de dimensions (coussins) ─────────────────────────────────────
const SIZE_CATALOG = {
  standard: {
    label: 'Standard',
    sizes: ['40x40', '45x45', '50x50', '60x60'],
  },
}

// ── Initial variant rows ───────────────────────────────────────────────────────
const initialVariants = [
  { id: 1, colorSwatch: '#2B2F2F', label: 'Noir - 40x40', sku: 'WW-BLK-40', price: '', stock: 50 },
  { id: 2, colorSwatch: '#2B2F2F', label: 'Noir - 45x45', sku: 'WW-BLK-45', price: '45.00', stock: 32 },
]

// ── Toggle component ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-10 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
        checked ? 'bg-brand' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// ── Label ──────────────────────────────────────────────────────────────────────
function Label({ children, required }) {
  return (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
      {children} {required && <span className="text-red-400">*</span>}
    </label>
  )
}

// ── Field input ────────────────────────────────────────────────────────────────
function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand transition-all placeholder:text-slate-400 outline-none ${className}`}
      {...props}
    />
  )
}

// Adapter: converts <option> children API → CustomSelect options API
function Select({ value, onChange, children }) {
  const childArray = Array.isArray(children) ? children : [children]
  const options = childArray.map((c) => ({
    value: c.props.value !== undefined ? String(c.props.value) : String(c.props.children),
    label: String(c.props.children),
  }))
  return (
    <CustomSelect
      value={value}
      onChange={(v) => onChange({ target: { value: v } })}
      options={options}
    />
  )
}


// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, children, rightSlot }) {
  return (
    <div className="bg-white rounded-custom border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">{title}</h3>
        {rightSlot}
      </div>
      <div className="p-8">{children}</div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
function AjouterProduit() {
  const navigate = useNavigate()

  // General info
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [collections, setCollections] = useState([])
  const [category, setCategory] = useState('')          // stores category id (string)
  const [subCategory, setSubCategory] = useState('')     // stores subcategory id (string)
  const [description, setDescription] = useState('')

  // Dynamic data from API
  const [parentCategories, setParentCategories] = useState([])  // [{id, nom, children:[]}]
  const [allCollections, setAllCollections] = useState([])       // [{id, nom}]

  useEffect(() => {
    categoryApi.getAll().then((cats) => {
      const parents = cats.filter((c) => !c.parentId).map((p) => ({
        ...p,
        children: cats.filter((c) => c.parentId === p.id),
      }))
      setParentCategories(parents)
      if (parents.length > 0) {
        setCategory(String(parents[0].id))
        const firstSub = (parents[0].children || [])[0]
        setSubCategory(firstSub ? String(firstSub.id) : '')
      }
    }).catch(() => {})
    collectionApi.getAll().then((cols) => {
      setAllCollections(cols)
    }).catch(() => {})
  }, [])

  // Pricing
  const [salePrice, setSalePrice] = useState('')
  const [promoActive, setPromoActive] = useState(false)
  const [promoPrice, setPromoPrice] = useState('')
  const [promoStart, setPromoStart] = useState('')
  const [promoEnd, setPromoEnd] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Badges
  const [badges, setBadges] = useState({
    nouveau: true,
    bestSeller: false,
    promo: true,
    exclusif: false,
  })
  const [nouveauteDuree, setNouveauteDuree] = useState(7)

  // Visibility
  const [visibility, setVisibility] = useState({
    site: true,
    category: true,
    pinnedSub: false,
  })
  const [metaTitle, setMetaTitle] = useState('')

  // Variants
  const [colors, setColors] = useState('Noir, Orange')
  const [selectedSizes, setSelectedSizes] = useState(['40x40', '45x45', '50x50', '60x60'])
  const [variants, setVariants] = useState(initialVariants)
  const [colorImages, setColorImages] = useState({})
  const [activeColorTab, setActiveColorTab] = useState('Général')
  const [mixMatchEnabled, setMixMatchEnabled] = useState(true)
  const [mixMatchGender, setMixMatchGender] = useState('auto')
  const [mixMatchRole, setMixMatchRole] = useState('auto')
  const [mixMatchImageIndex, setMixMatchImageIndex] = useState(2)

  useEffect(() => {
    const list = colors.split(',').map(c => c.trim()).filter(Boolean)
    setActiveColorTab(prev => list.includes(prev) ? prev : (list[0] || 'Général'))
  }, [colors])

  // Shipping
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [specificFees, setSpecificFees] = useState(false)

  // Upsell tags
  const [upsellTags] = useState(['Pantalon Cargo HV', 'Casque Reflex'])

  const updateVariant = (id, field, value) =>
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)))

  const generateVariants = () => {
    const colorList = colors.split(',').map((c) => c.trim()).filter(Boolean)
    if (colorList.length === 0 || selectedSizes.length === 0) return
    const generated = []
    colorList.forEach((col) => {
      const hex = resolveColor(col.toLowerCase())
      selectedSizes.forEach((size) => {
        generated.push({
          id: Date.now() + Math.random(),
          colorSwatch: hex,
          label: `${col.charAt(0).toUpperCase() + col.slice(1)} - ${size}`,
          sku: '',
          stock: 0,
        })
      })
    })
    setVariants(generated)
  }

  const removeVariant = (id) =>
    setVariants((prev) => prev.filter((v) => v.id !== id))

  const toggleBadge = (key) =>
    setBadges((prev) => ({ ...prev, [key]: !prev[key] }))

  const toggleVisibility = (key) =>
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }))

  const toggleCollection = (colId) =>
    setCollections((prev) =>
      prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId]
    )

  const handleCategoryChange = (newCatId) => {
    setCategory(newCatId)
    const parent = parentCategories.find((p) => String(p.id) === newCatId)
    const subs = parent?.children || []
    setSubCategory(subs.length > 0 ? String(subs[0].id) : '')
    setCollections([])  // reset collections when category changes
  }

  // Helpers to get nom from id
  const getCategoryNom = (id) => {
    for (const p of parentCategories) {
      if (String(p.id) === id) return p.nom
      for (const s of (p.children || [])) {
        if (String(s.id) === id) return s.nom
      }
    }
    return id
  }
  const subCategories = parentCategories.find((p) => String(p.id) === category)?.children || []
  const selectedParentCategory = parentCategories.find((p) => String(p.id) === category) || null
  const selectedSubCategory = subCategories.find((s) => String(s.id) === subCategory) || null
  const selectedCategoryNom = parentCategories.find((p) => String(p.id) === category)?.nom || ''
  const filteredCollections = allCollections.filter((col) =>
    col.menuParentCategory === selectedCategoryNom ||
    (Array.isArray(col.linkedCategories) && col.linkedCategories.includes(selectedCategoryNom))
  )
  const mixMatchSuggestions = getMixMatchSuggestions(selectedParentCategory, selectedSubCategory)

  const hasPromo = promoActive && parseFloat(promoPrice) > 0 && parseFloat(promoPrice) < parseFloat(salePrice)

  const activeBadge = badges.nouveau ? 'NEW' : badges.bestSeller ? 'BEST' : badges.promo ? 'PROMO' : badges.exclusif ? 'EXCLU' : null

  /* Capitalize first letter of each color name for consistency */
  const normalizeColorName = (n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error('Le nom du produit est requis.')
    setSubmitting(true)
    try {
      /* ── Normalize color names across colors, colorImages & variants ── */
      const normalizedColors = colors.split(',').map(c => c.trim()).filter(Boolean).map(normalizeColorName).join(', ')
      const normalizedColorImages = {}
      for (const [key, val] of Object.entries(colorImages)) {
        normalizedColorImages[normalizeColorName(key.trim())] = val
      }
      const normalizedVariants = variants.map((v) => {
        const parts = v.label.split(' - ')
        const nLabel = parts.length >= 2 ? `${normalizeColorName(parts[0].trim())} - ${parts.slice(1).join(' - ').trim()}` : v.label
        return { ...v, label: nLabel }
      })

      const payload = {
        nom: name.trim(),
        sku,
        description,
        categoryId: subCategory ? parseInt(subCategory) : (category ? parseInt(category) : null),
        collectionIds: collections.map((id) => parseInt(id)),
        salePrice: parseFloat(salePrice) || 0,
        promoActive,
        promoPrice: promoActive ? (parseFloat(promoPrice) || 0) : 0,
        promoStart: promoStart || null,
        promoEnd: promoEnd || null,
        stock: normalizedVariants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0),
        statut: 'actif',
        badgeNouveau: badges.nouveau,
        nouveauteDureeJours: badges.nouveau ? nouveauteDuree : null,
        badgeBestSeller: badges.bestSeller,
        badgePromo: badges.promo,
        badgeExclusif: badges.exclusif,
        visibleSite: visibility.site,
        visibleCategory: visibility.category,
        pinnedInSubCategory: visibility.pinnedSub,
        metaTitle: metaTitle || null,
        weight: parseFloat(weight) || 0,
        dimensionLength: parseFloat(length) || 0,
        dimensionWidth: parseFloat(width) || 0,
        dimensionHeight: parseFloat(height) || 0,
        specificFees,
        colors: normalizedColors,
        sizes: selectedSizes.join(', '),
        colorImages: JSON.stringify(normalizedColorImages),
        mixMatchEnabled,
        mixMatchGender,
        mixMatchRole,
        mixMatchImageIndex,
        variants: normalizedVariants.map((v) => ({
          label: v.label,
          colorSwatch: v.colorSwatch,
          sku: v.sku,
          price: parseFloat(salePrice) || 0,
          stock: parseInt(v.stock) || 0,
        })),
      }
      await productApi.create(payload)
      toast.success('Produit créé avec succès !')
      navigate('/produits')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la création.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">

        {/* ── Page title ── */}
        <PageHeader title="Nouveau produit" subtitle="Remplissez les informations pour ajouter un produit au catalogue.">
          <PageHeader.SecondaryBtn icon="arrow_back" onClick={() => navigate('/produits')}>Retour</PageHeader.SecondaryBtn>
        </PageHeader>

        <div className="grid grid-cols-12 gap-8 items-start">

          {/* ── COLONNE GAUCHE — Formulaire ── */}
          <div className="col-span-12 lg:col-span-8 space-y-8">

            {/* Informations générales */}
            <Section title="Informations générales">
              <div className="space-y-6">
                <div>
                  <Label required>Nom du produit</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Veste Softshell Haute Visibilité Orange"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Référence (SKU Parent)</Label>
                    <Input
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="WW-VS-2024"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label required>Catégorie</Label>
                    {parentCategories.length > 0 ? (
                      <Select value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
                        {parentCategories.map((cat) => (
                          <option key={cat.id} value={String(cat.id)}>{cat.nom}</option>
                        ))}
                      </Select>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2.5">Chargement...</p>
                    )}
                  </div>
                  <div>
                    <Label>Sous-catégorie</Label>
                    {subCategories.length > 0 ? (
                      <Select value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
                        {subCategories.map((sub) => (
                          <option key={sub.id} value={String(sub.id)}>{sub.nom}</option>
                        ))}
                      </Select>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2.5">Aucune sous-catégorie disponible</p>
                    )}
                  </div>
                </div>

                {/* Collections (multi-select) */}
                <div>
                  <Label>Collections</Label>
                  <p className="text-[10px] text-slate-400 mb-3">Un produit peut appartenir à plusieurs collections.</p>
                  <div className="flex flex-wrap gap-2">
                    {filteredCollections.length === 0 && selectedCategoryNom && (
                      <p className="text-xs text-slate-400 italic">Aucune collection pour cette catégorie.</p>
                    )}
                    {filteredCollections.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => toggleCollection(String(col.id))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          collections.includes(String(col.id))
                            ? 'border-badge bg-badge/10 text-badge'
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {collections.includes(String(col.id)) && (
                          <span className="material-symbols-outlined text-xs align-middle mr-1">check</span>
                        )}
                        {col.nom}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Description complète</Label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez les caractéristiques techniques..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand transition-all placeholder:text-slate-400 outline-none resize-none"
                  />
                </div>
              </div>
            </Section>

            {/* Variantes */}
            <Section
              title="Variantes du produit"
              rightSlot={
                <button
                  type="button"
                  onClick={generateVariants}
                  className="text-xs font-bold text-brand bg-brand/10 px-3 py-1.5 rounded-full hover:bg-brand/20 transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Générer les combinaisons
                </button>
              }
            >
              <div className="space-y-8">
                {/* Inputs */}
                <div className="space-y-6 pb-8 border-b border-slate-100">
                  <div>
                    <Label>Couleurs</Label>
                    <Input
                      value={colors}
                      onChange={(e) => setColors(e.target.value)}
                      placeholder="Noir, Blanc, Orange (séparés par virgule)"
                    />
                  </div>
                  <div>
                    <Label>Dimensions</Label>
                    <p className="text-[10px] text-slate-400 mb-3">
                      Type Standard — choisissez les dimensions disponibles (cm).
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold border border-brand bg-brand/10 text-brand inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check</span>
                        Standard
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                      {SIZE_CATALOG.standard.sizes.map((s) => {
                        const active = selectedSizes.includes(s)
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              setSelectedSizes((prev) =>
                                prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                              )
                            }
                            className={`min-w-[3.5rem] px-3 py-1.5 rounded-lg text-xs font-bold border transition-all text-center ${
                              active
                                ? 'border-brand bg-brand text-white'
                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-slate-100">
                        {['Variante', 'SKU', 'Stock', 'Action'].map((h, i) => (
                          <th
                            key={h}
                            className={`pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 ${i === 3 ? 'text-right' : ''}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(() => {
                        /* Group variants by color name for SKU rowSpan */
                        const colorGroups = []
                        let lastColor = null
                        variants.forEach((v, idx) => {
                          const colorName = v.label?.split(' - ')[0]?.trim() || ''
                          if (colorName !== lastColor) {
                            colorGroups.push({ color: colorName, startIdx: idx, count: 1 })
                            lastColor = colorName
                          } else {
                            colorGroups[colorGroups.length - 1].count++
                          }
                        })
                        const colorStartSet = new Set(colorGroups.map(g => g.startIdx))
                        const colorSpanMap = Object.fromEntries(colorGroups.map(g => [g.startIdx, g.count]))

                        return variants.map((v, idx) => {
                          const isColorStart = colorStartSet.has(idx)
                          const colorName = v.label?.split(' - ')[0]?.trim() || ''
                          return (
                            <tr key={v.id} className="group hover:bg-slate-50/50">
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-3">
                                  <label className="relative cursor-pointer flex-shrink-0">
                                    <div
                                      className="w-8 h-8 rounded border border-slate-200 flex-shrink-0"
                                      style={{ backgroundColor: resolveColor(v.colorSwatch) }}
                                    />
                                    <input
                                      type="color"
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      value={/^#[0-9a-f]{6}$/i.test(v.colorSwatch) ? v.colorSwatch : resolveColor(v.colorSwatch)}
                                      onChange={(e) => updateVariant(v.id, 'colorSwatch', e.target.value)}
                                    />
                                  </label>
                                  <input
                                    type="text"
                                    value={v.colorSwatch}
                                    onChange={(e) => updateVariant(v.id, 'colorSwatch', e.target.value)}
                                    onBlur={(e) => {
                                      const resolved = resolveColor(e.target.value)
                                      if (resolved !== '#cccccc') updateVariant(v.id, 'colorSwatch', resolved)
                                    }}
                                    placeholder="rouge ou #B01E35"
                                    className="w-28 bg-white border border-slate-200 rounded text-xs py-1.5 px-2 focus:ring-1 focus:ring-brand outline-none font-mono"
                                  />
                                  <span className="text-sm font-medium text-slate-700">{v.label}</span>
                                </div>
                              </td>
                              {isColorStart && (
                                <td className="py-4 px-2 align-middle" rowSpan={colorSpanMap[idx]}>
                                  <input
                                    type="text"
                                    value={v.sku}
                                    onChange={(e) => {
                                      const newSku = e.target.value
                                      setVariants(prev => prev.map(vr => {
                                        const vrColor = vr.label?.split(' - ')[0]?.trim() || ''
                                        return vrColor === colorName ? { ...vr, sku: newSku } : vr
                                      }))
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded text-xs py-1.5 px-2 focus:ring-1 focus:ring-brand outline-none"
                                  />
                                </td>
                              )}
                              <td className="py-4 px-2">
                                <input
                                  type="number"
                                  value={v.stock}
                                  onChange={(e) => updateVariant(v.id, 'stock', e.target.value)}
                                  className="w-20 bg-white border border-slate-200 rounded text-xs py-1.5 px-2 focus:ring-1 focus:ring-brand outline-none"
                                />
                              </td>
                              <td className="py-4 px-2 text-right">
                                <button
                                  onClick={() => removeVariant(v.id)}
                                  className="text-slate-300 hover:text-red-500 transition-colors"
                                >
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      })()}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={() =>
                    setVariants((prev) => [
                      ...prev,
                      {
                        id: Date.now(),
                        colorSwatch: '#FF6A2D',
                        label: 'Nouvelle variante',
                        sku: '',
                        price: '',
                        stock: 0,
                      },
                    ])
                  }
                  className="flex items-center gap-2 text-xs font-bold text-brand hover:text-brand-dark transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Ajouter une variante
                </button>
              </div>
            </Section>

            {/* Média & Galerie */}
            <Section title="Média & Galerie">
              <div className="space-y-5">
                {/* Onglets couleur */}
                <div className="flex gap-2 flex-wrap border-b border-slate-100 pb-4">
                  {(colors.split(',').map(c => c.trim()).filter(Boolean).length > 0
                    ? colors.split(',').map(c => c.trim()).filter(Boolean)
                    : ['Général']
                  ).map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setActiveColorTab(col)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        activeColorTab === col
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white flex-shrink-0"
                        style={{ backgroundColor: resolveColor(col.toLowerCase()) }}
                      />
                      {col}
                      {(colorImages[col] || []).some(Boolean) && (
                        <span className="w-1.5 h-1.5 bg-brand rounded-full ml-0.5" />
                      )}
                    </button>
                  ))}
                </div>

                {/* 3 emplacements photo */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Photos — {activeColorTab || 'Général'} <span className="normal-case font-normal">(max 3)</span>
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map((idx) => {
                      const tabKey = activeColorTab || 'Général'
                      const img = (colorImages[tabKey] || [])[idx]
                      return (
                        <div key={idx} className="relative group">
                          {img ? (
                            <div className="aspect-square rounded-lg border border-slate-200 overflow-hidden relative">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setColorImages(prev => {
                                  const arr = [...(prev[tabKey] || [null, null, null])]
                                  arr[idx] = null
                                  return { ...prev, [tabKey]: arr }
                                })}
                                className="absolute top-1 right-1 w-6 h-6 bg-white shadow-sm rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                              {idx === 0 && (
                                <span className="absolute bottom-1 left-1 bg-brand text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  Principale
                                </span>
                              )}
                              {idx === mixMatchImageIndex && (
                                <span className="absolute bottom-1 right-1 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  Mix & Match
                                </span>
                              )}
                            </div>
                          ) : (
                            <label className="cursor-pointer block">
                              <div className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-brand hover:text-brand transition-all">
                                <span className="material-symbols-outlined text-2xl mb-1">
                                  {idx === 0 ? 'add_photo_alternate' : 'add'}
                                </span>
                                {idx === 0 && <p className="text-[9px] font-bold">Principale</p>}
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files[0]
                                  e.target.value = ''
                                  if (!file) return
                                  const url = await uploadFileFromPc(file, 'products')
                                  if (!url) return
                                  setColorImages((prev) => {
                                    const arr = [...(prev[tabKey] || [null, null, null])]
                                    arr[idx] = url
                                    return { ...prev, [tabKey]: arr }
                                  })
                                }}
                              />
                            </label>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Mix & Match">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Suggestion mannequin</p>
                    <p className="text-lg font-bold text-slate-800">
                      {getMixMatchGenderLabel(mixMatchSuggestions.gender)}
                    </p>
                    <p className="text-xs text-slate-500">Déduit depuis la catégorie racine sélectionnée.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Suggestion placement</p>
                    <p className="text-lg font-bold text-slate-800">
                      {getMixMatchRoleLabel(mixMatchSuggestions.role)}
                    </p>
                    <p className="text-xs text-slate-500">Déduit depuis la sous-catégorie. Robe et combinaison deviennent une pièce unique.</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Activer sur le configurateur</p>
                    <p className="text-xs text-slate-500">Si désactivé, le produit n'apparaît pas dans l'expérience mannequin.</p>
                  </div>
                  <Toggle checked={mixMatchEnabled} onChange={setMixMatchEnabled} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>Mannequin</Label>
                    <CustomSelect value={mixMatchGender} onChange={setMixMatchGender} options={MIX_MATCH_GENDER_OPTIONS} />
                  </div>
                  <div>
                    <Label>Placement silhouette</Label>
                    <CustomSelect value={mixMatchRole} onChange={setMixMatchRole} options={MIX_MATCH_ROLE_OPTIONS} />
                  </div>
                  <div>
                    <Label>Image utilisée</Label>
                    <CustomSelect
                      value={String(mixMatchImageIndex)}
                      onChange={(value) => setMixMatchImageIndex(parseInt(value, 10))}
                      options={[
                        { value: '0', label: '1re image' },
                        { value: '1', label: '2e image' },
                        { value: '2', label: '3e image recommandée' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Section>

            {/* Livraison & Dimensions */}
            <Section title="Livraison & Dimensions">
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Poids (kg)',     value: weight,  set: setWeight,  placeholder: '0.5',  step: '0.1' },
                    { label: 'Longueur (cm)',  value: length,  set: setLength,  placeholder: '30' },
                    { label: 'Largeur (cm)',   value: width,   set: setWidth,   placeholder: '20' },
                    { label: 'Hauteur (cm)',   value: height,  set: setHeight,  placeholder: '10' },
                  ].map((f) => (
                    <div key={f.label}>
                      <Label>{f.label}</Label>
                      <Input
                        type="number"
                        value={f.value}
                        onChange={(e) => f.set(e.target.value)}
                        placeholder={f.placeholder}
                        step={f.step}
                      />
                    </div>
                  ))}
                </div>
                <div
                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer"
                  onClick={() => setSpecificFees(!specificFees)}
                >
                  <input
                    type="checkbox"
                    checked={specificFees}
                    onChange={() => setSpecificFees(!specificFees)}
                    className="w-4 h-4 text-brand rounded focus:ring-brand cursor-pointer"
                  />
                  <label className="text-sm font-medium text-slate-700 cursor-pointer">
                    Appliquer des frais de port spécifiques pour ce produit
                  </label>
                </div>
              </div>
            </Section>

            {/* Produits Associés */}
            <Section title="Produits Associés & Ventes Croisées">
              <div>
                <Label>Produits Similaires (Upsell)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                    search
                  </span>
                  <Input className="pl-10" placeholder="Rechercher par nom ou SKU..." />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {upsellTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium border border-slate-200"
                    >
                      {tag}
                      <button className="hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </Section>

            {/* Tarification */}
            <div className="bg-white rounded-custom border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                <h3 className="font-bold text-slate-800">Tarification</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <Label required>Prix de vente (DT)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">DT</span>
                    <input
                      type="number"
                      step="0.01"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="89.00"
                      className="w-full pl-9 rounded-lg border border-slate-200 bg-white py-2.5 text-sm focus:ring-2 focus:ring-brand outline-none"
                    />
                  </div>
                </div>


                {/* Promotion toggle */}
                <button
                  type="button"
                  onClick={() => setPromoActive((v) => !v)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    promoActive
                      ? 'bg-badge/10 text-badge border-badge/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{promoActive ? 'remove_circle' : 'local_offer'}</span>
                  {promoActive ? 'Retirer la promotion' : 'Ajouter une promotion'}
                </button>

                {/* Promo section — visible only when toggled */}
                {promoActive && (
                  <div className="space-y-5 pt-1">
                    <div>
                      <Label>Prix en promotion (DT)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">DT</span>
                        <input
                          type="number"
                          step="0.01"
                          value={promoPrice}
                          onChange={(e) => setPromoPrice(e.target.value)}
                          placeholder="Ex: 69.00"
                          className="w-full pl-9 rounded-lg border border-brand/30 bg-white py-2.5 text-sm focus:ring-2 focus:ring-brand outline-none"
                        />
                      </div>
                    </div>

                    {/* Promo preview */}
                    {hasPromo && (
                      <div className="bg-brand/5 p-4 rounded-xl flex items-center justify-between border border-brand/10">
                        <span className="text-xs font-bold text-brand uppercase tracking-wider">
                          Aperçu Promotion
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 line-through text-sm">{salePrice} DT</span>
                          <span className="material-symbols-outlined text-brand text-sm">arrow_forward</span>
                          <span className="text-brand font-bold text-lg">{parseFloat(promoPrice).toFixed(2)} DT</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Début Promo
                        </label>
                        <input
                          type="date"
                          value={promoStart}
                          onChange={(e) => setPromoStart(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white py-2 text-xs focus:ring-2 focus:ring-brand outline-none px-3"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Fin Promo
                        </label>
                        <input
                          type="date"
                          value={promoEnd}
                          onChange={(e) => setPromoEnd(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white py-2 text-xs focus:ring-2 focus:ring-brand outline-none px-3"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Étiquettes marketing */}
            <div className="bg-white rounded-custom border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                <h3 className="font-bold text-slate-800">Étiquettes de marketing</h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: 'nouveau',    label: 'Nouveauté' },
                  { key: 'bestSeller', label: 'Best-Seller' },
                  { key: 'promo',      label: 'Promotion Active' },
                  { key: 'exclusif',   label: 'Exclusivité Web' },
                ].map((b) => (
                  <div
                    key={b.key}
                    onClick={() => toggleBadge(b.key)}
                    className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <label className="text-sm font-medium text-slate-700 cursor-pointer">{b.label}</label>
                    <input
                      type="checkbox"
                      checked={badges[b.key]}
                      onChange={() => toggleBadge(b.key)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 text-brand rounded border-slate-300 focus:ring-brand cursor-pointer accent-brand"
                    />
                  </div>
                ))}
                {/* Duration picker — shown only when Nouveauté is active */}
                {badges.nouveau && (
                  <div className="flex items-center gap-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Durée Nouveauté</span>
                    <div className="flex gap-2 ml-auto">
                      {[7, 14].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setNouveauteDuree(d)}
                          className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                            nouveauteDuree === d
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          {d} jours
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visibilité & SEO */}
            <div className="bg-white rounded-custom border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                <h3 className="font-bold text-slate-800">Visibilité &amp; SEO</h3>
              </div>
              <div className="p-6 space-y-5">
                {[
                  { key: 'site',      title: 'Actif',                    sub: 'Produit activé / désactivé' },
                  { key: 'category',  title: 'Catégorie',                sub: 'Épingler en tête de catégorie' },
                  { key: 'pinnedSub', title: 'Sous-catégorie',           sub: 'Épingler en tête de sous-catégorie' },
                ].map((v) => (
                  <div key={v.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{v.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{v.sub}</p>
                    </div>
                    <Toggle
                      checked={visibility[v.key]}
                      onChange={(val) => toggleVisibility(v.key, val)}
                    />
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-100">
                  <Label>Meta-Titre (SEO)</Label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Auto-généré à partir du nom..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs focus:ring-2 focus:ring-brand outline-none"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ── COLONNE DROITE — Aperçu STICKY ── */}
          <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-[88px] lg:self-start space-y-6">

            {/* ── Aperçu Front Office ── */}
            <div className="bg-white rounded-custom border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-brand text-lg">storefront</span>
                <h2 className="text-sm font-bold text-slate-700">Aperçu Front Office</h2>
                <span className="ml-auto relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand/60 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
                </span>
              </div>
              <div className="p-4">
                {/* Fake browser bar */}
                <div className="rounded-lg border border-slate-200 overflow-hidden mb-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-white rounded px-2 py-0.5">
                      <span className="text-[9px] text-slate-400">localhost:3001/produits</span>
                    </div>
                  </div>
                  {/* Product grid — 3 cards, centre = le vrai produit */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-white">
                    {/* Fake left card */}
                    <div className="opacity-30">
                      <div className="aspect-[3/4] bg-slate-200" />
                      <div className="h-2 bg-slate-300 rounded mt-2 w-3/4" />
                      <div className="h-1.5 bg-slate-200 rounded mt-1 w-1/2" />
                    </div>

                    {/* Real product card — exact replica of frontoffice */}
                    {(() => {
                      // Resolve main image (first image of first color)
                      let previewImg = null
                      const colorKeys = Object.keys(colorImages)
                      if (colorKeys.length > 0) {
                        const firstArr = colorImages[colorKeys[0]]
                        previewImg = Array.isArray(firstArr) ? firstArr.find(Boolean) || null : null
                      }
                      // Swatches from variants (unique colorSwatch values)
                      const swatchColors = [...new Set(variants.map(v => resolveColor(v.colorSwatch)).filter(Boolean))].slice(0, 5)
                      // Price display
                      const displayPrice = hasPromo && promoPrice
                        ? parseFloat(promoPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 })
                        : salePrice
                        ? parseFloat(salePrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 })
                        : null
                      const discountPct = hasPromo && salePrice && promoPrice
                        ? Math.round(((parseFloat(salePrice) - parseFloat(promoPrice)) / parseFloat(salePrice)) * 100)
                        : null

                      return (
                        <div className="ring-2 ring-brand/50">
                          {/* Image */}
                          <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                            {previewImg ? (
                              <img src={previewImg} alt={name || 'produit'} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            {activeBadge && (
                              <span className="absolute top-1.5 left-1.5 bg-black text-white text-[6px] font-bold px-1.5 py-0.5 tracking-wider">
                                {activeBadge}
                              </span>
                            )}
                            {discountPct && (
                              <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[6px] font-bold px-1.5 py-0.5 tracking-wider">
                                -{discountPct}%
                              </span>
                            )}
                          </div>
                          {/* Info */}
                          <div className="pt-2 space-y-0.5">
                            <div className="flex justify-between items-start gap-1">
                              <p className="text-[8px] font-bold uppercase tracking-tight leading-tight line-clamp-1 flex-1">
                                {name || <span className="text-slate-300 font-normal italic">Nom du produit</span>}
                              </p>
                              <div className="text-right">
                                {displayPrice && (
                                  <span className="text-[8px] font-bold tracking-tight">{displayPrice} DT</span>
                                )}
                                {hasPromo && salePrice && (
                                  <span className="block text-[6px] text-neutral-400 line-through">
                                    {parseFloat(salePrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DT
                                  </span>
                                )}
                              </div>
                            </div>
                            {swatchColors.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {swatchColors.map((c, i) => (
                                  <div key={i} className="w-2 h-2" style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #c6c6c6' : 'none' }} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Fake right card */}
                    <div className="opacity-30">
                      <div className="aspect-[3/4] bg-slate-200" />
                      <div className="h-2 bg-slate-300 rounded mt-2 w-3/4" />
                      <div className="h-1.5 bg-slate-200 rounded mt-1 w-1/2" />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">info</span>
                  Aperçu en temps réel — tel que vu sur le site
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Global Actions ── */}
        <div className="flex items-center justify-between py-6 border-t border-slate-200">
          <div className="flex items-center gap-2 text-slate-400 text-sm italic">
            <span className="material-symbols-outlined text-[18px]">history</span>
            Dernière modification : il y a 2 minutes par Admin
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/produits')}
              className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
            >
              Annuler les modifications
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-btn hover:bg-btn-dark text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand/20 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">
                {submitting ? 'hourglass_top' : 'check_circle'}
              </span>
              {submitting ? 'Enregistrement...' : 'Enregistrer le produit'}
            </button>
          </div>
        </div>

    </div>
  )
}

export default AjouterProduit
