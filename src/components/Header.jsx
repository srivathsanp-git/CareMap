import { Activity } from 'lucide-react'

const TABS = [
  { id: 'find',      label: 'Find Care' },
  { id: 'county',    label: 'County Health' },
  { id: 'hospitals', label: 'Hospitals' },
  { id: 'rankings',  label: 'County Rankings' },
]

export default function Header({ activeTab, onTabChange }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-slate-900 text-lg tracking-tight">CareMap</span>
              <span className="text-blue-700 font-bold text-lg tracking-tight"> Iowa</span>
            </div>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              Public Data
            </span>
          </div>

          {/* Navigation tabs */}
          <nav className="flex items-end h-full gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  px-4 py-2 text-sm font-medium border-b-2 h-full
                  transition-colors duration-150
                  ${activeTab === tab.id
                    ? 'border-blue-700 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Data badge */}
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live NPI Data
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
