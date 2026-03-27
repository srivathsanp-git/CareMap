import { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronDown, BarChart2 } from 'lucide-react'
import { iowaCounties, IOWA_AVERAGES, computeNeedScore, computeRankingScores } from '../data/iowaCounties'
import HealthMetricCard from './HealthMetricCard'
import NeedAccessScore from './NeedAccessScore'
import SDOHProfile from './SDOHProfile'
import ShortageIndicators from './ShortageIndicators'
import AffordabilityCard from './AffordabilityCard'
import OpportunityScore from './OpportunityScore'
import BestNextAction from './BestNextAction'
import MaternalHealth from './MaternalHealth'
import CancerInsights from './CancerInsights'

const SORTED = [...iowaCounties].sort((a, b) => a.name.localeCompare(b.name))

const TABS = [
  { id: 'health',       label: '🩺 Health Indicators' },
  { id: 'sdoh',         label: '🏘️ Social Factors' },
  { id: 'access',       label: '🏥 Access & Shortage' },
  { id: 'affordability',label: '💰 Affordability' },
  { id: 'opportunity',  label: '🎯 Opportunity' },
  { id: 'mch',          label: '👶 Maternal & Child' },
  { id: 'cancer',       label: '🧬 Cancer Insights' },
]

function estimateProviderAccess(county) {
  if (county.pop > 200000) return 30
  if (county.pop > 100000) return 22
  if (county.pop > 50000)  return 14
  if (county.pop > 20000)  return 7
  if (county.pop > 10000)  return 4
  return 2
}

export default function CountyHealth() {
  const [selected, setSelected]   = useState(null)
  const [open, setOpen]           = useState(false)
  const [query, setQuery]         = useState('')
  const [score, setScore]         = useState(null)
  const [activeTab, setActiveTab] = useState('health')
  const dropdownRef               = useRef(null)

  useEffect(() => {
    if (!selected) { setScore(null); return }
    const providers = estimateProviderAccess(selected)
    setScore(computeNeedScore(selected, providers))
  }, [selected])

  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = SORTED.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))

  const QUICK_PICKS = ['Polk', 'Johnson', 'Story', 'Appanoose', 'Decatur', 'Woodbury', 'Dallas', 'Ringgold']

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-slate-900">County Health Profile</h2>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Full SDOH-aware health profile for any Iowa county — health indicators, social factors,
            shortage designations, and affordability. Data: CDC PLACES 2023, ACS 2022, HRSA 2023, CMS 2024.
          </p>

          {/* County selector */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div ref={dropdownRef} className="relative w-full sm:w-72">
              <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-left font-medium text-slate-800 text-sm hover:border-blue-400 transition-colors"
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
                        onClick={() => { setSelected(county); setOpen(false); setQuery(''); setActiveTab('health') }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between ${selected?.fips === county.fips ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}
                      >
                        <span>{county.name}</span>
                        <span className="text-xs text-slate-400">{county.pop.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selected && (
              <div className="text-sm text-slate-500 flex gap-3">
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
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-blue-300" />
            </div>
            <p className="text-slate-500 font-medium text-lg mb-2">Select a county to view full health profile</p>
            <p className="text-slate-400 text-sm mb-8">Health indicators · Social determinants · Shortage areas · Affordability</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PICKS.map(name => {
                const c = SORTED.find(x => x.name === name)
                return c ? (
                  <button key={name} onClick={() => setSelected(c)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-sm text-slate-700 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors font-medium">
                    {name}
                  </button>
                ) : null
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* County headline + ranking scores */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">{selected.name} County</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Pop: <strong className="text-slate-600">{selected.pop.toLocaleString()}</strong>
                    &ensp;·&ensp;FIPS: {selected.fips}
                  </p>
                </div>
                {/* Composite scores */}
                {(() => {
                  const scores = computeRankingScores(selected)
                  return (
                    <div className="flex gap-3">
                      {[
                        { label: 'Need',        value: scores.need,        colors: scores.need >= 60 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800' },
                        { label: 'Access',      value: scores.access,      colors: scores.access >= 55 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' },
                        { label: 'Opportunity', value: scores.opportunity, colors: scores.opportunity >= 60 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700' },
                      ].map(s => (
                        <div key={s.label} className={`text-center px-4 py-2 rounded-xl ${s.colors}`}>
                          <p className="text-xl font-extrabold">{s.value}</p>
                          <p className="text-[10px] font-semibold uppercase tracking-wide">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
              {/* Quick picks row */}
              <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-slate-100">
                {QUICK_PICKS.filter(n => n !== selected.name).slice(0, 6).map(name => {
                  const c = SORTED.find(x => x.name === name)
                  return c ? (
                    <button key={name} onClick={() => setSelected(c)}
                      className="px-2.5 py-1 bg-slate-100 text-xs text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors">
                      {name}
                    </button>
                  ) : null
                })}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex overflow-x-auto border-b border-slate-100">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {activeTab === 'health' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <HealthMetricCard metric="diabetes"     value={selected.diabetes}     iowaAvg={IOWA_AVERAGES.diabetes} />
                      <HealthMetricCard metric="obesity"      value={selected.obesity}      iowaAvg={IOWA_AVERAGES.obesity} />
                      <HealthMetricCard metric="smoking"      value={selected.smoking}      iowaAvg={IOWA_AVERAGES.smoking} />
                      <HealthMetricCard metric="mentalHealth" value={selected.mentalHealth} iowaAvg={IOWA_AVERAGES.mentalHealth} />
                    </div>
                    {score && <NeedAccessScore score={score} county={selected} />}
                    {/* Quick comparison table */}
                    <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            <th className="text-left px-5 py-3">Metric</th>
                            <th className="text-right px-5 py-3">{selected.name}</th>
                            <th className="text-right px-5 py-3">Iowa Avg</th>
                            <th className="text-right px-5 py-3">Diff</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key:'diabetes',     label:'Diabetes',           val:selected.diabetes,     avg:IOWA_AVERAGES.diabetes },
                            { key:'obesity',      label:'Obesity',            val:selected.obesity,      avg:IOWA_AVERAGES.obesity },
                            { key:'smoking',      label:'Smoking',            val:selected.smoking,      avg:IOWA_AVERAGES.smoking },
                            { key:'mentalHealth', label:'Poor Mental Health', val:selected.mentalHealth, avg:IOWA_AVERAGES.mentalHealth },
                          ].map((row, i) => {
                            const diff = row.val - row.avg
                            return (
                              <tr key={row.key} className={`border-t border-slate-200 ${i%2===0?'bg-white':'bg-slate-50/50'}`}>
                                <td className="px-5 py-3 text-slate-700 font-medium">{row.label}</td>
                                <td className="px-5 py-3 text-right font-semibold">{row.val.toFixed(1)}%</td>
                                <td className="px-5 py-3 text-right text-slate-500">{row.avg.toFixed(1)}%</td>
                                <td className="px-5 py-3 text-right">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diff > 0.3 ? 'bg-red-100 text-red-700' : diff < -0.3 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
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
                {activeTab === 'sdoh'         && <SDOHProfile         county={selected} />}
                {activeTab === 'access'       && <ShortageIndicators  county={selected} />}
                {activeTab === 'affordability'&& <AffordabilityCard   county={selected} />}
                {activeTab === 'opportunity'  && (
                  <div className="space-y-5">
                    <OpportunityScore county={selected} />
                    <BestNextAction   county={selected} />
                  </div>
                )}
                {activeTab === 'mch'    && <MaternalHealth county={selected} />}
                {activeTab === 'cancer' && <CancerInsights county={selected} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
