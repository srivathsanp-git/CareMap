import { useState } from 'react'
import { User, MapPin, ChevronRight } from 'lucide-react'
import { iowaCounties, IOWA_AVERAGES } from '../data/iowaCounties'
import { AGE_MULTIPLIERS, SEX_MULTIPLIERS, personalRisk } from '../utils/forecast'

const AGE_GROUPS = ['18-34', '35-49', '50-64', '65+']
const SEX_OPTIONS = ['Male', 'Female', 'Prefer not to say']

const METRICS = [
  { key: 'diabetes',    label: 'Diabetes Risk',       icon: '🩸', unit: '%', color: '#ef4444' },
  { key: 'obesity',     label: 'Obesity / Metabolic', icon: '⚖️', unit: '%', color: '#f97316' },
  { key: 'smoking',     label: 'Tobacco Use',         icon: '🚬', unit: '%', color: '#64748b' },
  { key: 'mentalHealth',label: 'Poor Mental Health',  icon: '🧠', unit: '%', color: '#8b5cf6' },
]

async function lookupCountyFromZip(zip) {
  const url = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&countrycodes=us&format=json&addressdetails=1&limit=3`
  const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) return null
  const data = await res.json()
  const iowaResult = data.find(r => r.address?.state === 'Iowa' || r.address?.['ISO3166-2-lvl4'] === 'US-IA')
  if (!iowaResult) return null
  const rawCounty = iowaResult.address?.county ?? ''
  const countyName = rawCounty.replace(/\s*County\s*$/i, '').trim()
  return iowaCounties.find(c => c.name.toLowerCase() === countyName.toLowerCase()) ?? null
}

function RiskBar({ personal, countyVal, iowaVal, color }) {
  const max = Math.max(personal, countyVal, iowaVal, 5) * 1.3
  return (
    <div className="space-y-1.5">
      {[
        { label: 'Your est. risk', value: personal, bold: true },
        { label: 'County avg',     value: countyVal },
        { label: 'Iowa avg',       value: iowaVal, muted: true },
      ].map(row => (
        <div key={row.label} className="flex items-center gap-2">
          <span className={`text-[10px] w-20 text-right flex-shrink-0 ${row.muted ? 'text-slate-400' : row.bold ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
            {row.label}
          </span>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (row.value / max) * 100)}%`,
                backgroundColor: row.bold ? color : row.muted ? '#94a3b8' : `${color}99`,
              }}
            />
          </div>
          <span className={`text-xs font-bold w-10 ${row.bold ? 'text-slate-900' : 'text-slate-400'}`}>
            {row.value.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )
}

function riskLevel(personal, iowaAvg) {
  const ratio = personal / iowaAvg
  if (ratio >= 1.4) return { label: 'High Risk',     cls: 'bg-red-100 text-red-700',     emoji: '🔴' }
  if (ratio >= 1.15)return { label: 'Above Average', cls: 'bg-orange-100 text-orange-700', emoji: '🟠' }
  if (ratio >= 0.85)return { label: 'Average',       cls: 'bg-yellow-100 text-yellow-700', emoji: '🟡' }
  return               { label: 'Below Average',  cls: 'bg-green-100 text-green-700',   emoji: '🟢' }
}

export default function PersonalRisk() {
  const [step,       setStep]       = useState(1)   // 1=form, 2=results
  const [ageGroup,   setAgeGroup]   = useState('')
  const [sex,        setSex]        = useState('')
  const [zip,        setZip]        = useState('')
  const [loading,    setLoading]    = useState(false)
  const [county,     setCounty]     = useState(null)
  const [error,      setError]      = useState('')
  const [risks,      setRisks]      = useState(null)

  const canSubmit = ageGroup && sex && zip.length === 5

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const found = await lookupCountyFromZip(zip)
      if (!found) {
        setError('ZIP not found in Iowa. Please enter an Iowa ZIP code.')
        setLoading(false)
        return
      }
      const computed = personalRisk(found, ageGroup, sex)
      setCounty(found)
      setRisks(computed)
      setStep(2)
    } catch {
      setError('Could not look up ZIP. Please try again.')
    }
    setLoading(false)
  }

  function reset() {
    setStep(1)
    setCounty(null)
    setRisks(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-slate-900">Personal Health Risk Profile</h2>
          </div>
          <p className="text-slate-500 text-sm">
            Compare your estimated health risks to your local county and Iowa averages
            using age- and sex-adjusted epidemiological multipliers.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <h3 className="font-bold text-slate-900 text-lg mb-1">Enter your information</h3>
            <p className="text-slate-400 text-sm mb-6">No data is stored. All calculations are done in your browser.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Age group */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Age Group</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AGE_GROUPS.map(g => (
                    <button
                      key={g} type="button"
                      onClick={() => setAgeGroup(g)}
                      className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${
                        ageGroup === g
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >{g}</button>
                  ))}
                </div>
              </div>

              {/* Sex */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Sex</label>
                <div className="grid grid-cols-3 gap-2">
                  {SEX_OPTIONS.map(s => (
                    <button
                      key={s} type="button"
                      onClick={() => setSex(s)}
                      className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${
                        sex === s
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {/* ZIP */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Iowa ZIP Code</label>
                <div className="relative w-full sm:w-48">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={zip}
                    onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="e.g. 50266"
                    className="w-full pl-9 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-40 hover:bg-blue-800 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Looking up county…
                  </span>
                ) : (
                  <>Calculate My Risk <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong>Disclaimer:</strong> This tool uses age- and sex-adjusted population-level
                epidemiological multipliers (CDC NHANES, BRFSS, National Diabetes Statistics Report).
                Results are statistical estimates for educational purposes only — not medical advice.
                Consult a healthcare provider for personal health assessment.
              </p>
            </div>
          </div>
        )}

        {step === 2 && county && risks && (
          <div className="space-y-5">
            {/* Summary header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xl">Your Risk Profile</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {ageGroup} · {sex} · {county.name} County (ZIP {zip})
                  </p>
                </div>
                <button onClick={reset}
                  className="text-xs text-blue-600 font-semibold hover:underline flex-shrink-0">
                  ← Start over
                </button>
              </div>

              {/* County context */}
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-medium">
                  📍 {county.name} County · Pop {county.pop.toLocaleString()}
                </span>
                <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-medium">
                  🏥 {county.providerDensity.toFixed(1)} providers/1k
                </span>
                <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-medium">
                  💰 ${county.acaPremium}/mo ACA premium
                </span>
              </div>
            </div>

            {/* Risk cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {METRICS.map(m => {
                const personal = risks[m.key]
                const countyVal = county[m.key]
                const iowaVal   = IOWA_AVERAGES[m.key]
                const lvl = riskLevel(personal, iowaVal)
                return (
                  <div key={m.key} className="bg-white rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{m.icon}</span>
                        <span className="text-sm font-semibold text-slate-700">{m.label}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lvl.cls}`}>
                        {lvl.emoji} {lvl.label}
                      </span>
                    </div>
                    <p className="text-3xl font-extrabold mb-3" style={{ color: m.color }}>
                      {personal.toFixed(1)}<span className="text-base font-normal text-slate-400 ml-1">%</span>
                    </p>
                    <RiskBar personal={personal} countyVal={countyVal} iowaVal={iowaVal} color={m.color} />
                  </div>
                )
              })}
            </div>

            {/* What this means */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h4 className="font-semibold text-slate-800 mb-3">What this means for you</h4>
              <div className="space-y-2">
                {METRICS.map(m => {
                  const personal = risks[m.key]
                  const iowaVal  = IOWA_AVERAGES[m.key]
                  const lvl = riskLevel(personal, iowaVal)
                  if (lvl.label === 'Below Average') return null
                  return (
                    <div key={m.key} className="flex items-start gap-3 text-sm">
                      <span className="text-lg flex-shrink-0">{m.icon}</span>
                      <div>
                        <span className="font-semibold text-slate-800">{m.label}: </span>
                        <span className="text-slate-600">
                          {lvl.label === 'High Risk' ? 'Significantly elevated — proactive screening recommended.' :
                           lvl.label === 'Above Average' ? 'Moderately elevated — discuss with your provider.' :
                           'Near average — maintain current health habits.'}
                        </span>
                      </div>
                    </div>
                  )
                }).filter(Boolean)}
                {METRICS.every(m => riskLevel(risks[m.key], IOWA_AVERAGES[m.key]).label === 'Below Average') && (
                  <p className="text-green-700 text-sm font-medium">✅ Your risk profile is below Iowa average across all measured indicators.</p>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Estimates use age/sex multipliers from CDC NHANES and BRFSS. Not medical advice.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
