import { useState, useMemo, useEffect } from 'react'
import { Trophy, TrendingUp, Target, ChevronUp, ChevronDown, Search } from 'lucide-react'
import { iowaCounties, computeRankingScores, needLabel, accessLabel, opportunityLabel } from '../data/iowaCounties'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

const RANKED = iowaCounties.map(c => ({ ...c, scores: computeRankingScores(c) }))

const SORT_DIMS = [
  { id: 'opportunity', label: 'Opportunity',  icon: Target,     desc: 'High need + low access' },
  { id: 'need',        label: 'Need',          icon: TrendingUp, desc: 'Disease burden + poverty' },
  { id: 'access',      label: 'Access',        icon: Trophy,     desc: 'Provider density + shortage' },
]

function scoreBadgeVariant(labelFn, score) {
  const { text } = labelFn(score)
  if (text === 'Critical' || text === 'Top Priority' || text === 'Poor') return 'danger'
  if (text === 'High'     || text === 'High Priority'|| text === 'Limited') return 'orange'
  if (text === 'Moderate' || text === 'Low')          return 'warning'
  return 'success'
}

function ScoreCell({ score, labelFn, barColor }) {
  const variant = scoreBadgeVariant(labelFn, score)
  const { text } = labelFn(score)
  return (
    <div className="flex flex-col gap-1.5 items-end">
      <Badge variant={variant}>{text}</Badge>
      <div className="flex items-center gap-1.5 w-full justify-end">
        <Progress value={score} className="h-1.5 w-20" indicatorClassName={barColor} />
        <span className="text-xs font-bold text-foreground w-5 text-right">{score}</span>
      </div>
    </div>
  )
}

function IowaCountyRanking() {
  const [sortDim,   setSortDim]   = useState('opportunity')
  const [sortAsc,   setSortAsc]   = useState(false)
  const [search,    setSearch]    = useState('')
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

  const top5opp  = [...RANKED].sort((a, b) => b.scores.opportunity - a.scores.opportunity).slice(0, 5)
  const top5need = [...RANKED].sort((a, b) => b.scores.need        - a.scores.need       ).slice(0, 5)
  const top5acc  = [...RANKED].sort((a, b) => b.scores.access      - a.scores.access     ).slice(0, 5)

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
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-card px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">County Rankings Dashboard</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            All 99 Iowa counties ranked by composite scores — disease burden, social determinants,
            provider supply, and shortage designations.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: 'top_opportunity', emoji: '🎯', title: 'Top Investment Opportunities', counties: top5opp,  scoreKey: 'opportunity', textCls: 'text-red-600'    },
            { key: 'top_need',        emoji: '⚠️',  title: 'Highest Health Need',          counties: top5need, scoreKey: 'need',        textCls: 'text-orange-600' },
            { key: 'best_access',     emoji: '✅',  title: 'Best Care Access',             counties: top5acc,  scoreKey: 'access',      textCls: 'text-green-600'  },
          ].map(card => (
            <Card
              key={card.key}
              onClick={() => setHighlight(highlight === card.key ? null : card.key)}
              className={['cursor-pointer transition-all hover:shadow-md', highlight === card.key ? 'ring-2 ring-primary' : ''].join(' ')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{card.emoji}</span>
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {card.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {card.counties.map((c, i) => (
                  <div key={c.fips} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">
                      <span className="text-xs text-muted-foreground mr-1.5">#{i + 1}</span>
                      {c.name}
                    </span>
                    <span className={`text-sm font-extrabold ${card.textCls}`}>{c.scores[card.scoreKey]}</span>
                  </div>
                ))}
                {highlight === card.key && (
                  <p className="text-xs text-primary font-medium pt-1">↑ Highlighted in table</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Methodology note */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-3 px-4">
            <p className="text-sm text-blue-800">
              <strong>Scores (0–100):</strong>&ensp;
              <strong>Need</strong> = disease burden (CDC PLACES) + poverty + uninsured (ACS) ·&ensp;
              <strong>Access</strong> = provider density + HRSA shortage designations ·&ensp;
              <strong>Opportunity</strong> = Need × (1 – Access/100)
            </p>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          {/* Controls */}
          <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {SORT_DIMS.map(dim => {
                const Icon = dim.icon
                const active = sortDim === dim.id
                return (
                  <Button
                    key={dim.id}
                    variant={active ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSort(dim.id)}
                    title={dim.desc}
                    className="gap-1.5"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {dim.label}
                    {active && (sortAsc
                      ? <ChevronUp className="h-3 w-3" />
                      : <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                )
              })}
            </div>
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter counties…"
                className="pl-8"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="text-left px-4 py-3 w-10">#</th>
                  <th className="text-left px-4 py-3">County</th>
                  <th className="text-right px-4 py-3">Pop</th>
                  <th className="px-4 py-3 min-w-[150px]">
                    <button onClick={() => toggleSort('need')} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">
                      Need {sortDim === 'need' && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </button>
                  </th>
                  <th className="px-4 py-3 min-w-[150px]">
                    <button onClick={() => toggleSort('access')} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">
                      Access {sortDim === 'access' && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </button>
                  </th>
                  <th className="px-4 py-3 min-w-[160px]">
                    <button onClick={() => toggleSort('opportunity')} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">
                      Opportunity {sortDim === 'opportunity' && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
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
                      className={[
                        'border-b border-border transition-colors hover:bg-muted/40',
                        hl ? 'bg-primary/5' : idx % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                      ].join(' ')}
                    >
                      <td className="px-4 py-3 text-muted-foreground text-xs font-medium">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-foreground">{county.name}</span>
                        {hl && <Badge variant="info" className="ml-2 text-[9px]">★ highlight</Badge>}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                        {(county.pop / 1000).toFixed(0)}k
                      </td>
                      <td className="px-4 py-3">
                        <ScoreCell score={need} labelFn={needLabel}
                          barColor={need >= 65 ? 'bg-red-500' : need >= 50 ? 'bg-orange-400' : 'bg-green-400'} />
                      </td>
                      <td className="px-4 py-3">
                        <ScoreCell score={access} labelFn={accessLabel}
                          barColor={access >= 55 ? 'bg-green-500' : access >= 35 ? 'bg-yellow-400' : 'bg-red-500'} />
                      </td>
                      <td className="px-4 py-3">
                        <ScoreCell score={opportunity} labelFn={opportunityLabel}
                          barColor={opportunity >= 65 ? 'bg-red-500' : opportunity >= 50 ? 'bg-orange-400' : 'bg-blue-400'} />
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <Badge variant={totalShortage >= 5 ? 'danger' : totalShortage >= 3 ? 'orange' : totalShortage >= 1 ? 'warning' : 'success'}>
                          {totalShortage}/6
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold hidden lg:table-cell">
                        {county.providerDensity.toFixed(1)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {sorted.length} of 99 counties</p>
            <p className="text-xs text-muted-foreground hidden sm:block">Shortage: PC + MH + Dental (max 6) · Density: providers per 1k</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── National rankings — CDC PLACES + ACS composite scores ────────────────────
function NationalCountyRanking({ state }) {
  const [countyMap, setCountyMap] = useState(null)
  const [acsMap,    setAcsMap]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [sortDim,   setSortDim]   = useState('opportunity')
  const [sortAsc,   setSortAsc]   = useState(false)
  const [search,    setSearch]    = useState('')

  useEffect(() => {
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

  const ranked = useMemo(() => {
    if (!countyMap) return []
    return Object.entries(countyMap)
      .map(([name, d]) => {
        const acs  = acsMap?.[name] || {}
        const need = computeNationalNeedScore(d, acs)
        const access = computeNationalAccessScore(d, acs, d.pop)
        const opportunity = computeNationalOpportunityScore(need, access)
        return { name, ...d, acs, need, access, opportunity }
      })
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => sortAsc ? a[sortDim] - b[sortDim] : b[sortDim] - a[sortDim])
  }, [countyMap, acsMap, sortDim, sortAsc, search])

  const top5opp  = useMemo(() => [...(ranked || [])].sort((a, b) => b.opportunity - a.opportunity).slice(0, 5), [ranked])
  const top5need = useMemo(() => [...(ranked || [])].sort((a, b) => b.need        - a.need       ).slice(0, 5), [ranked])

  const SORT_DIMS = [
    { id: 'opportunity', label: 'Opportunity' },
    { id: 'need',        label: 'Need'         },
    { id: 'access',      label: 'Access'       },
  ]

  function toggleSort(dim) {
    if (sortDim === dim) setSortAsc(!sortAsc)
    else { setSortDim(dim); setSortAsc(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">County Rankings — {state.name}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            All counties ranked by composite scores — health need, care access, and investment opportunity.
            Data: CDC PLACES 2023 + Census ACS 2022.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-3" />
            <p className="text-sm text-muted-foreground">Loading {state.name} county data…</p>
          </div>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/5 p-6 text-center">
            <p className="text-destructive font-medium">Failed to load data: {error}</p>
          </Card>
        )}

        {!loading && countyMap && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">🎯 Top Investment Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {top5opp.map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <span className="text-sm text-foreground"><span className="text-xs text-muted-foreground mr-1.5">#{i+1}</span>{c.name}</span>
                      <span className="text-sm font-extrabold text-red-600">{c.opportunity}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">⚠️ Highest Health Need</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {top5need.map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <span className="text-sm text-foreground"><span className="text-xs text-muted-foreground mr-1.5">#{i+1}</span>{c.name}</span>
                      <span className="text-sm font-extrabold text-orange-600">{c.need}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="py-4 px-4 text-sm text-blue-800">
                  <strong>Scores (0–100):</strong><br />
                  <strong>Need</strong> = disease burden + poverty + uninsured<br />
                  <strong>Access</strong> = provider density + coverage<br />
                  <strong>Opportunity</strong> = Need × (1 − Access/100)
                </CardContent>
              </Card>
            </div>

            <Card>
              <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {SORT_DIMS.map(dim => (
                    <Button
                      key={dim.id}
                      variant={sortDim === dim.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSort(dim.id)}
                      className="gap-1"
                    >
                      {dim.label}
                      {sortDim === dim.id && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </Button>
                  ))}
                </div>
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter counties…" className="pl-8" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <th className="text-left px-4 py-3 w-10">#</th>
                      <th className="text-left px-4 py-3">County</th>
                      <th className="text-right px-4 py-3">Pop</th>
                      <th className="text-right px-4 py-3 min-w-[120px]">
                        <button onClick={() => toggleSort('need')} className="flex items-center gap-1 ml-auto hover:text-foreground">
                          Need {sortDim === 'need' && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                        </button>
                      </th>
                      <th className="text-right px-4 py-3 min-w-[120px]">
                        <button onClick={() => toggleSort('access')} className="flex items-center gap-1 ml-auto hover:text-foreground">
                          Access {sortDim === 'access' && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                        </button>
                      </th>
                      <th className="text-right px-4 py-3 min-w-[130px]">
                        <button onClick={() => toggleSort('opportunity')} className="flex items-center gap-1 ml-auto hover:text-foreground">
                          Opportunity {sortDim === 'opportunity' && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                        </button>
                      </th>
                      <th className="text-right px-4 py-3 hidden md:table-cell">Diabetes</th>
                      <th className="text-right px-4 py-3 hidden lg:table-cell">Uninsured</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranked.map((c, idx) => (
                      <tr key={c.name} className={['border-b border-border hover:bg-muted/40 transition-colors', idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'].join(' ')}>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{c.name}</td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">{c.pop > 0 ? `${(c.pop / 1000).toFixed(0)}k` : '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Progress value={c.need} className="h-1.5 w-14" indicatorClassName={c.need >= 65 ? 'bg-red-500' : c.need >= 45 ? 'bg-orange-400' : 'bg-green-400'} />
                            <span className="text-xs font-bold w-5">{c.need}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Progress value={c.access} className="h-1.5 w-14" indicatorClassName={c.access >= 55 ? 'bg-green-500' : c.access >= 35 ? 'bg-yellow-400' : 'bg-red-500'} />
                            <span className="text-xs font-bold w-5">{c.access}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Progress value={c.opportunity} className="h-1.5 w-14" indicatorClassName={c.opportunity >= 65 ? 'bg-red-500' : c.opportunity >= 50 ? 'bg-orange-400' : 'bg-blue-400'} />
                            <span className="text-xs font-bold w-5">{c.opportunity}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-xs hidden md:table-cell">{c.DIABETES != null ? `${c.DIABETES.toFixed(1)}%` : '—'}</td>
                        <td className="px-4 py-3 text-right text-xs hidden lg:table-cell">{c.acs?.uninsured != null ? `${c.acs.uninsured.toFixed(1)}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Showing {ranked.length} of {Object.keys(countyMap).length} counties · CDC PLACES 2023 + Census ACS 2022</p>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default function CountyRanking() {
  return <IowaCountyRanking />
}
