import { useState, useEffect } from 'react'
import HeroSearch from './HeroSearch'
import ProviderMap from './ProviderMap'
import ProviderList from './ProviderList'
import { useNPI } from '../hooks/useNPI'
import { useGeocode } from '../hooks/useGeocode'
import { Card, CardContent } from '@/components/ui/card'

export default function FindCare() {
  const { providers, loading, error, searchMeta, search } = useNPI()
  const { location, geocode } = useGeocode()
  const [selectedId, setSelectedId] = useState(null)
  const [activeView, setActiveView] = useState('list')

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
    <div className="flex flex-col min-h-screen bg-background">
      <HeroSearch onSearch={handleSearch} loading={loading} />

      {/* Results panel */}
      {(searchMeta || loading) && (
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
          <Card className="overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border">
              {[
                { key: 'list', label: 'List' },
                { key: 'map',  label: 'Map'  },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key)}
                  className={[
                    'px-5 py-3 text-sm font-medium transition-colors',
                    activeView === tab.key
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <CardContent className="p-0">
              {activeView === 'list' ? (
                <ProviderList
                  providers={providers}
                  loading={loading}
                  error={error}
                  searchMeta={searchMeta}
                  selectedId={selectedId}
                  onSelect={(id) => { setSelectedId(id); setActiveView('map') }}
                />
              ) : (
                <div style={{ height: '560px' }}>
                  <ProviderMap
                    providers={providers}
                    center={location}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick tip */}
          {!loading && providers.length > 0 && activeView === 'list' && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Click a provider to switch to Map view · Use the Map tab to explore locations
            </p>
          )}
        </div>
      )}

      {/* Empty state — no search yet */}
      {!searchMeta && !loading && (
        <div className="flex-1 py-16">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🔍', title: 'Real Provider Data', desc: 'Search the CMS NPI Registry — over 1.6 million providers nationwide, updated daily.' },
              { icon: '🗺️', title: 'Interactive Map', desc: 'See providers on a map with distance context. Click any pin for details.' },
              { icon: '📊', title: 'County Health', desc: 'Compare health metrics like diabetes and obesity rates to the Iowa average.' },
            ].map(card => (
              <Card key={card.title} className="text-center p-6">
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
