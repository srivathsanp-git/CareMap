import { useState, useCallback } from 'react'

// NLM NPI Individual Provider API — CORS-enabled, same underlying NPI data
// https://clinicaltables.nlm.nih.gov/apidoc/npi_idv/v3/doc.html
const NLM_BASE = 'https://clinicaltables.nlm.nih.gov/api/npi_idv/v3/search'
const FIELDS   = 'NPI,name.full,provider_type,addr_practice.city,addr_practice.state,addr_practice.zip,addr_practice.phone,addr_practice.line1,name.credential'

// provider_type values returned by the NLM API (verified against live data)
const SPECIALTY_TYPES = {
  'Primary Care':  [
    'Physician/Family Practice',
    'Physician/Internal Medicine',
    'Nurse Practitioner',
    'Physician Assistant',
    'Physician/General Practice',
  ],
  'Pediatrics':    [
    'Physician/Pediatric Medicine',
    'Physician/Pediatrics',
  ],
  'Mental Health': [
    'Psychologist, Clinical',
    'Mental Health Counselor',
    'Counselor',
    'Physician/Psychiatry',
    'Marriage and Family Therapist',
    'Licensed Clinical Social Worker',
    'Social Worker',
    'Licensed Professional Counselor',
  ],
  'OB/GYN':        [
    'Physician/Obstetrics & Gynecology',
    'Certified Nurse Midwife',
  ],
}

// Convert "LAST, FIRST MIDDLE" → "First Last"
function formatName(raw) {
  if (!raw) return ''
  if (raw.includes(',')) {
    const [last, rest] = raw.split(',').map(s => s.trim())
    const first = rest.split(' ')[0]
    return `${first ? titleCase(first) + ' ' : ''}${titleCase(last)}`
  }
  return titleCase(raw)
}

function titleCase(s) {
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

async function fetchAllInZip(zip) {
  const params = new URLSearchParams({
    terms:   zip,
    sf:      'addr_practice.zip',
    maxList: '500',
    df:      FIELDS,
  })
  const res = await fetch(`${NLM_BASE}?${params}`)
  if (!res.ok) throw new Error(`NLM API error: ${res.status}`)
  const data = await res.json()
  return data[3] || []  // array of field arrays
}

function rowToProvider(row) {
  const [npi, nameFull, providerType, city, state, zip, phone, address, credential] = row
  return {
    npi,
    name:        formatName(nameFull),
    specialty:   providerType || '',
    credential:  credential   || '',
    address:     address      || '',
    city:        city         || '',
    state:       state        || '',
    zip:         zip          || '',
    phone:       phone        || '',
    fullAddress: [address, city, state, zip].filter(Boolean).join(', '),
  }
}

export function useNPI() {
  const [providers, setProviders]   = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [searchMeta, setSearchMeta] = useState(null)

  const search = useCallback(async (zip, specialty) => {
    setLoading(true)
    setError(null)
    setProviders([])
    setSearchMeta(null)

    try {
      const rows   = await fetchAllInZip(zip)
      const types  = new Set(SPECIALTY_TYPES[specialty] || SPECIALTY_TYPES['Primary Care'])
      const filtered = rows
        .filter(row => types.has(row[2]))   // row[2] is provider_type
        .map(rowToProvider)
        .filter(p => p.name)
        .slice(0, 40)

      setProviders(filtered)
      setSearchMeta({ zip, specialty, count: filtered.length })
    } catch (e) {
      setError('Could not load providers. Please try again.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  return { providers, loading, error, searchMeta, search }
}
