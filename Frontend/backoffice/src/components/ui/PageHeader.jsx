/**
 * PageHeader — barre d'actions standard pour toutes les pages du Back Office.
 * Le titre de la page est déjà affiché dans le Header (breadcrumb),
 * donc ce composant ne rend que les boutons d'action alignés à droite.
 *
 * Props:
 *   children {ReactNode} — boutons d'action alignés à droite
 */
export default function PageHeader({ children }) {
  if (!children) return null
  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  )
}

/**
 * PageHeader.SecondaryBtn — bouton secondaire standard (Importer / Exporter…)
 */
PageHeader.SecondaryBtn = function SecondaryBtn({ icon, onClick, children, type = 'button', disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm flex items-center gap-2 hover:bg-slate-200 transition-all border border-slate-200 font-button disabled:opacity-50"
    >
      {icon && <span className="material-symbols-outlined text-lg">{icon}</span>}
      {children}
    </button>
  )
}

/**
 * PageHeader.PrimaryBtn — bouton primaire standard (Ajouter / Nouveau…)
 */
PageHeader.PrimaryBtn = function PrimaryBtn({ icon, onClick, children, type = 'button', disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-2.5 bg-btn text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-btn/20 hover:bg-btn-dark transition-all font-button disabled:opacity-50"
    >
      {icon && <span className="material-symbols-outlined text-lg">{icon}</span>}
      {children}
    </button>
  )
}

/**
 * PageHeader.DangerBtn — bouton destructif (Supprimer…)
 */
PageHeader.DangerBtn = function DangerBtn({ icon, onClick, children, type = 'button', disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2.5 border border-red-200 text-red-600 font-semibold rounded-xl text-sm flex items-center gap-2 hover:bg-red-50 transition-all font-button disabled:opacity-50"
    >
      {icon && <span className="material-symbols-outlined text-lg">{icon}</span>}
      {children}
    </button>
  )
}
