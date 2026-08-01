import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CustomSelect from '../components/ui/CustomSelect'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useCart } from '../context/CartContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

/* ── Gouvernorats & Villes de Tunisie ── */
const GOUVERNORATS_DATA = [
  { gouvernorat: 'Tunis', villes: [{ nom: 'Tunis Médina', cp: '1001' },{ nom: 'Bab El Bhar', cp: '1006' },{ nom: 'Bab Souika', cp: '1007' },{ nom: 'El Omrane', cp: '1005' },{ nom: 'El Omrane Supérieur', cp: '1091' },{ nom: 'Ettahrir', cp: '1008' },{ nom: 'El Menzah', cp: '1004' },{ nom: 'Cité El Khadra', cp: '1003' },{ nom: 'El Kabaria', cp: '1069' },{ nom: 'Sidi Hassine', cp: '1094' },{ nom: 'Ezzouhour', cp: '1010' },{ nom: 'Djellaz', cp: '1019' },{ nom: 'La Marsa', cp: '2070' },{ nom: 'Carthage', cp: '2016' },{ nom: 'Le Kram', cp: '2015' },{ nom: 'La Goulette', cp: '2060' },{ nom: 'Le Bardo', cp: '2000' },{ nom: 'La Soukra', cp: '2036' },{ nom: 'Raoued', cp: '2056' },{ nom: 'Kalaat El Andalous', cp: '2044' },{ nom: 'Sidi Bou Said', cp: '2026' },{ nom: 'Gammarth', cp: '2078' }] },
  { gouvernorat: 'Ariana', villes: [{ nom: 'Ariana Ville', cp: '2080' },{ nom: 'Ettadhamen', cp: '2040' },{ nom: 'Mnihla', cp: '2094' },{ nom: 'Sidi Thabet', cp: '2020' },{ nom: 'Raoued', cp: '2056' },{ nom: 'Kalaat El Andalous', cp: '2044' },{ nom: 'La Soukra', cp: '2036' },{ nom: 'Cité Ennasr', cp: '2037' }] },
  { gouvernorat: 'Ben Arous', villes: [{ nom: 'Ben Arous', cp: '2013' },{ nom: 'Nouvelle Médina', cp: '2014' },{ nom: 'El Mourouj', cp: '2074' },{ nom: 'Hammam Lif', cp: '2050' },{ nom: 'Hammam Chott', cp: '2082' },{ nom: 'Bou Mhel El Bassatine', cp: '2097' },{ nom: 'Ezzahra', cp: '2034' },{ nom: 'Radès', cp: '2098' },{ nom: 'Mégrine', cp: '2033' },{ nom: 'Mohamedia', cp: '2090' },{ nom: 'Fouchana', cp: '2083' },{ nom: 'Mornag', cp: '1140' }] },
  { gouvernorat: 'Manouba', villes: [{ nom: 'Manouba', cp: '2010' },{ nom: 'Den Den', cp: '2011' },{ nom: 'Douar Hicher', cp: '2086' },{ nom: 'Oued Ellil', cp: '2021' },{ nom: 'Mornaguia', cp: '2014' },{ nom: 'Borj El Amri', cp: '2073' },{ nom: 'Djedeida', cp: '7003' },{ nom: 'Tébourba', cp: '1130' },{ nom: 'El Battane', cp: '2066' }] },
  { gouvernorat: 'Nabeul', villes: [{ nom: 'Nabeul', cp: '8000' },{ nom: 'Hammamet', cp: '8050' },{ nom: 'Kelibia', cp: '8090' },{ nom: 'El Haouaria', cp: '8045' },{ nom: 'Takelsa', cp: '8011' },{ nom: 'Soliman', cp: '8020' },{ nom: 'Menzel Temime', cp: '8080' },{ nom: 'Korba', cp: '8070' },{ nom: 'Menzel Bouzelfa', cp: '8010' },{ nom: 'Grombalia', cp: '8030' },{ nom: 'Bou Argoub', cp: '8040' },{ nom: 'Béni Khalled', cp: '8060' },{ nom: 'Dar Chaabane El Fehri', cp: '8011' },{ nom: 'Korbous', cp: '1145' },{ nom: 'Hammam Ghezèze', cp: '8062' },{ nom: 'Béni Khiar', cp: '8093' }] },
  { gouvernorat: 'Zaghouan', villes: [{ nom: 'Zaghouan', cp: '1100' },{ nom: 'Zriba', cp: '1121' },{ nom: 'Bir Mcherga', cp: '1111' },{ nom: 'El Fahs', cp: '1120' },{ nom: 'Nadhour', cp: '1131' },{ nom: 'Saouaf', cp: '1141' }] },
  { gouvernorat: 'Bizerte', villes: [{ nom: 'Bizerte', cp: '7000' },{ nom: 'Bizerte Nord', cp: '7021' },{ nom: 'Zarzouna', cp: '7021' },{ nom: 'Menzel Bourguiba', cp: '7050' },{ nom: 'Tinja', cp: '7040' },{ nom: 'Utique', cp: '7035' },{ nom: 'Ghar El Melh', cp: '7032' },{ nom: 'Mateur', cp: '7030' },{ nom: 'Sejnane', cp: '7010' },{ nom: 'Joumine', cp: '7014' },{ nom: 'El Alia', cp: '7036' },{ nom: 'Ras Jebel', cp: '7070' },{ nom: 'Menzel Jemil', cp: '7080' },{ nom: 'Ghezala', cp: '7011' }] },
  { gouvernorat: 'Béja', villes: [{ nom: 'Béja', cp: '9000' },{ nom: 'Béja Nord', cp: '9013' },{ nom: 'Béja Sud', cp: '9000' },{ nom: 'Amdoun', cp: '9020' },{ nom: 'Nefza', cp: '9010' },{ nom: 'Téboursouk', cp: '9040' },{ nom: 'Testour', cp: '9030' },{ nom: 'Goubellat', cp: '9060' },{ nom: 'Medjez El Bab', cp: '9070' },{ nom: 'Thibar', cp: '9036' }] },
  { gouvernorat: 'Jendouba', villes: [{ nom: 'Jendouba', cp: '8100' },{ nom: 'Jendouba Nord', cp: '8110' },{ nom: 'Bou Salem', cp: '8140' },{ nom: 'Tabarka', cp: '8110' },{ nom: 'Aïn Draham', cp: '8142' },{ nom: 'Fernana', cp: '8130' },{ nom: 'Ghardimaou', cp: '8120' },{ nom: 'Oued Melliz', cp: '8143' },{ nom: 'Balta Bou Aouane', cp: '8145' }] },
  { gouvernorat: 'Le Kef', villes: [{ nom: 'Le Kef', cp: '7100' },{ nom: 'Le Kef Ouest', cp: '7113' },{ nom: 'Nebeur', cp: '7110' },{ nom: 'Sakiet Sidi Youssef', cp: '7150' },{ nom: 'Tajerouine', cp: '7130' },{ nom: 'Kalaat Senan', cp: '7120' },{ nom: 'Kalaat Khasba', cp: '7140' },{ nom: 'Djérissa', cp: '7170' },{ nom: 'El Ksour', cp: '7160' },{ nom: 'Dahmani', cp: '7180' }] },
  { gouvernorat: 'Siliana', villes: [{ nom: 'Siliana', cp: '6100' },{ nom: 'Siliana Nord', cp: '6111' },{ nom: 'Bou Arada', cp: '6110' },{ nom: 'Gaâfour', cp: '6120' },{ nom: 'El Krib', cp: '6140' },{ nom: 'Bargou', cp: '6130' },{ nom: 'Makthar', cp: '6150' },{ nom: 'Rouhia', cp: '6160' },{ nom: 'Kesra', cp: '6170' },{ nom: 'Sidi Bou Rouis', cp: '6180' }] },
  { gouvernorat: 'Sousse', villes: [{ nom: 'Sousse Médina', cp: '4000' },{ nom: 'Sousse Riadh', cp: '4023' },{ nom: 'Sousse Jawhara', cp: '4051' },{ nom: 'Sousse Sidi Abdelhamid', cp: '4061' },{ nom: 'Hammam Sousse', cp: '4011' },{ nom: 'Akouda', cp: '4022' },{ nom: 'Kalaa Kebira', cp: '4060' },{ nom: 'Sidi Bou Ali', cp: '4040' },{ nom: 'Hergla', cp: '4042' },{ nom: 'Enfidha', cp: '4030' },{ nom: 'Bouficha', cp: '4021' },{ nom: 'Msaken', cp: '4070' },{ nom: 'Kalaat Sghira', cp: '4080' },{ nom: 'Sidi El Hani', cp: '4081' }] },
  { gouvernorat: 'Monastir', villes: [{ nom: 'Monastir', cp: '5000' },{ nom: 'Ouerdanine', cp: '5010' },{ nom: 'Sahline', cp: '5012' },{ nom: 'Zeramdine', cp: '5020' },{ nom: 'Beni Hassen', cp: '5021' },{ nom: 'Jemmal', cp: '5022' },{ nom: 'Bembla', cp: '5080' },{ nom: 'Ksar Hellal', cp: '5070' },{ nom: 'Moknine', cp: '5050' },{ nom: 'Bekalta', cp: '5060' },{ nom: 'Téboulba', cp: '5062' },{ nom: 'Sayada Lamta Bou Hajar', cp: '5052' }] },
  { gouvernorat: 'Mahdia', villes: [{ nom: 'Mahdia', cp: '5100' },{ nom: 'Bou Merdes', cp: '5111' },{ nom: 'Ouled Chamekh', cp: '5114' },{ nom: 'Chorbane', cp: '5120' },{ nom: 'Hebira', cp: '5141' },{ nom: 'Sidi Alouane', cp: '5130' },{ nom: 'El Jem', cp: '5160' },{ nom: 'Essouassi', cp: '5150' },{ nom: 'El Bradaa', cp: '5142' },{ nom: 'Ksour Essef', cp: '5170' },{ nom: 'La Chebba', cp: '5172' }] },
  { gouvernorat: 'Sfax', villes: [{ nom: 'Sfax Médina', cp: '3000' },{ nom: 'Sfax Ouest', cp: '3003' },{ nom: 'Sfax Sud', cp: '3021' },{ nom: 'Sakiet Eddaier', cp: '3011' },{ nom: 'Sakiet Ezzit', cp: '3041' },{ nom: 'Chihia', cp: '3031' },{ nom: 'Agareb', cp: '3040' },{ nom: 'Djebeneiana', cp: '3060' },{ nom: 'El Amra', cp: '3045' },{ nom: 'El Hencha', cp: '3053' },{ nom: 'Menzel Chaker', cp: '3090' },{ nom: 'Ghraiba', cp: '3028' },{ nom: 'Bir Ali Ben Khalifa', cp: '3080' },{ nom: 'Skhira', cp: '3050' },{ nom: 'Maharès', cp: '3070' },{ nom: 'Kerkennah', cp: '3070' }] },
  { gouvernorat: 'Kairouan', villes: [{ nom: 'Kairouan Nord', cp: '3100' },{ nom: 'Kairouan Sud', cp: '3100' },{ nom: 'Chebika', cp: '3120' },{ nom: 'Sbikha', cp: '3114' },{ nom: 'Oueslatia', cp: '3180' },{ nom: 'Haffouz', cp: '3140' },{ nom: 'El Alaa', cp: '3150' },{ nom: 'Hajeb El Aoun', cp: '3160' },{ nom: 'Nasrallah', cp: '3170' },{ nom: 'Cherarda', cp: '3110' },{ nom: 'Bouhajla', cp: '3130' }] },
  { gouvernorat: 'Kasserine', villes: [{ nom: 'Kasserine Nord', cp: '1200' },{ nom: 'Kasserine Sud', cp: '1215' },{ nom: 'Ezzouhour', cp: '1200' },{ nom: 'Hassi El Frid', cp: '1240' },{ nom: 'Jedeliane', cp: '1210' },{ nom: 'El Ayoun', cp: '1220' },{ nom: 'Thala', cp: '1230' },{ nom: 'Hidra', cp: '1250' },{ nom: 'Foussana', cp: '1214' },{ nom: 'Feriana', cp: '1260' },{ nom: 'Sbeitla', cp: '1250' },{ nom: 'Sbiba', cp: '1211' },{ nom: 'Majel Bel Abbès', cp: '1280' }] },
  { gouvernorat: 'Sidi Bouzid', villes: [{ nom: 'Sidi Bouzid Est', cp: '9100' },{ nom: 'Sidi Bouzid Ouest', cp: '9113' },{ nom: 'Jelma', cp: '9110' },{ nom: 'Cebbala Ouled Asker', cp: '9114' },{ nom: 'Bir El Hafey', cp: '9120' },{ nom: 'Sidi Ali Ben Aoun', cp: '9130' },{ nom: 'Meknassy', cp: '9140' },{ nom: 'Souk Jedid', cp: '9150' },{ nom: 'Mezzouna', cp: '9142' },{ nom: 'Regueb', cp: '9160' },{ nom: 'Ouled Haffouz', cp: '9113' }] },
  { gouvernorat: 'Gabès', villes: [{ nom: 'Gabès Médina', cp: '6000' },{ nom: 'Gabès Ouest', cp: '6014' },{ nom: 'Gabès Sud', cp: '6011' },{ nom: 'El Hamma', cp: '6020' },{ nom: 'Mareth', cp: '6030' },{ nom: 'Matmata', cp: '6070' },{ nom: 'Nouvelle Matmata', cp: '6080' },{ nom: 'Métouia', cp: '6040' },{ nom: 'Ouedhref', cp: '6050' },{ nom: 'Menzel El Habib', cp: '6060' },{ nom: 'Ghannouch', cp: '6021' }] },
  { gouvernorat: 'Médenine', villes: [{ nom: 'Medenine Nord', cp: '4100' },{ nom: 'Medenine Sud', cp: '4105' },{ nom: 'Ben Gardane', cp: '4160' },{ nom: 'Beni Khedache', cp: '4120' },{ nom: 'Houmt Souk (Djerba)', cp: '4180' },{ nom: 'Midoun (Djerba)', cp: '4116' },{ nom: 'Ajim', cp: '4135' },{ nom: 'Sidi Makhlouf', cp: '4150' },{ nom: 'Zarzis', cp: '4170' }] },
  { gouvernorat: 'Tataouine', villes: [{ nom: 'Tataouine Nord', cp: '3200' },{ nom: 'Tataouine Sud', cp: '3213' },{ nom: 'Bir Lahmar', cp: '3210' },{ nom: 'Ghomrassen', cp: '3240' },{ nom: 'Remada', cp: '3250' },{ nom: 'Smar', cp: '3220' }] },
  { gouvernorat: 'Gafsa', villes: [{ nom: 'Gafsa Nord', cp: '2100' },{ nom: 'Gafsa Sud', cp: '2110' },{ nom: 'Sidi Aïch', cp: '2111' },{ nom: 'El Ksar', cp: '2120' },{ nom: 'El Guettar', cp: '2130' },{ nom: 'Moulares', cp: '2140' },{ nom: 'Redeyef', cp: '2150' },{ nom: 'Métlaoui', cp: '2160' },{ nom: 'El Aïeun', cp: '2170' },{ nom: 'Belkhir', cp: '2180' },{ nom: 'Sened', cp: '2190' }] },
  { gouvernorat: 'Tozeur', villes: [{ nom: 'Tozeur', cp: '2200' },{ nom: 'Degache', cp: '2210' },{ nom: 'Tameghza', cp: '2230' },{ nom: 'Nefta', cp: '2240' },{ nom: 'Hazoua', cp: '2260' }] },
  { gouvernorat: 'Kébili', villes: [{ nom: 'Kébili Nord', cp: '4200' },{ nom: 'Kébili Sud', cp: '4211' },{ nom: 'Souk Lahad', cp: '4220' },{ nom: 'Douz Nord', cp: '4260' },{ nom: 'Douz Sud', cp: '4261' },{ nom: 'Faouar', cp: '4264' }] },
]

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, itemCount } = useCart()
  const navigate = useNavigate()

  const [payment, setPayment] = useState('ESPECES_LIVRAISON')
  const [shippingZones, setShippingZones] = useState([])
  const [selectedZone, setSelectedZone] = useState(null)
  const [tvaConfig, setTvaConfig] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [birthdayEligible, setBirthdayEligible] = useState(false)
  const [firstOrderEligible, setFirstOrderEligible] = useState(false)

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState(null) // { code, type, valeur }
  const [couponError, setCouponError] = useState('')

  // Track which fields came pre-filled from user profile
  const [profileFields, setProfileFields] = useState({})

  // Check if user is logged in
  const isLoggedIn = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      return !!(user && user.email)
    } catch { return false }
  }, [])



  // Customer form
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    gouvernorat: '',
  })

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  // Villes list based on selected gouvernorat
  const villesForGouvernorat = useMemo(() => {
    if (!form.gouvernorat) return []
    const g = GOUVERNORATS_DATA.find(g => g.gouvernorat === form.gouvernorat)
    return g ? g.villes : []
  }, [form.gouvernorat])

  // When gouvernorat changes → reset city & postalCode
  const handleGouvernoratChange = (val) => {
    setForm(prev => ({ ...prev, gouvernorat: val, city: '', postalCode: '' }))
  }

  // When ville changes → auto-fill postalCode
  const handleVilleChange = (villeName) => {
    const v = villesForGouvernorat.find(v => v.nom === villeName)
    setForm(prev => ({ ...prev, city: villeName, postalCode: v?.cp || prev.postalCode }))
  }

  // Fetch shipping zones + TVA config
  useEffect(() => {
    axios.get(`${API}/public/checkout/shipping-zones`)
      .then(res => {
        setShippingZones(res.data || [])
      })
      .catch(() => {})

    axios.get(`${API}/public/checkout/tva-config`)
      .then(res => setTvaConfig(res.data))
      .catch(() => {})
  }, [])

  // Pre-fill from localStorage user if logged in
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) {
        const filled = {}
        if (user.email) filled.email = true
        if (user.firstName) filled.firstName = true
        if (user.lastName) filled.lastName = true
        if (user.phone) filled.phone = true
        if (user.address) filled.address = true
        if (user.city) filled.city = true
        if (user.postalCode) filled.postalCode = true
        if (user.gouvernorat) filled.gouvernorat = true
        setProfileFields(filled)

        setForm(prev => ({
          ...prev,
          email: user.email || prev.email,
          firstName: user.firstName || prev.firstName,
          lastName: user.lastName || prev.lastName,
          phone: user.phone || prev.phone,
          address: user.address || prev.address,
          city: user.city || prev.city,
          postalCode: user.postalCode || prev.postalCode,
          gouvernorat: user.gouvernorat || prev.gouvernorat,
        }))
      }
    } catch {}
  }, [])

  // Auto-select shipping zone based on gouvernorat
  useEffect(() => {
    if (!form.gouvernorat || shippingZones.length === 0) return
    const matched = shippingZones.find(z =>
      z.regions?.split(',').map(r => r.trim().toLowerCase()).includes(form.gouvernorat.toLowerCase())
    )
    setSelectedZone(matched || null)
  }, [form.gouvernorat, shippingZones])

  // Auto-apply "Première commande" coupon for first-time buyers
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null')
      if (!u?.id) return
      if (localStorage.getItem(`_first_order_done_${u.id}`)) return
      axios.get(`${API}/public/coupons/auto-trigger`, { params: { trigger: 'premiere_commande' } })
        .then(res => {
          if (res.data?.code) {
            setAppliedCoupon({ code: res.data.code, type: res.data.type, valeur: res.data.valeur, label: 'Bienvenue' })
          }
        })
        .catch(() => {})
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Coupon validation ──
  const handleValidateCoupon = async () => {
    const code = couponCode.trim()
    if (!code) return
    setCouponLoading(true)
    setCouponError('')
    setAppliedCoupon(null)
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      const params = { code }
      if (user?.id) params.userId = user.id
      const { data } = await axios.get(`${API}/public/coupons/validate`, { params })
      setAppliedCoupon({ code: data.code, type: data.type, valeur: data.valeur, label: data.code })
      toast.success(`Coupon "${data.code}" appliqué !`)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Coupon invalide'
      setCouponError(typeof msg === 'string' ? msg : 'Coupon invalide')
      toast.error(typeof msg === 'string' ? msg : 'Coupon invalide')
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  // ── Calculations (prix TTC — TVA incluse) ──
  const subtotalTTC = items.reduce((s, i) => s + i.price * i.quantity, 0)

  // Coupon discount (applied on subtotal, before shipping)
  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === 'pourcentage'
      ? Math.round(subtotalTTC * appliedCoupon.valeur) / 100
      : Math.min(appliedCoupon.valeur, subtotalTTC)
    : 0
  const subtotalAfterCoupon = subtotalTTC - couponDiscount

  const shippingCost = selectedZone?.cout ?? 0
  const tvaRate = (tvaConfig?.tvaActive && tvaConfig?.tauxDefaut) ? tvaConfig.tauxDefaut : 0
  const tvaAmount = Math.round(subtotalAfterCoupon * tvaRate) / 100
  const prixHT = subtotalAfterCoupon - tvaAmount
  const total = subtotalAfterCoupon + shippingCost

  const fmt = (n) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DT'

  // ── Submit order ──
  const handleSubmit = async () => {
    const required = ['email', 'firstName', 'lastName', 'address', 'city', 'postalCode', 'gouvernorat']
    for (const f of required) {
      if (!form[f]?.trim()) {
        toast.error('Veuillez remplir tous les champs obligatoires')
        return
      }
    }
    if (!selectedZone) {
      toast.error('Aucune zone de livraison ne couvre votre gouvernorat')
      return
    }
    if (items.length === 0) return

    setSubmitting(true)
    try {
      const payload = {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone?.trim() || null,
        address: form.address.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
        gouvernorat: form.gouvernorat?.trim() || null,
        shippingZoneName: selectedZone.nom,
        paymentMethod: 'ESPECES_LIVRAISON',
        userId: JSON.parse(localStorage.getItem('user') || 'null')?.id || null,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: couponDiscount || 0,
        items: items.map(i => ({
          productId: i.productId,
          productName: i.nom,
          productSlug: i.slug,
          color: i.color,
          size: i.size,
          image: i.image,
          unitPrice: i.price,
          quantity: i.quantity,
        })),
      }

      const res = await axios.post(`${API}/public/checkout/orders`, payload)
      setOrderSuccess(res.data)
      clearCart()

      // ─── Post-order eligibility checks ───
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}')

        // Birthday check: birthday within next 30 days AND account ≥2 months old at that date
        if (u.dateOfBirth) {
          const today = new Date()
          const dob = new Date(u.dateOfBirth)
          const birthdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
          const daysUntil = Math.ceil((birthdayThisYear - today) / 86400000)
          if (daysUntil >= 0 && daysUntil <= 30) {
            const twoMonthsBefore = new Date(birthdayThisYear)
            twoMonthsBefore.setMonth(twoMonthsBefore.getMonth() - 2)
            const created = u.createdAt ? new Date(u.createdAt) : null
            if (created && created <= twoMonthsBefore) setBirthdayEligible(true)
          }
        }

        // First order check
        if (u.id && !localStorage.getItem(`_first_order_done_${u.id}`)) {
          setFirstOrderEligible(true)
          localStorage.setItem(`_first_order_done_${u.id}`, '1')
        }
      } catch {}

      // Save customer info for next time
      try {
        const saved = JSON.parse(localStorage.getItem('user') || '{}')
        const updated = {
          ...saved,
          phone: form.phone || saved.phone,
          address: form.address || saved.address,
          city: form.city || saved.city,
          postalCode: form.postalCode || saved.postalCode,
          gouvernorat: form.gouvernorat || saved.gouvernorat,
        }
        localStorage.setItem('user', JSON.stringify(updated))
      } catch {}

      toast.success('Commande passée avec succès !')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la commande'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ═══ Order success screen ═══
  if (orderSuccess) {
    return (
      <main className="pt-28 pb-16 px-6 md:px-12 max-w-[800px] mx-auto min-h-screen">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-green-500 mb-6 block">check_circle</span>
          <h1 className="font-headline font-black text-2xl tracking-tighter mb-4 uppercase">
            Commande Confirmée
          </h1>
          <p className="text-neutral-600 mb-2">
            Référence : <span className="font-bold">{orderSuccess.reference}</span>
          </p>
          <p className="text-neutral-600 mb-8">
            Un récapitulatif sera envoyé à <span className="font-bold">{orderSuccess.email}</span>
          </p>
          <div className="bg-surface-container p-6 text-left inline-block w-full max-w-md mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-500">Sous-total</span>
              <span>{fmt(orderSuccess.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-500">TVA ({orderSuccess.tvaRate}%)</span>
              <span>{fmt(orderSuccess.tvaAmount)}</span>
            </div>
            {orderSuccess.couponCode && (
              <div className="flex justify-between text-sm mb-2 text-green-600">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">confirmation_number</span>
                  Coupon ({orderSuccess.couponCode})
                </span>
                <span>-{fmt(orderSuccess.couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-500">Livraison ({orderSuccess.shippingZoneName})</span>
              <span>{fmt(orderSuccess.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-neutral-200">
              <span>Total</span>
              <span>{fmt(orderSuccess.total)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <Link
              to="/"
              className="inline-block fo-btn px-10 py-4 font-bold tracking-[0.1em] text-[12px] uppercase"
            >
              Retour à la boutique
            </Link>
          </div>

          {(birthdayEligible || firstOrderEligible) && (
            <div className="space-y-3 w-full max-w-md mx-auto mt-4 text-left">
              {birthdayEligible && (
                <div className="flex items-center gap-3 p-4 bg-pink-50 border border-pink-200 rounded-xl">
                  <span className="text-2xl">🎂</span>
                  <div>
                    <p className="font-bold text-pink-800 text-sm">Cadeau anniversaire activé !</p>
                    <p className="text-pink-600 text-xs mt-0.5">Votre coupon exclusif vous a été envoyé par e-mail.</p>
                  </div>
                </div>
              )}
              {firstOrderEligible && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <p className="font-bold text-green-800 text-sm">Merci pour votre première commande !</p>
                    <p className="text-green-600 text-xs mt-0.5">Un coupon de bienvenue vous attend par e-mail.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    )
  }

  // ═══ Empty cart ═══
  if (items.length === 0) {
    return (
      <main className="pt-28 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto min-h-screen">
        <h1 className="font-headline font-black text-2xl tracking-tighter mb-10 uppercase">
          Votre Panier
        </h1>
        <div className="text-center py-32">
          <span className="material-symbols-outlined text-6xl text-neutral-300 mb-6 block">shopping_bag</span>
          <p className="font-headline font-bold text-xl uppercase tracking-tight mb-4">Votre panier est vide</p>
          <Link
            to="/"
            className="inline-block fo-btn px-10 py-4 font-bold tracking-[0.1em] text-[12px] uppercase"
          >
            Continuer vos achats
          </Link>
        </div>
      </main>
    )
  }

  const inputCls = 'w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 font-body text-sm placeholder:text-neutral-300 focus:outline-none focus:border-b-primary focus:ring-0'
  const labelCls = 'text-[10px] font-bold tracking-widest uppercase text-secondary mb-2 block'

  return (
    <main className="pt-28 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto min-h-screen">
      <h1 className="font-headline font-black text-2xl tracking-tighter mb-10 uppercase">
        Votre Panier
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-8">

          {/* 01 / Articles */}
          <section>
            <h2 className="font-headline text-[11px] font-bold tracking-[0.1em] uppercase mb-5 text-outline">
              01 / Articles ({itemCount})
            </h2>
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.key} className="flex gap-4 pb-5">
                  <div className="w-28 h-36 bg-surface-container overflow-hidden shrink-0">
                    {(item.imageUrl || item.image) ? (
                      <img src={item.imageUrl || item.image} alt={item.nom} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <span className="material-symbols-outlined text-3xl">image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between w-full py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/produit/${item.slug}`} className="font-headline font-bold text-sm leading-tight uppercase hover:underline">
                          {item.nom}
                        </Link>
                        <p className="text-xs text-secondary mt-1 font-label tracking-wider uppercase">
                          Taille: {item.size} | {item.color}
                        </p>
                      </div>
                      <p className="font-headline font-bold text-sm tracking-tight">{fmt(item.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 border border-neutral-200 flex items-center justify-center text-xs hover:bg-neutral-100 disabled:opacity-30"
                        >−</button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="w-7 h-7 border border-neutral-200 flex items-center justify-center text-xs hover:bg-neutral-100"
                        >+</button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="flex items-center gap-2 text-[11px] font-bold tracking-[0.05em] uppercase hover:text-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 02-04 — only for logged-in users */}
          {isLoggedIn && (
          <>
          <section className="pt-4">
            <h2 className="font-headline text-[11px] font-bold tracking-[0.1em] uppercase mb-5 text-outline">
              02 / Informations Client
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {/* Email, Prénom, Nom — read-only display */}
              <div className="md:col-span-2 flex flex-wrap gap-x-8 gap-y-2 bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/15">
                <div><span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Email</span><p className="text-sm font-medium">{form.email || '—'}</p></div>
                <div><span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Prénom</span><p className="text-sm font-medium">{form.firstName || '—'}</p></div>
                <div><span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Nom</span><p className="text-sm font-medium">{form.lastName || '—'}</p></div>
              </div>
              {/* Téléphone — editable */}
              <div>
                <label className={labelCls}>Téléphone</label>
                <input type="tel" className={inputCls}
                  value={form.phone} onChange={e => setField('phone', e.target.value)} />
              </div>
              {/* Adresse — always shown */}
              <div className="md:col-span-2">
                <label className={labelCls}>Adresse de livraison *</label>
                <input type="text" placeholder="Rue, numéro, appartement" className={inputCls}
                  value={form.address} onChange={e => setField('address', e.target.value)} />
              </div>
              {/* Gouvernorat — dropdown */}
              <div>
                <label className={labelCls}>Gouvernorat *</label>
                <CustomSelect
                  variant="underline"
                  options={GOUVERNORATS_DATA.map(g => ({ value: g.gouvernorat, label: g.gouvernorat }))}
                  value={form.gouvernorat}
                  onChange={handleGouvernoratChange}
                  placeholder="— Sélectionner —"
                />
              </div>
              {/* Ville — dropdown dependent on gouvernorat */}
              <div>
                <label className={labelCls}>Ville *</label>
                <CustomSelect
                  variant="underline"
                  options={villesForGouvernorat.map(v => ({ value: v.nom, label: v.nom }))}
                  value={form.city}
                  onChange={handleVilleChange}
                  placeholder={form.gouvernorat ? '— Sélectionner —' : "— Choisir un gouvernorat d'abord —"}
                  disabled={!form.gouvernorat}
                />
              </div>
              {/* Code Postal — auto-filled but editable */}
              <div>
                <label className={labelCls}>Code Postal *</label>
                <input type="text" className={inputCls}
                  value={form.postalCode} onChange={e => setField('postalCode', e.target.value)} />
              </div>
            </div>
          </section>

          {/* 03 / Zone de Livraison (auto) */}
          <section className="pt-4">
            <h2 className="font-headline text-[11px] font-bold tracking-[0.1em] uppercase mb-5 text-outline">
              03 / Zone de Livraison
            </h2>
            {!form.gouvernorat ? (
              <p className="text-sm text-neutral-400 italic">Veuillez sélectionner un gouvernorat pour déterminer votre zone.</p>
            ) : selectedZone ? (
              <div className="flex items-center justify-between w-full p-4 border border-primary bg-surface-container-lowest">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary text-xl">local_shipping</span>
                  <div>
                    <span className="font-headline font-bold text-sm uppercase block">{selectedZone.regions}</span>
                    {selectedZone.estimation && (
                      <span className="text-[11px] text-neutral-400">Estimation : {selectedZone.estimation}</span>
                    )}
                  </div>
                </div>
                <span className="font-headline font-bold text-sm">{fmt(selectedZone.cout)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 border border-amber-300 bg-amber-50 text-amber-700 text-sm">
                <span className="material-symbols-outlined text-lg">warning</span>
                Aucune zone de livraison ne couvre <span className="font-bold">{form.gouvernorat}</span> pour le moment.
              </div>
            )}
          </section>

          {/* 04 / Code Promo */}
          <section className="pt-4">
            <h2 className="font-headline text-[11px] font-bold tracking-[0.1em] uppercase mb-5 text-outline">
              04 / Code Promo
            </h2>
            {appliedCoupon ? (
              <div className="flex items-center justify-between w-full p-4 border border-green-400 bg-green-50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-600 text-xl">confirmation_number</span>
                  <div>
                    <span className="font-headline font-bold text-sm uppercase block text-green-700">{appliedCoupon.code}</span>
                    <span className="text-[11px] text-green-600">
                      {appliedCoupon.type === 'pourcentage' ? `-${appliedCoupon.valeur}%` : `-${fmt(appliedCoupon.valeur)}`} sur le sous-total
                    </span>
                  </div>
                </div>
                <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 transition-colors">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Entrez votre code promo"
                  className={inputCls + ' flex-1 border border-outline-variant px-4'}
                  value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleValidateCoupon()}
                />
                <button
                  onClick={handleValidateCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="fo-btn px-6 py-3 text-[11px] font-bold tracking-widest uppercase whitespace-nowrap disabled:opacity-40"
                >
                  {couponLoading ? 'Vérification…' : 'Vérifier'}
                </button>
              </div>
            )}
            {couponError && (
              <p className="text-red-500 text-xs mt-2">{couponError}</p>
            )}
          </section>
          </>
          )} {/* end isLoggedIn 02-04 */}

          {/* ── Login prompt — shown when not logged in ── */}
          {!isLoggedIn && (
            <div className="pt-6 pb-2 flex flex-col items-start gap-4 border-t border-outline-variant">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-neutral-400">lock</span>
                <div>
                  <p className="font-bold text-sm uppercase tracking-wide">Connexion requise</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Connectez-vous pour finaliser votre commande</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/login', { state: { from: '/panier' } })}
                className="fo-btn px-8 py-4 text-[12px] font-bold uppercase tracking-widest w-full"
              >
                Se connecter pour commander
              </button>
            </div>
          )}
          {isLoggedIn && (
          <section className="pt-4">
            <h2 className="font-headline text-[11px] font-bold tracking-[0.1em] uppercase mb-5 text-outline">
              05 / Mode de Paiement
            </h2>
            <div className="flex items-center justify-between w-full p-4 border border-primary bg-surface-container-lowest">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full border-4 border-primary" />
                <span className="font-headline font-bold text-sm uppercase">Espèces à la livraison</span>
              </div>
              <span className="material-symbols-outlined text-neutral-400">local_shipping</span>
            </div>
          </section>
          )} {/* end isLoggedIn 05 */}
        </div>

        {/* ═══ Right column — Summary ═══ */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32 bg-surface-container-lowest border border-outline-variant p-8">
            <h2 className="font-headline font-bold text-sm uppercase tracking-wider mb-8">
              Récapitulatif
            </h2>
            <div className="space-y-4 text-sm mb-8">
              <div className="flex justify-between">
                <span className="text-secondary">Prix HT ({itemCount} article{itemCount > 1 ? 's' : ''})</span>
                <span>{fmt(prixHT)}</span>
              </div>
              {tvaRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-secondary">TVA ({tvaRate}%)</span>
                  <span>{fmt(tvaAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-secondary">Sous-total TTC</span>
                <span className="font-bold">{fmt(subtotalTTC)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({appliedCoupon.label || appliedCoupon.code})</span>
                  <span>-{fmt(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-secondary">Livraison{selectedZone ? ` (${selectedZone.regions})` : ''}</span>
                <span>{selectedZone ? fmt(shippingCost) : '—'}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-outline-variant">
                <span className="font-headline font-bold uppercase tracking-wider">Total</span>
                <span className="font-headline font-bold text-lg">{fmt(total)}</span>
              </div>
            </div>

            <button
              onClick={isLoggedIn ? handleSubmit : () => navigate('/login', { state: { from: '/panier' } })}
              disabled={isLoggedIn && (submitting || items.length === 0)}
              className={`w-full fo-btn py-5 text-[13px] font-bold uppercase tracking-widest transition-opacity ${
                isLoggedIn && submitting ? 'opacity-50 cursor-wait' : ''
              }`}
            >
              {isLoggedIn
                ? (submitting ? 'Traitement…' : 'Passer la commande')
                : 'Se connecter pour commander'}
            </button>

            <p className="text-[10px] text-neutral-400 text-center mt-4 leading-relaxed">
              En passant votre commande, vous acceptez nos conditions générales de vente.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
