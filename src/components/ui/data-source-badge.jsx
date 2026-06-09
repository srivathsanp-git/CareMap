import { cn } from '@/lib/utils'

// Small honesty indicator for whether figures came from the live CDC/ACS fetch
// or the bundled snapshot fallback. status: 'loading' | 'live' | 'snapshot'.
const META = {
  loading:  { dot: 'bg-sand animate-pulse', text: 'loading live data…' },
  live:     { dot: 'bg-ok',                 text: 'live · CDC PLACES' },
  snapshot: { dot: 'bg-heat-mid',           text: 'bundled snapshot' },
}

export function DataSourceBadge({ status = 'snapshot', className }) {
  const m = META[status] || META.snapshot
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper px-2 py-0.5', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
      <span className="font-mono text-[10px] normal-case tracking-normal text-sand">{m.text}</span>
    </span>
  )
}
