import { cn } from '@/lib/utils'

// Meter — horizontal low→high gauge with a needle. UI spec §2.
// `value` is 0..1 (clamped). The track gradient is .meter-track (index.css).
export function Meter({ value = 0.5, className }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div
      className={cn('meter-track relative h-3 rounded-full border border-ink/80', className)}
      role="meter"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="absolute -top-1 -bottom-1 w-[3px] rounded bg-ink"
        style={{ left: `calc(${pct}% - 1.5px)` }}
      />
    </div>
  )
}
