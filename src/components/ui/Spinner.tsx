export function Spinner({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Memuat"
      className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function LoadingPanel({ text = "Menghubungkan ke stasiun..." }: { text?: string }) {
  return (
    <div className="panel flex min-h-[200px] flex-col items-center justify-center gap-3 p-8 text-ice">
      <Spinner size={32} />
      <p className="font-hud text-sm tracking-widest">{text}</p>
    </div>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="panel border-rose-300/40 p-6 text-center">
      <p className="font-bold text-rose-200">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-ghost mt-4">
          Coba lagi
        </button>
      )}
    </div>
  );
}
