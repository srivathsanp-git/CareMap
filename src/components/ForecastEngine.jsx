import { useState, useMemo } from 'react'
import { TrendingUp, Bell, ChevronDown } from 'lucide-react'
import { iowaCounties } from '../data/iowaCounties'
import { ANNUAL_TRENDS, getProviderTrend, project, baseline2020, demandProjection, generateAlerts } from '../utils/forecast'

const SORTED = [...iowaCounties].sort((a, b) => a.name.localeCompare(b.name))
const ALL_ALERTS = generateAlerts(iowaCounties)

const FORECAST_YEARS = [
  { year: 2020, delta: -3, label: '2020' },
  { year: 2023, delta:  0, label: '2023\n(now)', isCurrent: true },
  { year: 2025, delta:  2, label: '2025' },
  { year: 2027, delta:  4, label: '2027' },
  { year: 2030, delta:  7, label: '2030' },
]

function SparkLine({ points, width = 220, height = 52, color = '#3b82f6', currentIdx = 1 }) {
  const vals = points.map(p => p.value)
  const min  = Math.min(...vals)
  const max  = Math.max(...vals)
  const span = max - min || 0.1
  const pad  = 8

  const toX = i  => pad + (i / (points.length - 1)) * (width - pad * 2)
  const toY = v  => height - pad - ((v - min) / span) * (height - pad * 2)
  const coords = points.map((p, i) => `${toX(i).toFixed(1)},${toY(p.value).toFixed(1)}`).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {/* Shaded future area */}
      <rect
        x={toX(currentIdx)} y={0}
        width={width - toX(currentIdx)} height={height}
        fill={color} opacity={0.06}
      />
      {/* Dashed projection line */}
      <polyline
        points={points.slice(currentIdx).map((p, i) => `${toX(currentIdx + i).toFixed(1)},${toY(p.value).toFixed(1)}`).join(' ')}
        fill="none" stroke={color} strokeWidth="1.8" strokeDasharray="4 3" opacity={0.7}
      />
      {/* Historical solid line */}
      <polyline
        points={points.slice(0, currentIdx + 1).map((p, i) => `${toX(i).toFixed(1)},${toY(p.value).toFixed(1)}`).join(' ')}
        fill="none" stroke={color} strokeWidth="2"
      />
      {/* Dots */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={toX(i)} cy={toY(p.value)} r={i === currentIdx ? 5 : 3.5}
          fill={i === currentIdx ? color : i > currentIdx ? '#fff' : color}
          stroke={color} strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}

function MetricForecastCard({ label, icon, unit, county, metric, color, invertBad = true }) {
  const rate = metric === 'providerDensity' ? getProviderTrend(county) : (ANNUAL_TRENDS[metric] ?? 0)
  const current = county[metric]

  const points = FORECAST_YEARS.map(yr => ({
    year:  yr.year,
    label: yr.label,
    value: parseFloat(project(current, rate, yr.delta)),
  }))

  const end2030 = points[4].value
  const diff    = +(end2030 - current).toFixed(1)
  const isRising = diff > 0

  // For provider density: rising = good; for disease metrics: rising = bad
  const isBad   = invertBad ? isRising : !isRising

  const demand2030 = metric !== 'providerDensity'
    ? demandProjection(county, metric, 7)
    : null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-semibold text-slate-700">{label}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          isBad ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {diff > 0 ? '▲' : '▼'} {Math.abs(diff)}{unit} by 2030
        </span>
      </div>

      <SparkLine points={points} color={color} currentIdx={1} />

      {/* Year labels */}
      <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-1">
        {points.map((p, i) => (
          <span key={i} className={i === 1 ? 'font-bold text-slate-600' : ''}>{p.year}</span>
        ))}
      </div>

      {/* Value at each year */}
      <div className="flex justify-between text-[10px] font-semibold mt-1 px-1">
        {points.map((p, i) => (
          <span key={i} className={i === 1 ? `font-extrabold` : i > 1 ? 'text-slate-400' : 'text-slate-500'}
            style={i === 1 ? { color } : {}}>
            {p.value}{unit}
          </span>
        ))}
      </div>

      {demand2030 && (
        <p className="text-[11px] text-slate-400 mt-3 border-t border-slate-100 pt-2">
          Projected residents affected 2030: <strong className="text-slate-600">{demand2030.toLocaleString()}</strong>
        </p>
      )}
    </div>
  )
}

const ALERT_CATEGORIES = ['All', 'Mental Health', 'Provider Shortage', 'Chronic Disease', 'Coverage Gap']
const SEVERITY_CONFIG = {
  critical: { label: 'Critical', cls: 'bg-red-100 text-red-700 border-red-200',    dot: 'bg-red-500'    },
  warning:  { label: 'Warning',  cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
}
const TREND_CONFIG = {
  rising:    { icon: '📈', cls: 'text-red-500'   },
  worsening: { icon: '📉', cls: 'text-red-500'   },
  stable:    { icon: '➡️', cls: 'text-slate-400' },
}

export default function ForecastEngine() {
  const [view,         setView]         = useState('forecast')  // 'forecast' | 'alerts'
  const [county,       setCounty]       = useState(null)
  const [open,         setOpen]         = useState(false)
  const [query,        setQuery]        = useState('')
  const [severFilter,  setSeverFilter]  = useState('All')
  const [catFilter,    setCatFilter]    = useState('All')

  const filtered   = SORTED.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
  const critCount  = ALL_ALERTS.filter(a => a.severity === 'critical').length
  const warnCount  = ALL_ALERTS.filter(a => a.severity === 'warning').length

  const visibleAlerts = useMemo(() => ALL_ALERTS.filter(a => {
    if (severFilter !== 'All' && a.severity !== severFilter.toLowerCase()) return false
    if (catFilter   !== 'All' && a.category !== catFilter) return false
    return true
  }), [severFilter, catFilter])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-slate-900">Forecast & Alert Engine</h2>
            <span className={`ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
              critCount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              <Bell className="w-3 h-3" />
              {critCount} critical · {warnCount} warnings
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            Trend-based projections (2025–2030) and system-wide health alerts across all 99 Iowa counties.
            Based on CDC PLACES longitudinal data and HRSA workforce projections.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* View toggle */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'forecast', label: '📊 County Forecast' },
            { id: 'alerts',   label: `🚨 Alerts (${ALL_ALERTS.length})` },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                view === v.id ? 'bg-blue-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >{v.label}</button>
          ))}
        </div>

        {/* ── FORECAST VIEW ── */}
        {view === 'forecast' && (
          <div className="space-y-6">
            {/* County selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">Select a county to project trends</p>
              <div className="relative w-full sm:w-72">
                <button
                  onClick={() => setOpen(!open)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-left font-medium text-slate-800 text-sm hover:border-blue-400 transition-colors"
                >
                  {county ? `${county.name} County` : 'Select county…'}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                        placeholder="Search…"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {filtered.map(c => (
                        <button key={c.fips} onClick={() => { setCounty(c); setOpen(false); setQuery('') }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 text-slate-700 transition-colors">
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!county ? (
              <div className="text-center py-16 text-slate-400">
                <span className="text-5xl">📊</span>
                <p className="mt-4 font-medium">Select a county to view 2025–2030 projections</p>
                <p className="text-sm mt-1">Disease trends · Provider supply · Demand growth</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-lg">{county.name} County — 2023–2030 Projections</h3>
                  <span className="text-xs text-slate-400 font-mono bg-white border border-slate-200 px-2 py-1 rounded-lg">
                    ── historical &nbsp; - - projected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricForecastCard label="Diabetes Rate"         icon="🩸" unit="%" metric="diabetes"      county={county} color="#ef4444" invertBad={true}  />
                  <MetricForecastCard label="Poor Mental Health"    icon="🧠" unit="%" metric="mentalHealth"  county={county} color="#8b5cf6" invertBad={true}  />
                  <MetricForecastCard label="Obesity Rate"          icon="⚖️" unit="%" metric="obesity"       county={county} color="#f97316" invertBad={true}  />
                  <MetricForecastCard label="Provider Density /1k"  icon="👨‍⚕️" unit=""  metric="providerDensity" county={county} color="#22c55e" invertBad={false} />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
                  <strong>ℹ Projection methodology:</strong> Linear trend extrapolation using Iowa CDC PLACES
                  longitudinal rates and HRSA workforce data. Provider density uses population-tier decline rates
                  from rural health research. Projections assume no major policy intervention.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ALERTS VIEW ── */}
        {view === 'alerts' && (
          <div className="space-y-5">
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Critical Alerts',  value: critCount,  cls: 'bg-red-50 border-red-200 text-red-700'    },
                { label: 'Warnings',         value: warnCount,  cls: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                { label: 'Counties Flagged', value: new Set(ALL_ALERTS.map(a => a.county)).size, cls: 'bg-orange-50 border-orange-200 text-orange-700' },
                { label: 'Total Residents Affected', value: `${Math.round(ALL_ALERTS.filter(a => a.severity==='critical').reduce((s, a) => s + a.pop, 0) / 1000)}k`, cls: 'bg-slate-50 border-slate-200 text-slate-700' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border-2 px-4 py-3 ${s.cls}`}>
                  <p className="text-2xl font-extrabold">{s.value}</p>
                  <p className="text-xs font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {['All', 'Critical', 'Warning'].map(s => (
                <button key={s} onClick={() => setSeverFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    severFilter === s ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>{s}</button>
              ))}
              <div className="w-px bg-slate-200 mx-1" />
              {ALERT_CATEGORIES.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    catFilter === c ? 'bg-blue-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>{c}</button>
              ))}
            </div>

            {/* Alert list */}
            <div className="space-y-2">
              {visibleAlerts.slice(0, 40).map(alert => {
                const sev   = SEVERITY_CONFIG[alert.severity]
                const trend = TREND_CONFIG[alert.trend] ?? TREND_CONFIG.stable
                return (
                  <div key={alert.id} className={`rounded-xl border p-4 ${sev.cls}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{alert.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold">{alert.county} County</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                            alert.severity === 'critical' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                            {sev.label}
                          </span>
                          <span className="text-[10px] text-slate-500 bg-white/60 px-1.5 py-0.5 rounded-full">{alert.category}</span>
                          <span className={`text-[10px] font-medium ml-auto ${trend.cls}`}>{trend.icon} {alert.trend}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 leading-snug">{alert.headline}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{alert.detail}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
              {visibleAlerts.length > 40 && (
                <p className="text-xs text-center text-slate-400 py-2">Showing 40 of {visibleAlerts.length} alerts</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
