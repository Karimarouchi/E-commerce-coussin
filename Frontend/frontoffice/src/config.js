export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

export const BACKOFFICE_URL = (
  import.meta.env.VITE_BACKOFFICE_URL || 'http://localhost:3000'
).replace(/\/$/, '')
