const LOGIN_IMAGE = '/auth-login-hero.png'

export default function AuthVisualPanel({ mode = 'login', animKey }) {
  return (
    <section className="hidden lg:block lg:w-1/2 relative bg-surface-container-high min-h-screen">
      <div
        key={animKey}
        className="absolute inset-0 bg-cover bg-center w-full h-full rounded-l-3xl shadow-[-10px_0_30px_rgba(74,74,74,0.05)] auth-image-enter"
        style={{ backgroundImage: `url(${LOGIN_IMAGE})` }}
        role="img"
        aria-label="Coussins artisanaux disposés sur un banc en bois"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-surface/20 to-transparent rounded-l-3xl mix-blend-multiply" />
      </div>

      {mode === 'login' && (
        <div className="absolute bottom-12 right-12 bg-surface/90 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-sm auth-login-card hidden xl:block z-10">
          <p className="font-headline text-headline-sm text-on-surface mb-2">
            L&apos;élégance tactile.
          </p>
          <p className="font-body text-caption text-on-surface-variant">
            Découvrez notre nouvelle collection de housses en lin lavé et teintures naturelles.
          </p>
        </div>
      )}
    </section>
  )
}
