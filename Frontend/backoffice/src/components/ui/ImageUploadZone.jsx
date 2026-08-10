import { useRef, useState } from 'react'
import { uploadFileFromPc } from '../../utils/uploadFile'

/**
 * Zone d'upload image : clic + drag & drop + barre de progression %.
 *
 * @param {object} props
 * @param {string|null} props.value - URL image actuelle
 * @param {(url: string) => void} props.onChange
 * @param {'products'|'categories'|'banners'|'collections'|'appearance'} [props.folder]
 * @param {string} [props.hint]
 * @param {string} [props.icon] - material symbol name
 * @param {'default'|'square'|'banner'} [props.variant]
 * @param {string} [props.className]
 * @param {string} [props.accept]
 * @param {boolean} [props.showClear]
 */
export default function ImageUploadZone({
  value,
  onChange,
  folder = 'products',
  hint = 'PNG, JPG, WebP — max 15 Mo',
  icon = 'cloud_upload',
  variant = 'default',
  className = '',
  accept = 'image/*',
  showClear = true,
  badge = null,
}) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const aspect =
    variant === 'square'
      ? 'aspect-square'
      : variant === 'banner'
        ? 'min-h-[7rem]'
        : 'min-h-[8rem]'

  const processFile = async (file) => {
    if (!file || uploading) return
    setUploading(true)
    setProgress(0)
    try {
      const url = await uploadFileFromPc(file, folder, {
        onProgress: (pct) => setProgress(pct),
      })
      if (url) onChange(url)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) processFile(file)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }

  const onDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }

  if (value && !uploading) {
    return (
      <div className={`relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 group ${aspect} ${className}`}>
        <img src={value} alt="" className="w-full h-full object-cover" />
        {badge}
        {showClear && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-white/90 text-red-400 hover:text-red-500 p-1 rounded-full shadow opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            aria-label="Supprimer l'image"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-2 left-2 px-2 py-1 text-[10px] font-bold bg-white/90 text-slate-700 rounded-md shadow hover:bg-white"
        >
          Remplacer
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) processFile(file)
          }}
        />
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (!uploading) inputRef.current?.click()
        }
      }}
      onClick={() => !uploading && inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`relative block border-2 border-dashed rounded-lg text-center transition-all cursor-pointer overflow-hidden ${aspect} ${
        uploading
          ? 'border-brand/50 bg-brand/5 pointer-events-none'
          : dragging
            ? 'border-brand bg-brand/10 scale-[1.01]'
            : 'border-slate-200 hover:border-brand/40 hover:bg-brand/5'
      } ${className}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {uploading ? (
          <div className="w-full max-w-[220px] space-y-2">
            <span className="material-symbols-outlined text-2xl text-brand animate-pulse">cloud_upload</span>
            <p className="text-xs font-bold text-slate-600">Upload en cours… {progress}%</p>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-brand transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <span className={`material-symbols-outlined text-3xl mb-2 block ${dragging ? 'text-brand' : 'text-slate-300'}`}>
              {dragging ? 'file_download' : icon}
            </span>
            <p className="text-xs font-bold text-slate-500">
              {dragging ? 'Lâchez pour importer' : 'Glissez ou cliquez'}
            </p>
            {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) processFile(file)
        }}
      />
    </div>
  )
}
