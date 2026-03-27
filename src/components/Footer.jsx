import { Activity, ExternalLink } from 'lucide-react'

const SOURCES = [
  { name: 'CMS NPI Registry',       url: 'https://npiregistry.cms.hhs.gov',                        desc: 'Provider search' },
  { name: 'CDC PLACES 2023',        url: 'https://www.cdc.gov/places',                             desc: 'County health data' },
  { name: 'CMS Care Compare',       url: 'https://www.medicare.gov/care-compare',                  desc: 'Hospital ratings' },
  { name: 'Iowa HHS',               url: 'https://hhs.iowa.gov',                                   desc: 'State health data' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white font-bold">CareMap Iowa</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Helping identify care gaps in Iowa using publicly available federal and state data.
              Built for consumers, researchers, and community health advocates.
            </p>
          </div>

          {/* Data sources */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Data Sources</h4>
            <ul className="space-y-2">
              {SOURCES.map(s => (
                <li key={s.name} className="flex items-start gap-2 text-sm">
                  <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-500" />
                  <div>
                    <a href={s.url} target="_blank" rel="noopener noreferrer"
                      className="text-slate-300 hover:text-white transition-colors font-medium">
                      {s.name}
                    </a>
                    <span className="text-slate-500 ml-1.5 text-xs">— {s.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Disclaimer</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              This tool uses publicly available data for informational and educational purposes only.
              It does not constitute medical advice. Provider availability may change — always verify
              directly with the provider or call 811 for Iowa health resources.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p className="text-slate-600">© 2024 CareMap Iowa · Open source · Public data</p>
          <p className="text-slate-600">
            Provider data: <span className="text-slate-500">CMS NPI Registry (live)</span>
            &ensp;·&ensp;Health data: <span className="text-slate-500">CDC PLACES 2023</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
