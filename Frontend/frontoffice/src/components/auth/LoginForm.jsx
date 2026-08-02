import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import apiClient, { scheduleAutoLogout } from '../../api/apiClient'
import { BACKOFFICE_URL } from '../../config'

export default function LoginForm({ onSwitch }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await apiClient.post('/auth/login', { email, password })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      if (remember) localStorage.setItem('rememberLogin', '1')
      else localStorage.removeItem('rememberLogin')
      window.dispatchEvent(new Event('userChanged'))
      scheduleAutoLogout()

      const redirect = params.get('redirect')
      if (redirect === 'backoffice' && data.user.roleName !== 'CLIENT') {
        const callbackUrl = `${BACKOFFICE_URL}/auth-callback?accessToken=${encodeURIComponent(data.accessToken)}&refreshToken=${encodeURIComponent(data.refreshToken)}&user=${encodeURIComponent(JSON.stringify(data.user))}`
        window.location.href = callbackUrl
      } else {
        navigate('/')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'E-mail ou mot de passe incorrect.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[480px] bg-surface-container-low rounded-3xl p-8 lg:p-12 auth-login-card relative">
      <div className="text-center mb-8">
        <Link
          to="/"
          className="inline-block font-headline text-headline-sm text-primary mb-2 transition-transform hover:scale-105 duration-300"
        >
          Coussin &amp; Co
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-on-surface mb-2">
          Heureux de vous revoir
        </h1>
      </div>

      {error && (
        <div className="mb-6 py-3 px-4 bg-error-container/60 border border-error/20 rounded-xl text-on-error-container text-sm font-body">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block font-label text-label-md text-on-surface uppercase mb-2"
          >
            E-mail
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block font-label text-label-md text-on-surface uppercase mb-2"
          >
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 pr-12 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors"
              aria-label={showPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPass ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest cursor-pointer"
            />
            <span className="ml-2 font-body text-caption text-on-surface-variant">
              Se souvenir de moi
            </span>
          </label>
          <a
            href="#"
            className="font-label text-caption text-primary hover:text-primary-container transition-colors underline-offset-4 hover:underline"
          >
            Mot de passe oublié ?
          </a>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-8 border border-transparent rounded-xl shadow-sm font-label text-label-md text-on-primary bg-primary hover:bg-primary-container hover:shadow-md hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="font-body text-caption text-on-surface-variant">
          Nouveau chez Coussin &amp; Co ?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="font-label text-primary hover:text-primary-container transition-colors font-semibold"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  )
}
