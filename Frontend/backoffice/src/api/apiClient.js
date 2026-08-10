import axios from 'axios'
import { API_BASE_URL, loginUrl } from '../config'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

let logoutTimer = null

function performLogout() {
  if (logoutTimer) {
    clearTimeout(logoutTimer)
    logoutTimer = null
  }
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.location.href = loginUrl('backoffice')
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
    performLogout()
    return
  }
  logoutTimer = setTimeout(performLogout, delay)
}

scheduleAutoLogout()

window.addEventListener('storage', (e) => {
  if (e.key === 'accessToken') {
    if (!e.newValue) performLogout()
    else scheduleAutoLogout()
  }
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Let the browser set multipart boundary for file uploads
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type']
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
  (response) => response,
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
            `${API_BASE_URL}/auth/refresh`,
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
          performLogout()
        }
      } else {
        isRefreshing = false
        performLogout()
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
