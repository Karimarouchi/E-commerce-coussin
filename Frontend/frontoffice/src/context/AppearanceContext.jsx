import { createContext, useContext, useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const DEFAULTS = {
  brandName: '',
  slogan: '',
  logoMain: '',
  logoLight: '',
  logoNavbar: '',
  favicon: '',
  instagram: '',
  facebook: '',
  linkedin: '',
  whatsapp: '',
  phone: '',
  email: '',
}

const AppearanceContext = createContext({ ...DEFAULTS, loaded: false })

function applyFavicon(href) {
  if (!href) return
  let link = document.querySelector("link[rel='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.type = href.startsWith('data:image/png')
    ? 'image/png'
    : href.startsWith('data:image/svg')
      ? 'image/svg+xml'
      : 'image/x-icon'
  link.href = href

  let apple = document.querySelector("link[rel='apple-touch-icon']")
  if (!apple) {
    apple = document.createElement('link')
    apple.rel = 'apple-touch-icon'
    document.head.appendChild(apple)
  }
  apple.href = href
}

function applyFoAppearance(data) {
  applyFavicon(data.favicon)

  // Page title from brand name
  if (data.brandName) {
    document.title = data.brandName + (data.slogan ? ` — ${data.slogan}` : '')
  }
}

// Fields shared between scopes — backoffice values are used as fallback when frontoffice is empty
const SHARED_FIELDS = ['brandName', 'slogan', 'instagram', 'facebook', 'linkedin', 'whatsapp', 'phone', 'email', 'domain']

export function AppearanceProvider({ children }) {
  const [appearance, setAppearance] = useState({ ...DEFAULTS, loaded: false })

  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/public/appearance/frontoffice`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${BASE_URL}/public/appearance/backoffice`).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([fo, bo]) => {
      const merged = { ...DEFAULTS, ...(fo || {}) }
      // Fall back to backoffice values for shared fields if frontoffice has them empty
      if (bo) {
        for (const field of SHARED_FIELDS) {
          if (!merged[field] && bo[field]) merged[field] = bo[field]
        }
      }
      merged.loaded = true
      setAppearance(merged)
      applyFoAppearance(merged)
    })
  }, [])

  return (
    <AppearanceContext.Provider value={appearance}>
      {children}
    </AppearanceContext.Provider>
  )
}

export const useFoAppearance = () => useContext(AppearanceContext)
