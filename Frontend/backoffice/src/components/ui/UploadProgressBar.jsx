/** Barre de progression upload (0–100). */
export default function UploadProgressBar({ progress = 0, label = 'Upload en cours…' }) {
  const pct = Math.max(0, Math.min(100, Number(progress) || 0))
  return (
    <div className="w-full space-y-1.5">
      <p className="text-xs font-bold text-slate-600 text-center">
        {label} {pct}%
      </p>
      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-brand transition-[width] duration-150 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
