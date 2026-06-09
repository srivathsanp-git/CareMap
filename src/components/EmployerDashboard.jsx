import { useState, useMemo } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { iowaCounties } from '../data/iowaCounties'
import { INDUSTRIES, COST_DRIVERS, employerHealthProfile } from '../utils/forecast'

const SORTED = [...iowaCounties].sort((a, b) => a.name.localeCompare(b.name))
const CARD = 'rounded-lg border border-ink/15 bg-paper'

const HEADCOUNT_OPTIONS = [
  { label: '< 50 employees',   value: 25   },
  { label: '50–250 employees', value: 125  },
  { label: '251–1,000',        value: 500  },
  { label: '1,001–5,000',      value: 2500 },
  { label: '5,000+',           value: 7500 },
]

const INTERVENTIONS = {
  'Manufacturing':        [
    { name: 'Diabetes Prevention Program (DPP)',  roi: '3.1×', saving: '$900/employee/yr' },
    { name: 'Smoking cessation + EAP bundle',     roi: '2.8×', saving: '$650/employee/yr' },
    { name: 'On-site occupational health clinic', roi: '2.4×', saving: '$800/employee/yr' },
  ],
  'Agriculture':          [
    { name: 'Mobile health unit + telehealth',    roi: '2.6×', saving: '$700/employee/yr' },
    { name: 'Mental health navigator program',    roi: '2.9×', saving: '$750/employee/yr' },
    { name: 'Diabetes + hypertension screening',  roi: '3.0×', saving: '$850/employee/yr' },
  ],
  'Healthcare':           [
    { name: 'Burnout & resilience program',       roi: '3.5×', saving: '$1,100/employee/yr' },
    { name: 'Employee assistance program (EAP)',  roi: '3.2×', saving: '$900/employee/yr' },
    { name: 'Preventive care incentive program',  roi: '2.7×', saving: '$600/employee/yr' },
  ],
  'Education':            [
    { name: 'Mental health first aid training',   roi: '2.8×', saving: '$650/employee/yr' },
    { name: 'Wellness + chronic disease coaching',roi: '2.5×', saving: '$500/employee/yr' },
    { name: 'ACA navigator + Medicaid enrollment',roi: '4.0×', saving: '$1,200/employee/yr' },
  ],
  'Retail / Hospitality': [
    { name: 'Obesity + metabolic health program', roi: '2.4×', saving: '$550/employee/yr' },
    { name: 'Smoking cessation support',          roi: '2.6×', saving: '$580/employee/yr' },
    { name: 'Mental health telehealth access',    roi: '2.9×', saving: '$650/employee/yr' },
  ],
  'Office / Tech':        [
    { name: 'Mental health & stress management',  roi: '3.1×', saving: '$780/employee/yr' },
    { name: 'Sedentary risk + ergonomics',        roi: '2.2×', saving: '$400/employee/yr' },
    { name: 'Preventive care + biometric screen', roi: '2.8×', saving: '$620/employee/yr' },
  ],
}

// Portal-recolored circular risk gauge.
function RiskGauge({ score }) {
  const c = 2 * Math.PI * 40
  const offset = c - (score / 100) * c
  const color = score >= 55 ? '#C9483D' : score >= 40 ? '#B5862B' : '#4C7A3B'
  const label = score >= 70 ? 'High risk' : score >= 55 ? 'Elevated' : score >= 40 ? 'Moderate' : 'Low risk'
  return (
    <div className="flex flex-col items-center">
      <svg width="104" height="104" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(26,26,26,0.10)" strokeWidth="9" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="9"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x="50" y="46" textAnchor="middle" fontSize="22" fontWeight="700" fontFamily="Fraunces, serif" fill="#1A1A1A">{score}</text>
        <text x="50" y="60" textAnchor="middle" fontSize="8" fontWeight="600" fill="#8A8478">/100</text>
      </svg>
      <span className="mt-1 font-mono text-[11px] uppercase tracking-wide" style={{ color }}>{label}</span>
    </div>
  )
}

function Bar({ pct, className = 'bg-ink' }) {
  return (
    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/10">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  )
}

function Choice({ active, children, ...props }) {
  return (
    <button {...props}
      className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${active ? 'border-action bg-action/10 text-action' : 'border-ink/20 text-ink2 hover:border-ink/40'}`}>
      {children}
    </button>
  )
}

export default function EmployerDashboard() {
  const [county,    setCounty]    = useState(null)
  const [industry,  setIndustry]  = useState('')
  const [headcount, setHeadcount] = useState(null)
  const [open,      setOpen]      = useState(false)
  const [query,     setQuery]     = useState('')

  const filtered = SORTED.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
  const canRun   = county && industry && headcount
  const profile  = useMemo(() => canRun ? employerHealthProfile(county, industry, headcount) : null, [county, industry, headcount])
  const recs     = INTERVENTIONS[industry] ?? []

  return (
    <div className="pb-4">
      {/* Hero */}
      <div className="mt-3">
        <div className="font-mono text-[11px] uppercase tracking-wider text-sand">Employer / payer dashboard</div>
        <h1 className="mt-1 font-display text-5xl font-semibold leading-none text-ink">Workforce health.</h1>
        <p className="mt-2 max-w-2xl text-ink2">
          Workforce health risk, cost drivers, and intervention ROI — based on CDC NIOSH, KFF, and SHRM benchmarks.
        </p>
      </div>

      {/* Config */}
      <div className={`${CARD} mt-6 p-5`}>
        <div className="font-display text-lg font-semibold text-ink">Configure your workforce</div>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-sand">County</p>
            <div className="relative">
              <button onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-ink/25 bg-paper px-4 py-2 text-sm font-medium text-ink hover:border-ink/50">
                {county ? `${county.name} County` : 'Select county…'}
                <ChevronDown className={`h-4 w-4 text-sand transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-ink/15 bg-paper shadow-xl">
                  <div className="flex items-center gap-2 border-b border-ink/10 px-3">
                    <Search className="h-4 w-4 text-sand" />
                    <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…"
                      className="h-10 w-full bg-transparent text-sm text-ink placeholder:text-sand focus:outline-none" />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filtered.map(c => (
                      <button key={c.fips} onClick={() => { setCounty(c); setOpen(false); setQuery('') }}
                        className="w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-paper2">{c.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-sand">Industry</p>
            <div className="space-y-1.5">
              {INDUSTRIES.map(ind => <Choice key={ind} active={industry === ind} onClick={() => setIndustry(ind)}>{ind}</Choice>)}
            </div>
          </div>

          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-sand">Workforce size</p>
            <div className="space-y-1.5">
              {HEADCOUNT_OPTIONS.map(opt => <Choice key={opt.value} active={headcount === opt.value} onClick={() => setHeadcount(opt.value)}>{opt.label}</Choice>)}
            </div>
          </div>
        </div>
      </div>

      {!profile ? (
        <div className={`${CARD} mt-4 py-16 text-center`}>
          <p className="font-display text-xl font-semibold text-ink">Select county, industry, and workforce size to generate your report</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className={`${CARD} flex flex-col items-center justify-center p-5`}>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-sand">Workforce health risk</p>
              <RiskGauge score={profile.riskScore} />
              <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wide text-sand">vs Iowa {industry} benchmark</p>
            </div>

            <div className={`${CARD} p-5`}>
              <p className="font-mono text-[11px] uppercase tracking-wide text-sand">Estimated annual cost</p>
              <p className="mt-2 font-display text-4xl font-semibold text-ink">${(profile.totalAnnualCost / 1000).toFixed(0)}k</p>
              <p className="text-sm text-ink2">Total healthcare spend</p>
              <div className="mt-3 space-y-1.5 border-t border-ink/10 pt-3">
                <div className="flex justify-between text-xs"><span className="text-ink2">Per employee / yr</span><span className="font-mono font-medium text-ink">${profile.costPerEmployee.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span className="text-ink2">Uninsured workers est.</span><span className="font-mono font-medium text-risk">{profile.uninsuredWorkers}</span></div>
              </div>
            </div>

            <div className="rounded-lg border border-ok/30 bg-ok/5 p-5">
              <p className="font-mono text-[11px] uppercase tracking-wide text-ok">Savings potential</p>
              <p className="mt-2 font-display text-4xl font-semibold text-ok">${(profile.savingsPotential / 1000).toFixed(0)}k</p>
              <p className="text-sm text-ink2">With evidence-based programs</p>
              <p className="mt-2 text-xs text-ink2">~12% reduction via DPP, cessation, and MH programs (KFF 2023)</p>
            </div>
          </div>

          {/* Top conditions */}
          <div className={`${CARD} p-5`}>
            <div className="font-display text-lg font-semibold text-ink">Top health-burden conditions</div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {profile.topConditions.map(cond => (
                <div key={cond.label} className="rounded-lg border border-ink/10 bg-paper2 p-4 text-center">
                  <p className="font-display text-2xl font-semibold text-ink">{cond.rate}%</p>
                  <p className="mt-1 text-xs font-medium text-ink">{cond.label}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-sand">est. workforce rate</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cost drivers */}
          <div className={`${CARD} p-5`}>
            <div className="font-display text-lg font-semibold text-ink">Cost-driver breakdown</div>
            <div className="mt-3 space-y-3">
              {COST_DRIVERS.map(d => (
                <div key={d.key} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-sm text-ink">{d.label}</span>
                  <Bar pct={d.pct * 100} className="bg-ink/70" />
                  <span className="w-32 shrink-0 text-right font-mono text-xs text-ink2">
                    {Math.round(d.pct * 100)}% · ${Math.round(profile.costPerEmployee * d.pct).toLocaleString()}/yr
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interventions */}
          <div className={`${CARD} p-5`}>
            <div className="flex items-baseline gap-2">
              <div className="font-display text-lg font-semibold text-ink">Recommended interventions</div>
              <span className="font-mono text-[11px] uppercase tracking-wide text-sand">for {industry}</span>
            </div>
            <div className="mt-3 space-y-2">
              {recs.map((rec, i) => (
                <div key={i} className="flex items-center justify-between gap-4 rounded-lg border border-ink/10 bg-paper2 p-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{rec.name}</p>
                    <p className="mt-0.5 text-xs text-ink2">Est. savings: <strong className="text-ink">{rec.saving}</strong></p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-lg font-semibold text-ok">{rec.roi}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wide text-sand">ROI</p>
                  </div>
                </div>
              ))}
              <p className="pt-1 font-mono text-[11px] text-sand">
                ROI estimates based on KFF Employer Health Benefits Survey, CDC Workplace Health Model, and RAND Corporation research.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
