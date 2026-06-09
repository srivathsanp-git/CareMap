import { useMemo, useState } from 'react'
import { Search, Download, ArrowUpDown, Star, ChevronRight } from 'lucide-react'
import { useCounties } from '@/context/CountyDataContext'
import { METRIC_INFO, metricLevel } from '@/utils/healthScore'
import { iowaHospitals } from '@/data/iowaHospitals'
import { SectionHead } from '@/components/ui/section-head'
import { DataSourceBadge } from '@/components/ui/data-source-badge'

const CARD = 'rounded-lg border border-ink/15 bg-paper'
const METRIC_KEYS = Object.keys(METRIC_INFO) // diabetes, obesity, smoking, mentalHealth, uninsured, poverty
const LEVEL_TEXT = { low: 'text-ok', mid: 'text-ink', high: 'text-risk' }

function downloadCSV(filename, header, rows) {
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

function scoreChip(score) {
  const cls = score >= 60 ? 'bg-heat-low text-ink' : score >= 40 ? 'bg-heat-mid text-ink' : 'bg-heat-high text-ink'
  return <span className={`inline-block min-w-[34px] rounded px-1.5 py-0.5 text-center font-display text-sm font-semibold ${cls}`}>{score}</span>
}

// Sortable header cell.
function Th({ label, col, sort, setSort, align = 'left', w }) {
  const active = sort.key === col
  return (
    <th style={{ width: w }} className={`whitespace-nowrap px-2 py-2 text-${align} font-mono text-[10px] uppercase tracking-wide text-sand`}>
      <button onClick={() => setSort({ key: col, dir: active && sort.dir === 'asc' ? 'desc' : 'asc' })}
        className={`inline-flex items-center gap-1 hover:text-ink ${active ? 'text-ink' : ''}`}>
        {label}<ArrowUpDown className="h-3 w-3 opacity-50" />
      </button>
    </th>
  )
}

function useSort(initial) {
  const [sort, setSort] = useState(initial)
  const apply = (rows) => {
    const { key, dir } = sort
    const s = [...rows].sort((a, b) => {
      const av = a[key], bv = b[key]
      if (typeof av === 'number' && typeof bv === 'number') return av - bv
      return String(av).localeCompare(String(bv))
    })
    return dir === 'desc' ? s.reverse() : s
  }
  return [sort, setSort, apply]
}

// ── Counties tab ───────────────────────────────────────────────────────────
function CountyTable({ counties, medians, onOpenCounty }) {
  const [q, setQ] = useState('')
  const [sort, setSort, apply] = useSort({ key: 'rank', dir: 'asc' })

  const rows = useMemo(() => {
    const filtered = q ? counties.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())) : counties
    return apply(filtered)
  }, [counties, q, sort])

  const exportCsv = () => {
    const header = ['rank', 'county', 'fips', 'population', 'healthScore', ...METRIC_KEYS]
    const data = [...counties].sort((a, b) => a.rank - b.rank)
      .map((c) => [c.rank, c.name, c.fips, c.pop, c.healthScore, ...METRIC_KEYS.map((k) => c[k])])
    downloadCSV('caremap-iowa-counties.csv', header, data)
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-ink/20 bg-paper px-3">
          <Search className="h-4 w-4 text-sand" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter counties…"
            className="h-9 w-48 bg-transparent text-sm text-ink placeholder:text-sand focus:outline-none" />
        </div>
        <span className="font-mono text-[11px] text-sand">{rows.length} of {counties.length} counties</span>
        <div className="flex-1" />
        <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-ink/25 px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5">
          <Download className="h-4 w-4" /> Download CSV
        </button>
      </div>

      <div className={`${CARD} overflow-x-auto`}>
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-ink/15 bg-paper2">
            <tr>
              <Th label="#" col="rank" sort={sort} setSort={setSort} w={44} />
              <Th label="County" col="name" sort={sort} setSort={setSort} />
              <Th label="Score" col="healthScore" sort={sort} setSort={setSort} align="center" w={70} />
              {METRIC_KEYS.map((k) => (
                <Th key={k} label={METRIC_INFO[k].label} col={k} sort={sort} setSort={setSort} align="right" />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.fips} onClick={() => onOpenCounty?.(c.name)}
                className="cursor-pointer border-b border-dashed border-ink/10 last:border-0 hover:bg-paper2">
                <td className="px-2 py-2 font-mono text-xs text-sand">{c.rank}</td>
                <td className="px-2 py-2">
                  <span className="inline-flex items-center gap-1 font-medium text-ink">{c.name}<ChevronRight className="h-3 w-3 text-sand" /></span>
                </td>
                <td className="px-2 py-2 text-center">{scoreChip(c.healthScore)}</td>
                {METRIC_KEYS.map((k) => (
                  <td key={k} className={`px-2 py-2 text-right font-mono text-xs ${LEVEL_TEXT[metricLevel(k, c[k])]}`}>
                    {c[k]}{METRIC_INFO[k].unit}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-ink/15 bg-paper2">
              <td colSpan={3} className="px-2 py-2 font-mono text-[10px] uppercase text-sand">Iowa median</td>
              {METRIC_KEYS.map((k) => (
                <td key={k} className="px-2 py-2 text-right font-mono text-[11px] text-ink2">{medians[k]}{METRIC_INFO[k].unit}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ── Hospitals tab ──────────────────────────────────────────────────────────
function HospitalTable() {
  const [q, setQ] = useState('')
  const [sort, setSort, apply] = useSort({ key: 'stars', dir: 'desc' })

  const rows = useMemo(() => {
    const norm = iowaHospitals.map((h) => ({ ...h, stars: h.stars ?? 0, beds: h.beds ?? 0 }))
    const filtered = q ? norm.filter((h) => `${h.name} ${h.city} ${h.county}`.toLowerCase().includes(q.toLowerCase())) : norm
    return apply(filtered)
  }, [q, sort])

  const exportCsv = () => {
    const header = ['name', 'city', 'county', 'cms_stars', 'type', 'beds', 'trauma', 'cms_id', 'phone', 'address']
    const data = iowaHospitals.map((h) => [h.name, h.city, h.county, h.stars ?? '', h.type, h.beds ?? '', h.trauma ?? '', h.cms_id ?? '', h.phone ?? '', h.address ?? ''])
    downloadCSV('caremap-iowa-hospitals.csv', header, data)
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-ink/20 bg-paper px-3">
          <Search className="h-4 w-4 text-sand" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter hospitals…"
            className="h-9 w-56 bg-transparent text-sm text-ink placeholder:text-sand focus:outline-none" />
        </div>
        <span className="font-mono text-[11px] text-sand">{rows.length} of {iowaHospitals.length} hospitals</span>
        <div className="flex-1" />
        <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-ink/25 px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5">
          <Download className="h-4 w-4" /> Download CSV
        </button>
      </div>

      <div className={`${CARD} overflow-x-auto`}>
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-ink/15 bg-paper2">
            <tr>
              <Th label="Hospital" col="name" sort={sort} setSort={setSort} />
              <Th label="City" col="city" sort={sort} setSort={setSort} />
              <Th label="County" col="county" sort={sort} setSort={setSort} />
              <Th label="CMS stars" col="stars" sort={sort} setSort={setSort} align="center" w={120} />
              <Th label="Type" col="type" sort={sort} setSort={setSort} />
              <Th label="Beds" col="beds" sort={sort} setSort={setSort} align="right" w={70} />
              <Th label="Trauma" col="trauma" sort={sort} setSort={setSort} align="center" w={80} />
            </tr>
          </thead>
          <tbody>
            {rows.map((h) => (
              <tr key={h.id} className="border-b border-dashed border-ink/10 last:border-0 hover:bg-paper2">
                <td className="px-2 py-2 font-medium text-ink">{h.name}</td>
                <td className="px-2 py-2 text-ink2">{h.city}</td>
                <td className="px-2 py-2 text-ink2">{h.county}</td>
                <td className="px-2 py-2 text-center">
                  {h.stars ? (
                    <span className="inline-flex items-center gap-0.5">
                      {Array.from({ length: h.stars }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-heat-mid text-heat-mid" />)}
                    </span>
                  ) : <span className="font-mono text-[11px] text-sand">not rated</span>}
                </td>
                <td className="px-2 py-2 text-ink2">{h.type}</td>
                <td className="px-2 py-2 text-right font-mono text-xs text-ink2">{h.beds || '—'}</td>
                <td className="px-2 py-2 text-center font-mono text-xs text-ink2">{h.trauma || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Resources({ onNavigate, onOpenCounty }) {
  const { counties, medians, status } = useCounties()
  const [tab, setTab] = useState('Counties')
  const TABS = ['Counties', 'Hospitals']

  return (
    <div className="mx-auto max-w-[1280px] px-8 pb-16">
      <div className="pt-10">
        <SectionHead
          eyebrow="Resources · the full dataset"
          title="Explore every county and hospital."
          right={<DataSourceBadge status={status} />}
        />
        <p className="mt-2 max-w-2xl text-ink2">
          All {counties.length} Iowa counties ranked by the live CDC health score, plus every CMS-rated
          hospital. Sort any column, filter, click a county for its full dashboard, or download the data.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-6 border-b border-ink/15">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`relative -mb-px py-2 text-[15px] ${t === tab ? 'font-semibold text-ink' : 'text-ink2 hover:text-ink'}`}>
            {t}
            {t === tab && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-ink" />}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === 'Counties'
          ? <CountyTable counties={counties} medians={medians} onOpenCounty={onOpenCounty} />
          : <HospitalTable />}
      </div>

      <p className="mt-4 font-mono text-[11px] text-sand">
        Sources: CDC PLACES (county prevalence + ACCESS2) · Census ACS (poverty) · CMS Care Compare (hospital stars).
        {' '}<button onClick={() => onNavigate?.('about')} className="text-action hover:underline">About the data →</button>
      </p>
    </div>
  )
}
