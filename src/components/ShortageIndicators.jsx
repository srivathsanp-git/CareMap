import { AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react'

const SHORTAGE_TYPES = [
  { key: 'pcShortage',     label: 'Primary Care',  icon: '🩺', desc: 'HRSA Health Professional Shortage Area' },
  { key: 'mhShortage',     label: 'Mental Health', icon: '🧠', desc: 'HRSA Mental Health HPSA' },
  { key: 'dentalShortage', label: 'Dental Care',   icon: '🦷', desc: 'HRSA Dental HPSA' },
]

const LEVEL_CONFIG = {
  0: { label: 'No Shortage',      Icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700',  badge: 'bg-green-100 text-green-800'  },
  1: { label: 'Partial Shortage', Icon: AlertCircle, bg: 'bg-yellow-50',border: 'border-yellow-200',text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  2: { label: 'Full Shortage',    Icon: AlertTriangle,bg: 'bg-red-50',  border: 'border-red-200',   text: 'text-red-700',    badge: 'bg-red-100 text-red-800'      },
}

export default function ShortageIndicators({ county }) {
  const totalShortage = county.pcShortage + county.mhShortage + county.dentalShortage
  const isAllClear    = totalShortage === 0

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <div className={`rounded-xl p-4 border ${isAllClear ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-start gap-3">
          {isAllClear
            ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            : <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          }
          <div>
            <p className={`font-semibold text-sm ${isAllClear ? 'text-green-800' : 'text-red-800'}`}>
              {isAllClear
                ? `${county.name} County has no active HRSA shortage designations`
                : `${county.name} County has ${totalShortage === 6 ? 'full' : 'partial'} HRSA shortage designations`
              }
            </p>
            <p className="text-xs text-slate-500 mt-1">
              HRSA designates Health Professional Shortage Areas (HPSAs) where there are too few providers
              relative to population. These areas may qualify for federal resources and loan repayment programs.
            </p>
          </div>
        </div>
      </div>

      {/* Per-type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SHORTAGE_TYPES.map(type => {
          const level = county[type.key]
          const cfg   = LEVEL_CONFIG[level]
          const { Icon } = cfg
          return (
            <div key={type.key} className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{type.icon}</span>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{type.label}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${cfg.text}`} />
                <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
              </div>
              <p className="text-[10px] text-slate-400">{type.desc}</p>
              {level === 2 && (
                <div className="mt-2 text-[10px] bg-white/70 rounded-lg px-2 py-1 text-red-700 font-medium">
                  May qualify for federal resources
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Provider density */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Provider Supply Density</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-blue-700">{county.providerDensity.toFixed(1)}</span>
              <span className="text-slate-500 text-sm font-medium">providers / 1,000 residents</span>
            </div>
          </div>
          <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            county.providerDensity >= 8   ? 'bg-green-100 text-green-800' :
            county.providerDensity >= 4   ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
          }`}>
            {county.providerDensity >= 8 ? 'Well Staffed' : county.providerDensity >= 4 ? 'Moderate' : 'Understaffed'}
          </div>
        </div>

        {/* Density bar */}
        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${
              county.providerDensity >= 8 ? 'bg-green-500' :
              county.providerDensity >= 4 ? 'bg-yellow-400' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((county.providerDensity / 20) * 100, 100)}%` }}
          />
          {/* Iowa avg tick */}
          <div className="absolute top-0 h-full w-0.5 bg-slate-500" style={{ left: `${(7.2 / 20) * 100}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>0</span>
          <span>Iowa avg: 7.2</span>
          <span>20+ / 1k</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">Estimated from HRSA and NPI Registry data. Iowa avg: 7.2 per 1,000.</p>
      </div>

      <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-500">
          Source: HRSA Health Professional Shortage Area designations (2023). HPSA designations determine eligibility
          for National Health Service Corps placements and J-1 visa waivers for foreign physicians.
        </p>
      </div>
    </div>
  )
}
