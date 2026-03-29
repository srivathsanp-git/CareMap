// CDC PLACES — fetch health metrics from the public Socrata API
// County endpoint: https://data.cdc.gov/resource/swc5-untb.json
// Uses SoQL aggregation to get state-level averages and county-level detail

const CDC_COUNTY = 'https://data.cdc.gov/resource/swc5-untb.json'

export const KEY_MEASURES = ['DIABETES', 'OBESITY', 'CSMOKING', 'MHLTH', 'ACCESS2', 'BPHIGH', 'CHD', 'CASTHMA', 'DEPRESSION']

export const MEASURE_META = {
  DIABETES:   { label: 'Diabetes',            unit: '%', desc: 'Adults with diabetes' },
  OBESITY:    { label: 'Obesity',              unit: '%', desc: 'Adults with obesity' },
  CSMOKING:   { label: 'Smoking',              unit: '%', desc: 'Current smokers' },
  MHLTH:      { label: 'Poor Mental Health',   unit: '%', desc: 'Mental health not good 14+ days/mo' },
  ACCESS2:    { label: 'Uninsured',            unit: '%', desc: 'Adults without health insurance' },
  BPHIGH:     { label: 'High Blood Pressure',  unit: '%', desc: 'Adults with high blood pressure' },
  CHD:        { label: 'Heart Disease',        unit: '%', desc: 'Coronary heart disease' },
  CASTHMA:    { label: 'Asthma',               unit: '%', desc: 'Current asthma' },
  DEPRESSION: { label: 'Depression',           unit: '%', desc: 'Adults with depression' },
}

// Color thresholds per metric (value → green/yellow/red)
export const METRIC_THRESHOLDS = {
  DIABETES:   { low: 9,  high: 13 },
  OBESITY:    { low: 30, high: 38 },
  CSMOKING:   { low: 12, high: 20 },
  MHLTH:      { low: 12, high: 17 },
  ACCESS2:    { low: 7,  high: 15 },
  BPHIGH:     { low: 28, high: 36 },
  CHD:        { low: 4,  high: 8  },
  CASTHMA:    { low: 9,  high: 13 },
  DEPRESSION: { low: 18, high: 26 },
}

// Returns color for choropleth: low value = good (green), high = bad (red)
export function metricColor(value, measureId) {
  if (value == null) return '#d1d5db'
  const { low, high } = METRIC_THRESHOLDS[measureId] || { low: 0, high: 100 }
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)))
  if (t < 0.33) return '#22c55e'   // green
  if (t < 0.66) return '#f59e0b'   // amber
  return '#ef4444'                  // red
}

// ── State-level averages (aggregated from county data) ──────────────────────
let _stateCache = null

export async function fetchStatePlaces() {
  if (_stateCache) return _stateCache

  const where = `measureid in('${KEY_MEASURES.join("','")}')`
  const url = `${CDC_COUNTY}?$select=stateabbr,statedesc,measureid,avg(data_value)%20as%20val` +
    `&$where=${encodeURIComponent(where)}&$group=stateabbr,statedesc,measureid&$limit=1000`

  const res = await fetch(url)
  if (!res.ok) throw new Error('CDC PLACES fetch failed')
  const rows = await res.json()

  const out = {}  // { AL: { name:'Alabama', DIABETES: 13.2, ... }, ... }
  for (const row of rows) {
    if (!row.stateabbr) continue
    if (!out[row.stateabbr]) out[row.stateabbr] = { name: row.statedesc }
    out[row.stateabbr][row.measureid] = parseFloat(row.val) || null
  }

  _stateCache = out
  return out
}

// ── County-level data for a given state ─────────────────────────────────────
const _countyCache = {}

export async function fetchCountyPlaces(stateAbbr) {
  if (_countyCache[stateAbbr]) return _countyCache[stateAbbr]

  const where = `stateabbr='${stateAbbr}' AND measureid in('${KEY_MEASURES.join("','")}')`
  const url = `${CDC_COUNTY}?$select=countyname,countyfips,measureid,data_value,totalpopulation` +
    `&$where=${encodeURIComponent(where)}&$limit=5000`

  const res = await fetch(url)
  if (!res.ok) throw new Error('CDC PLACES fetch failed')
  const rows = await res.json()

  const out = {}  // { 'Polk': { fips, pop, DIABETES, ... }, ... }
  for (const row of rows) {
    const raw = row.countyname || ''
    const name = raw.replace(/ County$/i, '').replace(/ Parish$/i, '').replace(/ Borough$/i, '').trim()
    if (!out[name]) out[name] = { fips: row.countyfips, pop: parseInt(row.totalpopulation) || 0 }
    if (row.measureid) out[name][row.measureid] = parseFloat(row.data_value) || null
  }

  _countyCache[stateAbbr] = out
  return out
}
