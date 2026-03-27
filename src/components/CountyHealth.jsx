import { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronDown, BarChart2 } from 'lucide-react'
import { iowaCounties, IOWA_AVERAGES, computeNeedScore } from '../data/iowaCounties'
import HealthMetricCard from './HealthMetricCard'
import NeedAccessScore from './NeedAccessScore'
import { useNPI } from '../hooks/useNPI'

const SORTED = [...iowaCounties].sort((a, b) => a.name.localeCompare(b.name))

export default function CountyHealth() {
  const [selected, setSelected]   = useState(null)
  const [open, setOpen]           = useState(false)
  const [query, setQuery]         = useState('')
  const [score, setScore]         = useState(null)
  const dropdownRef               = useRef(null)

  // Use provider count from NPI for a representative ZIP in the county
  // For simplicity, we estimate based on population as a proxy
  function estimateProviderAccess(county) {
    // Rough proxy: pop > 100k → 25+, 50k-100k → 15, 20k-50k → 8, <20k → 3
    if (county.pop > 200000) return 30
    if (county.pop > 100000) return 22
    if (county.pop > 50000)  return 14
    if (county.pop > 20000)  return 7
    if (county.pop > 10000)  return 4
    return 2
  }

  useEffect(() => {
    if (!selected) { setScore(null); return }
    const providers = estimateProviderAccess(selected)
    setScore(computeNeedScore(selected, providers))
  }, [selected])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = SORTED.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-slate-900">County Health Snapshot</h2>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Compare key health indicators for any Iowa county against the statewide average.
            Data: CDC PLACES 2023.
          </p>

          {/* County selector */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div ref={dropdownRef} className="relative w-full sm:w-72">
              <button
                onClick={() => setOpen(!open)}
                className="
                  w-full flex items-center justify-between gap-2
                  px-4 py-3 bg-white border-2 border-slate-300 rounded-xl
                  text-left font-medium text-slate-800 text-sm
                  hover:border-blue-400 transition-colors
                "
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {selected ? `${selected.name} County` : 'Select a county…'}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-slate-100">
                    <input
                      autoFocus
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search county…"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filtered.map(county => (
                      <button
                        key={county.fips}
                        onClick={() => { setSelected(county); setOpen(false); setQuery('') }}
                        className={`
                          w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors
                          flex items-center justify-between
                          ${selected?.fips === county.fips ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}
                        `}
                      >
                        <span>{county.name}</span>
                        <span className="text-xs text-slate-400">{county.pop.toLocaleString()} pop</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selected && (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{selected.name} County</span>
                <span>·</span>
                <span>Pop: {selected.pop.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {!selected ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-blue-300" />
            </div>
            <p className="text-slate-500 font-medium text-lg">Select a county to see health data</p>
            <p className="text-slate-400 text-sm mt-2">All 99 Iowa counties available</p>

            {/* Quick picks */}
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {['Polk', 'Linn', 'Johnson', 'Scott', 'Story', 'Black Hawk', 'Appanoose', 'Decatur'].map(name => {
                const c = SORTED.find(x => x.name === name)
                return c ? (
                  <button
                    key={name}
                    onClick={() => setSelected(c)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-sm text-slate-700 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors font-medium"
                  >
                    {name}
                  </button>
                ) : null
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* County headline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">{selected.name} County</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Population: <strong>{selected.pop.toLocaleString()}</strong>
                  &ensp;·&ensp;FIPS: {selected.fips}
                  &ensp;·&ensp;Iowa, United States
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['Polk', 'Linn', 'Johnson', 'Appanoose', 'Decatur'].map(name => {
                  const c = SORTED.find(x => x.name === name)
                  return c && c.fips !== selected.fips ? (
                    <button
                      key={name}
                      onClick={() => setSelected(c)}
                      className="px-3 py-1.5 bg-slate-100 text-xs text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors"
                    >
                      {name}
                    </button>
                  ) : null
                })}
              </div>
            </div>

            {/* Health metric cards */}
            <div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Health Indicators vs Iowa Average
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <HealthMetricCard metric="diabetes"     value={selected.diabetes}     iowaAvg={IOWA_AVERAGES.diabetes} />
                <HealthMetricCard metric="obesity"      value={selected.obesity}      iowaAvg={IOWA_AVERAGES.obesity} />
                <HealthMetricCard metric="smoking"      value={selected.smoking}      iowaAvg={IOWA_AVERAGES.smoking} />
                <HealthMetricCard metric="mentalHealth" value={selected.mentalHealth} iowaAvg={IOWA_AVERAGES.mentalHealth} />
              </div>
            </div>

            {/* Need vs Access */}
            {score && (
              <NeedAccessScore score={score} county={selected} />
            )}

            {/* Iowa comparison table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h4 className="font-semibold text-slate-800">Quick Comparison</h4>
                <p className="text-xs text-slate-400 mt-0.5">County vs Iowa state average</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-5 py-3">Metric</th>
                    <th className="text-right px-5 py-3">{selected.name}</th>
                    <th className="text-right px-5 py-3">Iowa Avg</th>
                    <th className="text-right px-5 py-3">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'diabetes',     label: 'Diabetes',           val: selected.diabetes,     avg: IOWA_AVERAGES.diabetes },
                    { key: 'obesity',      label: 'Obesity',            val: selected.obesity,      avg: IOWA_AVERAGES.obesity },
                    { key: 'smoking',      label: 'Smoking',            val: selected.smoking,      avg: IOWA_AVERAGES.smoking },
                    { key: 'mentalHealth', label: 'Poor Mental Health', val: selected.mentalHealth, avg: IOWA_AVERAGES.mentalHealth },
                  ].map((row, i) => {
                    const diff = row.val - row.avg
                    const isAbove = diff > 0.3
                    const isBelow = diff < -0.3
                    return (
                      <tr key={row.key} className={`border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="px-5 py-3 text-slate-700 font-medium">{row.label}</td>
                        <td className="px-5 py-3 text-right font-semibold text-slate-900">{row.val.toFixed(1)}%</td>
                        <td className="px-5 py-3 text-right text-slate-500">{row.avg.toFixed(1)}%</td>
                        <td className="px-5 py-3 text-right">
                          <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                            isAbove ? 'bg-red-100 text-red-700' :
                            isBelow ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
