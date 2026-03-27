import { IOWA_AVERAGES } from '../data/iowaCounties'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const SDOH_METRICS = [
  { key: 'poverty',    label: 'Poverty Rate',       icon: '💸', unit: '%', desc: 'Residents below federal poverty line', source: 'ACS 2022' },
  { key: 'uninsured',  label: 'Uninsured Rate',      icon: '🏥', unit: '%', desc: 'Adults without health insurance',       source: 'ACS 2022' },
  { key: 'noVehicle',  label: 'No Vehicle Access',   icon: '🚗', unit: '%', desc: 'Households with no vehicle',           source: 'ACS 2022' },
  { key: 'medianAge',  label: 'Median Age',          icon: '👥', unit: ' yrs', desc: 'Median resident age',              source: 'ACS 2022', noCompare: true },
  { key: 'medicaidPct',label: 'Medicaid Coverage',   icon: '📋', unit: '%', desc: 'Residents enrolled in Medicaid',       source: 'CMS 2023' },
]

function SDOHCard({ metric, value, avg }) {
  const diff    = value - avg
  const pctDiff = Math.abs((diff / avg) * 100).toFixed(0)
  const isAbove = diff > 0.3
  const isBelow = diff < -0.3

  // For age: higher isn't worse
  // For no vehicle, poverty, uninsured, medicaid: higher = worse
  const worseBetter = metric.key === 'medianAge'
    ? null
    : metric.key === 'medicaidPct'
    ? null  // neutral
    : isAbove ? 'worse' : isBelow ? 'better' : 'same'

  const colors =
    worseBetter === 'worse' ? { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',   badge: 'bg-red-100 text-red-800' }
    : worseBetter === 'better' ? { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' }
    : { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-600' }

  return (
    <div className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{metric.icon}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{metric.label}</span>
          </div>
          <p className={`text-3xl font-extrabold ${colors.text}`}>
            {metric.key === 'medianAge' ? value.toFixed(1) : value.toFixed(1)}{metric.unit}
          </p>
        </div>
        {!metric.noCompare && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
            {isAbove ? <TrendingUp className="w-3 h-3" /> : isBelow ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {isAbove ? '+' : isBelow ? '-' : ''}{pctDiff}%
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{metric.desc}</span>
        {!metric.noCompare && (
          <span className="text-slate-400">Iowa avg: {avg}{metric.unit}</span>
        )}
      </div>
      <div className="mt-1 text-[10px] text-slate-400">Source: {metric.source}</div>
    </div>
  )
}

export default function SDOHProfile({ county }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Social Determinants of Health</strong> — These upstream factors shape who gets sick and who can access care,
        often before they ever see a doctor.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SDOH_METRICS.map(m => (
          <SDOHCard
            key={m.key}
            metric={m}
            value={county[m.key]}
            avg={IOWA_AVERAGES[m.key]}
          />
        ))}
      </div>
    </div>
  )
}
