import { useState, useEffect } from 'react'
import HeroSearch from './HeroSearch'
import ProviderMap from './ProviderMap'
import ProviderList from './ProviderList'
import { useNPI } from '../hooks/useNPI'
import { useGeocode } from '../hooks/useGeocode'

export default function FindCare() {
  const { providers, loading, error, searchMeta, search } = useNPI()
  const { location, geocode } = useGeocode()
  const [selectedId, setSelectedId] = useState(null)

  async function handleSearch(zip, specialty) {
    setSelectedId(null)
    await Promise.all([
      geocode(zip),
      search(zip, specialty),
    ])
  }

  // Auto-deselect when results change
  useEffect(() => { setSelectedId(null) }, [providers])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <HeroSearch onSearch={handleSearch} loading={loading} />

      {/* Results panel */}
      {(searchMeta || loading) && (
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: '560px' }}>
            {/* Map */}
            <div className="lg:w-[58%] h-[400px] lg:h-auto rounded-xl overflow-hidden shadow border border-slate-200">
              <ProviderMap
                providers={providers}
                center={location}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>

            {/* List */}
            <div className="lg:w-[42%] bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex flex-col">
              <ProviderList
                providers={providers}
                loading={loading}
                error={error}
                searchMeta={searchMeta}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
          </div>

          {/* Quick tip */}
          {!loading && providers.length > 0 && (
            <p className="text-center text-xs text-slate-400 mt-4">
              Click a provider card to highlight it on the map · Click a map pin to see details
            </p>
          )}
        </div>
      )}

      {/* Empty state — no search yet */}
      {!searchMeta && !loading && (
        <div className="flex-1 bg-slate-50 py-16">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🔍', title: 'Real Provider Data', desc: 'Search the CMS NPI Registry — over 1.6 million providers nationwide, updated daily.' },
              { icon: '🗺️', title: 'Interactive Map', desc: 'See providers on a map with distance context. Click any pin for details.' },
              { icon: '📊', title: 'County Health', desc: 'Compare health metrics like diabetes and obesity rates to the Iowa average.' },
            ].map(card => (
              <div key={card.title} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-semibold text-slate-800 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
