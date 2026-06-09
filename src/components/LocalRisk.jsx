import { useMemo, useState } from 'react'
import { ChevronRight, ArrowRight, Stethoscope, HeartHandshake } from 'lucide-react'
import { METRIC_INFO, metricLevel } from '@/utils/healthScore'
import { useCounties } from '@/context/CountyDataContext'
import { Meter } from '@/components/ui/meter'
import { SectionHead } from '@/components/ui/section-head'
import { DataSourceBadge } from '@/components/ui/data-source-badge'

const KEYS = Object.keys(METRIC_INFO)
const LEVEL_SWATCH = { low: 'bg-heat-low', mid: 'bg-heat-mid', high: 'bg-heat-high' }
const CARD = 'rounded-lg border border-ink/15 bg-paper'

// Rank the county's adverse measures by how far above/below the state median
// they sit, normalized by the median so measures on different scales (e.g.
// 5% uninsured vs 36% obesity) compare fairly. All values are real CDC/ACS.
function rankMetrics(county, medians) {
  return KEYS
    .map((k) => ({
      k, ...METRIC_INFO[k],
      value: county[k],
      delta: +(county[k] - medians[k]).toFixed(1),
      norm: (county[k] - medians[k]) / medians[k],
    }))
    .sort((a, b) => b.norm - a.norm)
}

export default function LocalRisk({ countyName = 'Polk', onNavigate, onCountyChange }) {
  const { counties, getCounty, peerOf, medians, count, status } = useCounties()
  const [name, setName] = useState(countyName)
  const alpha = useMemo(() => [...counties].sort((a, b) => a.name.localeCompare(b.name)), [counties])
  const county = useMemo(() => getCounty(name), [getCounty, name])
  const peer = useMemo(() => peerOf(county), [peerOf, county])
  const metrics = useMemo(() => rankMetrics(county, medians), [county, medians])
  const worst = metrics[0]
  const best = metrics[metrics.length - 1]
  const healthierPct = Math.round((1 - county.rank / count) * 100)

  const pick = (n) => { setName(n); onCountyChange?.(n) }

  const benchRows = ['diabetes', 'obesity', 'uninsured']

  return (
    <div className="mx-auto max-w-[1280px] px-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 pt-4 font-mono text-[11px] uppercase tracking-wider text-sand">
        <button onClick={() => onNavigate?.('home')} className="hover:text-ink">Home</button>
        <ChevronRight className="h-3 w-3" /> <span>Local Risk</span>
        <ChevronRight className="h-3 w-3" /> <span className="text-ink">{county.name} County</span>
      </div>

      {/* Hero */}
      <div className="mt-3 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-sand">
            Local health risk <DataSourceBadge status={status} />
          </div>
          <h1 className="mt-1 font-display text-5xl font-semibold leading-none text-ink">{county.name} County.</h1>
          <p className="mt-2 text-ink2">FIPS {county.fips} · {county.pop.toLocaleString()} people · median age {county.medianAge}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-sand">county:</span>
          <select
            value={name}
            onChange={(e) => pick(e.target.value)}
            className="rounded-lg border border-ink/25 bg-paper px-3 py-2 text-sm text-ink focus:outline-none"
          >
            {alpha.map((c) => <option key={c.fips} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Scorecard row */}
      <div className="mt-5 flex flex-col gap-4 lg:flex-row">
        <div className={`${CARD} w-full p-5 lg:w-[320px]`}>
          <div className="font-mono text-[11px] uppercase tracking-wide text-sand">Overall health score</div>
          <div className="mt-2 flex items-end justify-between">
            <div className="font-display text-6xl font-semibold leading-none text-ink">
              {county.healthScore}<span className="text-lg font-normal text-sand">/100</span>
            </div>
            <div className="text-center">
              <div className="font-mono text-[11px] text-sand">RANK</div>
              <div className="font-display text-3xl font-semibold text-ink">{county.rank}</div>
              <div className="font-mono text-[11px] text-sand">of {count}</div>
            </div>
          </div>
          <div className="mt-3"><Meter value={county.healthScore / 100} /></div>
          <p className="mt-3 text-sm text-ink2">Healthier than {healthierPct}% of Iowa counties — a percentile across six CDC/ACS measures.</p>
        </div>

        {/* 3 takeaway cards */}
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { tag: worst.delta > 0 ? 'ABOVE STATE MEDIAN' : 'RELATIVE WEAK SPOT', m: worst },
            { tag: 'NEXT TO WATCH', m: metrics[1] },
            { tag: 'BRIGHT SPOT', m: best },
          ].map(({ tag, m }) => (
            <div key={tag} className={`${CARD} p-4`}>
              <div className="font-mono text-[11px] uppercase tracking-wide text-sand">{tag}</div>
              <div className="mt-2 text-[15px] font-medium text-ink">{m.label}</div>
              <div className="mt-2 font-display text-3xl font-semibold text-ink">{m.value}{m.unit}</div>
              <div className={`mt-1 font-mono text-[11px] ${m.delta > 0 ? 'text-risk' : 'text-ok'}`}>
                {m.delta > 0 ? '+' : ''}{m.delta}{m.unit} vs IA median
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story band */}
      <div className={`mt-4 rounded-lg border border-ink/15 bg-paper2 p-4`}>
        <span className="font-mono text-[11px] uppercase tracking-wide text-sand">The story: </span>
        <span className="text-[17px] leading-relaxed text-ink">
          {county.name} ranks {county.rank} of {count} — healthier than {healthierPct}% of Iowa counties.
          {worst.delta > 0
            ? ` Its biggest concern is ${worst.label.toLowerCase()} at ${worst.value}${worst.unit}, ${worst.delta}${worst.unit} above the state median.`
            : ` No measure runs above the state median; its relative weak spot is ${worst.label.toLowerCase()} at ${worst.value}${worst.unit}.`}
          {best.delta < 0
            ? ` Bright spot: ${best.label.toLowerCase()} sits ${Math.abs(best.delta)}${best.unit} below the state median.`
            : ` Even its strongest measure, ${best.label.toLowerCase()}, runs near the state median.`}
          {county.pcShortage === 2 && ' It also carries a full HRSA primary-care shortage designation.'}
        </span>
      </div>

      {/* Key metrics */}
      <section className="mt-8">
        <SectionHead
          eyebrow="Key metrics"
          right={<span className="font-mono text-[11px] uppercase tracking-wider text-sand">CDC PLACES · ACS · level vs Iowa</span>}
        />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map((m) => (
            <div key={m.k} className={`${CARD} p-3`}>
              <div className="font-mono text-[11px] uppercase tracking-wide text-sand">{m.label}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-display text-2xl font-semibold text-ink">{m.value}{m.unit}</span>
                <span className={`h-3 w-3 rounded-sm border border-ink/30 ${LEVEL_SWATCH[metricLevel(m.k, m.value)]}`} />
              </div>
              <div className="mt-1 font-mono text-[10px] text-sand">IA {medians[m.k]}{m.unit}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Benchmark + act-on-it */}
      <section className="mt-8 flex flex-col gap-4 lg:flex-row">
        <div className={`${CARD} flex-1 p-4`}>
          <div className="font-mono text-[11px] uppercase tracking-wide text-ink">
            {county.name} vs Iowa vs {peer.name} <span className="text-sand">(nearest in population)</span>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-0 text-sm">
            <div className="border-b border-dashed border-ink/30 pb-1.5 font-mono text-[11px] uppercase text-sand">Metric</div>
            <div className="border-b border-dashed border-ink/30 pb-1.5 text-right font-mono text-[11px] uppercase text-sand">{county.name}</div>
            <div className="border-b border-dashed border-ink/30 pb-1.5 text-right font-mono text-[11px] uppercase text-sand">Iowa</div>
            <div className="border-b border-dashed border-ink/30 pb-1.5 text-right font-mono text-[11px] uppercase text-sand">{peer.name}</div>
            {benchRows.map((k) => (
              <Fragmentish key={k} label={METRIC_INFO[k].label} unit={METRIC_INFO[k].unit}
                a={county[k]} b={medians[k]} c={peer[k]} />
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 lg:w-[360px]">
          <div className="font-mono text-[11px] uppercase tracking-wide text-ink">Act on it</div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate?.('find')} className={`${CARD} flex-1 p-3 text-left hover:border-ink/40`}>
              <Stethoscope className="h-5 w-5 text-action" />
              <div className="mt-2 font-display text-[15px] font-semibold text-ink">Find a doctor</div>
              <div className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-action">search NPI <ArrowRight className="h-3 w-3" /></div>
            </button>
            <button onClick={() => onNavigate?.('hospitals')} className={`${CARD} flex-1 p-3 text-left hover:border-ink/40`}>
              <HeartHandshake className="h-5 w-5 text-action" />
              <div className="mt-2 font-display text-[15px] font-semibold text-ink">Compare hospitals</div>
              <div className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-action">CMS ratings <ArrowRight className="h-3 w-3" /></div>
            </button>
          </div>
          <div className={`${CARD} p-2.5`}>
            <span className="font-mono text-[10px] uppercase tracking-wide text-sand">
              Sources: CDC PLACES 2023 · Census ACS 2022 · HRSA HPSA · CMS Care Compare
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

// One benchmark table row, with the county value emphasized.
function Fragmentish({ label, unit, a, b, c }) {
  return (
    <>
      <div className="border-b border-dashed border-ink/10 py-1.5 text-ink2">{label}</div>
      <div className="border-b border-dashed border-ink/10 py-1.5 text-right font-display font-semibold text-ink">{a}{unit}</div>
      <div className="border-b border-dashed border-ink/10 py-1.5 text-right font-mono text-xs text-sand">{b}{unit}</div>
      <div className="border-b border-dashed border-ink/10 py-1.5 text-right font-mono text-xs text-sand">{c}{unit}</div>
    </>
  )
}
