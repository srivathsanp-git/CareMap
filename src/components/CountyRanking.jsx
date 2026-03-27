import { useState, useMemo } from 'react'
import { Trophy, TrendingUp, Target, ChevronUp, ChevronDown, Search } from 'lucide-react'
import { iowaCounties, computeRankingScores, needLabel, accessLabel, opportunityLabel } from '../data/iowaCounties'

// Pre-compute scores for all 99 counties once
const RANKED = iowaCounties.map(c => ({ ...c, scores: computeRankingScores(c) }))

const SORT_DIMS = [
  { id: 'opportunity', label: 'Investment Opportunity', icon: Target,    desc: 'High need + low access = where to invest' },
  { id: 'need',        label: 'Health Need',            icon: TrendingUp, desc: 'Disease burden + poverty + uninsured' },
  { id: 'access',      label: 'Care Access',            icon: Trophy,     desc: 'Provider density + shortage designations' },
]

function ScoreBadge({ score, labelFn }) {
  const { text, cls } = labelFn(score)
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>
      {text}
    </span>
  )
}

function ScoreBar({ value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-700 w-6 text-right">{value}</span>
    </div>
  )
}

const HIGHLIGHT_COUNTIES = {
  top_opportunity: 'Top 10 Opportunity',
  top_need:        'Highest Need',
  best_access:     'Best Access',
}

export default function CountyRanking() {
  const [sortDim, setSortDim]   = useState('opportunity')
  const [sortAsc, setSortAsc]   = useState(false)
  const [search, setSearch]     = useState('')
  const [highlight, setHighlight] = useState(null)

  const sorted = useMemo(() => {
    let rows = [...RANKED]
    if (search) rows = rows.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    rows.sort((a, b) => {
      const av = a.scores[sortDim], bv = b.scores[sortDim]
      return sortAsc ? av - bv : bv - av
    })
    return rows
  }, [sortDim, sortAsc, search])

  // Summary stats
  const top5opp  = [...RANKED].sort((a,b) => b.scores.opportunity - a.scores.opportunity).slice(0, 5)
  const top5need = [...RANKED].sort((a,b) => b.scores.need        - a.scores.need       ).slice(0, 5)
  const top5acc  = [...RANKED].sort((a,b) => b.scores.access      - a.scores.access     ).slice(0, 5)

  function toggleSort(dim) {
    if (sortDim === dim) setSortAsc(!sortAsc)
    else { setSortDim(dim); setSortAsc(false) }
  }

  const isHighlighted = (county) => {
    if (!highlight) return false
    if (highlight === 'top_opportunity') return top5opp.some(c => c.fips === county.fips)
    if (highlight === 'top_need')        return top5need.some(c => c.fips === county.fips)
    if (highlight === 'best_access')     return top5acc.some(c => c.fips === county.fips)
    return false
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-slate-900">County Rankings Dashboard</h2>
          </div>
          <p className="text-slate-500 text-sm max-w-2xl">
            All 99 Iowa counties ranked by composite scores. Identifies where healthcare systems should
            invest — combining disease burden, social determinants, provider supply, and shortage designations.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: 'top_opportunity', icon: '🎯', title: 'Top Investment Opportunities', color: 'border-red-200 bg-red-50',   counties: top5opp,  scoreKey: 'opportunity', textColor: 'text-red-700' },
            { key: 'top_need',        icon: '⚠️',  title: 'Highest Health Need',          color: 'border-orange-200 bg-orange-50', counties: top5need, scoreKey: 'need',        textColor: 'text-orange-700' },
            { key: 'best_access',     icon: '✅',  title: 'Best Care Access',             color: 'border-green-200 bg-green-50',  counties: top5acc,  scoreKey: 'access',      textColor: 'text-green-700' },
          ].map(card => (
            <button
              key={card.key}
              onClick={() => setHighlight(highlight === card.key ? null : card.key)}
              className={`text-left rounded-2xl border-2 p-4 transition-all ${card.color} ${highlight === card.key ? 'ring-2 ring-blue-400 ring-offset-1' : 'hover:shadow-md'}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{card.icon}</span>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{card.title}</span>
              </div>
              <div className="space-y-1.5">
                {card.counties.map((c, i) => (
                  <div key={c.fips} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">
                      <span className="text-slate-400 text-xs mr-1.5">#{i+1}</span>
                      {c.name}
                    </span>
                    <span className={`text-sm font-extrabold ${card.textColor}`}>{c.scores[card.scoreKey]}</span>
                  </div>
                ))}
              </div>
              {highlight === card.key && (
                <p className="text-xs text-blue-600 font-medium mt-3">↑ Highlighted in table below</p>
              )}
            </button>
          ))}
        </div>

        {/* Methodology note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 flex items-start gap-2">
          <span className="flex-shrink-0 font-bold">ℹ</span>
          <span>
            <strong>Scores (0–100):</strong>&ensp;
            <strong>Need</strong> = disease burden (CDC PLACES) + poverty + uninsured (ACS) · &ensp;
            <strong>Access</strong> = provider density + HRSA shortage designations · &ensp;
            <strong>Opportunity</strong> = high need + low access → where investment is most critical
          </span>
        </div>

        {/* Table controls */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {SORT_DIMS.map(dim => {
                const Icon = dim.icon
                return (
                  <button
                    key={dim.id}
                    onClick={() => toggleSort(dim.id)}
                    title={dim.desc}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      sortDim === dim.id
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {dim.label}
                    {sortDim === dim.id && (sortAsc
                      ? <ChevronUp className="w-3 h-3" />
                      : <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )
              })}
            </div>
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter counties…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 w-8">#</th>
                  <th className="text-left px-4 py-3">County</th>
                  <th className="text-right px-4 py-3">Pop</th>
                  <th className="px-4 py-3 min-w-[140px]">
                    <button onClick={() => toggleSort('need')} className="flex items-center gap-1 ml-auto hover:text-blue-600">
                      Need Score {sortDim==='need' && (sortAsc ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}
                    </button>
                  </th>
                  <th className="px-4 py-3 min-w-[140px]">
                    <button onClick={() => toggleSort('access')} className="flex items-center gap-1 ml-auto hover:text-blue-600">
                      Access Score {sortDim==='access' && (sortAsc ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}
                    </button>
                  </th>
                  <th className="px-4 py-3 min-w-[160px]">
                    <button onClick={() => toggleSort('opportunity')} className="flex items-center gap-1 ml-auto hover:text-blue-600">
                      Opportunity {sortDim==='opportunity' && (sortAsc ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Shortage</th>
                  <th className="text-right px-4 py-3 hidden lg:table-cell">Density/1k</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((county, idx) => {
                  const hl = isHighlighted(county)
                  const { need, access, opportunity } = county.scores
                  const totalShortage = county.pcShortage + county.mhShortage + county.dentalShortage

                  return (
                    <tr
                      key={county.fips}
                      className={`border-t border-slate-100 transition-colors ${
                        hl ? 'bg-blue-50 border-blue-100' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      } hover:bg-blue-50/60`}
                    >
                      <td className="px-4 py-3 text-slate-400 text-xs font-medium">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">{county.name}</span>
                        {hl && <span className="ml-2 text-[9px] text-blue-600 font-bold uppercase tracking-wide">★ highlight</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 text-xs">{(county.pop/1000).toFixed(0)}k</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-end">
                          <ScoreBadge score={need} labelFn={needLabel} />
                          <ScoreBar value={need} color={need >= 65 ? 'bg-red-500' : need >= 50 ? 'bg-orange-400' : 'bg-green-400'} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-end">
                          <ScoreBadge score={access} labelFn={accessLabel} />
                          <ScoreBar value={access} color={access >= 55 ? 'bg-green-500' : access >= 35 ? 'bg-yellow-400' : 'bg-red-500'} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-end">
                          <ScoreBadge score={opportunity} labelFn={opportunityLabel} />
                          <ScoreBar value={opportunity} color={opportunity >= 65 ? 'bg-red-500' : opportunity >= 50 ? 'bg-orange-400' : 'bg-blue-400'} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          totalShortage >= 5 ? 'bg-red-100 text-red-700'
                          : totalShortage >= 3 ? 'bg-orange-100 text-orange-700'
                          : totalShortage >= 1 ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                        }`}>
                          {totalShortage}/6
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-slate-600 hidden lg:table-cell">
                        {county.providerDensity.toFixed(1)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">Showing {sorted.length} of 99 counties</p>
            <p className="text-xs text-slate-400">Shortage: sum of PC + MH + Dental designations (max 6) · Density: providers per 1,000</p>
          </div>
        </div>
      </div>
    </div>
  )
}
