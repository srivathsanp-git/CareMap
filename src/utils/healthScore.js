// Real-data county health scoring.
//
// Replaces the prior synthetic "need / access / opportunity" composite and the
// estimated `providerDensity`. Scores are built only from MEASURED public
// values:
//   · CDC PLACES — diabetes, obesity, smoking, poor mental health, uninsured (ACCESS2)
//   · Census ACS — poverty
//
// Method (transparent, equal-weight — the family of approach County Health
// Rankings uses): for each measure, a county's percentile vs the other Iowa
// counties in the healthier direction (all six are adverse, so lower = better);
// the health score is the average of those percentiles. State median ≈ 50 by
// construction, so the score reads honestly as "relative to other Iowa counties."
//
// The functions here are pure — they score whatever county array they're given,
// so the same code powers both the bundled snapshot and the live CDC/ACS fetch
// (see src/context/CountyDataContext.jsx).

import { iowaCounties } from '@/data/iowaCounties'

// Measure key → display metadata + real source. Thresholds are the published
// CDC PLACES / ACS color cut points (see src/utils/cdcPlaces.js).
export const METRIC_INFO = {
  diabetes:     { label: 'Diabetes',          unit: '%', low: 9,  high: 13, source: 'CDC PLACES' },
  obesity:      { label: 'Obesity',           unit: '%', low: 30, high: 38, source: 'CDC PLACES' },
  smoking:      { label: 'Smoking',           unit: '%', low: 12, high: 20, source: 'CDC PLACES' },
  mentalHealth: { label: 'Poor mental health', unit: '%', low: 12, high: 17, source: 'CDC PLACES' },
  uninsured:    { label: 'Uninsured',         unit: '%', low: 7,  high: 15, source: 'CDC PLACES' },
  poverty:      { label: 'Poverty',           unit: '%', low: 8,  high: 16, source: 'Census ACS' },
}

// Measures that feed the composite score (all adverse: higher = worse).
export const SCORE_MEASURES = ['diabetes', 'obesity', 'smoking', 'mentalHealth', 'uninsured', 'poverty']

export const COUNTY_COUNT = iowaCounties.length

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// Median of every numeric measure across a county array (real, for benchmarking).
export function computeMedians(counties) {
  const keys = Object.keys(counties[0]).filter(
    (k) => typeof counties[0][k] === 'number' && k !== 'lat' && k !== 'lng',
  )
  return Object.fromEntries(keys.map((k) => [k, +median(counties.map((c) => c[k])).toFixed(1)]))
}

// Percentile on one adverse measure: share of counties with a WORSE (higher)
// value → 100 = healthiest, 0 = least healthy.
function healthierPercentile(sortedAsc, value, n) {
  const worse = sortedAsc.filter((x) => x > value).length
  return (worse / (n - 1)) * 100
}

// Score + rank a county array. Returns the enriched, ranked array plus medians.
export function scoreAndRank(counties) {
  const n = counties.length
  const sorted = Object.fromEntries(
    SCORE_MEASURES.map((m) => [m, counties.map((c) => c[m]).sort((a, b) => a - b)]),
  )
  const ranked = counties
    .map((c) => {
      const parts = SCORE_MEASURES.map((m) => healthierPercentile(sorted[m], c[m], n))
      return { ...c, healthScore: Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) }
    })
    .sort((a, b) => b.healthScore - a.healthScore || a.name.localeCompare(b.name))
  ranked.forEach((c, i) => { c.rank = i + 1 })

  return {
    counties: ranked,
    medians: computeMedians(ranked),
    count: n,
    stateMedianScore: median(ranked.map((c) => c.healthScore)),
  }
}

export function pickCounty(counties, name) {
  return counties.find((c) => c.name.toLowerCase() === String(name).toLowerCase()) || counties[0]
}

// Nearest-population peer county (real), excluding the county itself.
export function pickPeer(counties, county) {
  return counties
    .filter((c) => c.name !== county.name)
    .reduce((best, c) => (Math.abs(c.pop - county.pop) < Math.abs(best.pop - county.pop) ? c : best))
}

// Risk level for a measure value, using its real published thresholds.
// 'low' = good (green), 'high' = concerning (red).
export function metricLevel(key, value) {
  const m = METRIC_INFO[key]
  if (!m) return 'mid'
  return value <= m.low ? 'low' : value >= m.high ? 'high' : 'mid'
}

// Synchronous snapshot result, used as the instant fallback before (or if) the
// live CDC/ACS fetch resolves.
export const SNAPSHOT = scoreAndRank(iowaCounties)
