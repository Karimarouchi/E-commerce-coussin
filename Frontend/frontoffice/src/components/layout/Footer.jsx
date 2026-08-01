import { useFoAppearance } from '../../context/AppearanceContext'

export default function Footer() {
  const { brandName, slogan, phone, email } = useFoAppearance()

  const name = brandName || 'Coussin & Co'
  const tagline =
    slogan || 'Artisanal & Élégant. Des créations uniques pour sublimer votre intérieur.'
  const contactEmail = email || 'hello@coussinandco.tn'
  const contactPhone = phone || '+216 12 345 678'

  return (
    <footer className="bg-surface-container border-t border-outline-variant/30 w-full mt-section-gap">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-stack-lg px-gutter py-section-gap max-w-container-max mx-auto">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <span className="font-display text-display-lg-mobile text-primary">
            {name}
          </span>
          <p className="font-body text-body-md text-on-surface opacity-80">
            {tagline}
          </p>
        </div>

        {/* Liens utiles */}
        <div>
          <h4 className="font-headline text-headline-sm text-on-surface mb-4">
            Liens Utiles
          </h4>
          <ul className="flex flex-col gap-2">
            <li>
              <a
                className="font-label text-label-md text-on-surface-variant hover:text-primary hover:underline transition-all"
                href="#"
              >
                Livraison &amp; Retours
              </a>
            </li>
            <li>
              <a
                className="font-label text-label-md text-on-surface-variant hover:text-primary hover:underline transition-all"
                href="#"
              >
                CGV
              </a>
            </li>
            <li>
              <a
                className="font-label text-label-md text-on-surface-variant hover:text-primary hover:underline transition-all"
                href="#"
              >
                Mentions Légales
              </a>
            </li>
            <li>
              <a
                className="font-label text-label-md text-on-surface-variant hover:text-primary hover:underline transition-all"
                href="#"
              >
                FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-headline text-headline-sm text-on-surface mb-4">
            Contact
          </h4>
          <ul className="flex flex-col gap-2">
            <li>
              <a
                className="font-label text-label-md text-on-surface-variant hover:text-primary hover:underline transition-all"
                href={`mailto:${contactEmail}`}
              >
                Contact
              </a>
            </li>
            <li>
              <a
                className="font-label text-label-md text-on-surface-variant hover:text-primary hover:underline transition-all"
                href={`mailto:${contactEmail}`}
              >
                {contactEmail}
              </a>
            </li>
            <li>
              <a
                className="font-label text-label-md text-on-surface-variant hover:text-primary hover:underline transition-all"
                href={`tel:${contactPhone.replace(/\s/g, '')}`}
              >
                {contactPhone}
              </a>
            </li>
          </ul>
        </div>

        {/* Paiement */}
        <div>
          <h4 className="font-headline text-headline-sm text-on-surface mb-4">
            Paiement Sécurisé
          </h4>
          <div className="flex gap-2 opacity-70">
            <div className="w-10 h-6 bg-surface-variant rounded" />
            <div className="w-10 h-6 bg-surface-variant rounded" />
            <div className="w-10 h-6 bg-surface-variant rounded" />
          </div>
        </div>
      </div>

      <div className="border-t border-outline-variant/30 py-4 text-center">
        <p className="font-body text-caption text-on-surface-variant">
          © {new Date().getFullYear()} {name}. Artisanal &amp; Élégant.
        </p>
      </div>
    </footer>
  )
}
