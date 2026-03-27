import { Phone, MapPin, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

function SkeletonCard() {
  return (
    <div className="flex items-start gap-3 p-4 animate-pulse">
      <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
    </div>
  )
}

const SPECIALTY_BADGE = {
  'Family Practice':    'info',
  'Internal Medicine':  'info',
  'Pediatric':          'success',
  'Psychiatry':         'purple',
  'Psychology':         'purple',
  'Mental Health':      'purple',
  'Obstetrics':         'orange',
  'Gynecology':         'orange',
}

function specialtyVariant(s = '') {
  for (const [k, v] of Object.entries(SPECIALTY_BADGE)) {
    if (s.toLowerCase().includes(k.toLowerCase())) return v
  }
  return 'secondary'
}

function initials(name) {
  return name.split(' ').filter(w => /[A-Za-z]/.test(w[0])).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

export default function ProviderList({ providers, loading, error, searchMeta, selectedId, onSelect }) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!loading && !searchMeta) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
          <MapPin className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground">Enter a ZIP code to find providers</p>
        <p className="text-sm text-muted-foreground mt-1">Results from the CMS NPI Registry</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {searchMeta && (
        <div className="px-4 py-3 border-b border-border shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                {loading
                  ? 'Searching…'
                  : `${searchMeta.count} provider${searchMeta.count !== 1 ? 's' : ''} found`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {searchMeta.specialty} · ZIP {searchMeta.zip}
                {!loading && searchMeta.totalInZip > 0 && (
                  <span> · {searchMeta.totalInZip} total in area</span>
                )}
              </p>
            </div>
            {!loading && (
              <Badge variant="success" className="shrink-0">Live data</Badge>
            )}
          </div>
          {!loading && searchMeta.apiCapped && (
            <Alert variant="warning">
              <AlertDescription className="text-xs">
                This ZIP has {searchMeta.totalInZip}+ providers — the NPI API returns at most 500
                per request. Try adjacent ZIP codes for more {searchMeta.specialty} providers.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : providers.length === 0
            ? (
              <div className="text-center py-12">
                <p className="font-medium text-foreground">No providers found</p>
                <p className="text-sm text-muted-foreground mt-1">Try a nearby ZIP or different specialty</p>
              </div>
            )
            : providers.map(p => (
              <button
                key={p.npi}
                onClick={() => onSelect(p.npi === selectedId ? null : p.npi)}
                className={[
                  'w-full text-left rounded-xl border-2 p-3.5 transition-all hover:shadow-sm',
                  p.npi === selectedId
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent hover:border-border bg-card',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <Avatar className={['shrink-0', p.npi === selectedId ? 'bg-primary/10' : ''].join(' ')}>
                    <AvatarFallback className={p.npi === selectedId ? 'bg-primary/10 text-primary' : ''}>
                      {initials(p.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{p.name}</p>
                    {p.credential && (
                      <p className="text-xs text-primary font-medium">{p.credential}</p>
                    )}
                    {p.specialty && (
                      <Badge variant={specialtyVariant(p.specialty)} className="mt-1 max-w-full truncate">
                        {p.specialty.length > 38 ? p.specialty.slice(0, 38) + '…' : p.specialty}
                      </Badge>
                    )}
                    <div className="mt-2 space-y-1">
                      {(p.city || p.address) && (
                        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                          <span className="truncate">{[p.address, p.city, p.state, p.zip].filter(Boolean).join(', ')}</span>
                        </p>
                      )}
                      {p.phone && (
                        <p className="flex items-center gap-1.5 text-xs">
                          <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                          <a href={`tel:${p.phone}`} onClick={e => e.stopPropagation()}
                            className="text-primary hover:underline">{p.phone}</a>
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight className={['h-4 w-4 shrink-0 mt-1 transition-colors', p.npi === selectedId ? 'text-primary' : 'text-muted-foreground'].join(' ')} />
                </div>
              </button>
            ))
          }
        </div>
      </ScrollArea>

      {!loading && providers.length > 0 && (
        <>
          <Separator />
          <p className="px-4 py-2.5 text-xs text-muted-foreground text-center shrink-0">
            Source: CMS National Provider Identifier Registry
          </p>
        </>
      )}
    </div>
  )
}
