import { useState, useRef, useEffect } from 'react'

/**
 * CustomSelect — dropdown stylisé adapté au style du site
 * variant: 'underline' (Cart) | 'box' (Profile)
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],        // [{ value, label }]
  placeholder = '— Sélectionner —',
  disabled = false,
  variant = 'underline',
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selected = options.find(o => o.value === value)

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (val) => {
    onChange(val)
    setOpen(false)
  }

  const isUnderline = variant === 'underline'

  const triggerCls = isUnderline
    ? `w-full flex items-center justify-between py-3 px-0 text-sm font-body border-0 border-b transition-colors duration-200 ${
        open ? 'border-black' : 'border-neutral-200'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`
    : `w-full flex items-center justify-between px-4 py-3 text-sm border transition-colors duration-200 ${
        open ? 'border-black ring-1 ring-black' : 'border-neutral-200 bg-neutral-50'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={triggerCls}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'text-black' : 'text-neutral-300'}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${open ? 'rotate-180' : ''} ${disabled ? 'text-neutral-300' : 'text-black'}`}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown list */}
      {open && !disabled && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-neutral-200 shadow-xl overflow-y-auto max-h-56">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-[12px] text-neutral-400 uppercase tracking-widest">Aucun choix disponible</div>
          ) : (
            options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors duration-150 ${
                  opt.value === value
                    ? 'bg-black text-white font-bold'
                    : 'hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
