import { cn } from '@/lib/utils'

// SectionHead — mono eyebrow + title with an optional right-aligned slot
// (e.g. a "see all →" link). UI spec §2.
export function SectionHead({ eyebrow, title, sub, right, className }) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div>
        {eyebrow && (
          <div className="font-mono text-[11px] uppercase tracking-wider text-sand">{eyebrow}</div>
        )}
        {title && <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{title}</h2>}
        {sub && <p className="mt-1 text-sm text-ink2">{sub}</p>}
      </div>
      {right}
    </div>
  )
}
