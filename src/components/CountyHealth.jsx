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

export default function CountyHealth() {
  return <IowaCountyHealth />
}
