import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { iowaCounties, computeRankingScores } from '../data/iowaCounties'
import { computeOpportunity, opportunityTier } from '../utils/healthDerived'

const LAYERS = [
  { id: 'opportunity', label: 'Opportunity',  emoji: '🎯', desc: 'Investment priority: Need × (1–Access/100)' },
  { id: 'need',        label: 'Health Need',  emoji: '⚠️',  desc: 'Disease burden + poverty + uninsured' },
  { id: 'access',      label: 'Care Access',  emoji: '🏥', desc: 'Provider density + shortage designations' },
  { id: 'shortage',    label: 'Shortages',    emoji: '🩺', desc: 'Sum of PC + MH + Dental shortage designations' },
  { id: 'affordability',label: 'Affordability',emoji: '💰', desc: 'ACA benchmark premium vs state avg' },
]

function getLayerValue(county, scores, layer) {
  if (layer === 'opportunity')   return scores.opportunity
  if (layer === 'need')          return scores.need
  if (layer === 'access')        return scores.access
  if (layer === 'shortage')      return (county.pcShortage + county.mhShortage + county.dentalShortage) / 6 * 100
  if (layer === 'affordability') return Math.min(100, Math.max(0, ((county.acaPremium - 300) / 400) * 100))
  return 50
}

function getColor(value, layer) {
  if (layer === 'access') {
    // green = high access (good), red = low access (bad)
    const r = Math.round(255 * (1 - value / 100))
    const g = Math.round(180 * (value / 100))
    return `rgb(${r},${g},40)`
  }
  // For opportunity/need/shortage/affordability: red = high (bad), green = low
  const r = Math.round(220 * (value / 100))
  const g = Math.round(160 * (1 - value / 100))
  return `rgb(${r},${g},40)`
}

function getRadius(value) {
  return 5 + (value / 100) * 12
}

const RANKED = iowaCounties.map(c => {
  const scores = computeRankingScores(c)
  return { ...c, scores }
})

export default function AdvancedMap() {
  const [activeLayer, setActiveLayer] = useState('opportunity')
  const [selected, setSelected]       = useState(null)

  const layerInfo = LAYERS.find(l => l.id === activeLayer)

  const countyData = useMemo(() => RANKED, [])

  const detailScores = selected ? computeRankingScores(selected) : null
  const detailOpp    = selected ? computeOpportunity(detailScores.need, detailScores.access) : null
  const detailTier   = detailOpp !== null ? opportunityTier(detailOpp) : null

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <span>🗺️</span> Iowa Health Map
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">{layerInfo.desc}</p>
            </div>
            {/* Layer toggles */}
            <div className="flex flex-wrap gap-2">
              {LAYERS.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeLayer === layer.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span>{layer.emoji}</span>
                  {layer.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: '520px' }}>
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[42.0, -93.5]}
            zoom={7}
            style={{ height: '100%', width: '100%', minHeight: '520px', background: '#0f172a' }}
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {countyData.map(county => {
              const val = getLayerValue(county, county.scores, activeLayer)
              return (
                <CircleMarker
                  key={county.fips}
                  center={[county.lat, county.lng]}
                  radius={getRadius(val)}
                  pathOptions={{
                    fillColor: getColor(val, activeLayer),
                    fillOpacity: 0.82,
                    color: selected?.fips === county.fips ? '#fff' : 'transparent',
                    weight: selected?.fips === county.fips ? 2 : 0,
                  }}
                  eventHandlers={{ click: () => setSelected(county) }}
                >
                  <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                    <div className="text-xs font-semibold">
                      <strong>{county.name}</strong><br />
                      {layerInfo.label}: {Math.round(val)}
                    </div>
                  </Tooltip>
                </CircleMarker>
              )
            })}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur rounded-xl px-3 py-2 text-xs text-slate-300 z-[1000]">
            <p className="font-semibold mb-1.5">{layerInfo.emoji} {layerInfo.label}</p>
            <div className="flex items-center gap-2">
              {activeLayer === 'access' ? (
                <>
                  <div className="w-16 h-2 rounded-full" style={{ background: 'linear-gradient(to right, rgb(220,0,40), rgb(0,180,40))' }} />
                  <span className="text-[10px]">Poor → Strong</span>
                </>
              ) : (
                <>
                  <div className="w-16 h-2 rounded-full" style={{ background: 'linear-gradient(to right, rgb(0,160,40), rgb(220,0,40))' }} />
                  <span className="text-[10px]">Low → High</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Circle size = magnitude</p>
          </div>
        </div>

        {/* Detail panel */}
        <div className="w-72 bg-slate-800 border-l border-slate-700 overflow-y-auto flex-shrink-0 hidden md:flex flex-col">
          {selected ? (
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-white font-bold text-lg">{selected.name} County</h3>
                <p className="text-slate-400 text-xs">Pop: {selected.pop.toLocaleString()}</p>
              </div>

              {/* Opportunity callout */}
              {detailTier && (
                <div className={`rounded-xl p-3 ${
                  detailTier.color === 'red'    ? 'bg-red-900/50 border border-red-700' :
                  detailTier.color === 'orange' ? 'bg-orange-900/50 border border-orange-700' :
                  detailTier.color === 'yellow' ? 'bg-yellow-900/50 border border-yellow-700' :
                  'bg-green-900/50 border border-green-700'
                }`}>
                  <p className="text-xs font-semibold text-slate-300 mb-0.5">Opportunity Score</p>
                  <p className="text-3xl font-extrabold text-white">{detailOpp}</p>
                  <p className="text-xs mt-1">{detailTier.emoji} {detailTier.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{detailTier.desc}</p>
                </div>
              )}

              {/* Scores */}
              {detailScores && (
                <div className="space-y-2">
                  {[
                    { label: 'Need Score',   value: detailScores.need,   color: 'bg-red-400' },
                    { label: 'Access Score', value: detailScores.access, color: 'bg-green-400' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{s.label}</span>
                        <span className="text-white font-bold">{s.value}</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Key metrics */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Key Metrics</p>
                {[
                  { label: 'Diabetes',      value: `${selected.diabetes}%` },
                  { label: 'Obesity',       value: `${selected.obesity}%` },
                  { label: 'Uninsured',     value: `${selected.uninsured}%` },
                  { label: 'Poverty',       value: `${selected.poverty}%` },
                  { label: 'Provider/1k',   value: selected.providerDensity.toFixed(1) },
                  { label: 'ACA Premium',   value: `$${selected.acaPremium}/mo` },
                ].map(m => (
                  <div key={m.label} className="flex justify-between text-xs">
                    <span className="text-slate-400">{m.label}</span>
                    <span className="text-white font-semibold">{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Shortage */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">HRSA Shortages</p>
                {[
                  { label: 'Primary Care', val: selected.pcShortage },
                  { label: 'Mental Health', val: selected.mhShortage },
                  { label: 'Dental', val: selected.dentalShortage },
                ].map(sh => (
                  <div key={sh.label} className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">{sh.label}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      sh.val === 2 ? 'bg-red-900 text-red-300' :
                      sh.val === 1 ? 'bg-yellow-900 text-yellow-300' :
                      'bg-green-900 text-green-300'
                    }`}>
                      {sh.val === 2 ? 'Full' : sh.val === 1 ? 'Partial' : 'None'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center h-full text-center">
              <span className="text-5xl mb-3">🗺️</span>
              <p className="text-slate-300 font-medium text-sm">Click any county</p>
              <p className="text-slate-500 text-xs mt-1">to see detailed health metrics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
