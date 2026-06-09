import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, MapPin, SlidersHorizontal } from 'lucide-react'
import { useNPI } from '@/hooks/useNPI'
import { useGeocode, batchGeocodeZips } from '@/hooks/useGeocode'
import { ProviderCard } from '@/components/ui/provider-card'
import { Pill } from '@/components/ui/pill'
import ProviderMap from '@/components/ProviderMap'

const SPECIALTIES = ['Primary Care', 'Pediatrics', 'Mental Health', 'OB/GYN']

// Haversine miles between two {lat,lng}.
function miles(a, b) {
  if (!a || !b) return null
  const R = 3958.8
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export default function FindCarePortal({ onOpenProvider }) {
  const { providers, loading, error, searchMeta, search } = useNPI()
  const { location, geocode } = useGeocode()
  const [zip, setZip] = useState('50309')
  const [specialty, setSpecialty] = useState('Primary Care')
  const [selectedId, setSelectedId] = useState(null)
  const [sortByDistance, setSortByDistance] = useState(true)
  const [pins, setPins] = useState({})
  const didInit = useRef(false)

  const run = (z = zip, s = specialty) => {
    const clean = (z || '').replace(/\D/g, '').slice(0, 5)
    if (clean.length !== 5) return
    setSelectedId(null)
    geocode(clean)
    search(clean, s)
  }

  // Default search on first mount so the screen opens with live results.
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    run('50309', 'Primary Care')
  }, [])

  // Geocode result ZIPs for per-card distances (module-cached, shared w/ map).
  useEffect(() => {
    const zips = providers.map((p) => p.zip).filter(Boolean)
    if (zips.length) batchGeocodeZips(zips).then(setPins)
    else setPins({})
  }, [providers])

  const withDistance = useMemo(() => {
    const list = providers.map((p) => ({ p, dist: location && pins[p.zip] ? miles(location, pins[p.zip]) : null }))
    if (sortByDistance) list.sort((a, b) => (a.dist ?? 1e9) - (b.dist ?? 1e9))
    return list
  }, [providers, pins, location, sortByDistance])

  const newPatientNote = searchMeta ? `${searchMeta.totalInZip || providers.length} NPI records in ${searchMeta.zip} · ${providers.length} ${specialty} matches` : ''

  return (
    <div className="portal flex h-[calc(100vh-4rem)] flex-col">
      {/* Search + filter bar */}
      <div className="border-b border-ink/15 bg-paper2 px-8 py-3">
        <form
          onSubmit={(e) => { e.preventDefault(); run() }}
          className="mx-auto flex max-w-[1280px] flex-col gap-2 sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 items-center overflow-hidden rounded-lg border border-ink/20 bg-paper">
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 shrink-0 text-sand" />
              <select
                value={specialty}
                onChange={(e) => { setSpecialty(e.target.value); run(zip, e.target.value) }}
                className="h-10 w-full bg-transparent text-[15px] text-ink focus:outline-none"
              >
                {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 border-l border-ink/15 px-3 sm:w-48">
              <MapPin className="h-4 w-4 shrink-0 text-sand" />
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="ZIP"
                inputMode="numeric"
                className="h-10 w-full bg-transparent text-[15px] text-ink placeholder:text-sand focus:outline-none"
              />
            </div>
          </div>
          <button type="submit" className="h-11 rounded-lg bg-action px-5 text-[15px] font-medium text-white hover:bg-action/90">
            Search
          </button>
        </form>
        <div className="mx-auto mt-2 flex max-w-[1280px] flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-sand">specialty:</span>
          {SPECIALTIES.map((s) => (
            <Pill key={s} size="sm" variant={s === specialty ? 'filled' : 'default'} onClick={() => { setSpecialty(s); run(zip, s) }}>
              {s}
            </Pill>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setSortByDistance((v) => !v)}
            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink2 hover:text-ink"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> sort: {sortByDistance ? 'closest' : 'default'}
          </button>
        </div>
      </div>

      {/* Results header */}
      <div className="border-b border-ink/15 px-8 py-3">
        <div className="mx-auto flex max-w-[1280px] items-baseline justify-between gap-4">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {loading ? 'Searching…' : `${providers.length} ${specialty.toLowerCase()} providers near ${searchMeta?.zip || zip}`}
          </h1>
          <span className="hidden font-mono text-[11px] text-sand md:block">{newPatientNote}</span>
        </div>
      </div>

      {/* List + sticky map */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-1 gap-0 overflow-hidden px-8">
        <div className="w-full overflow-y-auto py-4 pr-4 lg:w-1/2">
          {error && <div className="rounded-lg border border-risk/40 bg-risk/5 p-4 text-sm text-risk">{error}</div>}
          {loading && !providers.length && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg border border-ink/10 bg-paper2" />
              ))}
            </div>
          )}
          {!loading && !providers.length && !error && (
            <p className="py-8 text-center text-sm text-sand">No {specialty} providers found in {zip}. Try another ZIP.</p>
          )}
          <div className="space-y-3">
            {withDistance.map(({ p, dist }) => (
              <ProviderCard
                key={p.npi}
                provider={p}
                distance={dist}
                selected={p.npi === selectedId}
                onSelect={setSelectedId}
                onOpen={onOpenProvider}
              />
            ))}
          </div>
          {!!providers.length && (
            <p className="py-4 text-center font-mono text-[11px] text-sand">
              {providers.length} live NPI records · CMS NPPES via NLM
            </p>
          )}
        </div>

        <div className="hidden flex-1 py-4 lg:block">
          <div className="h-full overflow-hidden rounded-lg border border-ink/15">
            <ProviderMap
              providers={providers}
              center={location}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
