import { Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

// ProviderCard — renders a real NPI provider record (UI spec §2). Only fields
// the NPI/NLM API actually returns are shown; nothing is fabricated.
function initials(name = '') {
  return name.split(' ').filter((w) => /[A-Za-z]/.test(w[0] || '')).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

export function ProviderCard({ provider, selected, distance, onSelect, onOpen, onHover, onLeave }) {
  const p = provider
  return (
    <div
      onClick={() => onSelect?.(p.npi)}
      onMouseEnter={() => onHover?.(p.npi)}
      onMouseLeave={() => onLeave?.()}
      className={cn(
        'cursor-pointer rounded-lg border bg-paper p-3 transition-colors',
        selected ? 'border-action ring-1 ring-action' : 'border-ink/15 hover:border-ink/40',
      )}
    >
      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ink/20 bg-paper2 font-mono text-sm text-ink2">
          {initials(p.name) || '—'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="truncate font-display text-[17px] font-semibold text-ink">
              {p.name}{p.credential ? `, ${p.credential}` : ''}
            </div>
            {distance != null && (
              <span className="shrink-0 font-mono text-[11px] text-sand">{distance.toFixed(1)} mi</span>
            )}
          </div>
          <div className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-wide text-sand">
            {p.specialty}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink2">
            <span>{[p.city, p.state, p.zip].filter(Boolean).join(', ')}</span>
            {p.phone && (
              <a
                href={`tel:${p.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-action hover:underline"
              >
                <Phone className="h-3 w-3" /> {p.phone}
              </a>
            )}
          </div>
          {onOpen && (
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(p) }}
              className="mt-2 font-mono text-[11px] uppercase tracking-wide text-action hover:underline"
            >
              View profile →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
