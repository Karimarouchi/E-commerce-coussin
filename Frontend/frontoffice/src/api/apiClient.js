import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// ── Auto-logout on JWT expiry ──────────────────────────────
function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

let logoutTimer = null

/** Routes that require auth — elsewhere, logout must NOT force /login (Home stays the entry). */
function isProtectedPath(pathname) {
  return pathname.startsWith('/profil')
}

function performLogout({ redirect = true } = {}) {
  if (logoutTimer) {
    clearTimeout(logoutTimer)
    logoutTimer = null
  }
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.dispatchEvent(new Event('userChanged'))

  if (!redirect) return

  const path = window.location.pathname
  if (isProtectedPath(path)) {
    window.location.href = `/login?redirect=${encodeURIComponent(path)}`
  }
  // Public pages (/, /produits, …) stay put — Home remains the first page in prod
}

export function scheduleAutoLogout() {
  if (logoutTimer) {
    clearTimeout(logoutTimer)
    logoutTimer = null
  }
  const token = localStorage.getItem('accessToken')
  if (!token) return
  const expiry = getTokenExpiry(token)
  if (!expiry) return
  const delay = expiry - Date.now()
  if (delay <= 0) {
    performLogout({ redirect: true })
    return
  }
  logoutTimer = setTimeout(() => performLogout({ redirect: true }), delay)
}

// Schedule on app load (expired session is cleared without sending visitors to login)
scheduleAutoLogout()

// Sync across browser tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'accessToken') {
    if (!e.newValue) performLogout({ redirect: true })
    else scheduleAutoLogout()
  }
})
// ────────────────────────────────────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshSubscribers = []

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb)
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`
            resolve(apiClient(original))
          })
        })
      }

      isRefreshing = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${API_BASE}/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } },
          )
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          isRefreshing = false
          scheduleAutoLogout()
          onRefreshed(data.accessToken)
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return apiClient(original)
        } catch {
          isRefreshing = false
          refreshSubscribers = []
          performLogout({ redirect: true })
        }
      } else {
        isRefreshing = false
        performLogout({ redirect: false })
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
