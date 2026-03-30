import { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronDown, BarChart2 } from 'lucide-react'
import { iowaCounties, IOWA_AVERAGES, computeNeedScore, computeRankingScores } from '../data/iowaCounties'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import HealthMetricCard from './HealthMetricCard'
import NeedAccessScore from './NeedAccessScore'
import SDOHProfile from './SDOHProfile'
import ShortageIndicators from './ShortageIndicators'
import AffordabilityCard from './AffordabilityCard'
import OpportunityScore from './OpportunityScore'
import BestNextAction from './BestNextAction'
import MaternalHealth from './MaternalHealth'
import CancerInsights from './CancerInsights'
import { useAppState } from '../context/StateContext'
import { fetchCountyPlaces, metricColor, METRIC_THRESHOLDS } from '../utils/cdcPlaces'
import { fetchCountyACS, computeNationalNeedScore, computeNationalAccessScore, computeNationalOpportunityScore } from '../utils/censusACS'

const SORTED = [...iowaCounties].sort((a, b) => a.name.localeCompare(b.name))

const TABS = [
  { id: 'health',       label: '🩺 Health'      },
  { id: 'sdoh',         label: '🏘️ Social'      },
  { id: 'access',       label: '🏥 Access'      },
  { id: 'affordability',label: '💰 Affordability'},
  { id: 'opportunity',  label: '🎯 Opportunity' },
  { id: 'mch',          label: '👶 MCH'         },
  { id: 'cancer',       label: '🧬 Cancer'      },
]

function estimateProviderAccess(county) {
  if (county.pop > 200000) return 30
  if (county.pop > 100000) return 22
  if (county.pop > 50000)  return 14
  if (county.pop > 20000)  return 7
  if (county.pop > 10000)  return 4
  return 2
}

const QUICK_PICKS = ['Polk', 'Johnson', 'Story', 'Appanoose', 'Decatur', 'Woodbury', 'Dallas', 'Ringgold']

function IowaCountyHealth() {
  const [selected,   setSelected]   = useState(null)
  const [open,       setOpen]       = useState(false)
  const [query,      setQuery]      = useState('')
  const [score,      setScore]      = useState(null)
  const [activeTab,  setActiveTab]  = useState('health')
  const dropdownRef = useRef(null)

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

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-card px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">County Health Profile</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Full SDOH-aware health profile for any Iowa county. Data: CDC PLACES 2023, ACS 2022, HRSA 2023, CMS 2024.
          </p>

          {/* County selector */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div ref={dropdownRef} className="relative w-full sm:w-72">
              <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border-2 border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {selected ? `${selected.name} County` : 'Select a county…'}
                </div>
                <ChevronDown className={['h-4 w-4 text-muted-foreground transition-transform', open ? 'rotate-180' : ''].join(' ')} />
              </button>

              {open && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <Input
                      autoFocus
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search county…"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filtered.map(county => (
                      <button
                        key={county.fips}
                        onClick={() => { setSelected(county); setOpen(false); setQuery(''); setActiveTab('health') }}
                        className={['w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors flex items-center justify-between', selected?.fips === county.fips ? 'bg-primary/5 text-primary font-semibold' : 'text-foreground'].join(' ')}
                      >
                        <span>{county.name}</span>
                        <span className="text-xs text-muted-foreground">{county.pop.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selected && (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{selected.name} County</span>
                &ensp;·&ensp;Pop: {selected.pop.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {!selected ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Select a county to view its full health profile</p>
            <p className="text-sm text-muted-foreground mb-8">Health indicators · Social determinants · Shortage areas · Affordability</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PICKS.map(name => {
                const c = SORTED.find(x => x.name === name)
                return c ? (
                  <Button key={name} variant="outline" size="sm" onClick={() => setSelected(c)}>
                    {name}
                  </Button>
                ) : null
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* County headline + composite scores */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-extrabold text-foreground">{selected.name} County</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pop: <strong className="text-foreground">{selected.pop.toLocaleString()}</strong>
                      &ensp;·&ensp;FIPS: {selected.fips}
                    </p>
                  </div>
                  {(() => {
                    const scores = computeRankingScores(selected)
                    return (
                      <div className="flex gap-3">
                        {[
                          { label: 'Need',        value: scores.need,        bg: scores.need >= 60        ? 'bg-red-100 text-red-800'    : 'bg-green-100 text-green-800' },
                          { label: 'Access',      value: scores.access,      bg: scores.access >= 55      ? 'bg-green-100 text-green-800': 'bg-red-100 text-red-800'    },
                          { label: 'Opportunity', value: scores.opportunity, bg: scores.opportunity >= 60 ? 'bg-orange-100 text-orange-800':'bg-slate-100 text-slate-700' },
                        ].map(s => (
                          <div key={s.label} className={`text-center rounded-xl px-4 py-2 ${s.bg}`}>
                            <p className="text-xl font-extrabold">{s.value}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-wide">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>

                {/* Quick pick row */}
                <Separator className="mt-4 mb-3" />
                <div className="flex gap-2 flex-wrap">
                  {QUICK_PICKS.filter(n => n !== selected.name).slice(0, 6).map(name => {
                    const c = SORTED.find(x => x.name === name)
                    return c ? (
                      <Button key={name} variant="secondary" size="sm" onClick={() => setSelected(c)}>
                        {name}
                      </Button>
                    ) : null
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card className="overflow-hidden">
              {/* Tab bar */}
              <div className="flex overflow-x-auto border-b border-border">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      'flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                      activeTab === tab.id
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50',
                    ].join(' ')}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <CardContent className="pt-6">
                {activeTab === 'health' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <HealthMetricCard metric="diabetes"     value={selected.diabetes}     iowaAvg={IOWA_AVERAGES.diabetes} />
                      <HealthMetricCard metric="obesity"      value={selected.obesity}      iowaAvg={IOWA_AVERAGES.obesity} />
                      <HealthMetricCard metric="smoking"      value={selected.smoking}      iowaAvg={IOWA_AVERAGES.smoking} />
                      <HealthMetricCard metric="mentalHealth" value={selected.mentalHealth} iowaAvg={IOWA_AVERAGES.mentalHealth} />
                    </div>
                    {score && <NeedAccessScore score={score} county={selected} />}
                    {/* Comparison table */}
                    <Card className="overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                            <th className="text-left px-5 py-3">Metric</th>
                            <th className="text-right px-5 py-3">{selected.name}</th>
                            <th className="text-right px-5 py-3">Iowa Avg</th>
                            <th className="text-right px-5 py-3">Diff</th>
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
                            return (
                              <tr key={row.key} className={['border-t border-border', i % 2 === 0 ? '' : 'bg-muted/20'].join(' ')}>
                                <td className="px-5 py-3 text-foreground font-medium">{row.label}</td>
                                <td className="px-5 py-3 text-right font-semibold">{row.val.toFixed(1)}%</td>
                                <td className="px-5 py-3 text-right text-muted-foreground">{row.avg.toFixed(1)}%</td>
                                <td className="px-5 py-3 text-right">
                                  <Badge variant={diff > 0.3 ? 'danger' : diff < -0.3 ? 'success' : 'secondary'}>
                                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                                  </Badge>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </Card>
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

// ── National county health — full tabbed experience using CDC PLACES + ACS ───
const NAT_HEALTH_METRICS = [
  { id: 'DIABETES',   label: 'Diabetes'           },
  { id: 'OBESITY',    label: 'Obesity'             },
  { id: 'CSMOKING',   label: 'Smoking'             },
  { id: 'MHLTH',      label: 'Poor Mental Health'  },
  { id: 'BPHIGH',     label: 'High Blood Pressure' },
  { id: 'CHD',        label: 'Heart Disease'       },
  { id: 'CASTHMA',    label: 'Asthma'              },
  { id: 'DEPRESSION', label: 'Depression'          },
]

const NAT_TABS = [
  { id: 'health',      label: '🩺 Health'      },
  { id: 'sdoh',        label: '🏘️ Social'      },
  { id: 'opportunity', label: '🎯 Opportunity' },
]

function MetricRow({ label, value, avg, measureId }) {
  const diff = value != null && avg != null ? value - avg : null
  return (
    <tr className="border-t border-border odd:bg-background even:bg-muted/20">
      <td className="px-5 py-3 font-medium text-foreground">{label}</td>
      <td className="px-5 py-3 text-right">
        {value != null
          ? <span className="font-bold" style={{ color: metricColor(value, measureId) }}>{value.toFixed(1)}%</span>
          : '—'}
      </td>
      <td className="px-5 py-3 text-right text-muted-foreground">{avg != null ? `${avg.toFixed(1)}%` : '—'}</td>
      <td className="px-5 py-3 text-right">
        {diff != null
          ? <Badge variant={diff > 0.3 ? 'danger' : diff < -0.3 ? 'success' : 'secondary'}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}%</Badge>
          : '—'}
      </td>
    </tr>
  )
}

function NationalCountyHealth({ state }) {
  const [countyMap,  setCountyMap]  = useState(null)
  const [acsMap,     setAcsMap]     = useState(null)
  const [selected,   setSelected]   = useState(null)
  const [open,       setOpen]       = useState(false)
  const [query,      setQuery]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [activeTab,  setActiveTab]  = useState('health')
  const dropdownRef = useRef(null)

  useEffect(() => {
    setSelected(null)
    setCountyMap(null)
    setAcsMap(null)
    setLoading(true)
    setError(null)
    Promise.all([
      fetchCountyPlaces(state.abbr),
      fetchCountyACS(state.fips),
    ])
      .then(([places, acs]) => { setCountyMap(places); setAcsMap(acs) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [state.abbr, state.fips])

  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const sortedCounties = countyMap
    ? Object.entries(countyMap).sort((a, b) => a[0].localeCompare(b[0]))
    : []

  const filtered = sortedCounties.filter(([name]) =>
    name.toLowerCase().includes(query.toLowerCase())
  )

  const selPlaces = selected ? countyMap?.[selected] : null
  const selAcs    = selected ? acsMap?.[selected]    : null

  // State-level averages from PLACES
  const stateAvgs = countyMap
    ? NAT_HEALTH_METRICS.reduce((acc, m) => {
        const vals = sortedCounties.map(([, d]) => d[m.id]).filter(v => v != null)
        acc[m.id] = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null
        return acc
      }, {})
    : {}

  // State ACS averages
  const acsAvgs = acsMap
    ? ['poverty','uninsured','noVehicle','medianAge'].reduce((acc, k) => {
        const vals = Object.values(acsMap).map(d => d[k]).filter(v => v != null)
        acc[k] = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null
        return acc
      }, {})
    : {}

  // Scores for selected county
  const need        = selPlaces ? computeNationalNeedScore(selPlaces, selAcs)       : null
  const access      = selPlaces ? computeNationalAccessScore(selPlaces, selAcs, selPlaces.pop) : null
  const opportunity = need != null && access != null ? computeNationalOpportunityScore(need, access) : null

  const QUICK_PICKS = sortedCounties.slice(0, 8).map(([n]) => n)

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-card px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">County Health Profile — {state.name}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            CDC PLACES 2023 health metrics + Census ACS 2022 social determinants for {state.name} counties.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div ref={dropdownRef} className="relative w-full sm:w-72">
              <button
                onClick={() => setOpen(!open)}
                disabled={loading}
                className="flex w-full items-center justify-between gap-2 rounded-lg border-2 border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {loading ? 'Loading counties…' : selected ? `${selected} County` : 'Select a county…'}
                </div>
                <ChevronDown className={['h-4 w-4 text-muted-foreground transition-transform', open ? 'rotate-180' : ''].join(' ')} />
              </button>

              {open && countyMap && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <Input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search county…" />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filtered.map(([name, d]) => (
                      <button
                        key={name}
                        onClick={() => { setSelected(name); setOpen(false); setQuery(''); setActiveTab('health') }}
                        className={['w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors flex items-center justify-between', selected === name ? 'bg-primary/5 text-primary font-semibold' : 'text-foreground'].join(' ')}
                      >
                        <span>{name}</span>
                        <span className="text-xs text-muted-foreground">{d.pop?.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selected && (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{selected} County</span>
                &ensp;·&ensp;Pop: {selPlaces?.pop?.toLocaleString() || '—'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <Card className="border-destructive/50 bg-destructive/5 p-6 text-center">
            <p className="text-destructive font-medium mb-1">Failed to load data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </Card>
        )}

        {!selected && !loading && !error && (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Select a county to view its full health profile</p>
            <p className="text-sm text-muted-foreground mb-8">{state.name} · {sortedCounties.length} counties · CDC PLACES + Census ACS</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PICKS.map(name => (
                <Button key={name} variant="outline" size="sm" onClick={() => { setSelected(name); setActiveTab('health') }}>
                  {name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {selPlaces && (
          <div className="space-y-5">
            {/* County headline + scores */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-extrabold text-foreground">{selected} County</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pop: <strong className="text-foreground">{selPlaces.pop?.toLocaleString() || '—'}</strong>
                      &ensp;·&ensp;FIPS: {selPlaces.fips || '—'}
                      &ensp;·&ensp;{state.name}
                    </p>
                  </div>
                  {need != null && (
                    <div className="flex gap-3">
                      {[
                        { label: 'Need',        value: need,        bg: need >= 60        ? 'bg-red-100 text-red-800'     : 'bg-green-100 text-green-800' },
                        { label: 'Access',      value: access,      bg: access >= 55      ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'    },
                        { label: 'Opportunity', value: opportunity, bg: opportunity >= 60 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700' },
                      ].map(s => (
                        <div key={s.label} className={`text-center rounded-xl px-4 py-2 ${s.bg}`}>
                          <p className="text-xl font-extrabold">{s.value}</p>
                          <p className="text-[10px] font-semibold uppercase tracking-wide">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Separator className="mt-4 mb-3" />
                <div className="flex gap-2 flex-wrap">
                  {QUICK_PICKS.filter(n => n !== selected).slice(0, 6).map(name => (
                    <Button key={name} variant="secondary" size="sm" onClick={() => setSelected(name)}>
                      {name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card className="overflow-hidden">
              <div className="flex overflow-x-auto border-b border-border">
                {NAT_TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      'flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                      activeTab === tab.id
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50',
                    ].join(' ')}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <CardContent className="pt-6">
                {activeTab === 'health' && (
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          <th className="text-left px-5 py-3">Metric</th>
                          <th className="text-right px-5 py-3">{selected}</th>
                          <th className="text-right px-5 py-3">{state.abbr} Avg</th>
                          <th className="text-right px-5 py-3">Diff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {NAT_HEALTH_METRICS.map(m => (
                          <MetricRow
                            key={m.id}
                            label={m.label}
                            value={selPlaces[m.id]}
                            avg={stateAvgs[m.id]}
                            measureId={m.id}
                          />
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-muted-foreground px-5 py-3 border-t border-border">Source: CDC PLACES 2023</p>
                  </div>
                )}

                {activeTab === 'sdoh' && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Social determinants from Census ACS 2022 5-year estimates.</p>
                    {selAcs ? (
                      <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              <th className="text-left px-5 py-3">Indicator</th>
                              <th className="text-right px-5 py-3">{selected}</th>
                              <th className="text-right px-5 py-3">{state.abbr} Avg</th>
                              <th className="text-right px-5 py-3">Diff</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { key: 'poverty',   label: 'Below Poverty Line', unit: '%'  },
                              { key: 'uninsured', label: 'Uninsured',          unit: '%'  },
                              { key: 'noVehicle', label: 'No Vehicle (HH)',    unit: '%'  },
                              { key: 'medianAge', label: 'Median Age',         unit: ' yrs' },
                            ].map((row, i) => {
                              const val  = selAcs[row.key]
                              const avg  = acsAvgs[row.key]
                              const diff = val != null && avg != null ? val - avg : null
                              return (
                                <tr key={row.key} className={['border-t border-border', i % 2 === 0 ? '' : 'bg-muted/20'].join(' ')}>
                                  <td className="px-5 py-3 font-medium text-foreground">{row.label}</td>
                                  <td className="px-5 py-3 text-right font-bold text-foreground">{val != null ? `${val.toFixed(1)}${row.unit}` : '—'}</td>
                                  <td className="px-5 py-3 text-right text-muted-foreground">{avg != null ? `${avg.toFixed(1)}${row.unit}` : '—'}</td>
                                  <td className="px-5 py-3 text-right">
                                    {diff != null ? (
                                      <Badge variant={Math.abs(diff) < 0.5 ? 'secondary' : diff > 0 ? 'danger' : 'success'}>
                                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}{row.unit}
                                      </Badge>
                                    ) : '—'}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                        <p className="text-xs text-muted-foreground px-5 py-3 border-t border-border">Source: Census ACS 2022 5-year estimates</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">ACS data unavailable for this county.</p>
                    )}
                  </div>
                )}

                {activeTab === 'opportunity' && need != null && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: 'Health Need', value: need, desc: 'Disease burden + social risk', color: need >= 60 ? 'text-red-600' : need >= 40 ? 'text-amber-600' : 'text-green-600' },
                        { label: 'Care Access', value: access, desc: 'Provider density + coverage', color: access >= 55 ? 'text-green-600' : access >= 35 ? 'text-amber-600' : 'text-red-600' },
                        { label: 'Opportunity', value: opportunity, desc: 'Investment priority score', color: opportunity >= 60 ? 'text-red-600' : opportunity >= 40 ? 'text-amber-600' : 'text-slate-600' },
                      ].map(s => (
                        <Card key={s.label}>
                          <CardContent className="pt-5 text-center">
                            <p className={`text-4xl font-extrabold ${s.color}`}>{s.value}</p>
                            <p className="text-sm font-semibold text-foreground mt-1">{s.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="py-3 px-4 text-sm text-blue-800">
                        <strong>Scoring methodology:</strong> Need = disease burden (CDC PLACES) + poverty + uninsured (ACS) ·
                        Access = estimated provider density + insurance coverage ·
                        Opportunity = Need × (1 − Access/100)
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Dispatcher ───────────────────────────────────────────────────────────────
export default function CountyHealth() {
  const { selectedState } = useAppState()
  return selectedState.abbr === 'IA'
    ? <IowaCountyHealth />
    : <NationalCountyHealth state={selectedState} />
}
