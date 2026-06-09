import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { iowaCounties } from '@/data/iowaCounties'
import { fetchCountyPlaces } from '@/utils/cdcPlaces'
import { fetchCountyACS, hasCensusKey } from '@/utils/censusACS'
import { scoreAndRank, pickCounty, pickPeer, SNAPSHOT } from '@/utils/healthScore'

// Iowa state FIPS for the Census ACS endpoint.
const IA_FIPS = '19'

const CountyDataContext = createContext(null)

// Overlay live data onto the bundled county records, matched by county name.
// The static base supplies fields the public APIs don't carry — lat/lng, HRSA
// shortage flags, Medicaid %, ACA premium — so any field a live feed misses
// keeps its snapshot value. CDC PLACES is keyless and drives the score (incl.
// uninsured via ACCESS2); Census ACS (poverty) needs an API key, so it's
// optional and falls back to the snapshot when unavailable.
function mergeLive(places, acs) {
  return iowaCounties.map((base) => {
    const p = (places && places[base.name]) || {}
    const a = (acs && acs[base.name]) || {}
    return {
      ...base,
      pop:          Number.isFinite(p.pop) && p.pop > 0 ? p.pop : base.pop,
      diabetes:     p.DIABETES ?? base.diabetes,
      obesity:      p.OBESITY ?? base.obesity,
      smoking:      p.CSMOKING ?? base.smoking,
      mentalHealth: p.MHLTH ?? base.mentalHealth,
      uninsured:    p.ACCESS2 ?? a.uninsured ?? base.uninsured,
      poverty:      a.poverty ?? base.poverty,
      noVehicle:    a.noVehicle ?? base.noVehicle,
      medianAge:    a.medianAge ?? base.medianAge,
    }
  })
}

export function CountyDataProvider({ children }) {
  // status: 'loading' (showing snapshot) → 'live' (CDC ok) | 'snapshot' (failed).
  const [data, setData] = useState({ ...SNAPSHOT, status: 'loading' })

  useEffect(() => {
    let off = false
    // CDC PLACES is keyless and drives the score. Census ACS (poverty) needs an
    // API key — only attempt it when VITE_CENSUS_KEY is set, otherwise skip the
    // doomed request entirely and let poverty fall back to the snapshot.
    const jobs = [fetchCountyPlaces('IA')]
    if (hasCensusKey()) jobs.push(fetchCountyACS(IA_FIPS))

    Promise.allSettled(jobs)
      .then(([cdc, census]) => {
        if (off) return
        const places = cdc.status === 'fulfilled' ? cdc.value : null
        const acs = census && census.status === 'fulfilled' ? census.value : null
        if (census && census.status === 'rejected') {
          console.info('[CareMap.ai] Census ACS unavailable (poverty from snapshot):', census.reason?.message || census.reason)
        }
        if (!places && !acs) {
          console.warn('[CareMap.ai] live data unavailable, using snapshot')
          setData({ ...SNAPSHOT, status: 'snapshot' })
          return
        }
        setData({ ...scoreAndRank(mergeLive(places, acs)), status: 'live' })
      })
    return () => { off = true }
  }, [])

  const value = useMemo(() => ({
    ...data,
    getCounty: (name) => pickCounty(data.counties, name),
    peerOf: (county) => pickPeer(data.counties, county),
  }), [data])

  return <CountyDataContext.Provider value={value}>{children}</CountyDataContext.Provider>
}

export function useCounties() {
  const ctx = useContext(CountyDataContext)
  // Fallback so components still work if rendered outside the provider.
  if (!ctx) {
    return {
      ...SNAPSHOT,
      status: 'snapshot',
      getCounty: (name) => pickCounty(SNAPSHOT.counties, name),
      peerOf: (county) => pickPeer(SNAPSHOT.counties, county),
    }
  }
  return ctx
}
