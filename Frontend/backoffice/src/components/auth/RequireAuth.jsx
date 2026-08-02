import { Outlet } from 'react-router-dom'
import { FRONTOFFICE_URL, loginUrl } from '../../config'

export default function RequireAuth() {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    window.location.href = loginUrl('backoffice')
    return null
  }
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user?.roleName === 'CLIENT') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.location.href = FRONTOFFICE_URL
      return null
    }
  } catch {
    /* ignore parse error */
  }
  return <Outlet />
}
