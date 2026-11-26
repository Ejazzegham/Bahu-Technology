/** Read-only star rating. Supports halves via partial fill. */
export default function Stars({ value, size = 14, className = "" }: { value: number; size?: number; className?: string }) {
  return (
    <div className={`flex gap-0.5 text-amber-400 ${className}`} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute inset-0 opacity-40" aria-hidden>
              <path d="M12 2l2.9 6.26L21.5 9l-5 4.87L17.8 21 12 17.6 6.2 21l1.3-7.13-5-4.87 6.6-.74L12 2z" />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M12 2l2.9 6.26L21.5 9l-5 4.87L17.8 21 12 17.6 6.2 21l1.3-7.13-5-4.87 6.6-.74L12 2z" />
              </svg>
            </span>
          </span>
        );
      })}
    </div>
  );
}
