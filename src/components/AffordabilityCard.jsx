import { DollarSign, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { IOWA_AVERAGES } from '../data/iowaCounties'

export default function AffordabilityCard({ county }) {
  const premiumDiff   = county.acaPremium - IOWA_AVERAGES.acaPremium
  const premiumAbove  = premiumDiff > 10
  const premiumBelow  = premiumDiff < -10
  const medicaidAbove = county.medicaidPct > IOWA_AVERAGES.medicaidPct + 2

  const annualPremium  = county.acaPremium * 12
  const deductibleEst  = 4800   // avg silver plan deductible IA 2024
  const oopMax         = 9450   // ACA out-of-pocket max 2024

  return (
    <div className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
        <strong>Affordability matters</strong> — Even where providers exist, cost is the #1 reason Iowans skip care.
        These metrics show whether residents can realistically afford coverage.
      </div>

      {/* ACA Premium */}
      <div className={`rounded-2xl border-2 p-5 ${premiumAbove ? 'bg-red-50 border-red-200' : premiumBelow ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ACA Benchmark Premium</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-extrabold ${premiumAbove ? 'text-red-700' : premiumBelow ? 'text-green-700' : 'text-slate-800'}`}>
                ${county.acaPremium}
              </span>
              <span className="text-slate-500 text-sm">/month</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">40-year-old, Silver SLCSP, before subsidies · CMS 2024</p>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
            premiumAbove ? 'bg-red-100 text-red-800' : premiumBelow ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
          }`}>
            {premiumAbove ? <TrendingUp className="w-3 h-3" /> : premiumBelow ? <TrendingDown className="w-3 h-3" /> : null}
            {premiumAbove ? '+' : ''}{premiumDiff > 0 ? '+' : ''}${Math.round(premiumDiff)}/mo vs Iowa avg
          </div>
        </div>

        {/* Annual cost breakdown */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Annual Premiums', value: `$${annualPremium.toLocaleString()}` },
            { label: 'Est. Deductible',  value: `$${deductibleEst.toLocaleString()}` },
            { label: 'OOP Maximum',      value: `$${oopMax.toLocaleString()}` },
          ].map(item => (
            <div key={item.label} className="bg-white/70 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
              <p className="font-bold text-slate-800 text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Medicaid */}
      <div className={`rounded-2xl border-2 p-5 ${medicaidAbove ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📋</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Medicaid Enrollment</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-extrabold ${medicaidAbove ? 'text-blue-700' : 'text-slate-800'}`}>
                {county.medicaidPct.toFixed(1)}%
              </span>
              <span className="text-slate-500 text-sm">of residents</span>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
            county.medicaidPct >= 24 ? 'bg-blue-100 text-blue-800' :
            county.medicaidPct >= 18 ? 'bg-slate-100 text-slate-700' :
                                       'bg-slate-100 text-slate-600'
          }`}>
            {county.medicaidPct >= 24 ? 'High dependency' :
             county.medicaidPct >= 18 ? 'Moderate' : 'Below avg'}
          </div>
        </div>

        {/* Bar */}
        <div className="relative h-2.5 bg-white rounded-full overflow-hidden mb-1">
          <div
            className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min((county.medicaidPct / 35) * 100, 100)}%` }}
          />
          <div className="absolute top-0 h-full w-0.5 bg-slate-400" style={{ left: `${(16 / 35) * 100}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mb-3">
          <span>0%</span><span>Iowa avg: 16%</span><span>35%</span>
        </div>

        {medicaidAbove && (
          <p className="text-xs text-blue-700 bg-blue-100 rounded-lg px-3 py-2">
            Higher Medicaid concentration signals greater reliance on public coverage — provider reimbursement rates
            can affect whether clinics accept new Medicaid patients.
          </p>
        )}
      </div>

      {/* Affordability index */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Cost Context</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Iowa Medicaid expansion', value: 'Active since 2014', positive: true },
            { label: 'Premium subsidy threshold', value: '100–400% FPL', positive: true },
            { label: 'Avg subsidy eligible (IA)', value: '~68% of ACA enrollees', positive: true },
            { label: 'Uncompensated care risk', value: county.uninsured > 7 ? 'Elevated' : 'Moderate', positive: county.uninsured <= 7 },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-2">
              <span className={`mt-0.5 text-base ${item.positive ? 'text-green-500' : 'text-red-500'}`}>
                {item.positive ? '✓' : '⚠'}
              </span>
              <div>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-xs font-semibold text-slate-700">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-500">
          ACA premium: CMS Health Insurance Marketplace 2024 Silver SLCSP for a 40-year-old non-smoker, before
          premium tax credits. Medicaid: CMS Medicaid enrollment data 2023. OOP max: ACA 2024 limit.
        </p>
      </div>
    </div>
  )
}
