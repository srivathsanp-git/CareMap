import { useState } from 'react'
import { MapPin, ChevronRight, Loader2 } from 'lucide-react'
import { iowaCounties, IOWA_AVERAGES } from '../data/iowaCounties'
import { AGE_MULTIPLIERS, SEX_MULTIPLIERS, personalRisk } from '../utils/forecast'
import { Pill } from '@/components/ui/pill'

const AGE_GROUPS  = ['18-34', '35-49', '50-64', '65+']
const SEX_OPTIONS = ['Male', 'Female', 'Prefer not to say']
const CARD = 'rounded-lg border border-ink/15 bg-paper'

const METRICS = [
  { key: 'diabetes',     label: 'Diabetes risk' },
  { key: 'obesity',      label: 'Obesity / metabolic' },
  { key: 'smoking',      label: 'Tobacco use' },
  { key: 'mentalHealth', label: 'Poor mental health' },
]

async function lookupCountyFromZip(zip) {
  const url  = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&countrycodes=us&format=json&addressdetails=1&limit=3`
  const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) return null
  const data = await res.json()
  const iowa = data.find(r => r.address?.state === 'Iowa' || r.address?.['ISO3166-2-lvl4'] === 'US-IA')
  if (!iowa) return null
  const name = (iowa.address?.county ?? '').replace(/\s*County\s*$/i, '').trim()
  return iowaCounties.find(c => c.name.toLowerCase() === name.toLowerCase()) ?? null
}

// Risk level vs Iowa average → portal styling (chip variant + bar/level color).
function riskLevel(personal, avg) {
  const r = personal / avg
  if (r >= 1.4)  return { label: 'High risk',     swatch: 'bg-heat-high', text: 'text-risk', variant: 'risk' }
  if (r >= 1.15) return { label: 'Above average', swatch: 'bg-heat-high', text: 'text-risk', variant: 'risk' }
  if (r >= 0.85) return { label: 'Average',       swatch: 'bg-heat-mid',  text: 'text-ink2', variant: 'default' }
  return               { label: 'Below average', swatch: 'bg-heat-low',  text: 'text-ok',   variant: 'action' }
}

// Inline portal progress bar.
function Bar({ pct, className = 'bg-ink' }) {
  return (
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  )
}

export default function PersonalRisk() {
  const [step,     setStep]     = useState(1)
  const [ageGroup, setAgeGroup] = useState('')
  const [sex,      setSex]      = useState('')
  const [zip,      setZip]      = useState('')
  const [loading,  setLoading]  = useState(false)
  const [county,   setCounty]   = useState(null)
  const [error,    setError]    = useState('')
  const [risks,    setRisks]    = useState(null)

  const canSubmit = ageGroup && sex && zip.length === 5

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const found = await lookupCountyFromZip(zip)
      if (!found) { setError('ZIP not found in Iowa. Please enter an Iowa ZIP code.'); setLoading(false); return }
      setCounty(found)
      setRisks(personalRisk(found, ageGroup, sex))
      setStep(2)
    } catch { setError('Could not look up ZIP. Please try again.') }
    setLoading(false)
  }

  const Choice = ({ active, children, ...props }) => (
    <button type="button" {...props}
      className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${active ? 'border-action bg-action/10 text-action' : 'border-ink/20 text-ink2 hover:border-ink/40'}`}>
      {children}
    </button>
  )

  return (
    <div className="pb-4">
      {/* Hero */}
      <div className="mt-3">
        <div className="font-mono text-[11px] uppercase tracking-wider text-sand">My risk profile</div>
        <h1 className="mt-1 font-display text-5xl font-semibold leading-none text-ink">Your health risk.</h1>
        <p className="mt-2 max-w-2xl text-ink2">
          Compare your estimated health risks to your county and Iowa averages, using age- and sex-adjusted
          epidemiological multipliers. Nothing is stored — it all runs in your browser.
        </p>
      </div>

      <div className="mt-6 max-w-3xl">
        {step === 1 && (
          <div className={`${CARD} p-6`}>
            <div className="font-display text-xl font-semibold text-ink">Enter your information</div>
            <p className="mt-1 text-sm text-ink2">No data is stored. All calculations happen in your browser.</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-sand">Age group</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {AGE_GROUPS.map(g => <Choice key={g} active={ageGroup === g} onClick={() => setAgeGroup(g)}>{g}</Choice>)}
                </div>
              </div>

              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-sand">Sex</p>
                <div className="grid grid-cols-3 gap-2">
                  {SEX_OPTIONS.map(s => <Choice key={s} active={sex === s} onClick={() => setSex(s)}>{s}</Choice>)}
                </div>
              </div>

              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-sand">Iowa ZIP code</p>
                <div className="relative w-full sm:w-52">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand" />
                  <input type="text" inputMode="numeric" maxLength={5} value={zip}
                    onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="e.g. 50266"
                    className={`h-10 w-full rounded-lg border bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-sand focus:outline-none ${error ? 'border-risk' : 'border-ink/20'}`} />
                </div>
                {error && <p className="mt-2 text-sm text-risk">{error}</p>}
              </div>

              <button type="submit" disabled={!canSubmit || loading}
                className="inline-flex items-center gap-1.5 rounded-full bg-action px-5 py-2.5 text-sm font-medium text-white hover:bg-action/90 disabled:opacity-40">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Looking up county…</> : <>Calculate my risk <ChevronRight className="h-4 w-4" /></>}
              </button>
            </form>

            <p className="mt-6 border-t border-ink/10 pt-4 font-mono text-[11px] leading-relaxed text-sand">
              Disclaimer: uses age- and sex-adjusted population-level multipliers (CDC NHANES, BRFSS). Results are
              statistical estimates for educational purposes only — not medical advice.
            </p>
          </div>
        )}

        {step === 2 && county && risks && (
          <div className="space-y-4">
            <div className={`${CARD} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-2xl font-semibold text-ink">Your risk profile</div>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-sand">{ageGroup} · {sex} · {county.name} County · ZIP {zip}</p>
                </div>
                <button onClick={() => { setStep(1); setCounty(null); setRisks(null); setError('') }}
                  className="rounded-full border border-ink/25 px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5">Start over</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill size="sm">{county.name} County · {county.pop.toLocaleString()}</Pill>
                <Pill size="sm">{county.providerDensity.toFixed(1)} providers/1k</Pill>
                <Pill size="sm">${county.acaPremium}/mo ACA premium</Pill>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {METRICS.map(m => {
                const personal = risks[m.key], countyVal = county[m.key], iowaVal = IOWA_AVERAGES[m.key]
                const lvl = riskLevel(personal, iowaVal)
                const maxVal = Math.max(personal, countyVal, iowaVal, 5) * 1.3
                const rows = [
                  { label: 'Your est. risk', value: personal, cls: 'bg-ink' },
                  { label: 'County avg',     value: countyVal, cls: 'bg-ink/40' },
                  { label: 'Iowa avg',       value: iowaVal,   cls: 'bg-sand' },
                ]
                return (
                  <div key={m.key} className={`${CARD} p-4`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-mono text-[11px] uppercase tracking-wide text-sand">{m.label}</div>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide">
                        <span className={`h-2.5 w-2.5 rounded-sm border border-ink/30 ${lvl.swatch}`} />
                        <span className={lvl.text}>{lvl.label}</span>
                      </span>
                    </div>
                    <div className="mt-2 font-display text-3xl font-semibold text-ink">
                      {personal.toFixed(1)}<span className="text-base font-normal text-sand">%</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {rows.map(row => (
                        <div key={row.label} className="flex items-center gap-2">
                          <span className="w-20 shrink-0 text-right font-mono text-[10px] text-sand">{row.label}</span>
                          <Bar pct={(row.value / maxVal) * 100} className={row.cls} />
                          <span className="w-10 shrink-0 text-right font-mono text-xs text-ink">{row.value.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className={`${CARD} p-5`}>
              <div className="font-display text-lg font-semibold text-ink">What this means for you</div>
              <div className="mt-3 space-y-3">
                {METRICS.map(m => {
                  const lvl = riskLevel(risks[m.key], IOWA_AVERAGES[m.key])
                  if (lvl.label === 'Below average') return null
                  return (
                    <div key={m.key} className="text-sm">
                      <span className="font-semibold text-ink">{m.label}: </span>
                      <span className="text-ink2">
                        {lvl.label === 'High risk' ? 'Significantly elevated — proactive screening recommended.' :
                         lvl.label === 'Above average' ? 'Moderately elevated — discuss with your provider.' :
                         'Near average — maintain current health habits.'}
                      </span>
                    </div>
                  )
                }).filter(Boolean)}
                {METRICS.every(m => riskLevel(risks[m.key], IOWA_AVERAGES[m.key]).label === 'Below average') && (
                  <p className="text-sm font-medium text-ok">Your risk profile is below the Iowa average across all measured indicators.</p>
                )}
                <p className="border-t border-ink/10 pt-3 font-mono text-[11px] text-sand">
                  Estimates use age/sex multipliers from CDC NHANES and BRFSS. Not medical advice.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
