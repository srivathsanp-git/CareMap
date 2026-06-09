import { useMemo, useState } from 'react'
import { Search, MapPin, ArrowRight, Stethoscope, Activity, Building2 } from 'lucide-react'
import { KEY_MEASURES } from '@/utils/cdcPlaces'
import { iowaHospitals } from '@/data/iowaHospitals'
import { useCounties } from '@/context/CountyDataContext'
import { Pill } from '@/components/ui/pill'
import { Stat } from '@/components/ui/stat'
import { Meter } from '@/components/ui/meter'
import { MiniChart } from '@/components/ui/mini-chart'
import { SectionHead } from '@/components/ui/section-head'
import { DataSourceBadge } from '@/components/ui/data-source-badge'

const POPULAR = ['Primary care', 'Mental health', 'Pediatrics', 'Dental', 'Urgent care']

const TASKS = [
  { icon: Stethoscope, title: 'Find a provider', desc: 'Real NPI records by specialty, ZIP, and distance.', cta: 'Find care', route: 'find', primary: true },
  { icon: Activity,    title: "See my county's health", desc: 'CDC PLACES + ACS metrics, ranked across Iowa.', cta: 'Open dashboard', route: 'local' },
  { icon: Building2,   title: 'Compare hospitals', desc: 'CMS Care Compare star ratings & trauma level.', cta: 'Compare', route: 'hospitals' },
]

const CARD = 'rounded-lg border border-ink/15 bg-paper'

export default function Home({ onNavigate, onOpenCounty }) {
  const [condition, setCondition] = useState('')
  const [where, setWhere] = useState('')
  const { counties, getCounty, medians, count, status } = useCounties()

  // Statewide + insight figures, recomputed whenever the data source changes
  // (snapshot → live). PCP shortage flags come from the static HRSA base.
  const { POLK, SNAPSHOT, INSIGHTS } = useMemo(() => {
    const polk = getCounty('Polk')
    const pcpFull = counties.filter((c) => c.pcShortage === 2).length
    const byObesity = [...counties].sort((a, b) => b.obesity - a.obesity)
    const worstObesity = byObesity[0]
    const shortageBars = [0, 1, 2].map((lvl) => counties.filter((c) => c.pcShortage === lvl).length)
    const best = counties[0]
    const spread = counties.map((c) => c.healthScore).sort((a, b) => a - b)
    return {
      POLK: polk,
      SNAPSHOT: [
        { num: String(count), label: 'counties' },
        { num: String(iowaHospitals.length), label: 'hospitals rated · CMS' },
        { num: String(KEY_MEASURES.length), label: 'health metrics · CDC' },
        { num: `${medians.diabetes}%`, label: 'median diabetes' },
        { num: String(pcpFull), label: 'PCP-shortage counties' },
      ],
      INSIGHTS: [
        { tag: 'HIGHEST BURDEN', headline: `Obesity peaks at ${worstObesity.obesity}% in ${worstObesity.name} County.`, stat: `${worstObesity.obesity}%`, kind: 'bar', color: 'risk', points: byObesity.slice(0, 6).map((c) => c.obesity) },
        { tag: 'ACCESS GAP', headline: `${pcpFull} of ${count} counties carry a full primary-care shortage.`, stat: String(pcpFull), kind: 'bar', color: 'action', points: shortageBars },
        { tag: 'WIDE DISPARITY', headline: `${best.name} scores ${best.healthScore} — the worst county scores ${spread[0]}.`, stat: `${spread[0]}–${best.healthScore}`, kind: 'area', color: 'ok', points: spread },
      ],
    }
  }, [counties, getCounty, medians, count])

  const search = (e) => {
    e?.preventDefault()
    onNavigate?.('find')
  }
  const openPolk = () => (onOpenCounty ? onOpenCounty(POLK.name) : onNavigate?.('local'))

  return (
    <div className="mx-auto max-w-[1280px] px-8 pb-16">
      {/* ── HERO + SEARCH ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-8 pt-10 lg:grid-cols-[1fr_320px]">
        <div className="max-w-[720px]">
          <div className="font-mono text-[11px] uppercase tracking-wider text-sand">
            Public health, made useful · Iowa
          </div>
          <h1 className="mt-3 font-display text-[52px] font-semibold leading-[1.02] tracking-tight text-ink">
            Iowa health data, all in one place.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink2">
            {KEY_MEASURES.length} CDC health metrics across all {count} counties, real provider
            records, and CMS hospital ratings — searchable in one place.
          </p>

          {/* Search bar */}
          <form onSubmit={search} className="mt-6 flex flex-col gap-2 rounded-xl border border-ink/20 bg-paper p-1.5 shadow-sm sm:flex-row">
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 shrink-0 text-sand" />
              <input
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Find a doctor, clinic, or condition…"
                className="h-11 w-full bg-transparent text-[15px] text-ink placeholder:text-sand focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 px-3 sm:border-l sm:border-ink/15 sm:w-48">
              <MapPin className="h-4 w-4 shrink-0 text-sand" />
              <input
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                placeholder="ZIP or county"
                className="h-11 w-full bg-transparent text-[15px] text-ink placeholder:text-sand focus:outline-none"
              />
            </div>
            <button type="submit" className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-action px-5 text-[15px] font-medium text-white hover:bg-action/90">
              Search
            </button>
          </form>

          {/* Popular searches */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-sand">popular:</span>
            {POPULAR.map((p) => (
              <Pill key={p} size="sm" onClick={() => onNavigate?.('find')}>{p}</Pill>
            ))}
          </div>
        </div>

        {/* Your-county card */}
        <div className={`${CARD} p-5`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink">
              Your county · {POLK.name}
            </span>
            <Pill size="sm" variant="action" onClick={openPolk}>change</Pill>
          </div>
          <div className="mt-3 font-display text-4xl font-semibold leading-none text-ink">
            {POLK.healthScore}
            <span className="text-base font-normal text-sand">/100</span>
          </div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-wide text-sand">
            rank {POLK.rank} of {count} · healthier than {Math.round((1 - POLK.rank / count) * 100)}%
          </div>
          <div className="mt-3">
            <Meter value={POLK.healthScore / 100} />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink2">Diabetes</span>
              <span className="font-mono text-xs text-ink">{POLK.diabetes}% · IA {medians.diabetes}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink2">Uninsured</span>
              <span className="font-mono text-xs text-ink">{POLK.uninsured}% · IA {medians.uninsured}%</span>
            </div>
          </div>
          <button
            onClick={openPolk}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-action px-4 py-2 text-sm font-medium text-white hover:bg-action/90"
          >
            Open {POLK.name} dashboard <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* ── IOWA SNAPSHOT STRIP ───────────────────────────────────────── */}
      <section className="mt-10 -mx-8 border-y border-ink/15 bg-paper2 px-8 py-5">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink">
            Iowa snapshot <DataSourceBadge status={status} />
          </div>
          <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
            {SNAPSHOT.map((s) => (
              <Stat key={s.label} num={s.num} label={s.label} size="sm" />
            ))}
          </div>
        </div>
      </section>

      {/* ── START HERE — 3 task cards ─────────────────────────────────── */}
      <section className="mt-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TASKS.map((t) => {
            const Icon = t.icon
            return (
              <div key={t.title} className={`${CARD} flex flex-col p-5`}>
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink/5">
                    <Icon className="h-5 w-5 text-ink" strokeWidth={1.75} />
                  </div>
                  <button
                    onClick={() => onNavigate?.(t.route)}
                    className={[
                      'flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium',
                      t.primary ? 'bg-action text-white hover:bg-action/90' : 'border border-ink/25 text-ink hover:bg-ink/5',
                    ].join(' ')}
                  >
                    {t.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{t.title}</h3>
                <p className="mt-1.5 text-sm text-ink2">{t.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── INSIGHTS — 3 tiles with real charts ───────────────────────── */}
      <section className="mt-10">
        <SectionHead
          eyebrow="Iowa health, by the numbers"
          right={<button onClick={() => onNavigate?.('local')} className="font-mono text-[11px] uppercase tracking-wider text-action hover:underline">explore counties →</button>}
        />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {INSIGHTS.map((c) => (
            <div key={c.headline} className={`${CARD} p-4`}>
              <div className="font-mono text-[11px] uppercase tracking-wider text-sand">{c.tag}</div>
              <p className="mt-2 text-[17px] font-medium leading-snug text-ink">{c.headline}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="font-display text-3xl font-semibold leading-none text-ink">{c.stat}</div>
                <div className="w-32">
                  <MiniChart kind={c.kind} points={c.points} color={c.color} height={44} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] text-sand">
          Sources: CDC PLACES 2023 · Census ACS 2022 5-yr · HRSA HPSA · CMS Care Compare. Scores are percentile ranks across Iowa counties.
        </p>
      </section>
    </div>
  )
}
