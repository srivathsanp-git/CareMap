import { Phone, MapPin, User, ChevronRight } from 'lucide-react'

function SkeletonCard() {
  return (
    <div className="p-4 border border-slate-100 rounded-xl animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-2/3" />
        </div>
      </div>
    </div>
  )
}

const SPECIALTY_COLORS = {
  'Family Medicine':     'bg-blue-100 text-blue-700',
  'Internal Medicine':   'bg-indigo-100 text-indigo-700',
  'General Practice':    'bg-cyan-100 text-cyan-700',
  'Pediatrics':          'bg-green-100 text-green-700',
  'Psychiatry':          'bg-purple-100 text-purple-700',
  'Psychology':          'bg-violet-100 text-violet-700',
  'Mental Health Counseling': 'bg-fuchsia-100 text-fuchsia-700',
  'Obstetrics & Gynecology': 'bg-rose-100 text-rose-700',
}

function getSpecialtyColor(specialty) {
  for (const [key, cls] of Object.entries(SPECIALTY_COLORS)) {
    if (specialty?.toLowerCase().includes(key.toLowerCase())) return cls
  }
  return 'bg-slate-100 text-slate-600'
}

function initials(name) {
  return name
    .split(' ')
    .filter(w => /[A-Za-z]/.test(w[0]))
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

export default function ProviderList({ providers, loading, error, searchMeta, selectedId, onSelect }) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
          <span className="text-red-500 text-xl">!</span>
        </div>
        <p className="text-slate-700 font-medium">Could not load providers</p>
        <p className="text-slate-400 text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (!loading && !searchMeta) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-blue-300" />
        </div>
        <p className="text-slate-500 font-medium">Enter a ZIP code above to find providers</p>
        <p className="text-slate-400 text-sm mt-1">Results from the CMS NPI Registry</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {searchMeta && (
        <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {loading ? 'Searching…' : `${searchMeta.count} provider${searchMeta.count !== 1 ? 's' : ''} found`}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {searchMeta.specialty} · ZIP {searchMeta.zip}
              </p>
            </div>
            {!loading && (
              <span className="text-xs bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-full border border-green-100">
                Live data
              </span>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : providers.length === 0
          ? (
            <div className="text-center py-12">
              <p className="text-slate-500 font-medium">No providers found</p>
              <p className="text-slate-400 text-sm mt-1">Try a nearby ZIP or different specialty</p>
            </div>
          )
          : providers.map(p => (
            <button
              key={p.npi}
              onClick={() => onSelect(p.npi === selectedId ? null : p.npi)}
              className={`
                provider-card w-full text-left p-4 rounded-xl border-2 transition-all
                ${p.npi === selectedId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  text-sm font-bold
                  ${p.npi === selectedId ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'}
                `}>
                  {initials(p.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm leading-snug truncate">{p.name}</p>
                  {p.credential && (
                    <p className="text-xs text-blue-600 font-medium">{p.credential}</p>
                  )}
                  {p.specialty && (
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${getSpecialtyColor(p.specialty)}`}>
                      {p.specialty.length > 35 ? p.specialty.slice(0, 35) + '…' : p.specialty}
                    </span>
                  )}

                  <div className="mt-2 space-y-1">
                    {(p.city || p.address) && (
                      <p className="flex items-start gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-400" />
                        <span className="truncate">{p.address ? `${p.address}, ` : ''}{p.city}{p.state ? `, ${p.state}` : ''}{p.zip ? ` ${p.zip}` : ''}</span>
                      </p>
                    )}
                    {p.phone && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone className="w-3 h-3 flex-shrink-0 text-slate-400" />
                        <a
                          href={`tel:${p.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="text-blue-600 hover:underline"
                        >
                          {p.phone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 transition-colors ${p.npi === selectedId ? 'text-blue-500' : 'text-slate-300'}`} />
              </div>
            </button>
          ))
        }
      </div>

      {/* Footer attribution */}
      {!loading && providers.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-100 flex-shrink-0">
          <p className="text-xs text-slate-400 text-center">
            Source: CMS National Provider Identifier Registry
          </p>
        </div>
      )}
    </div>
  )
}
