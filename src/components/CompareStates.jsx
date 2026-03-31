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
import { fetchStatePlaces, METRIC_THRESHOLDS, metricColor } from '../utils/cdcPlaces'
import { STATE_STATIC } from '../utils/nationalData'

// ── Unified metric definitions ────────────────────────────────────────────────
// type: 'places' = from CDC PLACES API, 'static' = from nationalData.js
// higherIsBetter: affects color scale direction
// showOnMap: whether this metric can be choropleth-mapped (skip boolean)
// unit: '%' | 'yr' | '$k' | 'bool'

export const ALL_METRICS = [
  // ── CDC PLACES (prevalence — lower = better) ─────────────────────────────
  { id: 'DIABETES',   label: 'Diabetes',           type: 'places', unit: '%',  higherIsBetter: false, showOnMap: true,  desc: 'Adults with diabetes',                    source: 'CDC PLACES 2023' },
  { id: 'OBESITY',    label: 'Obesity',             type: 'places', unit: '%',  higherIsBetter: false, showOnMap: true,  desc: 'Adults with obesity',                     source: 'CDC PLACES 2023' },
  { id: 'CSMOKING',   label: 'Smoking',             type: 'places', unit: '%',  higherIsBetter: false, showOnMap: true,  desc: 'Current smokers',                         source: 'CDC PLACES 2023' },
  { id: 'MHLTH',      label: 'Poor Mental Health',  type: 'places', unit: '%',  higherIsBetter: false, showOnMap: true,  desc: 'Mental health not good 14+ days/mo',      source: 'CDC PLACES 2023' },
  { id: 'ACCESS2',    label: 'Uninsured',           type: 'places', unit: '%',  higherIsBetter: false, showOnMap: true,  desc: 'Adults without health insurance',          source: 'CDC PLACES 2023' },
  { id: 'BPHIGH',     label: 'High Blood Pressure', type: 'places', unit: '%',  higherIsBetter: false, showOnMap: true,  desc: 'Adults with high blood pressure',          source: 'CDC PLACES 2023' },
  { id: 'CHD',        label: 'Heart Disease',       type: 'places', unit: '%',  higherIsBetter: false, showOnMap: true,  desc: 'Coronary heart disease',                  source: 'CDC PLACES 2023' },
  { id: 'CASTHMA',    label: 'Asthma',              type: 'places', unit: '%',  higherIsBetter: false, showOnMap: true,  desc: 'Current asthma',                          source: 'CDC PLACES 2023' },
  { id: 'DEPRESSION', label: 'Depression',          type: 'places', unit: '%',  higherIsBetter: false, showOnMap: true,  desc: 'Adults with depression',                  source: 'CDC PLACES 2023' },
  { id: 'LPA',        label: 'Physical Inactivity', type: 'places', unit: '%',  higherIsBetter: false, showOnMap: true,  desc: 'Adults with no leisure-time physical activity', source: 'CDC PLACES 2023' },
  { id: 'BINGE',      label: 'Binge Drinking',      type: 'places', unit: '%',  higherIsBetter: false, showOnMap: true,  desc: 'Adults reporting binge drinking',          source: 'CDC PLACES 2023' },
  { id: 'SLEEP',      label: 'Insufficient Sleep',  type: 'places', unit: '%',  higherIsBetter: false, showOnMap: true,  desc: 'Adults sleeping <7 hours',                source: 'CDC PLACES 2023' },
  // ── Static / Census data ─────────────────────────────────────────────────
  { id: 'lifeExp',       label: 'Life Expectancy',    type: 'static', unit: 'yr', higherIsBetter: true,  showOnMap: true,  desc: 'Average life expectancy at birth',        source: 'CDC NCHS 2021',          thresholds: { low: 73, high: 79 } },
  { id: 'medianIncome',  label: 'Median Income',      type: 'static', unit: '$k', higherIsBetter: true,  showOnMap: true,  desc: 'Median household income (thousands)',      source: 'Census ACS 2022',        thresholds: { low: 50000, high: 80000 } },
  { id: 'povertyRate',   label: 'Poverty Rate',       type: 'static', unit: '%',  higherIsBetter: false, showOnMap: true,  desc: 'Persons below poverty line',              source: 'Census ACS 2022',        thresholds: { low: 9, high: 17 } },
  { id: 'medicaidExpanded', label: 'Medicaid Expanded', type: 'static', unit: 'bool', higherIsBetter: true, showOnMap: false, desc: 'State adopted ACA Medicaid expansion',  source: 'KFF State Health Facts 2024' },
]

// Subsets
const MAP_METRICS       = ALL_METRICS.filter(m => m.showOnMap)
const PLACES_METRICS    = ALL_METRICS.filter(m => m.type === 'places')

const TABS = [
  { id: 'scorecard',  label: 'State Scorecard',  icon: BarChart2     },
  { id: 'headtohead', label: 'Head-to-Head',      icon: BarChart2     },
  { id: 'map',        label: 'National Map',      icon: Map           },
  { id: 'deserts',    label: 'Provider Deserts',  icon: AlertTriangle },
]

// ── Color helpers ─────────────────────────────────────────────────────────────
const CHORO_COLORS = ['#22c55e','#86efac','#fde68a','#fbbf24','#f97316','#ef4444','#991b1b']

function getThresholds(metric) {
  // For PLACES metrics, use METRIC_THRESHOLDS from cdcPlaces.js
  if (metric.type === 'places') return METRIC_THRESHOLDS[metric.id] || { low: 0, high: 100 }
  return metric.thresholds || { low: 0, high: 100 }
}

function choroColor(value, metric) {
  if (value == null) return '#e5e7eb'
  const { low, high } = getThresholds(metric)
  let t = Math.max(0, Math.min(1, (value - low) / (high - low)))
  if (metric.higherIsBetter) t = 1 - t   // invert: high value → green side
  const idx = Math.min(Math.floor(t * CHORO_COLORS.length), CHORO_COLORS.length - 1)
  return CHORO_COLORS[idx]
}

function valueBadgeVariant(value, metric) {
  const { low, high } = getThresholds(metric)
  let t = (value - low) / (high - low)
  if (metric.higherIsBetter) t = 1 - t
  if (t < 0.33) return 'success'
  if (t < 0.66) return 'warning'
  return 'danger'
}

function formatValue(value, unit) {
  if (value == null) return '—'
  if (unit === '%')   return `${value.toFixed(1)}%`
  if (unit === 'yr')  return `${value.toFixed(1)} yr`
  if (unit === '$k')  return `$${(value / 1000).toFixed(0)}k`
  if (unit === 'bool') return value ? 'Yes' : 'No'
  return String(value)
}

function careGapScore(stateData) {
  const a = stateData?.ACCESS2   || 0
  const d = stateData?.DIABETES  || 0
  const o = stateData?.OBESITY   || 0
  const m = stateData?.MHLTH     || 0
  return Math.round(((a/18)*30) + ((d/15)*25) + ((o/42)*25) + ((m/18)*20))
}

function rankStates(data, metricId) {
  const metric = ALL_METRICS.find(m => m.id === metricId)
  const asc = metric ? !metric.higherIsBetter : true
  const entries = Object.entries(data)
    .filter(([, d]) => d[metricId] != null)
    .sort((a, b) => asc ? a[1][metricId] - b[1][metricId] : b[1][metricId] - a[1][metricId])
  return Object.fromEntries(entries.map(([abbr], i) => [abbr, i + 1]))
}

// ── GeoJSON property name → state abbr ───────────────────────────────────────
const GEO_NAME_TO_ABBR = { ...NAME_TO_ABBR, 'District of Columbia': 'DC' }

// ── Scorecard ─────────────────────────────────────────────────────────────────
function Scorecard({ merged }) {
  const [sortId,  setSortId]  = useState('DIABETES')
  const [sortAsc, setSortAsc] = useState(true)
  const [search,  setSearch]  = useState('')

  const sortMetric = ALL_METRICS.find(m => m.id === sortId) || ALL_METRICS[0]
  const ranks = rankStates(merged, sortId)

  const rows = Object.entries(merged)
    .filter(([abbr]) => {
      const st = US_STATES.find(s => s.abbr === abbr)
      if (!st) return false
      return !search || st.name.toLowerCase().includes(search.toLowerCase()) || abbr.toLowerCase().includes(search.toLowerCase())
    })
    .sort((a, b) => {
      const av = a[1][sortId] ?? (sortAsc ? 999 : -999)
      const bv = b[1][sortId] ?? (sortAsc ? 999 : -999)
      return sortAsc ? av - bv : bv - av
    })

  function toggleSort(id) {
    const m = ALL_METRICS.find(x => x.id === id)
    if (sortId === id) setSortAsc(!sortAsc)
    else { setSortId(id); setSortAsc(!m?.higherIsBetter) } // default: lower=worse for negative metrics
  }

  // Group metrics for header display
  const metricGroups = [
    { label: 'CDC PLACES 2023', cols: PLACES_METRICS },
    { label: 'Population Health', cols: ALL_METRICS.filter(m => m.type === 'static') },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <p className="text-sm text-muted-foreground">All 50 states ranked. Click a column header to sort.</p>
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter states…" className="pl-8" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            {/* Group row */}
            <tr className="bg-muted/30 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <th className="text-left px-4 py-2 sticky left-0 bg-muted/30 min-w-[130px]" />
              {metricGroups.map(g => (
                <th key={g.label} colSpan={g.cols.length} className="text-center px-2 py-2 border-l border-border/50">
                  {g.label}
                </th>
              ))}
            </tr>
            {/* Column header row */}
            <tr className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <th className="text-left px-4 py-3 sticky left-0 bg-muted/50">State</th>
              {ALL_METRICS.map(m => (
                <th key={m.id} className="px-3 py-3 min-w-[100px]">
                  <button
                    onClick={() => toggleSort(m.id)}
                    className={['flex items-center gap-1 mx-auto hover:text-foreground transition-colors', sortId === m.id ? 'text-primary' : ''].join(' ')}
                    title={m.desc}
                  >
                    <span className="text-center leading-tight">{m.label}</span>
                    {sortId === m.id && (sortAsc ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />)}
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
                      <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[80px]">{st?.name}</span>
                    </div>
                  </td>
                  {ALL_METRICS.map(m => {
                    const val = d[m.id]
                    if (m.unit === 'bool') {
                      return (
                        <td key={m.id} className="px-3 py-2.5 text-center">
                          <Badge variant={val ? 'success' : 'secondary'} className="text-[10px]">
                            {val ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                      )
                    }
                    return (
                      <td key={m.id} className="px-3 py-2.5 text-right">
                        {val != null ? (
                          <Badge variant={valueBadgeVariant(val, m)} className="text-xs">
                            {formatValue(val, m.unit)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Source attribution */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground justify-center pt-1">
        <span>CDC PLACES 2023 — county-level health prevalence, aggregated by state</span>
        <span>·</span>
        <span>CDC NCHS 2021 — life expectancy at birth</span>
        <span>·</span>
        <span>Census ACS 2022 — income &amp; poverty</span>
        <span>·</span>
        <span>KFF State Health Facts 2024 — Medicaid expansion status</span>
      </div>
    </div>
  )
}

// ── Head-to-Head ──────────────────────────────────────────────────────────────
function HeadToHead({ merged }) {
  const [stateA, setStateA] = useState('IA')
  const [stateB, setStateB] = useState('MN')

  const dA = merged[stateA]
  const dB = merged[stateB]

  return (
    <div className="space-y-5">
      {/* State selectors */}
      <div className="flex gap-3 flex-wrap items-center">
        {[{ label: 'State A', val: stateA, set: setStateA }, { label: 'State B', val: stateB, set: setStateB }].map(({ label, val, set }, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground font-bold">vs</span>}
            <span className="text-sm font-medium text-foreground">{label}:</span>
            <select
              value={val}
              onChange={e => set(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.abbr} — {s.name}</option>)}
            </select>
          </div>
        ))}
      </div>

      {dA && dB && (
        <div className="space-y-3">
          {ALL_METRICS.map(m => {
            const vA = dA[m.id]
            const vB = dB[m.id]
            if (vA == null && vB == null) return null

            // Boolean metric: show side-by-side badge
            if (m.unit === 'bool') {
              return (
                <Card key={m.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-sm text-foreground">{m.label}</span>
                      <span className="text-xs text-muted-foreground">{m.desc}</span>
                    </div>
                    <div className="flex gap-6">
                      {[{ abbr: stateA, v: vA }, { abbr: stateB, v: vB }].map(({ abbr, v }) => (
                        <div key={abbr} className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold w-8 text-foreground">{abbr}</span>
                          <Badge variant={v ? 'success' : 'secondary'}>{v ? 'Expanded' : 'Not Expanded'}</Badge>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Source: {m.source}</p>
                  </CardContent>
                </Card>
              )
            }

            // Numeric metric: horizontal bar
            const { low, high } = getThresholds(m)
            const maxV = m.unit === '$k'
              ? Math.max(vA || 0, vB || 0, high)
              : Math.max(vA || 0, vB || 0, high)
            // For higher-is-better, winner has higher value; otherwise lower value
            const winner = vA != null && vB != null
              ? (m.higherIsBetter
                  ? (vA > vB ? stateA : vA < vB ? stateB : 'tie')
                  : (vA < vB ? stateA : vA > vB ? stateB : 'tie'))
              : null

            return (
              <Card key={m.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm text-foreground">{m.label}</span>
                    <span className="text-xs text-muted-foreground">{m.desc}</span>
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
                              backgroundColor: v != null ? choroColor(v, m) : '#e5e7eb',
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-16 text-right text-foreground">
                          {formatValue(v, m.unit)}
                        </span>
                        {winner === abbr && <Badge variant="success" className="text-[10px]">Better</Badge>}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Source: {m.source}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Source footer */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1 border-t border-border">
        <span>CDC PLACES 2023 · CDC NCHS 2021 · Census ACS 2022 · KFF 2024</span>
      </div>
    </div>
  )
}

// ── National Map ──────────────────────────────────────────────────────────────
function NationalMap({ merged, measureId, onMeasureChange }) {
  const [geoJson,  setGeoJson]  = useState(null)
  const [geoError, setGeoError] = useState(null)

  const metric = MAP_METRICS.find(m => m.id === measureId) || MAP_METRICS[0]

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(setGeoJson)
      .catch(e => setGeoError(e.message))
  }, [])

  function featureStyle(feature) {
    const stateName = feature.properties.name || feature.properties.NAME || ''
    const abbr  = GEO_NAME_TO_ABBR[stateName]
    const value = abbr && merged[abbr] ? merged[abbr][measureId] : null
    return {
      fillColor:   choroColor(value, metric),
      fillOpacity: 0.75,
      color:       '#fff',
      weight:      1.5,
    }
  }

  function onEachFeature(feature, layer) {
    const stateName = feature.properties.name || feature.properties.NAME || ''
    const abbr  = GEO_NAME_TO_ABBR[stateName]
    const value = abbr && merged[abbr] ? merged[abbr][measureId] : null
    const color = choroColor(value, metric)
    const tooltipHtml = `
      <div style="font-family:sans-serif;line-height:1.4;min-width:150px">
        <div style="font-weight:700;font-size:13px;margin-bottom:3px">${stateName}</div>
        <div style="font-size:11px;color:#6b7280;margin-bottom:2px">${metric.label}</div>
        <div style="font-size:16px;font-weight:800;color:${value != null ? color : '#9ca3af'}">
          ${value != null ? formatValue(value, metric.unit) : 'No data'}
        </div>
        <div style="font-size:10px;color:#9ca3af;margin-top:4px">${metric.source}</div>
      </div>
    `
    layer.bindTooltip(tooltipHtml, { sticky: true, opacity: 0.97, className: 'caremap-tooltip' })
    layer.on({
      mouseover: () => layer.setStyle({ weight: 3, fillOpacity: 0.95 }),
      mouseout:  () => layer.setStyle(featureStyle(feature)),
    })
  }

  // Group metric selector pills
  const mapMetricGroups = [
    { label: 'CDC PLACES', metrics: MAP_METRICS.filter(m => m.type === 'places') },
    { label: 'Population Health', metrics: MAP_METRICS.filter(m => m.type === 'static') },
  ]

  return (
    <div className="space-y-4">
      {/* Metric selector grouped by source */}
      {mapMetricGroups.map(g => (
        <div key={g.label} className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{g.label}</p>
          <div className="flex flex-wrap gap-2">
            {g.metrics.map(m => (
              <button
                key={m.id}
                onClick={() => onMeasureChange(m.id)}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  measureId === m.id
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                ].join(' ')}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{metric.higherIsBetter ? 'Worse' : 'Better'}</span>
        {CHORO_COLORS.map((c, i) => <div key={i} className="h-4 w-6 rounded" style={{ backgroundColor: c }} />)}
        <span>{metric.higherIsBetter ? 'Better' : 'Worse'}</span>
        <div className="ml-4 h-4 w-6 rounded bg-[#e5e7eb]" />
        <span>No data</span>
      </div>

      <div className="rounded-xl overflow-hidden border border-border" style={{ height: '520px' }}>
        {geoError ? (
          <div className="h-full flex items-center justify-center bg-muted/20">
            <p className="text-sm text-destructive">Failed to load map: {geoError}</p>
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
              key={`${measureId}-${Object.keys(merged).length}`}
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

      <p className="text-xs text-muted-foreground text-center">Source: {metric.source}</p>
    </div>
  )
}

// ── Provider Deserts ──────────────────────────────────────────────────────────
function ProviderDeserts({ merged }) {
  const [sortAsc, setSortAsc] = useState(false)

  const ranked = US_STATES
    .map(st => ({
      ...st,
      d:         merged[st.abbr],
      gap:       careGapScore(merged[st.abbr]),
      uninsured: merged[st.abbr]?.ACCESS2,
      diabetes:  merged[st.abbr]?.DIABETES,
      mhlth:     merged[st.abbr]?.MHLTH,
      lifeExp:   merged[st.abbr]?.lifeExp,
      poverty:   merged[st.abbr]?.povertyRate,
    }))
    .filter(s => s.d)
    .sort((a, b) => sortAsc ? a.gap - b.gap : b.gap - a.gap)

  const worst5 = [...ranked].sort((a, b) => b.gap - a.gap).slice(0, 5)
  const best5  = [...ranked].sort((a, b) => a.gap - b.gap).slice(0, 5)

  const lifeExpMetric   = ALL_METRICS.find(m => m.id === 'lifeExp')
  const povertyMetric   = ALL_METRICS.find(m => m.id === 'povertyRate')
  const uninsuredMetric = ALL_METRICS.find(m => m.id === 'ACCESS2')
  const diabetesMetric  = ALL_METRICS.find(m => m.id === 'DIABETES')
  const mhlthMetric     = ALL_METRICS.find(m => m.id === 'MHLTH')

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

      {/* Full ranked table */}
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
                <th className="text-right px-4 py-3">Mental Health</th>
                <th className="text-right px-4 py-3">Life Exp.</th>
                <th className="text-right px-4 py-3">Poverty</th>
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
                    {s.uninsured != null ? <Badge variant={valueBadgeVariant(s.uninsured, uninsuredMetric)} className="text-xs">{s.uninsured.toFixed(1)}%</Badge> : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {s.diabetes != null ? <Badge variant={valueBadgeVariant(s.diabetes, diabetesMetric)} className="text-xs">{s.diabetes.toFixed(1)}%</Badge> : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {s.mhlth != null ? <Badge variant={valueBadgeVariant(s.mhlth, mhlthMetric)} className="text-xs">{s.mhlth.toFixed(1)}%</Badge> : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {s.lifeExp != null ? <Badge variant={valueBadgeVariant(s.lifeExp, lifeExpMetric)} className="text-xs">{s.lifeExp.toFixed(1)} yr</Badge> : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {s.poverty != null ? <Badge variant={valueBadgeVariant(s.poverty, povertyMetric)} className="text-xs">{s.poverty.toFixed(1)}%</Badge> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Source attribution */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1 border-t border-border">
        <span>Care Gap Score: CDC PLACES 2023 (uninsured, diabetes, obesity, mental health)</span>
        <span>·</span>
        <span>Life Expectancy: CDC NCHS 2021</span>
        <span>·</span>
        <span>Poverty: Census ACS 2022</span>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CompareStates() {
  const [tab,       setTab]       = useState('scorecard')
  const [mapMetric, setMapMetric] = useState('DIABETES')
  const [placesData, setPlacesData] = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    fetchStatePlaces()
      .then(setPlacesData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Merge CDC PLACES data with static data
  const merged = placesData
    ? Object.fromEntries(
        Object.entries(placesData).map(([abbr, d]) => [
          abbr,
          { ...d, ...(STATE_STATIC[abbr] || {}) },
        ])
      )
    : null

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
            Compare health outcomes across all 50 states · 16 metrics · CDC PLACES 2023 · Census ACS 2022 · CDC NCHS 2021 · KFF 2024
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

        {merged && !loading && (
          <>
            {tab === 'scorecard'  && <Scorecard   merged={merged} />}
            {tab === 'headtohead' && <HeadToHead  merged={merged} />}
            {tab === 'map'        && <NationalMap merged={merged} measureId={mapMetric} onMeasureChange={setMapMetric} />}
            {tab === 'deserts'    && <ProviderDeserts merged={merged} />}
          </>
        )}
      </div>
    </div>
  )
}
