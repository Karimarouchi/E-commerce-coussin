import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import AuthVisualPanel from './AuthVisualPanel'

export default function AuthLayout({ mode: initialMode = 'login' }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState(initialMode)
  const [transitioning, setTransitioning] = useState(false)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    setMode(initialMode)
    setFormKey((k) => k + 1)
  }, [initialMode])

  const switchMode = useCallback(() => {
    if (transitioning) return
    setTransitioning(true)
    const next = mode === 'login' ? 'signup' : 'login'

    setTimeout(() => {
      setMode(next)
      setFormKey((k) => k + 1)
      navigate(next === 'login' ? '/login' : '/inscription', { replace: true })
      setTransitioning(false)
    }, 350)
  }, [mode, transitioning, navigate])

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex antialiased">
      <div className="flex flex-1 w-full flex-col lg:flex-row">
        {/* Left — form */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-10 lg:px-10 lg:py-12 z-10 bg-surface min-h-screen">
          <div
            key={formKey}
            className={`w-full flex justify-center ${
              transitioning ? 'auth-page-exit' : 'auth-page-enter'
            }`}
          >
            {mode === 'login' ? (
              <LoginForm onSwitch={switchMode} />
            ) : (
              <div className="w-full max-w-[480px] bg-surface-container-low rounded-3xl p-8 lg:p-12 auth-login-card">
                <SignupForm onSwitch={switchMode} />
              </div>
            )}
          </div>
        </section>

        {/* Right — lifestyle image */}
        <AuthVisualPanel mode={mode} animKey={formKey} />
      </div>
    </div>
  )
}
