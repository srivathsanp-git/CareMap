import { getBestNextActions } from '../utils/healthDerived'

const PRIORITY_CONFIG = {
  0: { label: 'Urgent',   cls: 'bg-red-100 text-red-700 border-red-200',    dot: 'bg-red-500'    },
  1: { label: 'High',     cls: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
  2: { label: 'Moderate', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',  dot: 'bg-yellow-400' },
}

const CATEGORY_COLOR = {
  'Access':               'text-blue-700 bg-blue-50',
  'Mental Health':        'text-purple-700 bg-purple-50',
  'Chronic Disease':      'text-red-700 bg-red-50',
  'Prevention':           'text-green-700 bg-green-50',
  'Coverage':             'text-indigo-700 bg-indigo-50',
  'Social Determinants':  'text-orange-700 bg-orange-50',
  'Dental':               'text-teal-700 bg-teal-50',
  'Affordability':        'text-yellow-700 bg-yellow-50',
}

export default function BestNextAction({ county }) {
  const actions = getBestNextActions(county)

  if (actions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🧭</span>
          <h3 className="font-bold text-slate-900">Best Next Actions</h3>
        </div>
        <div className="text-center py-8">
          <span className="text-4xl">✅</span>
          <p className="text-slate-500 text-sm mt-3 font-medium">No critical gaps detected</p>
          <p className="text-slate-400 text-xs mt-1">This county is performing near or above Iowa averages across all indicators.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧭</span>
          <h3 className="font-bold text-slate-900">Best Next Actions</h3>
        </div>
        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
          Top {actions.length} recommendations
        </span>
      </div>

      <div className="space-y-3">
        {actions.map((a, i) => {
          const pCfg = PRIORITY_CONFIG[a.priority] ?? PRIORITY_CONFIG[2]
          const catCls = CATEGORY_COLOR[a.category] ?? 'text-slate-700 bg-slate-50'
          return (
            <div
              key={i}
              className={`rounded-xl border p-4 ${pCfg.cls}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catCls}`}>
                      {a.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />
                      {pCfg.label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">{a.action}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{a.rationale}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-slate-400 mt-4">
        Rule-based engine using HRSA shortage designations, CDC PLACES, ACS, and CMS data.
        Actions ranked by evidence-based clinical priority.
      </p>
    </div>
  )
}
