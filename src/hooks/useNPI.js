import { useState, useCallback } from 'react'

const SPECIALTY_MAP = {
  'Primary Care':    ['Family Medicine', 'Internal Medicine', 'General Practice'],
  'Pediatrics':      ['Pediatrics'],
  'Mental Health':   ['Psychiatry', 'Psychology', 'Mental Health Counseling', 'Behavioral Health'],
  'OB/GYN':          ['Obstetrics & Gynecology'],
}

const NPI_BASE = 'https://npiregistry.cms.hhs.gov/api'

async function fetchNPITaxonomy(zip, taxonomyDescription) {
  const params = new URLSearchParams({
    version: '2.1',
    postal_code: zip,
    taxonomy_description: taxonomyDescription,
    enumeration_type: 'NPI-1',
    limit: '25',
  })
  const res = await fetch(`${NPI_BASE}/?${params}`)
  if (!res.ok) throw new Error('NPI API error')
  const data = await res.json()
  return data.results || []
}

function normalizeProvider(raw) {
  const basic = raw.basic || {}
  const addresses = raw.addresses || []
  const taxonomies = raw.taxonomies || []

  const practice = addresses.find(a => a.address_purpose === 'LOCATION') || addresses[0] || {}
  const taxonomy = taxonomies.find(t => t.primary) || taxonomies[0] || {}

  const firstName = basic.first_name || ''
  const lastName  = basic.last_name  || ''
  const orgName   = basic.organization_name || ''
  const name = orgName || `${basic.name_prefix ? basic.name_prefix + ' ' : ''}${firstName} ${lastName}`.trim()

  const city    = practice.city    || ''
  const state   = practice.state   || ''
  const zip     = practice.postal_code?.slice(0, 5) || ''
  const address = [practice.address_1, practice.address_2].filter(Boolean).join(', ')
  const phone   = practice.telephone_number || ''

  return {
    npi:       raw.number,
    name,
    credential: basic.credential || '',
    specialty:  taxonomy.desc || taxonomy.code || '',
    address,
    city,
    state,
    zip,
    phone,
    fullAddress: [address, city, state, zip].filter(Boolean).join(', '),
  }
}

export function useNPI() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [searchMeta, setSearchMeta] = useState(null)

  const search = useCallback(async (zip, specialty) => {
    setLoading(true)
    setError(null)
    setProviders([])
    setSearchMeta(null)

    try {
      const taxonomies = SPECIALTY_MAP[specialty] || SPECIALTY_MAP['Primary Care']
      const allResults = await Promise.all(
        taxonomies.map(t => fetchNPITaxonomy(zip, t).catch(() => []))
      )

      // Deduplicate by NPI number
      const seen = new Set()
      const merged = allResults
        .flat()
        .filter(r => {
          if (seen.has(r.number)) return false
          seen.add(r.number)
          return true
        })
        .map(normalizeProvider)
        .filter(p => p.name && p.name.trim() !== '')
        .slice(0, 40)

      setProviders(merged)
      setSearchMeta({ zip, specialty, count: merged.length })
    } catch (e) {
      setError('Could not load providers. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { providers, loading, error, searchMeta, search }
}
