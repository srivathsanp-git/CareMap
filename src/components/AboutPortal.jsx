import { Gift, ShieldCheck, RefreshCw, BookOpen, ExternalLink } from 'lucide-react'
import { COUNTY_COUNT } from '@/utils/healthScore'
import { KEY_MEASURES } from '@/utils/cdcPlaces'
import { Stat } from '@/components/ui/stat'
import { SectionHead } from '@/components/ui/section-head'

const CARD = 'rounded-lg border border-ink/15 bg-paper'

const PRINCIPLES = [
  { icon: Gift,        title: 'Free, forever', desc: 'No paywall, no login, no data sold.' },
  { icon: ShieldCheck, title: 'Public sources only', desc: 'Every number traces to a citable federal or state dataset.' },
  { icon: RefreshCw,   title: 'Refreshed at the source', desc: 'Pulled from live APIs and the latest public releases.' },
  { icon: BookOpen,    title: 'Open methodology', desc: 'Scores are plain percentiles — the formula is on this page.' },
]

const SOURCES = [
  { name: 'CDC PLACES', covers: 'County chronic-condition & behavior prevalence', url: 'https://www.cdc.gov/places' },
  { name: 'Census ACS 2022 5-yr', covers: 'Uninsured, poverty, vehicle access, age', url: 'https://www.census.gov/programs-surveys/acs' },
  { name: 'HRSA HPSA', covers: 'Primary-care / mental-health / dental shortage areas', url: 'https://data.hrsa.gov' },
  { name: 'CMS Care Compare', covers: 'Hospital overall star ratings & quality', url: 'https://www.medicare.gov/care-compare' },
  { name: 'CMS NPPES (NPI)', covers: 'Provider registry — search & profiles', url: 'https://npiregistry.cms.hhs.gov' },
  { name: 'OpenStreetMap / Nominatim', covers: 'Geocoding ZIPs to map coordinates', url: 'https://www.openstreetmap.org' },
]

const METHOD = [
  { n: '1', t: 'PULL', d: 'Live CDC PLACES, ACS, HRSA, CMS & NPI.' },
  { n: '2', t: 'CLEAN', d: 'Normalize to county FIPS; flag gaps.' },
  { n: '3', t: 'BENCHMARK', d: 'Percentile-rank each measure across Iowa.' },
  { n: '4', t: 'PUBLISH', d: 'Average into a 0–100 county score.' },
]

export default function AboutPortal({ onNavigate }) {
  return (
    <div className="mx-auto max-w-[1280px] px-8 pb-16">
      {/* Mission hero */}
      <section className="flex flex-col items-start justify-between gap-8 pt-12 lg:flex-row">
        <div className="max-w-[720px]">
          <div className="font-mono text-[11px] uppercase tracking-wider text-sand">About CareMap Iowa</div>
          <h1 className="mt-3 font-display text-[56px] font-semibold leading-[0.98] tracking-tight text-ink">
            Public health data, made useful.
          </h1>
          <p className="mt-4 max-w-[640px] text-lg text-ink2">
            Six public datasets in one place you can search, compare, and act on — no research-portal
            login, no statistics degree. Built around live federal and state APIs, not a black box.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-full bg-action px-5 py-2.5 text-sm font-medium text-white hover:bg-action/90">Read methodology</button>
            <button onClick={() => onNavigate?.('local')} className="rounded-full border border-ink/25 px-5 py-2.5 text-sm font-medium text-ink hover:bg-ink/5">Explore counties</button>
          </div>
        </div>
        <div className="flex gap-8">
          <Stat num={String(SOURCES.length)} label="sources" size="sm" />
          <Stat num={String(COUNTY_COUNT)} label="counties" size="sm" />
          <Stat num={String(KEY_MEASURES.length)} label="metrics" size="sm" />
        </div>
      </section>

      {/* Principles */}
      <section className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PRINCIPLES.map((p) => {
          const Icon = p.icon
          return (
            <div key={p.title} className={`${CARD} p-4`}>
              <Icon className="h-6 w-6 text-action" strokeWidth={1.75} />
              <div className="mt-3 font-display text-lg font-semibold text-ink">{p.title}</div>
              <p className="mt-1.5 text-sm text-ink2">{p.desc}</p>
            </div>
          )
        })}
      </section>

      {/* Sources + method */}
      <section className="mt-10 flex flex-col gap-4 lg:flex-row">
        <div className={`${CARD} flex-1 p-4`}>
          <div className="font-mono text-[11px] uppercase tracking-wide text-ink">Data sources</div>
          <div className="mt-2">
            {SOURCES.map((s, i) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-3 py-2.5 ${i ? 'border-t border-dashed border-ink/15' : ''} group`}
              >
                <span className="w-44 shrink-0 font-display text-[15px] font-semibold text-ink">{s.name}</span>
                <span className="flex-1 text-sm text-ink2">{s.covers}</span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase text-action group-hover:underline">
                  view <ExternalLink className="h-3 w-3" />
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-[420px]">
          <div className="font-mono text-[11px] uppercase tracking-wide text-ink">From raw data to your screen</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {METHOD.map((m) => (
              <div key={m.n} className={`${CARD} p-3 text-center`}>
                <div className="font-display text-2xl font-semibold text-ink">{m.n}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-wide text-sand">{m.t}</div>
                <div className="mt-1 text-[11px] leading-snug text-ink2">{m.d}</div>
              </div>
            ))}
          </div>
          <div className={`${CARD} p-4`}>
            <div className="font-mono text-[11px] uppercase tracking-wide text-ink">Team & funding</div>
            <p className="mt-2 text-sm leading-relaxed text-ink2">
              An open-source project built on public data for consumers, researchers, and community health
              advocates. No commercial sponsors — data is licensed CC BY 4.0; the code is MIT.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 font-mono text-[11px] text-sand">
        Methodology note: the 0–100 health score is the equal-weight average of a county's percentile rank
        (vs all {COUNTY_COUNT} Iowa counties) across six measured indicators — diabetes, obesity, smoking,
        poor mental health, and uninsured (live CDC PLACES), plus poverty (Census ACS). No estimated or
        modeled inputs. CDC PLACES loads live in-app; poverty uses the bundled snapshot where the keyed
        Census API is unavailable.
      </p>
    </div>
  )
}
