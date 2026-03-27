import { useState, useMemo } from 'react'
import { TrendingUp, Bell, ChevronDown } from 'lucide-react'
import { iowaCounties } from '../data/iowaCounties'
import { ANNUAL_TRENDS, getProviderTrend, project, demandProjection, generateAlerts } from '../utils/forecast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

const SORTED     = [...iowaCounties].sort((a, b) => a.name.localeCompare(b.name))
const ALL_ALERTS = generateAlerts(iowaCounties)

const FORECAST_YEARS = [
  { year: 2020, delta: -3 },
  { year: 2023, delta:  0, isCurrent: true },
  { year: 2025, delta:  2 },
  { year: 2027, delta:  4 },
  { year: 2030, delta:  7 },
]

function SparkLine({ points, color = '#3b82f6', currentIdx = 1, width = 220, height = 52 }) {
  const vals = points.map(p => p.value)
  const min  = Math.min(...vals), max = Math.max(...vals)
  const span = max - min || 0.1
  const pad  = 8
  const toX  = i => pad + (i / (points.length - 1)) * (width - pad * 2)
  const toY  = v => height - pad - ((v - min) / span) * (height - pad * 2)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <rect x={toX(currentIdx)} y={0} width={width - toX(currentIdx)} height={height} fill={color} opacity={0.06} />
      <polyline
        points={points.slice(currentIdx).map((p, i) => `${toX(currentIdx + i).toFixed(1)},${toY(p.value).toFixed(1)}`).join(' ')}
        fill="none" stroke={color} strokeWidth="1.8" strokeDasharray="4 3" opacity={0.7}
      />
      <polyline
        points={points.slice(0, currentIdx + 1).map((p, i) => `${toX(i).toFixed(1)},${toY(p.value).toFixed(1)}`).join(' ')}
        fill="none" stroke={color} strokeWidth="2"
      />
      {points.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p.value)} r={i === currentIdx ? 5 : 3.5}
          fill={i === currentIdx ? color : i > currentIdx ? '#fff' : color}
          stroke={color} strokeWidth="1.5" />
      ))}
    </svg>
  )
}

function MetricForecastCard({ label, icon, unit, county, metric, color, invertBad = true }) {
  const rate    = metric === 'providerDensity' ? getProviderTrend(county) : (ANNUAL_TRENDS[metric] ?? 0)
  const current = county[metric]
  const points  = FORECAST_YEARS.map(yr => ({
    year: yr.year, value: parseFloat(project(current, rate, yr.delta)),
  }))
  const diff   = +(points[4].value - current).toFixed(1)
  const isBad  = invertBad ? diff > 0 : diff < 0
  const demand = metric !== 'providerDensity' ? demandProjection(county, metric, 7) : null

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <span>{icon}</span> {label}
          </CardTitle>
          <Badge variant={isBad ? 'danger' : 'success'} className="text-[10px]">
            {diff > 0 ? '▲' : '▼'} {Math.abs(diff)}{unit} by 2030
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <SparkLine points={points} color={color} currentIdx={1} />
        <div className="flex justify-between text-[9px] text-muted-foreground mt-1 px-1">
          {points.map(p => <span key={p.year}>{p.year}</span>)}
        </div>
        <div className="flex justify-between text-[10px] font-semibold mt-1 px-1">
          {points.map((p, i) => (
            <span key={i} className={i === 1 ? 'font-extrabold' : i > 1 ? 'text-muted-foreground' : 'text-muted-foreground'}
              style={i === 1 ? { color } : {}}>
              {p.value}{unit}
            </span>
          ))}
        </div>
        {demand && (
          <p className="text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border">
            Projected residents affected 2030: <strong className="text-foreground">{demand.toLocaleString()}</strong>
          </p>
        )}
      </CardContent>
    </Card>
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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Forecast & Alert Engine</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Trend-based projections (2025–2030) and system-wide alerts across all 99 counties.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="danger" className="gap-1.5">
                <Bell className="h-3 w-3" /> {critCount} critical
              </Badge>
              <Badge variant="warning">{warnCount} warnings</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <div className="flex gap-2">
          <Button variant={view === 'forecast' ? 'default' : 'outline'} onClick={() => setView('forecast')}>
            📊 County Forecast
          </Button>
          <Button variant={view === 'alerts' ? 'default' : 'outline'} onClick={() => setView('alerts')}>
            🚨 Alerts ({ALL_ALERTS.length})
          </Button>
        </div>

        {/* ── FORECAST ── */}
        {view === 'forecast' && (
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Select a county to project trends</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative w-full sm:w-72">
                  <button
                    onClick={() => setOpen(!open)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium hover:border-primary/50 transition-colors"
                  >
                    {county ? `${county.name} County` : 'Select county…'}
                    <ChevronDown className={['h-4 w-4 text-muted-foreground transition-transform', open ? 'rotate-180' : ''].join(' ')} />
                  </button>
                  {open && (
                    <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                      <div className="p-2 border-b border-border">
                        <Input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" />
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {filtered.map(c => (
                          <button key={c.fips} onClick={() => { setCounty(c); setOpen(false); setQuery('') }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent text-foreground transition-colors">
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {!county ? (
              <div className="text-center py-16 text-muted-foreground">
                <span className="text-5xl">📊</span>
                <p className="mt-4 font-medium text-foreground">Select a county to view 2025–2030 projections</p>
                <p className="text-sm mt-1">Disease trends · Provider supply · Demand growth</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{county.name} County — 2023–2030 Projections</h3>
                  <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-lg">── historical &nbsp; - - projected</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricForecastCard label="Diabetes Rate"        icon="🩸" unit="%" metric="diabetes"       county={county} color="#ef4444" invertBad={true}  />
                  <MetricForecastCard label="Poor Mental Health"   icon="🧠" unit="%" metric="mentalHealth"   county={county} color="#8b5cf6" invertBad={true}  />
                  <MetricForecastCard label="Obesity Rate"         icon="⚖️" unit="%" metric="obesity"        county={county} color="#f97316" invertBad={true}  />
                  <MetricForecastCard label="Provider Density /1k" icon="👨‍⚕️" unit=""  metric="providerDensity" county={county} color="#22c55e" invertBad={false} />
                </div>
                <Alert variant="info">
                  <AlertDescription>
                    <strong>Projection methodology:</strong> Linear trend extrapolation using Iowa CDC PLACES longitudinal
                    rates and HRSA workforce data. Projections assume no major policy intervention.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        )}

        {/* ── ALERTS ── */}
        {view === 'alerts' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Critical Alerts',       value: critCount,  variant: 'danger'   },
                { label: 'Warnings',              value: warnCount,  variant: 'warning'  },
                { label: 'Counties Flagged',      value: new Set(ALL_ALERTS.map(a => a.county)).size, variant: 'orange' },
                { label: 'Residents at Risk',     value: `${Math.round(ALL_ALERTS.filter(a => a.severity === 'critical').reduce((s, a) => s + a.pop, 0) / 1000)}k`, variant: 'secondary' },
              ].map(s => (
                <Card key={s.label}>
                  <CardContent className="pt-5 pb-4">
                    <p className="text-2xl font-extrabold">{s.value}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {['All', 'Critical', 'Warning'].map(s => (
                <Button key={s} variant={severFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setSeverFilter(s)}>{s}</Button>
              ))}
              <Separator orientation="vertical" className="h-8 mx-1" />
              {ALERT_CATS.map(c => (
                <Button key={c} variant={catFilter === c ? 'default' : 'outline'} size="sm" onClick={() => setCatFilter(c)}>{c}</Button>
              ))}
            </div>

            <div className="space-y-2">
              {visibleAlerts.slice(0, 40).map(alert => (
                <Card key={alert.id} className={alert.severity === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0">{alert.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-foreground">{alert.county} County</span>
                          <Badge variant={alert.severity === 'critical' ? 'danger' : 'warning'}>{alert.severity}</Badge>
                          <span className="text-[10px] text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded-full">{alert.category}</span>
                          <span className={`text-[10px] font-medium ml-auto ${alert.trend === 'rising' || alert.trend === 'worsening' ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {alert.trend === 'rising' ? '📈' : alert.trend === 'worsening' ? '📉' : '➡️'} {alert.trend}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{alert.headline}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{alert.detail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {visibleAlerts.length > 40 && (
                <p className="text-xs text-center text-muted-foreground py-2">Showing 40 of {visibleAlerts.length} alerts</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
