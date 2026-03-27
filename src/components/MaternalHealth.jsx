import { getMCH, MCH_AVERAGES, MCH_META } from '../utils/healthDerived'

export default function MaternalHealth({ county }) {
  const mch = getMCH(county)

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 flex items-start gap-2">
        <span className="flex-shrink-0 font-bold">ℹ</span>
        <span>
          Derived from SDOH correlations using poverty, smoking, and uninsured rates.
          Sources: Iowa HHS Birth Records 2022, CDC WONDER, HRSA maternal health research.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MCH_META.map(meta => {
          const val = mch[meta.key]
          const avg = MCH_AVERAGES[meta.key]
          const diff = val - avg
          const pct  = Math.abs(((val - avg) / avg) * 100)
          const worse = meta.higherIsBad ? diff > 0 : diff < 0
          const better = meta.higherIsBad ? diff < 0 : diff > 0

          return (
            <div key={meta.key} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{meta.icon}</span>
                  <span className="text-sm font-semibold text-slate-700">{meta.label}</span>
                </div>
                {pct > 5 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    worse  ? 'bg-red-100 text-red-700' :
                    better ? 'bg-green-100 text-green-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {worse ? '▲' : '▼'} {pct.toFixed(0)}%
                  </span>
                )}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {val}
                    <span className="text-sm font-normal text-slate-400 ml-1">{meta.unit}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Iowa avg: {avg} {meta.unit}</p>
                </div>
                <div className={`text-right text-sm font-bold ${
                  worse ? 'text-red-600' : better ? 'text-green-600' : 'text-slate-400'
                }`}>
                  {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                </div>
              </div>

              {/* Comparison bar */}
              <div className="mt-3">
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  {/* Iowa avg marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                    style={{ left: `${Math.min(80, (avg / (avg * 1.6)) * 80)}%` }}
                  />
                  <div
                    className={`h-full rounded-full ${worse ? 'bg-red-400' : better ? 'bg-green-400' : 'bg-blue-400'}`}
                    style={{ width: `${Math.min(100, (val / (avg * 1.6)) * 80)}%` }}
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mt-2">{meta.source}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">MCH Summary vs Iowa Average</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
              <th className="text-left pb-2">Indicator</th>
              <th className="text-right pb-2">{county.name}</th>
              <th className="text-right pb-2">Iowa Avg</th>
              <th className="text-right pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {MCH_META.map((meta, i) => {
              const val  = mch[meta.key]
              const avg  = MCH_AVERAGES[meta.key]
              const diff = val - avg
              const worse = meta.higherIsBad ? diff > avg * 0.05 : diff < -avg * 0.05
              const better = meta.higherIsBad ? diff < -avg * 0.05 : diff > avg * 0.05
              return (
                <tr key={meta.key} className={`border-t border-slate-100 ${i%2===0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                  <td className="py-2.5 text-slate-700">{meta.icon} {meta.label}</td>
                  <td className="py-2.5 text-right font-semibold">{val} {meta.unit}</td>
                  <td className="py-2.5 text-right text-slate-400">{avg} {meta.unit}</td>
                  <td className="py-2.5 text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      worse  ? 'bg-red-100 text-red-700' :
                      better ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {worse ? 'Worse' : better ? 'Better' : 'Similar'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
