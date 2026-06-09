import { useState, useMemo } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { iowaCounties } from '../data/iowaCounties'
import { ANNUAL_TRENDS, getProviderTrend, project, demandProjection, generateAlerts } from '../utils/forecast'
import { Pill } from '@/components/ui/pill'
import { Stat } from '@/components/ui/stat'

const SORTED     = [...iowaCounties].sort((a, b) => a.name.localeCompare(b.name))
const ALL_ALERTS = generateAlerts(iowaCounties)
const CARD = 'rounded-lg border border-ink/15 bg-paper'

const FORECAST_YEARS = [
  { year: 2020, delta: -3 },
  { year: 2023, delta:  0, isCurrent: true },
  { year: 2025, delta:  2 },
  { year: 2027, delta:  4 },
  { year: 2030, delta:  7 },
]

// Portal-styled sparkline: solid ink for history, dashed for the projection,
// a subtle shaded future region and a "now" divider. Strokes are kept crisp
// across the responsive x-stretch with non-scaling-stroke.
function SparkLine({ points, currentIdx = 1, height = 48 }) {
  const INK = '#1A1A1A'
  const width = 240
  const vals = points.map(p => p.value)
  const min = Math.min(...vals), max = Math.max(...vals)
  const span = max - min || 0.1
  const pad = 6
  const toX = i => pad + (i / (points.length - 1)) * (width - pad * 2)
  const toY = v => height - pad - ((v - min) / span) * (height - pad * 2)
  const line = (slice, offset) => slice.map((p, i) => `${toX(offset + i).toFixed(1)},${toY(p.value).toFixed(1)}`).join(' ')

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block">
      <rect x={toX(currentIdx)} y={0} width={width - toX(currentIdx)} height={height} fill={INK} opacity={0.04} />
      <line x1={toX(currentIdx)} y1={0} x2={toX(currentIdx)} y2={height} stroke={INK} strokeWidth="1" strokeDasharray="2 2" opacity={0.4} vectorEffect="non-scaling-stroke" />
      <polyline points={line(points.slice(currentIdx), currentIdx)} fill="none" stroke={INK} strokeWidth="1.5" strokeDasharray="4 3" opacity={0.5} vectorEffect="non-scaling-stroke" />
      <polyline points={line(points.slice(0, currentIdx + 1), 0)} fill="none" stroke={INK} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function MetricForecastCard({ label, unit, county, metric, invertBad = true }) {
  const rate    = metric === 'providerDensity' ? getProviderTrend(county) : (ANNUAL_TRENDS[metric] ?? 0)
  const current = county[metric]
  const points  = FORECAST_YEARS.map(yr => ({ year: yr.year, value: parseFloat(project(current, rate, yr.delta)) }))
  const diff   = +(points[4].value - current).toFixed(1)
  const isBad  = invertBad ? diff > 0 : diff < 0
  const demand = metric !== 'providerDensity' ? demandProjection(county, metric, 7) : null

  return (
    <div className={`${CARD} p-4`}>
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-[11px] uppercase tracking-wide text-sand">{label}</div>
        <Pill variant={isBad ? 'risk' : 'action'} size="sm">
          {diff > 0 ? '↑' : '↓'} {Math.abs(diff)}{unit} by 2030
        </Pill>
      </div>
      <div className="mt-3"><SparkLine points={points} currentIdx={1} /></div>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-sand">
        {points.map(p => <span key={p.year}>{p.year}</span>)}
      </div>
      <div className="mt-0.5 flex justify-between font-mono text-[10px]">
        {points.map((p, i) => (
          <span key={i} className={i === 1 ? 'font-semibold text-ink' : 'text-sand'}>{p.value}{unit}</span>
        ))}
      </div>
      {demand != null && (
        <p className="mt-3 border-t border-ink/10 pt-2 text-[11px] text-ink2">
          Projected residents affected by 2030: <strong className="text-ink">{demand.toLocaleString()}</strong>
        </p>
      )}
    </div>
  )
}

const ALERT_CATS = ['All', 'Mental Health', 'Provider Shortage', 'Chronic Disease', 'Coverage Gap']

export default function ForecastEngine() {
  const [view,        setView]        = useState('forecast')
  const [county,      setCounty]      = useState(null)
  const [open,        setOpen]        = useState(false)
  const [query,       setQuery]       = useState('')
  const [severFilter, setSeverFilter] = useState('All')
  const [catFilter,   setCatFilter]   = useState('All')

  const filtered = SORTED.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
  const critCount = ALL_ALERTS.filter(a => a.severity === 'critical').length
  const warnCount = ALL_ALERTS.filter(a => a.severity === 'warning').length

  const visibleAlerts = useMemo(() => ALL_ALERTS.filter(a => {
    if (severFilter !== 'All' && a.severity !== severFilter.toLowerCase()) return false
    if (catFilter   !== 'All' && a.category !== catFilter) return false
    return true
  }), [severFilter, catFilter])

  const TABS = [['forecast', 'County forecast'], ['alerts', `Alerts (${ALL_ALERTS.length})`]]

  return (
    <div className="pb-4">
      {/* Hero */}
      <div className="mt-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-sand">Forecast &amp; alerts</div>
          <h1 className="mt-1 font-display text-5xl font-semibold leading-none text-ink">What&apos;s ahead.</h1>
          <p className="mt-2 text-ink2">Trend-based projections (2025–2030) and system-wide alerts across all 99 counties.</p>
        </div>
        <div className="flex items-center gap-2">
          <Pill variant="risk" size="sm">{critCount} critical</Pill>
          <Pill size="sm">{warnCount} warnings</Pill>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-6 border-b border-ink/15">
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setView(id)}
            className={`relative -mb-px py-2 text-[15px] ${view === id ? 'font-semibold text-ink' : 'text-ink2 hover:text-ink'}`}>
            {label}
            {view === id && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-ink" />}
          </button>
        ))}
      </div>

      {/* ── FORECAST ── */}
      {view === 'forecast' && (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-wide text-sand">County:</span>
            <div className="relative w-full sm:w-72">
              <button onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-ink/25 bg-paper px-4 py-2.5 text-sm font-medium text-ink hover:border-ink/50">
                {county ? `${county.name} County` : 'Select county…'}
                <ChevronDown className={`h-4 w-4 text-sand transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-ink/15 bg-paper shadow-xl">
                  <div className="flex items-center gap-2 border-b border-ink/10 px-3">
                    <Search className="h-4 w-4 text-sand" />
                    <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…"
                      className="h-10 w-full bg-transparent text-sm text-ink placeholder:text-sand focus:outline-none" />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filtered.map(c => (
                      <button key={c.fips} onClick={() => { setCounty(c); setOpen(false); setQuery('') }}
                        className="w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-paper2">{c.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {!county ? (
            <div className={`${CARD} py-16 text-center`}>
              <p className="font-display text-xl font-semibold text-ink">Select a county to view 2025–2030 projections</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-sand">Disease trends · Provider supply · Demand growth</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold text-ink">{county.name} County — 2023–2030 projections</h2>
                <span className="font-mono text-[10px] uppercase tracking-wide text-sand">━ historical · ┄ projected</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <MetricForecastCard label="Diabetes rate"        unit="%" metric="diabetes"        county={county} invertBad />
                <MetricForecastCard label="Poor mental health"   unit="%" metric="mentalHealth"    county={county} invertBad />
                <MetricForecastCard label="Obesity rate"         unit="%" metric="obesity"         county={county} invertBad />
                <MetricForecastCard label="Provider density /1k" unit=""  metric="providerDensity" county={county} invertBad={false} />
              </div>
              <div className={`${CARD} bg-paper2 p-4`}>
                <span className="font-mono text-[11px] uppercase tracking-wide text-ink">Projection note: </span>
                <span className="text-sm text-ink2">
                  Linear trend extrapolation using Iowa CDC PLACES longitudinal rates and HRSA workforce data.
                  Projections assume no major policy intervention.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ALERTS ── */}
      {view === 'alerts' && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'critical alerts',   value: String(critCount) },
              { label: 'warnings',          value: String(warnCount) },
              { label: 'counties flagged',  value: String(new Set(ALL_ALERTS.map(a => a.county)).size) },
              { label: 'residents at risk', value: `${Math.round(ALL_ALERTS.filter(a => a.severity === 'critical').reduce((s, a) => s + a.pop, 0) / 1000)}k` },
            ].map(s => (
              <div key={s.label} className={`${CARD} p-4`}><Stat num={s.value} label={s.label} size="sm" /></div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wide text-sand">severity:</span>
            {['All', 'Critical', 'Warning'].map(s => (
              <Pill key={s} size="sm" variant={severFilter === s ? 'filled' : 'default'} onClick={() => setSeverFilter(s)}>{s}</Pill>
            ))}
            <span className="ml-2 font-mono text-[11px] uppercase tracking-wide text-sand">category:</span>
            {ALERT_CATS.map(c => (
              <Pill key={c} size="sm" variant={catFilter === c ? 'filled' : 'default'} onClick={() => setCatFilter(c)}>{c}</Pill>
            ))}
          </div>

          <div className="space-y-2">
            {visibleAlerts.slice(0, 40).map(alert => {
              const crit = alert.severity === 'critical'
              return (
                <div key={alert.id} className={`rounded-lg border p-3.5 ${crit ? 'border-risk/40 bg-risk/5' : 'border-ink/15 bg-heat-mid/15'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{alert.county} County</span>
                    <Pill variant={crit ? 'risk' : 'default'} size="sm">{alert.severity}</Pill>
                    <span className="font-mono text-[10px] uppercase tracking-wide text-sand">{alert.category}</span>
                    <span className={`ml-auto font-mono text-[10px] uppercase ${alert.trend === 'rising' || alert.trend === 'worsening' ? 'text-risk' : 'text-sand'}`}>
                      {alert.trend}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-ink">{alert.headline}</p>
                  <p className="mt-0.5 text-xs text-ink2">{alert.detail}</p>
                </div>
              )
            })}
            {visibleAlerts.length > 40 && (
              <p className="py-2 text-center font-mono text-[11px] text-sand">Showing 40 of {visibleAlerts.length} alerts</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
