import { useCallback, useEffect, useRef, useState } from 'react'
import { useFoAppearance } from '../context/AppearanceContext'

const DURATION = 2000 // ms — durée minimale avant que la barre puisse atteindre 100%

const CSS = `
  @keyframes ls-fade-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ls-logo-in {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes ls-spin {
    to { transform: rotate(360deg); }
  }

  .ls-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #f9f9f9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    font-family: 'Public Sans', 'Inter', system-ui, sans-serif;
    transition: opacity 0.6s ease;
  }
  .ls-overlay.fade-out {
    opacity: 0;
    pointer-events: none;
  }

  /* Spinner — thin circle like frontoffice */
  .ls-spinner-wrap {
    position: relative;
    width: 220px;
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
  }
  .ls-spinner {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.08);
    border-top-color: #1a1c1c;
    animation: ls-spin 1s linear infinite;
  }

  /* Logo inside spinner */
  .ls-logo-inner {
    animation: ls-logo-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .ls-logo-img {
    max-width: 120px;
    max-height: 120px;
    object-fit: contain;
  }
  .ls-brand-name {
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgb(0 91 61);  /* --fo-brand */
    line-height: 1;
  }
  .ls-brand-slogan {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.45);
    margin-top: 5px;
  }

  /* Brand text block below spinner (when logo image shown) */
  .ls-identity {
    text-align: center;
    animation: ls-fade-in 0.7s ease 0.3s both;
    margin-bottom: 44px;
  }
  .ls-identity-name {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #1a1c1c;
  }
  .ls-identity-slogan {
    font-size: 9px;
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.38);
    margin-top: 4px;
  }

  /* Welcome message */
  .ls-msg {
    font-size: 10px;
    font-weight: 400;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.35);
    margin-bottom: 20px;
    animation: ls-fade-in 0.7s ease 0.5s both;
    text-align: center;
    padding: 0 24px;
  }

  /* Progress */
  .ls-bar-wrap {
    width: 100%;
    max-width: 340px;
    padding: 0 32px;
    animation: ls-fade-in 0.7s ease 0.7s both;
  }
  .ls-bar-track {
    height: 1px;
    background: rgba(0,0,0,0.1);
    position: relative;
    overflow: hidden;
    margin-bottom: 12px;
  }
  .ls-bar-fill {
    height: 100%;
    background: #1a1c1c;
    transition: width 0.08s linear;
  }
  .ls-bar-label {
    font-size: 9px;
    font-weight: 400;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.3);
    text-align: center;
  }

  @media (max-width: 480px) {
    .ls-spinner-wrap { width: 170px; height: 170px; margin-bottom: 24px; }
    .ls-logo-img { max-width: 90px; max-height: 90px; }
    .ls-brand-name { font-size: 20px; }
    .ls-bar-wrap { max-width: 280px; padding: 0 24px; }
  }
`

// Module-level guard removed — LoadingScreen is now controlled by the parent

export default function LoadingScreen({ onComplete, dataReady = false }) {
  const { brandName, slogan, logoMain, logoNavbar, logoLight } = useFoAppearance()
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const [done, setDone] = useState(false)
  const progressRef = useRef(0)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  const complete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setDone(true)
    setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => onCompleteRef.current?.(), 600)
    }, 300)
  }, [])

  // Phase 1 : remplir la barre à 85% sur DURATION ms minimum, puis tenir
  useEffect(() => {
    const start = Date.now()
    let rafId
    const tick = () => {
      const elapsed = Date.now() - start
      const p = Math.min(85, (elapsed / DURATION) * 85)
      progressRef.current = p
      setProgress(p)
      if (p < 85) {
        rafId = requestAnimationFrame(tick)
      }
      // s'arrête à 85% — attend dataReady pour la phase 2
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Phase 2 : quand dataReady, rush 85→100% en 400ms puis fermer
  useEffect(() => {
    if (!dataReady) return
    const startP = progressRef.current
    const RUSH = 400
    const start = Date.now()
    let rafId
    const rush = () => {
      const t = Math.min(1, (Date.now() - start) / RUSH)
      const p = startP + (100 - startP) * t
      progressRef.current = p
      setProgress(p)
      if (t < 1) {
        rafId = requestAnimationFrame(rush)
      } else {
        complete()
      }
    }
    rafId = requestAnimationFrame(rush)
    return () => cancelAnimationFrame(rafId)
  }, [dataReady, complete])

  const logo = logoMain || logoNavbar || logoLight || '/antigone-logo.svg'
  const hasLogo = true

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className={`ls-overlay${fadeOut ? ' fade-out' : ''}`}>

        {/* Spinner + logo */}
        <div className="ls-spinner-wrap">
          <div className="ls-spinner" aria-hidden="true" />
          <div className="ls-logo-inner">
            {hasLogo ? (
              <img src={logo} alt={brandName || 'Logo'} className="ls-logo-img" />
            ) : (
              <>
                {brandName && <div className="ls-brand-name">{brandName}</div>}
                {slogan && <div className="ls-brand-slogan">{slogan}</div>}
              </>
            )}
          </div>
        </div>

        {/* Brand identity (only when image logo shown) */}
        {hasLogo && (brandName || slogan) && (
          <div className="ls-identity">
            {brandName && <div className="ls-identity-name">{brandName}</div>}
            {slogan && <div className="ls-identity-slogan">{slogan}</div>}
          </div>
        )}

        {/* Message */}
        <p className="ls-msg">
          {done ? 'Bienvenue' : 'Préparation de votre expérience'}
        </p>

        {/* Progress bar */}
        <div className="ls-bar-wrap">
          <div className="ls-bar-track">
            <div className="ls-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="ls-bar-label">
            {done ? 'Prêt' : 'Chargement en cours'}
          </p>
        </div>

      </div>
    </>
  )
}
