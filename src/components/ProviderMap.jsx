import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { batchGeocodeZips } from '../hooks/useGeocode'

// Blue dot marker for providers
const providerIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width:14px;height:14px;
    background:#1d4ed8;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 6px rgba(29,78,216,0.5);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

// Red star for selected provider
const selectedIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;
    background:#dc2626;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 8px rgba(220,38,38,0.6);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

// Search center marker
const centerIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;
    background:#0d9488;
    border:4px solid white;
    border-radius:50%;
    box-shadow:0 2px 8px rgba(13,148,136,0.5);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

function MapRecenter({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 12, { duration: 1 })
  }, [center, map])
  return null
}

export default function ProviderMap({ providers, center, selectedId, onSelect }) {
  const [pinMap, setPinMap] = useState({})
  const [geocoding, setGeocoding] = useState(false)
  const prevProvidersRef = useRef([])

  useEffect(() => {
    if (!providers.length) { setPinMap({}); return }
    if (providers === prevProvidersRef.current) return
    prevProvidersRef.current = providers

    const zips = providers.map(p => p.zip).filter(Boolean)
    setGeocoding(true)
    batchGeocodeZips(zips)
      .then(setPinMap)
      .finally(() => setGeocoding(false))
  }, [providers])

  const defaultCenter = center || [42.0, -93.5]

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={center ? 12 : 7}
        scrollWheelZoom
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {center && <MapRecenter center={[center.lat, center.lng]} />}

        {/* Search center */}
        {center && (
          <Marker position={[center.lat, center.lng]} icon={centerIcon}>
            <Popup>
              <div className="p-2 text-sm font-semibold text-teal-700">📍 Search location</div>
            </Popup>
          </Marker>
        )}

        {/* Provider pins */}
        {providers.map(p => {
          const geo = pinMap[p.zip]
          if (!geo) return null
          const isSelected = p.npi === selectedId
          return (
            <Marker
              key={p.npi}
              position={[geo.lat, geo.lng]}
              icon={isSelected ? selectedIcon : providerIcon}
              eventHandlers={{ click: () => onSelect(p.npi) }}
            >
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <p className="font-semibold text-slate-900 text-sm leading-snug">{p.name}</p>
                  {p.credential && <p className="text-xs text-blue-600 font-medium mt-0.5">{p.credential}</p>}
                  <p className="text-xs text-slate-500 mt-1">{p.specialty}</p>
                  <p className="text-xs text-slate-600 mt-1">{p.city}, IA {p.zip}</p>
                  {p.phone && (
                    <a href={`tel:${p.phone}`} className="text-xs text-blue-600 hover:underline mt-1 block">{p.phone}</a>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-lg shadow px-3 py-2 text-xs z-[400]">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-3 rounded-full bg-teal-600 border-2 border-white shadow-sm inline-block" />
          Your location
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 mt-1">
          <span className="w-3 h-3 rounded-full bg-blue-700 border-2 border-white shadow-sm inline-block" />
          Provider
        </div>
      </div>

      {geocoding && (
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs text-slate-500 px-3 py-1.5 rounded-lg shadow z-[400] flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin inline-block" />
          Placing pins…
        </div>
      )}
    </div>
  )
}
