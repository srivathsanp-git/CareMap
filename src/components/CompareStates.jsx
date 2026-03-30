import { useState, useEffect } from 'react'
import { Globe, BarChart2, Map, AlertTriangle, ChevronUp, ChevronDown, Search } from 'lucide-react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { US_STATES, NAME_TO_ABBR } from '../data/usStates'
import { fetchStatePlaces, MEASURE_META, KEY_MEASURES, metricColor, METRIC_THRESHOLDS } from '../utils/cdcPlaces'

const TABS = [
  { id: 'scorecard', label: 'State Scorecard', icon: BarChart2  },
  { id: 'headtohead',label: 'Head-to-Head',    icon: BarChart2  },
  { id: 'map',       label: 'National Map',    icon: Map        },
  { id: 'deserts',   label: 'Provider Deserts',icon: AlertTriangle },
]

const DISPLAY_METRICS = KEY_MEASURES.slice(0, 7)  // show 7 in scorecard

// ── helpers ─────────────────────────────────────────────────────────────────
function rankStates(data, measureId) {
  const entries = Object.entries(data)
    .filter(([, d]) => d[measureId] != null)
    .sort((a, b) => a[1][measureId] - b[1][measureId])  // lower = better rank
  return Object.fromEntries(entries.map(([abbr], i) => [abbr, i + 1]))
}

function valueBadgeVariant(value, measureId) {
  const { low, high } = METRIC_THRESHOLDS[measureId] || { low: 0, high: 100 }
  const t = (value - low) / (high - low)
  if (t < 0.33) return 'success'
  if (t < 0.66) return 'warning'
  return 'danger'
}

function careGapScore(stateData) {
  // Higher = worse care gap: blend of uninsured + diabetes + obesity
  const a = stateData?.ACCESS2  || 0
  const d = stateData?.DIABETES  || 0
  const o = stateData?.OBESITY   || 0
  const m = stateData?.MHLTH    || 0
  // Normalize each to 0-100
  return Math.round(
    ((a / 18) * 30) +
    ((d / 15) * 25) +
    ((o / 42) * 25) +
    ((m / 18) * 20)
  )
}

// Leaflet choropleth colors (green → red, 7 buckets)
const CHORO_COLORS = ['#22c55e','#86efac','#fde68a','#fbbf24','#f97316','#ef4444','#991b1b']
function choroColor(value, measureId) {
  if (value == null) return '#e5e7eb'
  const { low, high } = METRIC_THRESHOLDS[measureId] || { low: 0, high: 100 }
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)))
  const idx = Math.min(Math.floor(t * CHORO_COLORS.length), CHORO_COLORS.length - 1)
  return CHORO_COLORS[idx]
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Scorecard({ data }) {
  const [sortMetric, setSortMetric] = useState('DIABETES')
  const [sortAsc,    setSortAsc]    = useState(true)
  const [search,     setSearch]     = useState('')

  const ranks = rankStates(data, sortMetric)

  const rows = Object.entries(data)
    .filter(([abbr, d]) => {
      const st = US_STATES.find(s => s.abbr === abbr)
      if (!st) return false
      return !search || st.name.toLowerCase().includes(search.toLowerCase()) || abbr.toLowerCase().includes(search.toLowerCase())
    })
    .sort((a, b) => {
      const av = a[1][sortMetric] ?? 999
      const bv = b[1][sortMetric] ?? 999
      return sortAsc ? av - bv : bv - av
    })

  function toggleSort(m) {
    if (sortMetric === m) setSortAsc(!sortAsc)
    else { setSortMetric(m); setSortAsc(true) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <p className="text-sm text-muted-foreground">All 50 states ranked by CDC PLACES health metrics. Lower % = better.</p>
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter states…" className="pl-8" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <th className="text-left px-4 py-3 sticky left-0 bg-muted/50 min-w-[120px]">State</th>
              {DISPLAY_METRICS.map(m => (
                <th key={m} className="px-3 py-3 min-w-[110px]">
                  <button
                    onClick={() => toggleSort(m)}
                    className={['flex items-center gap-1 ml-auto hover:text-foreground transition-colors', sortMetric === m ? 'text-primary' : ''].join(' ')}
                  >
                    {MEASURE_META[m].label}
                    {sortMetric === m && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([abbr, d], idx) => {
              const st = US_STATES.find(s => s.abbr === abbr)
              return (
                <tr key={abbr} className={['border-b border-border hover:bg-muted/30 transition-colors', idx % 2 === 0 ? '' : 'bg-muted/10'].join(' ')}>
                  <td className="px-4 py-2.5 sticky left-0 bg-background font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5">{ranks[abbr]}</span>
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{abbr}</span>
                      <span className="hidden sm:inline text-xs text-muted-foreground">{st?.name}</span>
                    </div>
                  </td>
                  {DISPLAY_METRICS.map(m => (
                    <td key={m} className="px-3 py-2.5 text-right">
                      {d[m] != null ? (
                        <Badge variant={valueBadgeVariant(d[m], m)} className="text-xs">
                          {d[m].toFixed(1)}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground text-center">Source: CDC PLACES 2023 · Aggregated from county-level data</p>
    </div>
  )
}

function HeadToHead({ data }) {
  const [stateA, setStateA] = useState('IA')
  const [stateB, setStateB] = useState('MN')

  const dA = data[stateA]
  const dB = data[stateB]

  return (
    <div className="space-y-5">
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">State A:</span>
          <select
            value={stateA}
            onChange={e => setStateA(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.abbr} — {s.name}</option>)}
          </select>
        </div>
        <span className="text-muted-foreground font-bold">vs</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">State B:</span>
          <select
            value={stateB}
            onChange={e => setStateB(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.abbr} — {s.name}</option>)}
          </select>
        </div>
      </div>

      {dA && dB && (
        <div className="space-y-3">
          {KEY_MEASURES.map(m => {
            const vA = dA[m], vB = dB[m]
            if (vA == null && vB == null) return null
            const maxV = Math.max(vA || 0, vB || 0, METRIC_THRESHOLDS[m]?.high || 30)
            const winner = vA != null && vB != null ? (vA < vB ? stateA : vA > vB ? stateB : 'tie') : null

            return (
              <Card key={m} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm text-foreground">{MEASURE_META[m].label}</span>
                    <span className="text-xs text-muted-foreground">{MEASURE_META[m].desc}</span>
                  </div>
                  <div className="space-y-2">
                    {[{ abbr: stateA, v: vA }, { abbr: stateB, v: vB }].map(({ abbr, v }) => (
                      <div key={abbr} className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold w-8 text-foreground">{abbr}</span>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: v != null ? `${(v / maxV) * 100}%` : '0%',
                              backgroundColor: v != null ? metricColor(v, m) : '#e5e7eb',
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-14 text-right text-foreground">
                          {v != null ? `${v.toFixed(1)}%` : '—'}
                        </span>
                        {winner === abbr && <Badge variant="success" className="text-[10px]">Better</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// GeoJSON property name → state abbr (covers common variations)
const GEO_NAME_TO_ABBR = {
  ...NAME_TO_ABBR,
  'District of Columbia': 'DC',
}

function NationalMap({ data, measureId, onMeasureChange }) {
  const [geoJson, setGeoJson] = useState(null)
  const [geoError, setGeoError] = useState(null)

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(setGeoJson)
      .catch(e => setGeoError(e.message))
  }, [])

  function featureStyle(feature) {
    const stateName = feature.properties.name || feature.properties.NAME || ''
    const abbr  = GEO_NAME_TO_ABBR[stateName]
    const value = abbr && data[abbr] ? data[abbr][measureId] : null
    return {
      fillColor:   choroColor(value, measureId),
      fillOpacity: 0.75,
      color:       '#fff',
      weight:      1.5,
    }
  }

  function onEachFeature(feature, layer) {
    const stateName = feature.properties.name || feature.properties.NAME || ''
    const abbr  = GEO_NAME_TO_ABBR[stateName]
    const value = abbr && data[abbr] ? data[abbr][measureId] : null
    const metricLabel = MEASURE_META[measureId]?.label || measureId
    const tooltipHtml = `
      <div style="font-family:sans-serif;line-height:1.4;min-width:140px">
        <div style="font-weight:700;font-size:13px;margin-bottom:3px">${stateName}</div>
        <div style="font-size:12px;color:#6b7280">${metricLabel}</div>
        <div style="font-size:16px;font-weight:800;margin-top:2px;color:${value != null ? choroColor(value, measureId) : '#9ca3af'}">
          ${value != null ? value.toFixed(1) + '%' : 'No data'}
        </div>
      </div>
    `
    layer.bindTooltip(tooltipHtml, { sticky: true, opacity: 0.97, className: 'caremap-tooltip' })
    layer.on({
      mouseover: () => layer.setStyle({ weight: 3, fillOpacity: 0.95 }),
      mouseout:  () => layer.setStyle(featureStyle(feature)),
    })
  }

  return (
    <div className="space-y-4">
      {/* Metric selector */}
      <div className="flex flex-wrap gap-2">
        {KEY_MEASURES.map(m => (
          <button
            key={m}
            onClick={() => onMeasureChange(m)}
            className={[
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              measureId === m
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            ].join(' ')}
          >
            {MEASURE_META[m].label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>Better</span>
        {CHORO_COLORS.map((c, i) => <div key={i} className="h-4 w-6 rounded" style={{ backgroundColor: c }} />)}
        <span>Worse</span>
        <div className="ml-4 h-4 w-6 rounded bg-[#e5e7eb]" />
        <span>No data</span>
      </div>

      <div className="rounded-xl overflow-hidden border border-border" style={{ height: '520px' }}>
        {geoError ? (
          <div className="h-full flex items-center justify-center bg-muted/20">
            <p className="text-sm text-destructive">Failed to load map boundaries: {geoError}</p>
          </div>
        ) : geoJson ? (
          <MapContainer
            center={[39.5, -98.35]}
            zoom={4}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <GeoJSON
              key={`${measureId}-${Object.keys(data).length}`}
              data={geoJson}
              style={featureStyle}
              onEachFeature={onEachFeature}
            />
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/20">
            <div className="text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent mb-2" />
              <p className="text-sm">Loading map boundaries…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProviderDeserts({ data }) {
  const [sortAsc, setSortAsc] = useState(false)

  const ranked = US_STATES
    .map(st => ({
      ...st,
      d: data[st.abbr],
      gap: careGapScore(data[st.abbr]),
      uninsured: data[st.abbr]?.ACCESS2,
      diabetes:  data[st.abbr]?.DIABETES,
      mhlth:     data[st.abbr]?.MHLTH,
    }))
    .filter(s => s.d)
    .sort((a, b) => sortAsc ? a.gap - b.gap : b.gap - a.gap)

  const worst5  = [...ranked].sort((a, b) => b.gap - a.gap).slice(0, 5)
  const best5   = [...ranked].sort((a, b) => a.gap - b.gap).slice(0, 5)

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Care Gap Score combines uninsured rate, diabetes prevalence, obesity, and poor mental health —
        a proxy for states where healthcare access is most strained.
      </p>

      {/* Top/Bottom cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Highest Care Gap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {worst5.map((s, i) => (
              <div key={s.abbr} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">#{i+1}</span>
                  <span className="font-mono text-xs font-bold bg-red-50 text-red-700 px-1.5 py-0.5 rounded">{s.abbr}</span>
                  <span className="text-sm text-foreground">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={s.gap} className="h-1.5 w-16" indicatorClassName="bg-red-500" />
                  <span className="text-xs font-bold text-red-600 w-6">{s.gap}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600 flex items-center gap-1.5">
              <Globe className="h-4 w-4" /> Best Care Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {best5.map((s, i) => (
              <div key={s.abbr} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">#{i+1}</span>
                  <span className="font-mono text-xs font-bold bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{s.abbr}</span>
                  <span className="text-sm text-foreground">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={s.gap} className="h-1.5 w-16" indicatorClassName="bg-green-500" />
                  <span className="text-xs font-bold text-green-600 w-6">{s.gap}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Full table */}
      <Card>
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">All States — Care Gap Ranking</span>
          <Button variant="outline" size="sm" onClick={() => setSortAsc(!sortAsc)} className="gap-1">
            {sortAsc ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {sortAsc ? 'Best first' : 'Worst first'}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">State</th>
                <th className="text-right px-4 py-3">Care Gap</th>
                <th className="text-right px-4 py-3">Uninsured</th>
                <th className="text-right px-4 py-3">Diabetes</th>
                <th className="text-right px-4 py-3">Poor Mental Health</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((s, idx) => (
                <tr key={s.abbr} className={['border-b border-border hover:bg-muted/30', idx % 2 === 0 ? '' : 'bg-muted/10'].join(' ')}>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs font-bold mr-2">{s.abbr}</span>
                    <span className="text-foreground text-xs hidden sm:inline">{s.name}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress value={s.gap} className="h-1.5 w-16" indicatorClassName={s.gap >= 60 ? 'bg-red-500' : s.gap >= 40 ? 'bg-amber-500' : 'bg-green-500'} />
                      <span className="font-bold text-xs w-5">{s.gap}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {s.uninsured != null ? <Badge variant={valueBadgeVariant(s.uninsured, 'ACCESS2')} className="text-xs">{s.uninsured.toFixed(1)}%</Badge> : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {s.diabetes != null ? <Badge variant={valueBadgeVariant(s.diabetes, 'DIABETES')} className="text-xs">{s.diabetes.toFixed(1)}%</Badge> : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {s.mhlth != null ? <Badge variant={valueBadgeVariant(s.mhlth, 'MHLTH')} className="text-xs">{s.mhlth.toFixed(1)}%</Badge> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function CompareStates() {
  const [tab,       setTab]       = useState('scorecard')
  const [mapMetric, setMapMetric] = useState('DIABETES')
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    fetchStatePlaces()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-card px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">National State Comparison</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Compare health outcomes across all 50 states · CDC PLACES 2023 · Sortable scorecard · Choropleth map · Care gap analysis
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border mb-6">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  'flex items-center gap-1.5 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  tab === t.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            )
          })}
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-3" />
            <p className="text-sm text-muted-foreground">Loading CDC PLACES data for all 50 states…</p>
          </div>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/5 p-6 text-center">
            <p className="text-destructive font-medium">Failed to load data: {error}</p>
            <p className="text-sm text-muted-foreground mt-1">Check your connection and try refreshing.</p>
          </Card>
        )}

        {data && !loading && (
          <>
            {tab === 'scorecard'  && <Scorecard data={data} />}
            {tab === 'headtohead' && <HeadToHead data={data} />}
            {tab === 'map'        && <NationalMap data={data} measureId={mapMetric} onMeasureChange={setMapMetric} />}
            {tab === 'deserts'    && <ProviderDeserts data={data} />}
          </>
        )}
      </div>
    </div>
  )
}
