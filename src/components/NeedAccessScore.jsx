import { AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react'

const SCORE_CONFIG = {
  high: {
    label:  'High Need',
    emoji:  '🔴',
    icon:   AlertTriangle,
    bg:     'bg-red-50',
    border: 'border-red-300',
    text:   'text-red-700',
    badge:  'bg-red-600 text-white',
    bar:    'bg-red-500',
    width:  '85%',
  },
  moderate: {
    label:  'Moderate Need',
    emoji:  '🟡',
    icon:   AlertCircle,
    bg:     'bg-yellow-50',
    border: 'border-yellow-300',
    text:   'text-yellow-700',
    badge:  'bg-yellow-500 text-white',
    bar:    'bg-yellow-400',
    width:  '50%',
  },
  low: {
    label:  'Well Served',
    emoji:  '🟢',
    icon:   CheckCircle,
    bg:     'bg-green-50',
    border: 'border-green-300',
    text:   'text-green-700',
    badge:  'bg-green-600 text-white',
    bar:    'bg-green-500',
    width:  '25%',
  },
}

export default function NeedAccessScore({ score, county }) {
  if (!score) return null

  const cfg = SCORE_CONFIG[score.level]
  const Icon = cfg.icon

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Need vs Access Score
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{cfg.emoji}</span>
            <h3 className={`text-xl font-extrabold ${cfg.text}`}>{cfg.label}</h3>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
          {county?.name} County
        </span>
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="h-3 bg-white/70 rounded-full border border-white overflow-hidden">
          <div
            className={`h-full rounded-full ${cfg.bar} transition-all duration-1000`}
            style={{ width: cfg.width }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
          <span>Well Served</span>
          <span>Moderate</span>
          <span>High Need</span>
        </div>
      </div>

      {/* Description */}
      <p className={`text-sm font-medium ${cfg.text} mb-3`}>{score.desc}</p>

      {/* How it's calculated */}
      <div className="bg-white/60 rounded-xl p-3 border border-white">
        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">How this is calculated</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Combines disease burden (diabetes, obesity, smoking, mental health) relative to the Iowa average,
              with estimated provider access from the NPI Registry. Rule-based — no ML.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
