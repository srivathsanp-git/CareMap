import { useState, useMemo } from 'react'
import { Briefcase, ChevronDown } from 'lucide-react'
import { iowaCounties } from '../data/iowaCounties'
import { INDUSTRIES, COST_DRIVERS, employerHealthProfile } from '../utils/forecast'

const SORTED = [...iowaCounties].sort((a, b) => a.name.localeCompare(b.name))

const HEADCOUNT_OPTIONS = [
  { label: '< 50 employees',    value: 25   },
  { label: '50–250 employees',  value: 125  },
  { label: '251–1,000',         value: 500  },
  { label: '1,001–5,000',       value: 2500 },
  { label: '5,000+',            value: 7500 },
]

const INTERVENTIONS = {
  'Manufacturing':        [
    { name: 'Diabetes Prevention Program (DPP)',      roi: '3.1×', saving: '900/employee/yr',  icon: '🩸' },
    { name: 'Smoking cessation + EAP bundle',          roi: '2.8×', saving: '650/employee/yr',  icon: '🚬' },
    { name: 'On-site occupational health clinic',     roi: '2.4×', saving: '800/employee/yr',  icon: '🏥' },
  ],
  'Agriculture':          [
    { name: 'Mobile health unit + telehealth access', roi: '2.6×', saving: '700/employee/yr',  icon: '🚐' },
    { name: 'Mental health navigator program',        roi: '2.9×', saving: '750/employee/yr',  icon: '🧠' },
    { name: 'Diabetes + hypertension screening',      roi: '3.0×', saving: '850/employee/yr',  icon: '🩸' },
  ],
  'Healthcare':           [
    { name: 'Burnout & resilience program',           roi: '3.5×', saving: '1,100/employee/yr', icon: '🧠' },
    { name: 'Employee assistance program (EAP)',      roi: '3.2×', saving: '900/employee/yr',  icon: '💼' },
    { name: 'Preventive care incentive program',      roi: '2.7×', saving: '600/employee/yr',  icon: '🔬' },
  ],
  'Education':            [
    { name: 'Mental health first aid training',       roi: '2.8×', saving: '650/employee/yr',  icon: '🧠' },
    { name: 'Wellness + chronic disease coaching',    roi: '2.5×', saving: '500/employee/yr',  icon: '💪' },
    { name: 'ACA navigator + Medicaid enrollment',   roi: '4.0×', saving: '1,200/employee/yr', icon: '📋' },
  ],
  'Retail / Hospitality': [
    { name: 'Obesity + metabolic health program',     roi: '2.4×', saving: '550/employee/yr',  icon: '⚖️' },
    { name: 'Smoking cessation support',              roi: '2.6×', saving: '580/employee/yr',  icon: '🚬' },
    { name: 'Mental health telehealth access',        roi: '2.9×', saving: '650/employee/yr',  icon: '🧠' },
  ],
  'Office / Tech':        [
    { name: 'Mental health & stress management',     roi: '3.1×', saving: '780/employee/yr',  icon: '🧠' },
    { name: 'Sedentary risk + ergonomics program',    roi: '2.2×', saving: '400/employee/yr',  icon: '🏃' },
    { name: 'Preventive care + biometric screening',  roi: '2.8×', saving: '620/employee/yr',  icon: '🔬' },
  ],
}

function RiskGauge({ score }) {
  const c = 2 * Math.PI * 40
  const offset = c - (score / 100) * c
  const color = score >= 70 ? '#ef4444' : score >= 55 ? '#f97316' : score >= 40 ? '#eab308' : '#22c55e'
  const label = score >= 70 ? 'High Risk' : score >= 55 ? 'Elevated' : score >= 40 ? 'Moderate' : 'Low Risk'
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x="50" y="45" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0f172a">{score}</text>
        <text x="50" y="59" textAnchor="middle" fontSize="8"  fontWeight="600" fill="#64748b">/100</text>
      </svg>
      <span className="text-xs font-bold mt-1" style={{ color }}>{label}</span>
    </div>
  )
}

export default function EmployerDashboard() {
  const [county,    setCounty]    = useState(null)
  const [industry,  setIndustry]  = useState('')
  const [headcount, setHeadcount] = useState(null)
  const [open,      setOpen]      = useState(false)
  const [query,     setQuery]     = useState('')

  const filtered  = SORTED.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
  const canRun    = county && industry && headcount

  const profile = useMemo(() => {
    if (!canRun) return null
    return employerHealthProfile(county, industry, headcount)
  }, [county, industry, headcount])

  const recommendations = INTERVENTIONS[industry] ?? []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-slate-900">Employer / Payer Dashboard</h2>
          </div>
          <p className="text-slate-500 text-sm">
            Workforce health risk profile, cost drivers, and intervention ROI estimates
            for Iowa employers and health plans. Based on CDC NIOSH, KFF, and SHRM benchmarks.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Configure your workforce</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* County */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">County</label>
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-left text-sm font-medium text-slate-800 hover:border-blue-400 transition-colors"
                >
                  {county ? `${county.name} County` : 'Select county…'}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                        placeholder="Search…"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filtered.map(c => (
                        <button key={c.fips} onClick={() => { setCounty(c); setOpen(false); setQuery('') }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 text-slate-700 transition-colors">
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Industry</label>
              <div className="space-y-1.5">
                {INDUSTRIES.map(ind => (
                  <button key={ind} onClick={() => setIndustry(ind)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      industry === ind
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>{ind}</button>
                ))}
              </div>
            </div>

            {/* Headcount */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Workforce Size</label>
              <div className="space-y-1.5">
                {HEADCOUNT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setHeadcount(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      headcount === opt.value
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>{opt.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {!profile ? (
          <div className="text-center py-16 text-slate-400">
            <span className="text-5xl">🏢</span>
            <p className="mt-4 font-medium text-slate-500">Select county, industry, and workforce size to generate your report</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Risk + cost summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-center justify-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Workforce Health Risk</p>
                <RiskGauge score={profile.riskScore} />
                <p className="text-xs text-slate-400 text-center mt-2">vs Iowa {industry} benchmark</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Estimated Annual Cost</p>
                <p className="text-3xl font-extrabold text-slate-900">
                  ${(profile.totalAnnualCost / 1000).toFixed(0)}k
                </p>
                <p className="text-sm text-slate-500 mt-1">Total healthcare spend</p>
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Per employee / yr</span>
                    <span className="font-bold text-slate-700">${profile.costPerEmployee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Uninsured workers est.</span>
                    <span className="font-bold text-red-600">{profile.uninsuredWorkers}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">Savings Potential</p>
                <p className="text-3xl font-extrabold text-green-700">
                  ${(profile.savingsPotential / 1000).toFixed(0)}k
                </p>
                <p className="text-sm text-green-600 mt-1">With evidence-based programs</p>
                <p className="text-xs text-green-500 mt-2">~12% reduction achievable via DPP, cessation, and MH programs (KFF 2023)</p>
              </div>
            </div>

            {/* Top conditions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h4 className="font-semibold text-slate-800 mb-4">Top Health Burden Conditions</h4>
              <div className="grid grid-cols-3 gap-4">
                {profile.topConditions.map((cond, i) => (
                  <div key={cond.label} className="text-center p-4 bg-slate-50 rounded-xl">
                    <span className="text-2xl">{cond.icon}</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-2">{cond.rate}%</p>
                    <p className="text-xs text-slate-600 font-medium mt-1">{cond.label}</p>
                    <span className="text-[10px] text-slate-400">est. workforce rate</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost driver breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h4 className="font-semibold text-slate-800 mb-4">Cost Driver Breakdown</h4>
              <div className="space-y-3">
                {COST_DRIVERS.map(d => {
                  const amt = Math.round(profile.costPerEmployee * d.pct)
                  return (
                    <div key={d.key} className="flex items-center gap-3">
                      <span className="text-lg w-6 flex-shrink-0">{d.icon}</span>
                      <span className="text-sm text-slate-700 w-40 flex-shrink-0">{d.label}</span>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${d.pct * 100}%`, opacity: 0.6 + d.pct }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-20 text-right">
                        {Math.round(d.pct * 100)}% · ${amt}/yr
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recommended interventions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h4 className="font-semibold text-slate-800 mb-4">
                Recommended Interventions
                <span className="ml-2 text-xs font-normal text-slate-400">for {industry}</span>
              </h4>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{rec.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Est. savings: <strong>{rec.saving}</strong></p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-green-700 font-extrabold text-lg">{rec.roi}</span>
                      <p className="text-[10px] text-slate-400">ROI</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                ROI and savings estimates based on KFF Employer Health Benefits Survey, CDC Workplace Health Model,
                and RAND Corporation employer wellness research. Individual results vary.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
