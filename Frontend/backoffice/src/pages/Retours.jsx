import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import KpiCard from '../components/ui/KpiCard'
import PageHeader from '../components/ui/PageHeader'
import CustomSelect from '../components/ui/CustomSelect'
import apiClient from '../api/apiClient'

const STATUS_LABELS = {
  EN_ATTENTE: 'En attente',
  INSPECTE: 'Inspecte',
  REMBOURSE: 'Rembourse',
  FERME: 'Ferme',
}

const STATUS_BG = {
  EN_ATTENTE: 'bg-amber-100 text-amber-700',
  INSPECTE: 'bg-blue-100 text-blue-700',
  REMBOURSE: 'bg-badge/10 text-badge',
  FERME: 'bg-slate-100 text-slate-600',
}

const statusOptions = ['Tous les Statuts', 'EN_ATTENTE', 'INSPECTE', 'REMBOURSE', 'FERME']
const raisonOptions = [
  'Toutes les raisons',
  'Taille incorrecte',
  'Produit defectueux',
  'Non conforme a la description',
  'Produit endommage a la reception',
  'Erreur de commande',
  'Autre',
]

const modeOptions = ['Mode original', 'Virement bancaire', 'Avoir boutique', 'Carte cadeau']
const eligibiliteOptions = ['Neufs avec etiquettes', 'Neufs sans etiquettes', 'Occasion acceptable', 'Tout etat']
const fraisOptions = ['Gratuit (Tunisie)', 'A la charge du client', 'Forfait 5 DT', 'Selon transporteur']

function getInitials(name) {
  if (!name) return '??'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso) {
  if (!iso) return '\u2014'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Retours() {
  const navigate = useNavigate()
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterStatut, setFilterStatut] = useState('Tous les Statuts')
  const [filterRaison, setFilterRaison] = useState('Toutes les raisons')

  const [editingPolitique, setEditingPolitique] = useState(false)
  const [politique, setPolitique] = useState({
    periode: '30',
    eligibilite: 'Neufs avec etiquettes',
    remboursement: 'Mode original',
    frais: 'Gratuit (Tunisie)',
    conditionsSpeciales: '',
  })
  const [politiqueDraft, setPolitiqueDraft] = useState(politique)

  useEffect(() => { fetchReturns() }, [])

  const fetchReturns = async () => {
    try {
      setLoading(true)
      const { data } = await apiClient.get('/admin/returns')
      setReturns(data)
      if (data.length > 0 && !selected) setSelected(data[0])
    } catch {
      toast.error('Erreur lors du chargement des retours')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiClient.patch(`/admin/returns/${id}/status`, { status: newStatus })
      toast.success(`Statut mis a jour : ${STATUS_LABELS[newStatus]}`)
      await fetchReturns()
      setSelected(prev => prev?.id === id ? { ...prev, status: newStatus } : prev)
    } catch {
      toast.error('Erreur lors de la mise a jour du statut')
    }
  }

  const handleSavePolitique = () => {
    setPolitique(politiqueDraft)
    setEditingPolitique(false)
    toast.success('Politique de retour mise a jour avec succes.')
  }
  const handleCancelPolitique = () => {
    setPolitiqueDraft(politique)
    setEditingPolitique(false)
  }

  const enAttente = returns.filter(r => r.status === 'EN_ATTENTE').length
  const inspectes = returns.filter(r => r.status === 'INSPECTE').length
  const rembourses = returns.filter(r => r.status === 'REMBOURSE').length
  const totalRembourse = returns.filter(r => r.status === 'REMBOURSE').reduce((s, r) => s + (r.amount || 0), 0)

  const kpiData = [
    { label: 'Demandes en attente', value: String(enAttente), icon: 'pending_actions', iconBg: 'bg-amber-50 text-amber-500', sub: enAttente > 0 ? 'À traiter' : 'Aucune', subColor: enAttente > 0 ? 'text-amber-500' : 'text-slate-400' },
    { label: 'Retours approuvés', value: String(rembourses), icon: 'check_circle', iconBg: 'bg-badge/10 text-badge', sub: returns.length > 0 ? `~${Math.round(rembourses / returns.length * 100)}%` : '—', subColor: 'text-badge' },
    { label: 'Remboursements complétés', value: `${totalRembourse.toFixed(2)} DT`, icon: 'payments', iconBg: 'bg-badge/10 text-badge' },
    { label: 'Total demandes', value: String(returns.length), icon: 'analytics', iconBg: 'bg-blue-50 text-blue-500' },
  ]

  const filtered = returns.filter((r) => {
    const matchStatut = filterStatut === 'Tous les Statuts' || r.status === filterStatut
    const matchRaison = filterRaison === 'Toutes les raisons' || r.raison === filterRaison
    return matchStatut && matchRaison
  })

  useEffect(() => {
    if (selected && returns.length > 0) {
      const updated = returns.find(r => r.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [returns])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="material-symbols-outlined animate-spin text-4xl text-badge">progress_activity</span>
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <PageHeader title="Retours">
        <PageHeader.SecondaryBtn icon="policy" onClick={() => document.getElementById('politiqueSection')?.scrollIntoView({ behavior: 'smooth' })}>
          Politique
        </PageHeader.SecondaryBtn>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* Filters + count */}
      <div className="flex flex-wrap items-center gap-3">
        <CustomSelect options={statusOptions} value={filterStatut} onChange={setFilterStatut} />
        <CustomSelect options={raisonOptions} value={filterRaison} onChange={setFilterRaison} />
        <span className="ml-auto text-xs text-slate-400">{filtered.length} sur {returns.length} demandes</span>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Table + Politique */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 text-left font-semibold">ID Retour</th>
                    <th className="py-3 px-4 text-left font-semibold">Commande</th>
                    <th className="py-3 px-4 text-left font-semibold">Client</th>
                    <th className="py-3 px-4 text-left font-semibold">Produit</th>
                    <th className="py-3 px-4 text-left font-semibold">Statut</th>
                    <th className="py-3 px-4 text-right font-semibold">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-16 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl block mb-2">assignment_return</span>
                      Aucune demande de retour
                    </td></tr>
                  ) : filtered.map(r => (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className={`border-t border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 ${selected?.id === r.id ? 'bg-badge/5' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold text-badge">#{r.reference?.slice(-8)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-slate-500">#{r.orderReference?.slice(-8) || '—'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-badge/10 text-badge flex items-center justify-center text-[10px] font-bold flex-shrink-0">{getInitials(r.customerName)}</span>
                          <span className="font-medium text-slate-700 truncate max-w-[100px]">{r.customerName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[120px]">{r.productName}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_BG[r.status] || 'bg-slate-100'}`}>
                          {STATUS_LABELS[r.status] || r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">{r.amount?.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination info */}
            {filtered.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                <span>Affichage 1 à {filtered.length} sur {filtered.length} résultats</span>
              </div>
            )}
          </div>

          {/* Politique de retour */}
          <div id="politiqueSection" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-800">Politique de retour actuelle</h3>
              {!editingPolitique ? (
                <button onClick={() => { setPolitiqueDraft(politique); setEditingPolitique(true) }}
                  className="flex items-center gap-1.5 text-badge text-sm font-medium hover:underline">
                  Modifier la configuration <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleCancelPolitique} className="px-4 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Annuler</button>
                  <button onClick={handleSavePolitique} className="px-4 py-1.5 text-sm rounded-lg bg-badge text-white hover:opacity-90">Enregistrer</button>
                </div>
              )}
            </div>

            {editingPolitique ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium uppercase tracking-wider">Période autorisée</label>
                  <input type="number" value={politiqueDraft.periode} onChange={e => setPolitiqueDraft({ ...politiqueDraft, periode: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium uppercase tracking-wider">Éligibilité</label>
                  <CustomSelect options={eligibiliteOptions} value={politiqueDraft.eligibilite}
                    onChange={v => setPolitiqueDraft({ ...politiqueDraft, eligibilite: v })} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium uppercase tracking-wider">Remboursement</label>
                  <CustomSelect options={modeOptions} value={politiqueDraft.remboursement}
                    onChange={v => setPolitiqueDraft({ ...politiqueDraft, remboursement: v })} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium uppercase tracking-wider">Frais de retour</label>
                  <CustomSelect options={fraisOptions} value={politiqueDraft.frais}
                    onChange={v => setPolitiqueDraft({ ...politiqueDraft, frais: v })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block font-medium uppercase tracking-wider">Conditions spéciales</label>
                  <textarea value={politiqueDraft.conditionsSpeciales}
                    onChange={e => setPolitiqueDraft({ ...politiqueDraft, conditionsSpeciales: e.target.value })}
                    rows={2} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" placeholder="Conditions supplémentaires..." />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Période autorisée</p>
                  <p className="font-bold text-slate-800">{politique.periode} jours après réception</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Éligibilité</p>
                  <p className="font-bold text-slate-800">{politique.eligibilite}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Remboursement</p>
                  <p className="font-bold text-slate-800">{politique.remboursement}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Frais de retour</p>
                  <p className="font-bold text-slate-800">{politique.frais}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Detail panel */}
        <div className="col-span-12 lg:col-span-4">
          {selected ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
              {/* Panel header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Détails de la demande</h3>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_BG[selected.status] || ''}`}>
                  {STATUS_LABELS[selected.status] || selected.status}
                </span>
              </div>

              <div className="p-5 space-y-5">
                {/* Product card */}
                <div className="flex items-center gap-3">
                  {selected.productImage ? (
                    <img src={selected.productImage} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
                  ) : (
                    <span className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-slate-400 text-xl">image</span>
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">Commande {selected.orderReference}</p>
                    <p className="font-bold text-slate-800 text-sm truncate">{selected.productName}</p>
                    <p className="text-[11px] text-slate-400">Réf: {selected.reference}</p>
                  </div>
                </div>

                {/* Client info */}
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Informations client</p>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-badge/10 text-badge flex items-center justify-center text-xs font-bold flex-shrink-0">{getInitials(selected.customerName)}</span>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{selected.customerName}</p>
                      <p className="text-xs text-slate-400">{selected.customerEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Raison du retour */}
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Raison du retour</p>
                  <div className="bg-slate-50 rounded-xl p-3 border-l-4 border-badge">
                    <p className="font-semibold text-slate-700 text-sm mb-1">{selected.raison}</p>
                    {selected.commentaire && (
                      <p className="text-xs text-slate-500 italic leading-relaxed">&ldquo;{selected.commentaire}&rdquo;</p>
                    )}
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Photos (preuves)</p>
                  <div className="flex gap-2">
                    {selected.photo1 ? (
                      <img src={selected.photo1} alt="Preuve 1" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                    ) : (
                      <span className="w-16 h-16 rounded-lg border border-dashed border-slate-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-300 text-lg">photo_camera</span>
                      </span>
                    )}
                    {selected.photo2 ? (
                      <img src={selected.photo2} alt="Preuve 2" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                    ) : (
                      <span className="w-16 h-16 rounded-lg border border-dashed border-slate-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-300 text-lg">add</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100">
                  {selected.status === 'EN_ATTENTE' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleStatusChange(selected.id, 'FERME')}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition">
                        Rejeter
                      </button>
                      <button onClick={() => handleStatusChange(selected.id, 'INSPECTE')}
                        className="flex-1 py-2.5 rounded-xl border border-blue-200 text-blue-600 font-medium text-sm hover:bg-blue-50 transition">
                        Inspecter
                      </button>
                    </div>
                  )}
                  {selected.status === 'EN_ATTENTE' && (
                    <button onClick={() => handleStatusChange(selected.id, 'REMBOURSE')}
                      className="w-full mt-2 py-2.5 rounded-xl bg-badge text-white font-medium text-sm hover:opacity-90 transition flex items-center justify-center gap-2">
                      Approuver & Rembourser
                    </button>
                  )}
                  {selected.status === 'INSPECTE' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button onClick={() => handleStatusChange(selected.id, 'FERME')}
                          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition">
                          Rejeter
                        </button>
                        <button onClick={() => handleStatusChange(selected.id, 'REMBOURSE')}
                          className="flex-1 py-2.5 rounded-xl bg-badge text-white font-medium text-sm hover:opacity-90 transition">
                          Rembourser
                        </button>
                      </div>
                    </div>
                  )}
                  {selected.status === 'REMBOURSE' && (
                    <div className="text-center py-3 bg-green-50 rounded-xl text-green-700 font-medium text-sm">
                      <span className="material-symbols-outlined align-middle mr-1 text-base">check_circle</span> Remboursement effectué
                    </div>
                  )}
                  {selected.status === 'FERME' && (
                    <div className="text-center py-3 bg-slate-50 rounded-xl text-slate-500 font-medium text-sm">
                      <span className="material-symbols-outlined align-middle mr-1 text-base">block</span> Demande fermée
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">assignment_return</span>
              <p className="text-slate-400 text-sm">Sélectionnez une demande<br />pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
