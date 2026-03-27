import { useState } from 'react'
import { Building2, MapPin, Phone, Star, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { iowaHospitals } from '../data/iowaHospitals'

const REGIONS = {
  All:       () => true,
  'Central': h => ['Polk', 'Story', 'Boone', 'Warren', 'Madison', 'Dallas', 'Jasper', 'Marion', 'Marshall'].includes(h.county),
  'Eastern': h => ['Linn', 'Johnson', 'Scott', 'Dubuque', 'Clinton', 'Jackson', 'Jones', 'Cedar', 'Delaware', 'Benton'].includes(h.county),
  'Western': h => ['Woodbury', 'Pottawattamie', 'Harrison', 'Shelby', 'Cass', 'Audubon', 'Crawford', 'Monona'].includes(h.county),
  'Northern':h => ['Black Hawk', 'Cerro Gordo', 'Kossuth', 'Winnebago', 'Worth', 'Dickinson', 'Clay', 'Emmet', 'Hancock'].includes(h.county),
  'Southern':h => ['Wapello', 'Appanoose', 'Davis', 'Monroe', 'Mahaska', 'Lucas', 'Clarke', 'Union', 'Wayne'].includes(h.county),
}

function StarRating({ stars, max = 5 }) {
  if (stars === null || stars === undefined) {
    return <span className="text-xs text-slate-400 italic">Not yet rated</span>
  }
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
        />
      ))}
      <span className="text-xs font-semibold text-slate-700 ml-1">{stars}/5</span>
    </div>
  )
}

const STAR_BADGE = {
  5: 'bg-green-100 text-green-800 border-green-200',
  4: 'bg-blue-100 text-blue-800 border-blue-200',
  3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  2: 'bg-orange-100 text-orange-800 border-orange-200',
  1: 'bg-red-100 text-red-800 border-red-200',
}

const TYPE_ICON = {
  'Academic Medical Center': '🎓',
  'General Acute Care':       '🏥',
  'Critical Access':          '🏡',
  "Children's Hospital":      '👶',
  'Public Hospital':          '🏛️',
}

export default function HospitalQuality() {
  const [region, setRegion]     = useState('All')
  const [sortBy, setSortBy]     = useState('stars')
  const [expandedId, setExpandedId] = useState(null)

  const filtered = iowaHospitals
    .filter(REGIONS[region])
    .sort((a, b) => {
      if (sortBy === 'stars') {
        const sa = a.stars ?? 0, sb = b.stars ?? 0
        return sb - sa
      }
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-slate-900">Hospital Quality</h2>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Iowa hospitals with CMS Overall Star Ratings from Care Compare (2023).
            Critical Access hospitals serve rural communities and are rated separately.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Region filter */}
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(REGIONS).map(r => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                    ${region === r
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }
                  `}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
              <span>Sort:</span>
              {[['stars', '⭐ Stars'], ['name', 'A–Z Name']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setSortBy(val)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    sortBy === val ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hospital cards */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-3">
        <p className="text-xs text-slate-400 mb-4">Showing {filtered.length} hospitals</p>

        {filtered.map(h => {
          const isExpanded = expandedId === h.id
          const starBadge  = h.stars !== null ? STAR_BADGE[h.stars] || STAR_BADGE[3] : 'bg-slate-100 text-slate-500 border-slate-200'

          return (
            <div
              key={h.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow transition-shadow"
            >
              <button
                className="w-full text-left p-5"
                onClick={() => setExpandedId(isExpanded ? null : h.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Type icon */}
                    <span className="text-2xl flex-shrink-0 mt-0.5">
                      {TYPE_ICON[h.type] || '🏥'}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 text-sm leading-snug">{h.name}</h3>
                        {h.trauma && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-700 rounded-full border border-red-200 flex-shrink-0">
                            <Shield className="w-2.5 h-2.5" />
                            {h.trauma}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{h.city}, Iowa · {h.county} County</span>
                      </div>

                      <div className="mt-2">
                        <StarRating stars={h.stars} />
                      </div>
                    </div>
                  </div>

                  {/* Star badge */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {h.stars !== null ? (
                      <span className={`text-lg font-extrabold px-3 py-1 rounded-xl border ${starBadge}`}>
                        {'★'.repeat(h.stars)}{'☆'.repeat(5 - h.stars)}
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-xl border bg-slate-50 text-slate-400 border-slate-200">
                        CAH
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Type</p>
                      <p className="text-sm font-medium text-slate-700 mt-1">{h.type}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Licensed Beds</p>
                      <p className="text-sm font-medium text-slate-700 mt-1">{h.beds}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">CMS ID</p>
                      <p className="text-sm font-medium text-slate-700 mt-1 font-mono">{h.cms_id}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Phone</p>
                      <a href={`tel:${h.phone}`} className="text-sm font-medium text-blue-600 hover:underline mt-1 block">{h.phone}</a>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-slate-500">
                      <strong>Address:</strong> {h.address}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={`https://www.medicare.gov/care-compare/details/hospital/${h.cms_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      View on CMS Care Compare →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No hospitals found for this region filter.
          </div>
        )}

        {/* Attribution */}
        <p className="text-center text-xs text-slate-400 pt-4">
          Star ratings from CMS Care Compare Overall Hospital Quality Star Rating (2023).
          Not all hospitals have a CMS star rating — Critical Access Hospitals are evaluated separately.
        </p>
      </div>
    </div>
  )
}
