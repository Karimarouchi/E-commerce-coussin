/** URLs publiques — définies au build via VITE_* (voir .env / docker-compose). */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

export const FRONTOFFICE_URL = (
  import.meta.env.VITE_FRONTOFFICE_URL || 'http://localhost:3001'
).replace(/\/$/, '')

export const loginUrl = (redirect = 'backoffice') =>
  `${FRONTOFFICE_URL}/login?redirect=${encodeURIComponent(redirect)}`
