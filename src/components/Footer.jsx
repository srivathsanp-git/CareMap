import { Activity, ExternalLink } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const SOURCES = [
  { name: 'CMS NPI Registry',       url: 'https://npiregistry.cms.hhs.gov',                        desc: 'Provider search' },
  { name: 'CDC PLACES 2023',        url: 'https://www.cdc.gov/places',                             desc: 'County health data' },
  { name: 'CMS Care Compare',       url: 'https://www.medicare.gov/care-compare',                  desc: 'Hospital ratings' },
  { name: 'Iowa HHS',               url: 'https://hhs.iowa.gov',                                   desc: 'State health data' },
]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card text-muted-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-foreground font-bold">CareMap Iowa</span>
            </div>
            <p className="text-sm leading-relaxed">
              Helping identify care gaps in Iowa using publicly available federal and state data.
              Built for consumers, researchers, and community health advocates.
            </p>
          </div>

          {/* Data sources */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Data Sources</h4>
            <ul className="space-y-2">
              {SOURCES.map(s => (
                <li key={s.name} className="flex items-start gap-2 text-sm">
                  <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <a href={s.url} target="_blank" rel="noopener noreferrer"
                      className="text-foreground hover:text-primary transition-colors font-medium">
                      {s.name}
                    </a>
                    <span className="text-muted-foreground ml-1.5 text-xs">— {s.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Disclaimer</h4>
            <p className="text-xs leading-relaxed">
              This tool uses publicly available data for informational and educational purposes only.
              It does not constitute medical advice. Provider availability may change — always verify
              directly with the provider or call 811 for Iowa health resources.
            </p>
          </div>
        </div>

        <Separator className="mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© 2024 CareMap Iowa · Open source · Public data</p>
          <p>Provider data: CMS NPI Registry (live) · Health data: CDC PLACES 2023</p>
        </div>
      </div>
    </footer>
  )
}
