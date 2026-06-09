import { cn } from '@/lib/utils'

// Stat — big number (display font) + mono label + optional delta. UI spec §2.
// delta: { value: '↓ 3', dir: 'down' | 'up' | 'flat' }. Direction sets color:
// by default down=ok, up=risk (good for "shortage" style metrics); pass
// `goodWhenUp` to invert.
const DELTA_COLOR = { up: 'text-risk', down: 'text-ok', flat: 'text-sand' }

export function Stat({ num, label, delta, size = 'md', goodWhenUp = false, className }) {
  const numCls = size === 'lg' ? 'text-5xl' : size === 'sm' ? 'text-3xl' : 'text-[2.5rem]'
  let deltaCls = 'text-sand'
  if (delta?.dir) {
    const d = goodWhenUp
      ? { up: 'down', down: 'up', flat: 'flat' }[delta.dir]
      : delta.dir
    deltaCls = DELTA_COLOR[d] || 'text-sand'
  }
  return (
    <div className={cn('flex flex-col', className)}>
      <div className={cn('font-display font-semibold leading-none text-ink tabular-nums', numCls)}>
        {num}
      </div>
      <div className="mt-1.5 font-mono text-[11px] uppercase tracking-wide text-sand">
        {label}
      </div>
      {delta && (
        <div className={cn('mt-1 text-sm font-medium', deltaCls)}>
          {typeof delta === 'string' ? delta : delta.value}
        </div>
      )}
    </div>
  )
}
