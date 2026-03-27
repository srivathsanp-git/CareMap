import { getCancer, CANCER_AVERAGES, CANCER_META } from '../utils/healthDerived'

export default function CancerInsights({ county }) {
  const cancer = getCancer(county)

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 flex items-start gap-2">
        <span className="flex-shrink-0 font-bold">ℹ</span>
        <span>
          Age-adjusted incidence rates derived from smoking, obesity, and poverty correlations.
          Sources: Iowa Cancer Registry 2022, NCI SEER, CDC WONDER.
          Rates per 100,000 population.
        </span>
      </div>

      {/* All-cancer callout */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">All Cancers (age-adjusted)</p>
            <p className="text-4xl font-extrabold text-slate-900 mt-1">
              {cancer.allCancer}
              <span className="text-base font-normal text-slate-400 ml-2">/100k</span>
            </p>
            <p className="text-sm text-slate-400 mt-1">Iowa avg: {CANCER_AVERAGES.allCancer}/100k</p>
          </div>
          <div className="text-right">
            {(() => {
              const diff = cancer.allCancer - CANCER_AVERAGES.allCancer
              const pct  = Math.round((diff / CANCER_AVERAGES.allCancer) * 100)
              return (
                <div>
                  <span className={`text-2xl font-extrabold ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </span>
                  <p className={`text-xs font-bold mt-1 ${diff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {diff > 0 ? '▲' : '▼'} {Math.abs(pct)}% vs Iowa
                  </p>
                </div>
              )
            })()}
          </div>
        </div>
        <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 w-0.5 bg-slate-500 z-10"
            style={{ left: `${(CANCER_AVERAGES.allCancer / 700) * 100}%` }} />
          <div
            className={`h-full rounded-full ${cancer.allCancer > CANCER_AVERAGES.allCancer ? 'bg-red-400' : 'bg-green-400'}`}
            style={{ width: `${Math.min(100, (cancer.allCancer / 700) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>0</span>
          <span className="font-medium text-slate-500">Iowa avg: {CANCER_AVERAGES.allCancer}</span>
          <span>700</span>
        </div>
      </div>

      {/* Cancer type breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CANCER_META.filter(m => m.key !== 'allCancer').map(meta => {
          const val  = cancer[meta.key]
          const avg  = CANCER_AVERAGES[meta.key]
          const diff = val - avg
          const pct  = Math.round(Math.abs((diff / avg) * 100))

          return (
            <div key={meta.key} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{meta.icon}</span>
                <span className="text-xs font-semibold text-slate-600">{meta.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {val}
                <span className="text-xs font-normal text-slate-400 ml-1">/100k</span>
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Avg: {avg}</span>
                {pct > 5 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    diff > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {diff > 0 ? '▲' : '▼'}{pct}%
                  </span>
                )}
              </div>
              {/* Mini bar */}
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${diff > 0 ? 'bg-red-400' : 'bg-green-400'}`}
                  style={{ width: `${Math.min(100, (val / (avg * 2)) * 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Drivers */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">Cancer Risk Drivers</h4>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Smoking', value: county.smoking,  avg: 14.8, icon: '🚬', note: 'Lung / all cancer driver' },
            { label: 'Obesity',  value: county.obesity,  avg: 35.7, icon: '⚖️', note: 'Colorectal / breast driver' },
            { label: 'Poverty',  value: county.poverty,  avg: 11.2, icon: '💸', note: 'Screening access barrier' },
          ].map(d => {
            const diff = d.value - d.avg
            return (
              <div key={d.label} className="text-center">
                <p className="text-2xl mb-1">{d.icon}</p>
                <p className="text-lg font-extrabold text-slate-900">{d.value.toFixed(1)}%</p>
                <p className="text-xs text-slate-500">{d.label}</p>
                <p className={`text-[10px] font-bold mt-0.5 ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {diff > 0 ? '+' : ''}{diff.toFixed(1)}% vs avg
                </p>
                <p className="text-[10px] text-slate-400 mt-1">{d.note}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
