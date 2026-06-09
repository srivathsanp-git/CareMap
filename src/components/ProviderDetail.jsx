import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Phone, MapPin, Navigation, BadgeCheck, Building2, ArrowRight } from 'lucide-react'
import { batchGeocodeZips } from '@/hooks/useGeocode'
import { METRIC_INFO, metricLevel } from '@/utils/healthScore'
import { useCounties } from '@/context/CountyDataContext'
import { iowaHospitals } from '@/data/iowaHospitals'

const LEVEL_DOT = { low: 'bg-heat-low', mid: 'bg-heat-mid', high: 'bg-heat-high' }

function miles(a, b) {
  const R = 3958.8
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180, la2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
const initials = (n = '') => n.split(' ').filter((w) => /[A-Za-z]/.test(w[0] || '')).slice(0, 2).map((w) => w[0].toUpperCase()).join('')

const CARD = 'rounded-lg border border-ink/15 bg-paper'

export default function ProviderDetail({ provider, onBack, onOpenCounty }) {
  const { counties, medians } = useCounties()
  const [loc, setLoc] = useState(null)
  const [tab, setTab] = useState('About')

  useEffect(() => {
    let off = false
    if (provider?.zip) {
      batchGeocodeZips([provider.zip])
        .then((m) => { if (!off && m[provider.zip]) setLoc(m[provider.zip]) })
        .catch(() => {})
    }
    return () => { off = true }
  }, [provider?.zip])

  const county = useMemo(() => {
    if (!loc) return null
    return counties.reduce((best, c) =>
      miles(loc, c) < miles(loc, best) ? c : best, counties[0])
  }, [loc, counties])

  const nearbyHospitals = useMemo(() => {
    if (!loc) return []
    return [...iowaHospitals]
      .map((h) => ({ ...h, dist: miles(loc, h) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3)
  }, [loc])

  if (!provider) {
    return (
      <div className="mx-auto max-w-[1280px] px-8 py-16 text-center">
        <p className="text-ink2">No provider selected.</p>
        <button onClick={onBack} className="mt-3 text-sm font-medium text-action hover:underline">← Back to Find Care</button>
      </div>
    )
  }

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.fullAddress || `${provider.name} ${provider.city} IA`)}`
  const TABS = ['About', 'Location', 'County health']

  return (
    <div className="mx-auto max-w-[1280px] px-8 pb-16">
      <button onClick={onBack} className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-sand hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Find Care
      </button>

      <div className="mt-3 flex flex-col gap-6 lg:flex-row">
        {/* Main column */}
        <div className="flex-1">
          <div className="flex items-start gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-ink/20 bg-paper2 font-display text-2xl text-ink2">
              {initials(provider.name) || '—'}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-action bg-action/12 px-3 py-1 text-xs font-medium text-action">
                  <BadgeCheck className="h-3.5 w-3.5" /> NPI {provider.npi}
                </span>
                {provider.credential && (
                  <span className="rounded-full border border-ink/25 px-3 py-1 text-xs text-ink2">{provider.credential}</span>
                )}
              </div>
              <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink">
                {provider.name}{provider.credential ? `, ${provider.credential}` : ''}
              </h1>
              <p className="mt-1 text-lg text-ink2">{provider.specialty}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-sand">
                <MapPin className="h-4 w-4" /> {provider.fullAddress || [provider.city, provider.state, provider.zip].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-6 border-b border-ink/15">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative -mb-px py-2 text-[15px] ${t === tab ? 'font-semibold text-ink' : 'text-ink2 hover:text-ink'}`}
              >
                {t}
                {t === tab && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-ink" />}
              </button>
            ))}
          </div>

          {/* Panels */}
          <div className="mt-5">
            {tab === 'About' && (
              <div className="space-y-4">
                <div className={`${CARD} p-4`}>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      ['Provider type', provider.specialty],
                      ['Credential', provider.credential || '—'],
                      ['Location', `${provider.city || '—'}, ${provider.state || 'IA'}`],
                      ['NPI', provider.npi],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="font-mono text-[11px] uppercase tracking-wide text-sand">{k}</div>
                        <div className="mt-1 text-sm font-medium text-ink">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="font-mono text-[11px] leading-relaxed text-sand">
                  Profile sourced from the CMS NPPES NPI registry (via the NLM NPI API). Patient reviews,
                  insurance acceptance, and live appointment availability are not part of public NPI data —
                  call the office to confirm.
                </p>
              </div>
            )}

            {tab === 'Location' && (
              <div className={`${CARD} p-4`}>
                <div className="font-mono text-[11px] uppercase tracking-wide text-ink">Practice address</div>
                <p className="mt-2 text-sm text-ink">{provider.fullAddress || `${provider.city}, ${provider.state} ${provider.zip}`}</p>
                <a href={mapsHref} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-action hover:underline">
                  <Navigation className="h-4 w-4" /> Open in Maps
                </a>
                {nearbyHospitals.length > 0 && (
                  <div className="mt-5">
                    <div className="font-mono text-[11px] uppercase tracking-wide text-ink">Nearest hospitals · CMS rated</div>
                    <div className="mt-2 space-y-2">
                      {nearbyHospitals.map((h) => (
                        <div key={h.id} className="flex items-center justify-between border-t border-ink/10 pt-2 text-sm first:border-0 first:pt-0">
                          <span className="flex items-center gap-2 text-ink"><Building2 className="h-4 w-4 text-sand" />{h.name}</span>
                          <span className="font-mono text-[11px] text-sand">{h.stars ? `${'★'.repeat(h.stars)} · ` : ''}{h.dist.toFixed(0)} mi</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'County health' && (
              <div className={`${CARD} p-4`}>
                {county ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-[11px] uppercase tracking-wide text-ink">
                        {county.name} County · health score {county.healthScore}/100 · rank {county.rank} of 99
                      </div>
                      <button onClick={() => onOpenCounty?.(county.name)} className="font-mono text-[11px] uppercase tracking-wide text-action hover:underline">
                        full dashboard →
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {Object.entries(METRIC_INFO).map(([k, m]) => (
                        <div key={k} className="rounded-md border border-ink/10 p-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-ink2">{m.label}</span>
                            <span className={`h-2.5 w-2.5 rounded-full border border-ink/30 ${LEVEL_DOT[metricLevel(k, county[k])]}`} />
                          </div>
                          <div className="mt-1 font-display text-lg font-semibold text-ink">{county[k]}{m.unit}</div>
                          <div className="font-mono text-[10px] text-sand">IA {medians[k]}{m.unit}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-sand">Locating county…</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="w-full shrink-0 lg:w-[270px]">
          <div className={`${CARD} sticky top-20 p-4`}>
            <div className="font-mono text-[11px] uppercase tracking-wide text-ink">Contact this provider</div>
            <div className="mt-3 space-y-2">
              {provider.phone ? (
                <a href={`tel:${provider.phone}`} className="flex w-full items-center justify-center gap-2 rounded-lg bg-action px-4 py-2.5 text-sm font-medium text-white hover:bg-action/90">
                  <Phone className="h-4 w-4" /> Call {provider.phone}
                </a>
              ) : (
                <div className="rounded-lg border border-ink/15 px-4 py-2.5 text-center text-sm text-sand">No phone on file</div>
              )}
              <a href={mapsHref} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-lg border border-ink/25 px-4 py-2.5 text-sm font-medium text-ink hover:bg-ink/5">
                <Navigation className="h-4 w-4" /> Directions
              </a>
              <button className="w-full rounded-lg px-4 py-2.5 text-sm text-ink2 hover:bg-ink/5">Save to care plan</button>
            </div>
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-sand">
              Online booking isn't available through public NPI data — call to schedule.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
