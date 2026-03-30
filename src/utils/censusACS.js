// Census ACS 5-year Data Profiles — SDOH metrics for any state's counties
// Endpoint: api.census.gov (no API key required for basic use)
// Variables from ACS 2022 5-year Data Profiles (DP03, DP04, DP05)

const ACS_BASE = 'https://api.census.gov/data/2022/acs/acs5/profile'

// DP03_0119PE — % below poverty level
// DP03_0099PE — % without health insurance
// DP04_0058PE — % households with no vehicle available
// DP05_0018E  — median age
const ACS_VARS = 'NAME,DP03_0119PE,DP03_0099PE,DP04_0058PE,DP05_0018E'

function stripCountySuffix(raw) {
  return (raw || '')
    .split(',')[0]
    .replace(/ County$/i, '')
    .replace(/ Parish$/i, '')
    .replace(/ Borough$/i, '')
    .replace(/ Census Area$/i, '')
    .replace(/ Municipality$/i, '')
    .trim()
}

const _cache = {}

export async function fetchCountyACS(stateFips) {
  if (_cache[stateFips]) return _cache[stateFips]

  const url = `${ACS_BASE}?get=${ACS_VARS}&for=county:*&in=state:${stateFips}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Census ACS error ${res.status}`)
  const rows = await res.json()
  if (!Array.isArray(rows) || rows.length < 2) throw new Error('No ACS data returned')

  const [headers, ...data] = rows
  const idx = {
    name:      headers.indexOf('NAME'),
    poverty:   headers.indexOf('DP03_0119PE'),
    uninsured: headers.indexOf('DP03_0099PE'),
    noVehicle: headers.indexOf('DP04_0058PE'),
    medianAge: headers.indexOf('DP05_0018E'),
  }

  const out = {}
  for (const row of data) {
    const name = stripCountySuffix(row[idx.name])
    out[name] = {
      poverty:   parseFloat(row[idx.poverty])   || null,
      uninsured: parseFloat(row[idx.uninsured]) || null,
      noVehicle: parseFloat(row[idx.noVehicle]) || null,
      medianAge: parseFloat(row[idx.medianAge]) || null,
    }
  }

  _cache[stateFips] = out
  return out
}

// ── Score helpers (mirrors Iowa logic) ──────────────────────────────────────

// Need score 0-100: blends disease burden + social determinants
export function computeNationalNeedScore(places, acs) {
  const diabetes  = Math.min(((places?.DIABETES  || 0) / 15)  * 25, 25)
  const obesity   = Math.min(((places?.OBESITY   || 0) / 42)  * 20, 20)
  const mhlth     = Math.min(((places?.MHLTH     || 0) / 20)  * 15, 15)
  const poverty   = Math.min(((acs?.poverty      || 0) / 25)  * 20, 20)
  const uninsured = Math.min(((acs?.uninsured    || 0) / 20)  * 20, 20)
  return Math.round(diabetes + obesity + mhlth + poverty + uninsured)
}

// Access score 0-100: provider density estimate + uninsured rate
export function computeNationalAccessScore(places, acs, pop) {
  // Density estimate: larger pop → more providers per 1k
  const density = pop > 200000 ? 8 : pop > 100000 ? 6 : pop > 50000 ? 4 : pop > 20000 ? 2.5 : pop > 10000 ? 1.5 : 0.8
  const densityScore  = Math.min((density / 10) * 50, 50)
  const uninsuredPenalty = Math.min(((acs?.uninsured || 10) / 20) * 50, 50)
  return Math.round(Math.max(0, densityScore + (50 - uninsuredPenalty)))
}

export function computeNationalOpportunityScore(need, access) {
  return Math.round(need * (1 - access / 100))
}
