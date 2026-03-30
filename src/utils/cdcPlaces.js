// CDC PLACES — county-level health metrics via Socrata API
// Dataset: PLACES Local Data for Better Health, County Data 2023 release
// Endpoint: chronicdata.cdc.gov (not data.cdc.gov — different domain)

const CDC_COUNTY = 'https://chronicdata.cdc.gov/resource/swc5-untb.json'

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

export function metricColor(value, measureId) {
  if (value == null) return '#d1d5db'
  const { low, high } = METRIC_THRESHOLDS[measureId] || { low: 0, high: 100 }
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)))
  if (t < 0.33) return '#22c55e'
  if (t < 0.66) return '#f59e0b'
  return '#ef4444'
}

function stripCountySuffix(raw) {
  return (raw || '')
    .replace(/ County$/i, '')
    .replace(/ Parish$/i, '')
    .replace(/ Borough$/i, '')
    .replace(/ Census Area$/i, '')
    .replace(/ Municipality$/i, '')
    .trim()
}

// ── State-level averages ──────────────────────────────────────────────────────
let _stateCache = null

export async function fetchStatePlaces() {
  if (_stateCache) return _stateCache

  const measures = KEY_MEASURES.map(m => `'${m}'`).join(',')
  const url = `${CDC_COUNTY}?$select=stateabbr,statedesc,measureid,avg(data_value) as val` +
    `&$where=measureid in(${measures})` +
    `&$group=stateabbr,statedesc,measureid&$limit=2000`

  const res = await fetch(encodeURI(url))
  if (!res.ok) throw new Error(`CDC PLACES API error ${res.status}`)
  const rows = await res.json()
  if (!Array.isArray(rows)) throw new Error('Unexpected CDC PLACES response')

  const out = {}
  for (const row of rows) {
    if (!row.stateabbr) continue
    if (!out[row.stateabbr]) out[row.stateabbr] = { name: row.statedesc }
    out[row.stateabbr][row.measureid] = row.val != null ? parseFloat(row.val) : null
  }

  _stateCache = out
  return out
}

// ── County-level data for a given state ─────────────────────────────────────
const _countyCache = {}

export async function fetchCountyPlaces(stateAbbr) {
  if (_countyCache[stateAbbr]) return _countyCache[stateAbbr]

  const measures = KEY_MEASURES.map(m => `'${m}'`).join(',')
  const url = `${CDC_COUNTY}?$select=countyname,countyfips,measureid,data_value,totalpopulation` +
    `&$where=stateabbr='${stateAbbr}' AND measureid in(${measures})` +
    `&$limit=5000`

  const res = await fetch(encodeURI(url))
  if (!res.ok) throw new Error(`CDC PLACES API error ${res.status}`)
  const rows = await res.json()
  if (!Array.isArray(rows)) throw new Error('Unexpected CDC PLACES response')

  const out = {}
  for (const row of rows) {
    const name = stripCountySuffix(row.countyname)
    if (!out[name]) out[name] = { fips: row.countyfips, pop: parseInt(row.totalpopulation) || 0 }
    if (row.measureid && row.data_value != null) {
      out[name][row.measureid] = parseFloat(row.data_value)
    }
  }

  _countyCache[stateAbbr] = out
  return out
}
