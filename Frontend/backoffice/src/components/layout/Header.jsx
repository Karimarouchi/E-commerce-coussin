import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { notificationApi } from '../../api/notificationApi'

const singleTitles = {
  '/dashboard':       'Tableau de bord',
  '/produits':        'Produits',
  '/commandes':       'Commandes',
  '/clients':         'Clients',
  '/analyses':        'Analyses',
  '/apparence':       'Apparence',
  '/collections':     'Collections',
  '/promotions':      'Promotions',
  '/email-marketing': 'Email Marketing',
  '/roles':           'Rôles & Permissions',
  '/retours':         'Gestion des Retours',
  '/compte':          'Réglages Système',
  '/categories':      'Catégories',
  '/bannieres':       'Bannières',
  '/tva-livraison':   'TVA & Livraison',
  '/avis':             'Gestion des avis',
}

function getBreadcrumbs(pathname) {
  if (pathname === '/collections/nouveau') {
    return [
      { label: 'Collections', path: '/collections' },
      { label: 'Ajouter Collection', path: null },
    ]
  }
  if (pathname.match(/^\/collections\/\d+$/)) {
    return [
      { label: 'Collections', path: '/collections' },
      { label: 'Gérer Collection', path: null },
    ]
  }
  if (pathname === '/clients/nouveau') {
    return [
      { label: 'Clients', path: '/clients' },
      { label: 'Ajouter un compte', path: null },
    ]
  }
  if (pathname.match(/^\/clients\/\d+$/)) {
    return [
      { label: 'Clients', path: '/clients' },
      { label: 'Détail Client', path: null },
    ]
  }
  if (pathname.startsWith('/produits/edit/')) {
    return [
      { label: 'Produits', path: '/produits' },
      { label: 'Modifier Produit', path: null },
    ]
  }
  if (pathname === '/produits/nouveau') {
    return [
      { label: 'Produits', path: '/produits' },
      { label: 'Ajouter Produit', path: null },
    ]
  }
  if (pathname === '/retours/historique') {
    return [
      { label: 'Gestion des Retours', path: '/retours' },
      { label: 'Historique Remboursements', path: null },
    ]
  }
  if (pathname === '/categories/nouveau') {
    return [
      { label: 'Catégories', path: '/categories' },
      { label: 'Ajouter Catégorie', path: null },
    ]
  }
  if (pathname.match(/^\/categories\/edit\/\d+$/)) {
    return [
      { label: 'Catégories', path: '/categories' },
      { label: 'Modifier Catégorie', path: null },
    ]
  }
  if (pathname.match(/^\/commandes\/\d+$/)) {
    return [
      { label: 'Commandes', path: '/commandes' },
      { label: 'Détail Commande', path: null },
    ]
  }
  if (pathname === '/bannieres/nouveau') {
    return [
      { label: 'Bannières', path: '/bannieres' },
      { label: 'Ajouter Bannière', path: null },
    ]
  }
  return [{ label: singleTitles[pathname] || 'Back Office', path: null }]
}

function formatNotifTime(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString('fr-TN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const crumbs = getBreadcrumbs(location.pathname)

  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const panelRef = useRef(null)

  const refreshNotifications = useCallback(async () => {
    try {
      const [list, count] = await Promise.all([
        notificationApi.getRecent(),
        notificationApi.unreadCount(),
      ])
      setNotifications(Array.isArray(list) ? list : [])
      setUnreadCount(Number(count) || 0)
    } catch {
      /* ignore if non-admin session */
    }
  }, [])

  useEffect(() => {
    refreshNotifications()
    const timer = setInterval(refreshNotifications, 20000)
    return () => clearInterval(timer)
  }, [refreshNotifications])

  useEffect(() => {
    if (!open) return undefined
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const handleOpen = async () => {
    const next = !open
    setOpen(next)
    if (next) await refreshNotifications()
  }

  const handleClickNotif = async (n) => {
    try {
      if (!n.read) await notificationApi.markRead(n.id)
    } catch { /* ignore */ }
    setOpen(false)
    if (n.link) navigate(n.link)
    else if (n.orderId) navigate(`/commandes/${n.orderId}`)
    else navigate('/commandes')
    refreshNotifications()
  }

  const handleMarkAll = async () => {
    try {
      await notificationApi.markAllRead()
      await refreshNotifications()
    } catch { /* ignore */ }
  }

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <nav className="flex items-center gap-2">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <span key={crumb.label} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-slate-300 font-bold text-xl select-none">/</span>
              )}
              {crumb.path && !isLast ? (
                <button
                  onClick={() => navigate(crumb.path)}
                  className="text-xl font-bold text-slate-400 hover:text-slate-700 transition-colors font-heading"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-xl font-bold text-slate-800 font-heading">{crumb.label}</span>
              )}
            </span>
          )
        })}
      </nav>

      <div className="flex items-center gap-6">
        {/* Counters */}
        <div className="flex items-center gap-4 text-slate-500">
          <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-full">
            <span className="material-symbols-outlined text-base">mail</span>
            <span className="text-sm font-bold text-slate-700">1,000</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-full">
            <span className="material-symbols-outlined text-base">smart_toy</span>
            <span className="text-sm font-bold text-slate-700">42</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={handleOpen}
            className="relative cursor-pointer p-1 rounded-full hover:bg-slate-50 transition-colors"
            aria-label="Notifications"
            aria-expanded={open}
          >
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-red-500 text-[11px] text-white flex items-center justify-center rounded-full border-2 border-white font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            <span className="material-symbols-outlined text-[22px] text-slate-400">notifications</span>
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-800">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAll}
                    className="text-[11px] font-bold text-brand hover:underline"
                  >
                    Tout marquer lu
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                    Aucune notification
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleClickNotif(n)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                        n.read ? 'bg-white' : 'bg-brand/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`material-symbols-outlined text-[20px] mt-0.5 ${
                          n.read ? 'text-slate-300' : 'text-brand'
                        }`}>
                          shopping_bag
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-800 truncate">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{formatNotifTime(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <span className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
              <button
                type="button"
                onClick={() => { setOpen(false); navigate('/commandes') }}
                className="w-full text-center text-xs font-bold text-brand py-3 hover:bg-slate-50 border-t border-slate-100"
              >
                Voir toutes les commandes
              </button>
            </div>
          )}
        </div>

        <div className="h-9 w-px bg-slate-200 mx-2"></div>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">Admin User</p>
            <p className="text-xs text-slate-500">Directeur Commercial</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-500">
            <span className="material-symbols-outlined text-[22px]">person</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
