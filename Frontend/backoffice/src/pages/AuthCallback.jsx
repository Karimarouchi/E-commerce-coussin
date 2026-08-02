import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { scheduleAutoLogout } from '../api/apiClient'
import { loginUrl } from '../config'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')
    const user = params.get('user')

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      if (user) localStorage.setItem('user', user)
      scheduleAutoLogout()
      navigate('/dashboard', { replace: true })
    } else {
      window.location.href = loginUrl('backoffice')
    }
  }, [params, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Authentification en cours...</p>
    </div>
  )
}
