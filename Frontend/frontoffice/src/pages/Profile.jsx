import { useState, useEffect, useMemo } from 'react'
import CustomSelect from '../components/ui/CustomSelect'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/apiClient'

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

const STATUS_LABELS = {
  EN_ATTENTE: 'Commande créée',
  CONFIRMEE: 'Confirmée',
  EN_PREPARATION: 'En préparation',
  EXPEDIEE: 'Expédiée',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
  REMBOURSEE: 'Remboursée',
}

const STATUS_COLORS = {
  EN_ATTENTE: 'text-amber-600',
  CONFIRMEE: 'text-blue-600',
  EN_PREPARATION: 'text-indigo-600',
  EXPEDIEE: 'text-indigo-600',
  LIVREE: 'text-green-600',
  ANNULEE: 'text-red-600',
  REMBOURSEE: 'text-purple-600',
}

const TIMELINE_STEPS = [
  { status: 'EN_ATTENTE', label: 'Commande créée', icon: 'shopping_cart' },
  { status: 'EN_PREPARATION', label: 'En préparation', icon: 'inventory_2' },
  { status: 'EXPEDIEE', label: 'Expédiée', icon: 'local_shipping' },
  { status: 'LIVREE', label: 'Livrée', icon: 'done_all' },
]

const STATUS_FLOW = ['EN_ATTENTE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE']

const sidebarLinks = [
  { key: 'commandes', label: 'COMMANDES' },
  { key: 'adresses', label: 'ADRESSE DE LIVRAISON' },
]

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Profile() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [activeTab, setActiveTab] = useState('commandes')

  // Orders state
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)

  // Reviews state
  const [myReviews, setMyReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({}) // key: `${orderId}-${productId}` → { note, commentaire }
  const [submittingReview, setSubmittingReview] = useState(null) // key being submitted

  // Address state
  const [address, setAddress] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
    gouvernorat: user?.gouvernorat || '',
  })
  const [editingAddress, setEditingAddress] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  // Return request state
  const [returnModal, setReturnModal] = useState(null) // { orderId, item }
  const [returnRaison, setReturnRaison] = useState('')
  const [returnComment, setReturnComment] = useState('')
  const [returnPhoto1, setReturnPhoto1] = useState(null)
  const [returnPhoto2, setReturnPhoto2] = useState(null)
  const [returnPhoto1Preview, setReturnPhoto1Preview] = useState(null)
  const [returnPhoto2Preview, setReturnPhoto2Preview] = useState(null)
  const [submittingReturn, setSubmittingReturn] = useState(false)
  const [myReturns, setMyReturns] = useState([])

  // Villes list based on selected gouvernorat
  const villesForGouvernorat = useMemo(() => {
    if (!address.gouvernorat) return []
    const g = GOUVERNORATS_DATA.find(g => g.gouvernorat === address.gouvernorat)
    return g ? g.villes : []
  }, [address.gouvernorat])

  const handleGouvernoratChange = (val) => {
    setAddress(a => ({ ...a, gouvernorat: val, city: '', postalCode: '' }))
  }

  const handleVilleChange = (villeName) => {
    const v = villesForGouvernorat.find(v => v.nom === villeName)
    setAddress(a => ({ ...a, city: villeName, postalCode: v?.cp || a.postalCode }))
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchOrders()
    fetchMyReviews()
    fetchMyReturns()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true)
      const { data } = await apiClient.get('/profile/orders')
      setOrders(data)
    } catch {
      // silently fail — user may have no orders
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchMyReviews = async () => {
    try {
      const { data } = await apiClient.get('/profile/reviews')
      setMyReviews(data)
    } catch {
      // ignore
    }
  }

  const hasReviewed = (orderId, productId) =>
    myReviews.some(r => r.orderId === orderId && r.productId === productId)

  const getReview = (orderId, productId) =>
    myReviews.find(r => r.orderId === orderId && r.productId === productId)

  const handleSubmitReview = async (orderId, productId) => {
    const key = `${orderId}-${productId}`
    const form = reviewForm[key]
    if (!form?.note) return
    setSubmittingReview(key)
    try {
      await apiClient.post('/profile/reviews', {
        orderId,
        productId,
        note: form.note,
        commentaire: form.commentaire || '',
      })
      setReviewForm(prev => { const copy = { ...prev }; delete copy[key]; return copy })
      await fetchMyReviews()
    } catch (err) {
      const data = err.response?.data
      const msg = typeof data === 'string' ? data : data?.message || 'Erreur lors de la soumission'
      alert(msg)
    } finally {
      setSubmittingReview(null)
    }
  }

  // ── Returns ──
  const fetchMyReturns = async () => {
    try {
      const { data } = await apiClient.get('/profile/returns')
      setMyReturns(data)
    } catch { /* ignore */ }
  }

  const hasReturn = (orderItemId) => myReturns.some(r => r.orderItemId === orderItemId)

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const openReturnModal = (orderId, item) => {
    setReturnModal({ orderId, item })
    setReturnRaison('')
    setReturnComment('')
    setReturnPhoto1(null)
    setReturnPhoto2(null)
    setReturnPhoto1Preview(null)
    setReturnPhoto2Preview(null)
  }

  const handlePhoto = async (file, setter, previewSetter) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Photo trop grande (max 5 Mo)'); return }
    previewSetter(URL.createObjectURL(file))
    const b64 = await fileToBase64(file)
    setter(b64)
  }

  const handleSubmitReturn = async () => {
    if (!returnRaison.trim()) { alert('Veuillez sélectionner une raison'); return }
    setSubmittingReturn(true)
    try {
      await apiClient.post('/profile/returns', {
        orderId: returnModal.orderId,
        orderItemId: returnModal.item.id,
        raison: returnRaison,
        commentaire: returnComment,
        photo1: returnPhoto1,
        photo2: returnPhoto2,
      })
      setReturnModal(null)
      await fetchMyReturns()
    } catch (err) {
      const data = err.response?.data
      alert(typeof data === 'string' ? data : data?.error || data?.message || 'Erreur lors de la soumission')
    } finally {
      setSubmittingReturn(false)
    }
  }

  const handleSaveAddress = async () => {
    try {
      setSavingAddress(true)
      await apiClient.put('/profile', address)
      // Update localStorage user
      const updatedUser = { ...user, ...address }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setEditingAddress(false)
    } catch {
      // error handling silently
    } finally {
      setSavingAddress(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    window.dispatchEvent(new Event('userChanged'))
    navigate('/login')
  }

  const inputCls = 'w-full px-4 py-3 border border-neutral-200 bg-neutral-50 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all'

  return (
    <div className="flex-1 pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
      {/* Header */}
      <header className="mb-16">
        <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">MON COMPTE</h1>
        <p className="text-secondary font-label tracking-[0.05em] text-[11px] uppercase">
          BIENVENUE, {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim().toUpperCase() || 'UTILISATEUR' : 'UTILISATEUR'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <nav className="flex flex-col gap-5">
            {sidebarLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => setActiveTab(link.key)}
                className={`text-left font-headline text-sm tracking-tight border-l-2 pl-4 transition-all ${
                  activeTab === link.key
                    ? 'font-bold border-primary text-primary'
                    : 'text-neutral-400 border-transparent hover:text-primary'
                }`}
              >
                {link.label}
              </button>
            ))}
            <hr className="border-outline-variant/15 my-3" />
            <button
              onClick={handleLogout}
              className="text-left font-headline text-error text-sm tracking-tight pl-4"
            >
              DÉCONNEXION
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-9 flex flex-col gap-20">

          {/* ═══ COMMANDES TAB ═══ */}
          {activeTab === 'commandes' && (
            <section>
              <h2 className="font-headline font-extrabold text-xl tracking-tight uppercase mb-8">
                MES COMMANDES
              </h2>

              {loadingOrders ? (
                <div className="py-16 text-center text-neutral-400">
                  <span className="material-symbols-outlined text-3xl mb-2 block animate-spin">progress_activity</span>
                  <p className="text-sm">Chargement...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center">
                  <span className="material-symbols-outlined text-4xl text-neutral-300 mb-3 block">shopping_bag</span>
                  <p className="text-neutral-500 mb-4">Aucune commande pour le moment</p>
                  <button onClick={() => navigate('/produits')} className="fo-btn px-8 py-3 text-sm">
                    DÉCOUVRIR NOS PRODUITS
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const isExpanded = expandedOrder === order.id
                    const stepIndex = STATUS_FLOW.indexOf(order.status)

                    return (
                      <div key={order.id} className="border border-neutral-200 bg-white">
                        {/* Order summary row */}
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="w-full p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left hover:bg-neutral-50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-label text-[10px] tracking-widest text-secondary uppercase mb-1">
                              {order.reference} / {formatDate(order.createdAt)}
                            </p>
                            <p className="font-headline font-bold text-sm tracking-tight">
                              {(order.items || []).map(i => i.productName).join(', ') || 'Commande'}
                            </p>
                            <p className="text-sm mt-1">
                              Statut : <span className={`font-medium ${STATUS_COLORS[order.status] || 'text-neutral-800'}`}>
                                {STATUS_LABELS[order.status] || order.status}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-headline font-black text-lg">{(order.total || 0).toFixed(2)} DT</span>
                            <span className={`material-symbols-outlined text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                          </div>
                        </button>

                        {/* Expanded tracking */}
                        {isExpanded && (
                          <div className="border-t border-neutral-200 p-6">
                            {/* Progress bar — hidden for cancelled orders */}
                            {order.status === 'ANNULEE' ? (
                              <div className="flex items-center gap-3 mb-8 p-4 bg-red-50 border border-red-200 rounded">
                                <span className="material-symbols-outlined text-red-500 text-2xl">cancel</span>
                                <div>
                                  <p className="font-bold text-red-700 text-sm">Commande annulée</p>
                                  <p className="text-red-500 text-[11px]">Cette commande a été annulée.</p>
                                </div>
                              </div>
                            ) : (
                            <div className="flex items-center justify-between mb-8">
                              {TIMELINE_STEPS.map((step, i) => {
                                const reached = i <= stepIndex
                                const isCurrent = i === stepIndex
                                return (
                                  <div key={step.status} className="flex-1 flex flex-col items-center relative">
                                    {i > 0 && (
                                      <div className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                                        i <= stepIndex ? 'bg-black' : 'bg-neutral-200'
                                      }`} style={{ left: '-50%' }} />
                                    )}
                                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                                      reached ? 'bg-black' : 'bg-neutral-200'
                                    } ${isCurrent ? 'ring-4 ring-neutral-200' : ''}`}>
                                      <span className={`material-symbols-outlined text-sm ${reached ? 'text-white' : 'text-neutral-400'}`}>
                                        {step.icon}
                                      </span>
                                    </div>
                                    <p className={`mt-2 text-[10px] font-bold uppercase tracking-wide ${reached ? 'text-black' : 'text-neutral-400'}`}>
                                      {step.label}
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                            )}

                            {/* Order items */}
                            <div className="space-y-3">
                              {(order.items || []).map((item) => (
                                <div key={item.id} className="flex items-center gap-4 py-2">
                                  <div className="w-16 h-16 bg-neutral-100 overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-neutral-300">image</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{item.productName}</p>
                                    <p className="text-[11px] text-neutral-500">
                                      {[item.color && `Couleur: ${item.color}`, item.size && `Taille: ${item.size}`].filter(Boolean).join(' • ')}
                                      {' × '}{item.quantity}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <p className="font-bold text-sm">{(item.lineTotal || 0).toFixed(2)} DT</p>
                                    {order.status === 'LIVREE' && (
                                      hasReturn(item.id) ? (
                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 uppercase tracking-wide whitespace-nowrap">
                                          Retour demandé
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => openReturnModal(order.id, item)}
                                          className="text-[10px] font-bold text-neutral-500 border border-neutral-300 px-2 py-1 uppercase tracking-wide hover:bg-neutral-100 hover:text-black transition-colors whitespace-nowrap"
                                        >
                                          Demande de retour
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Reviews section — only for delivered orders */}
                            {order.status === 'LIVREE' && (
                              <div className="mt-6 pt-6 border-t border-neutral-100">
                                <h4 className="font-headline font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-base">rate_review</span>
                                  DONNER VOTRE AVIS
                                </h4>
                                <div className="space-y-4">
                                  {(order.items || []).map((item) => {
                                    const reviewed = hasReviewed(order.id, item.productId)
                                    const existingReview = reviewed ? getReview(order.id, item.productId) : null
                                    const key = `${order.id}-${item.productId}`
                                    const form = reviewForm[key] || { note: 0, commentaire: '' }
                                    const isSubmitting = submittingReview === key

                                    return (
                                      <div key={`review-${item.id}`} className="bg-neutral-50 border border-neutral-200 p-4">
                                        <p className="font-bold text-sm mb-2">{item.productName}</p>

                                        {reviewed ? (
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-1">
                                              {[1, 2, 3, 4, 5].map(s => (
                                                <span key={s} className={`material-symbols-outlined text-lg ${s <= existingReview.note ? 'text-amber-400' : 'text-neutral-300'}`}
                                                  style={{ fontVariationSettings: s <= existingReview.note ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                              ))}
                                              <span className="text-[10px] text-green-600 font-bold ml-2 uppercase tracking-wider flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                Avis envoyé
                                              </span>
                                            </div>
                                            {existingReview.commentaire && (
                                              <p className="text-sm text-neutral-600 italic">"{existingReview.commentaire}"</p>
                                            )}
                                            {existingReview.reponse && (
                                              <div className="mt-2 bg-white border border-neutral-200 p-3 text-sm">
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Réponse du vendeur</p>
                                                <p className="text-neutral-700">{existingReview.reponse}</p>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="space-y-3">
                                            {/* Star rating */}
                                            <div className="flex items-center gap-1">
                                              {[1, 2, 3, 4, 5].map(s => (
                                                <button
                                                  key={s}
                                                  type="button"
                                                  onClick={() => setReviewForm(prev => ({ ...prev, [key]: { ...form, note: s } }))}
                                                  className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                  <span className={`material-symbols-outlined text-2xl ${s <= form.note ? 'text-amber-400' : 'text-neutral-300'}`}
                                                    style={{ fontVariationSettings: s <= form.note ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                                </button>
                                              ))}
                                              {form.note > 0 && <span className="text-xs text-neutral-500 ml-2">{form.note}/5</span>}
                                            </div>
                                            {/* Comment */}
                                            <textarea
                                              value={form.commentaire}
                                              onChange={e => setReviewForm(prev => ({ ...prev, [key]: { ...form, commentaire: e.target.value } }))}
                                              placeholder="Décrivez votre expérience... (optionnel)"
                                              rows={2}
                                              className="w-full px-3 py-2 border border-neutral-200 bg-white text-sm focus:ring-1 focus:ring-black focus:border-black outline-none resize-none"
                                            />
                                            {/* Submit */}
                                            <button
                                              onClick={() => handleSubmitReview(order.id, item.productId)}
                                              disabled={!form.note || isSubmitting}
                                              className="fo-btn px-5 py-2 text-[11px] font-bold tracking-widest uppercase disabled:opacity-40"
                                            >
                                              {isSubmitting ? 'ENVOI...' : 'ENVOYER MON AVIS'}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Total summary */}
                            <div className="mt-4 pt-4 border-t border-neutral-100 space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-neutral-500">Sous-total</span>
                                <span>{(order.subtotal || 0).toFixed(2)} DT</span>
                              </div>
                              {order.couponCode && (
                                <div className="flex justify-between text-green-600">
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">confirmation_number</span>
                                    Coupon ({order.couponCode})
                                  </span>
                                  <span>-{(order.couponDiscount || 0).toFixed(2)} DT</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-neutral-500">Livraison</span>
                                <span>{(order.shippingCost || 0).toFixed(2)} DT</span>
                              </div>
                              <div className="flex justify-between font-bold text-base pt-2 border-t border-neutral-100">
                                <span>Total</span>
                                <span>{(order.total || 0).toFixed(2)} DT</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {/* ═══ ADRESSE TAB ═══ */}
          {activeTab === 'adresses' && (
            <section>
              <h2 className="font-headline font-extrabold text-xl tracking-tight uppercase mb-8">
                ADRESSE DE LIVRAISON
              </h2>
              <div className="bg-surface p-8 border border-outline-variant/15 max-w-lg">
                {!editingAddress ? (
                  <>
                    <p className="font-headline font-bold text-sm mb-4">
                      {user?.name?.toUpperCase() || 'UTILISATEUR'}
                    </p>
                    <div className="text-secondary text-sm leading-relaxed space-y-1">
                      {address.address && <p>{address.address}</p>}
                      {(address.city || address.postalCode) && (
                        <p>{address.city}{address.postalCode ? ` ${address.postalCode}` : ''}</p>
                      )}
                      {address.gouvernorat && <p>{address.gouvernorat}</p>}
                      {address.phone && <p>{address.phone}</p>}
                      {!address.address && !address.city && !address.gouvernorat && (
                        <p className="text-neutral-400 italic">Aucune adresse enregistrée</p>
                      )}
                    </div>
                    <button
                      onClick={() => setEditingAddress(true)}
                      className="mt-6 text-[11px] font-label tracking-[0.05em] uppercase underline underline-offset-4"
                    >
                      MODIFIER L'ADRESSE
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Téléphone</label>
                      <input type="tel" className={inputCls} value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Adresse</label>
                      <input type="text" className={inputCls} value={address.address} onChange={e => setAddress(a => ({ ...a, address: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Gouvernorat</label>
                      <CustomSelect
                        variant="box"
                        options={GOUVERNORATS_DATA.map(g => ({ value: g.gouvernorat, label: g.gouvernorat }))}
                        value={address.gouvernorat}
                        onChange={handleGouvernoratChange}
                        placeholder="— Sélectionner —"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Ville</label>
                        <CustomSelect
                          variant="box"
                          options={villesForGouvernorat.map(v => ({ value: v.nom, label: v.nom }))}
                          value={address.city}
                          onChange={handleVilleChange}
                          placeholder={address.gouvernorat ? '— Sélectionner —' : "— Choisir un gouvernorat d'abord —"}
                          disabled={!address.gouvernorat}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Code Postal</label>
                        <input type="text" className={inputCls + ' bg-neutral-100 cursor-not-allowed'} value={address.postalCode} readOnly />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveAddress}
                        disabled={savingAddress}
                        className="fo-btn px-6 py-3 text-[11px] font-bold tracking-widest uppercase"
                      >
                        {savingAddress ? 'ENREGISTREMENT...' : 'ENREGISTRER'}
                      </button>
                      <button
                        onClick={() => setEditingAddress(false)}
                        className="px-6 py-3 text-[11px] font-bold tracking-widest uppercase border border-neutral-300 hover:bg-neutral-50"
                      >
                        ANNULER
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ═══ RETURN REQUEST MODAL ═══ */}
      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setReturnModal(null)}>
          <div className="bg-white w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h3 className="font-headline font-black text-lg tracking-tight uppercase">Demande de retour</h3>
              <button onClick={() => setReturnModal(null)} className="text-neutral-400 hover:text-black transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Product info */}
              <div className="flex items-center gap-4 p-4 bg-neutral-50 border border-neutral-200">
                <div className="w-14 h-14 bg-neutral-100 overflow-hidden flex-shrink-0">
                  {returnModal.item.image ? (
                    <img src={returnModal.item.image} alt={returnModal.item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-neutral-300">image</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm">{returnModal.item.productName}</p>
                  <p className="text-[11px] text-neutral-500">
                    {[returnModal.item.color && `Couleur: ${returnModal.item.color}`, returnModal.item.size && `Taille: ${returnModal.item.size}`].filter(Boolean).join(' • ')}
                    {' × '}{returnModal.item.quantity}
                  </p>
                  <p className="font-bold text-sm mt-1">{(returnModal.item.lineTotal || 0).toFixed(2)} DT</p>
                </div>
              </div>

              {/* Raison */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">
                  Raison du retour *
                </label>
                <CustomSelect
                  variant="box"
                  options={[
                    { value: 'Taille incorrecte', label: 'Taille incorrecte' },
                    { value: 'Produit défectueux', label: 'Produit défectueux' },
                    { value: 'Non conforme à la description', label: 'Non conforme à la description' },
                    { value: 'Produit endommagé à la réception', label: 'Produit endommagé à la réception' },
                    { value: 'Erreur de commande', label: 'Erreur de commande' },
                    { value: 'Autre', label: 'Autre' },
                  ]}
                  value={returnRaison}
                  onChange={setReturnRaison}
                  placeholder="— Sélectionner une raison —"
                />
              </div>

              {/* Commentaire */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={returnComment}
                  onChange={e => setReturnComment(e.target.value)}
                  placeholder="Décrivez le problème en détail..."
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-200 bg-neutral-50 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none resize-none transition-all"
                />
              </div>

              {/* Photos */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">
                  Photos (preuves) — max 2
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Photo 1 */}
                  <div className="relative">
                    {returnPhoto1Preview ? (
                      <div className="relative aspect-square border border-neutral-200 overflow-hidden">
                        <img src={returnPhoto1Preview} alt="Preuve 1" className="w-full h-full object-cover" />
                        <button
                          onClick={() => { setReturnPhoto1(null); setReturnPhoto1Preview(null) }}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ) : (
                      <label className="aspect-square border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-neutral-50 transition-colors">
                        <span className="material-symbols-outlined text-neutral-400 text-2xl">add_a_photo</span>
                        <span className="text-[10px] text-neutral-400 mt-1 font-bold uppercase">Photo 1</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e.target.files[0], setReturnPhoto1, setReturnPhoto1Preview)} />
                      </label>
                    )}
                  </div>
                  {/* Photo 2 */}
                  <div className="relative">
                    {returnPhoto2Preview ? (
                      <div className="relative aspect-square border border-neutral-200 overflow-hidden">
                        <img src={returnPhoto2Preview} alt="Preuve 2" className="w-full h-full object-cover" />
                        <button
                          onClick={() => { setReturnPhoto2(null); setReturnPhoto2Preview(null) }}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ) : (
                      <label className="aspect-square border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-neutral-50 transition-colors">
                        <span className="material-symbols-outlined text-neutral-400 text-2xl">add_a_photo</span>
                        <span className="text-[10px] text-neutral-400 mt-1 font-bold uppercase">Photo 2</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e.target.files[0], setReturnPhoto2, setReturnPhoto2Preview)} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-6 border-t border-neutral-200 flex gap-3">
              <button
                onClick={() => setReturnModal(null)}
                className="flex-1 py-3 text-[11px] font-bold tracking-widest uppercase border border-neutral-300 hover:bg-neutral-100 transition-colors"
              >
                ANNULER
              </button>
              <button
                onClick={handleSubmitReturn}
                disabled={!returnRaison || submittingReturn}
                className="flex-1 fo-btn py-3 text-[11px] font-bold tracking-widest uppercase disabled:opacity-40"
              >
                {submittingReturn ? 'ENVOI...' : 'ENVOYER LA DEMANDE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
