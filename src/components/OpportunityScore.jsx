import { computeOpportunity, opportunityTier } from '../utils/healthDerived'
import { computeRankingScores } from '../data/iowaCounties'

export default function OpportunityScore({ county }) {
  const { need, access } = computeRankingScores(county)
  const score = computeOpportunity(need, access)
  const tier  = opportunityTier(score)

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  const trackColor =
    tier.color === 'red'    ? '#ef4444' :
    tier.color === 'orange' ? '#f97316' :
    tier.color === 'yellow' ? '#eab308' :
    '#22c55e'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl">🎯</span>
        <h3 className="font-bold text-slate-900">Opportunity Score</h3>
        <span className="ml-auto text-xs text-slate-400 font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
          Need × (1 – Access/100)
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Gauge */}
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128">
            {/* Track */}
            <circle
              cx="64" cy="64" r="54"
              fill="none" stroke="#f1f5f9" strokeWidth="12"
            />
            {/* Progress */}
            <circle
              cx="64" cy="64" r="54"
              fill="none"
              stroke={trackColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 64 64)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-slate-900">{score}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">/ 100</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${
              tier.color === 'red'    ? 'bg-red-100 text-red-800' :
              tier.color === 'orange' ? 'bg-orange-100 text-orange-800' :
              tier.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {tier.emoji} {tier.label}
            </span>
            <p className="text-slate-500 text-sm mt-1.5">{tier.desc}</p>
          </div>

          {/* Component breakdown */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 w-20">Need</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full" style={{ width: `${need}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-700 w-6 text-right">{need}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 w-20">Access</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full" style={{ width: `${access}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-700 w-6 text-right">{access}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 w-20">Opportunity</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: trackColor }} />
              </div>
              <span className="text-xs font-bold text-slate-700 w-6 text-right">{score}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Formula: {need} × (1 – {access}/100) = <strong className="text-slate-600">{score}</strong>
            &ensp;·&ensp; Higher = more critical investment need
          </p>
        </div>
      </div>
    </div>
  )
}
