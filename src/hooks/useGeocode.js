import { useState, useCallback, useRef } from 'react'

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'

// Simple in-memory cache to avoid duplicate requests
const cache = {}

async function geocodeZip(zip) {
  if (cache[zip]) return cache[zip]
  const url = `${NOMINATIM}?postalcode=${zip}&countrycodes=US&format=json&limit=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) throw new Error('Geocoding failed')
  const data = await res.json()
  if (!data.length) throw new Error(`No location found for ZIP ${zip}`)
  const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label: data[0].display_name }
  cache[zip] = result
  return result
}

export function useGeocode() {
  const [location, setLocation] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const lastZip = useRef(null)

  const geocode = useCallback(async (zip) => {
    if (!zip || zip === lastZip.current) return
    setLoading(true)
    setError(null)
    try {
      const loc = await geocodeZip(zip)
      setLocation(loc)
      lastZip.current = zip
    } catch (e) {
      setError(e.message)
      setLocation(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { location, loading, error, geocode }
}

// Geocode a batch of ZIP codes for provider pins
// Returns a map: { zip -> { lat, lng } }
export async function batchGeocodeZips(zips) {
  const unique = [...new Set(zips.filter(Boolean))]
  const results = {}
  for (const zip of unique) {
    try {
      await new Promise(r => setTimeout(r, 200)) // Nominatim rate limit ~1 req/sec
      const loc = await geocodeZip(zip)
      results[zip] = loc
    } catch {
      // Skip if geocoding fails for a particular zip
    }
  }
  return results
}
