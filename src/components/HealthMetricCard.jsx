import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const METRIC_CONFIG = {
  diabetes: {
    label:   'Diabetes',
    icon:    '🩸',
    unit:    '% adults',
    description: 'Adults diagnosed with diabetes',
    color:   { above: 'red', below: 'green', same: 'slate' },
  },
  obesity: {
    label:   'Obesity',
    icon:    '⚖️',
    unit:    '% adults',
    description: 'Adults with BMI ≥ 30',
    color:   { above: 'orange', below: 'green', same: 'slate' },
  },
  smoking: {
    label:   'Smoking',
    icon:    '🚬',
    unit:    '% adults',
    description: 'Current cigarette smokers',
    color:   { above: 'yellow', below: 'green', same: 'slate' },
  },
  mentalHealth: {
    label:   'Poor Mental Health',
    icon:    '🧠',
    unit:    '% adults',
    description: '≥14 poor mental health days/month',
    color:   { above: 'purple', below: 'green', same: 'slate' },
  },
}

const COLOR_MAP = {
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700',    bar: 'bg-red-400'    },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-400' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-400' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700',  bar: 'bg-green-400'  },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', bar: 'bg-purple-400' },
  slate:  { bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-600',  badge: 'bg-slate-100 text-slate-600',  bar: 'bg-slate-300'  },
}

export default function HealthMetricCard({ metric, value, iowaAvg }) {
  const config = METRIC_CONFIG[metric]
  if (!config) return null

  const diff    = value - iowaAvg
  const pctDiff = Math.abs((diff / iowaAvg) * 100).toFixed(1)
  const isAbove = diff > 0.3
  const isBelow = diff < -0.3

  const colorKey = isAbove
    ? config.color.above
    : isBelow
    ? config.color.below
    : config.color.same

  const c = COLOR_MAP[colorKey]

  // Bar: show value relative to scale (0–50%)
  const barPct = Math.min((value / 50) * 100, 100)
  const avgPct = Math.min((iowaAvg / 50) * 100, 100)

  return (
    <div className={`rounded-2xl border-2 ${c.border} ${c.bg} p-5 flex flex-col gap-3`}>
      {/* Top */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{config.icon}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{config.label}</span>
          </div>
          <p className={`text-3xl font-extrabold ${c.text}`}>{value.toFixed(1)}%</p>
        </div>

        {/* Delta badge */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${c.badge}`}>
          {isAbove ? (
            <><TrendingUp className="w-3 h-3" /> +{pctDiff}%</>
          ) : isBelow ? (
            <><TrendingDown className="w-3 h-3" /> -{pctDiff}%</>
          ) : (
            <><Minus className="w-3 h-3" /> Avg</>
          )}
        </div>
      </div>

      {/* Bar chart */}
      <div>
        <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full rounded-full ${c.bar} transition-all duration-700`}
            style={{ width: `${barPct}%` }}
          />
          {/* Iowa average tick */}
          <div
            className="absolute top-0 h-full w-0.5 bg-slate-500 rounded"
            style={{ left: `${avgPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>0%</span>
          <span>Iowa avg: {iowaAvg}%</span>
          <span>50%</span>
        </div>
      </div>

      {/* Label */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{config.description}</p>
        <span className={`text-xs font-semibold ${c.text}`}>
          {isAbove ? 'Higher than avg' : isBelow ? 'Lower than avg' : 'Near avg'}
        </span>
      </div>
    </div>
  )
}
