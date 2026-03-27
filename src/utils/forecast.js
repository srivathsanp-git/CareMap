// Forecasting + Alert engine
// Trend rates sourced from CDC PLACES longitudinal, BRFSS Iowa, HRSA workforce projections

// Annual change per metric (percentage points per year)
export const ANNUAL_TRENDS = {
  diabetes:     +0.28,   // Iowa CDC trend 2015-2023
  obesity:      +0.42,   // BRFSS Iowa trend
  smoking:      -0.35,   // Declining, CDC NHIS
  mentalHealth: +0.62,   // Post-COVID crisis trend
  uninsured:    -0.08,   // ACA enrollment gains
  poverty:      +0.04,   // Near-stable
}

// Provider density shift by pop tier (rural exodus, urban retention)
export function getProviderTrend(county) {
  if (county.pop > 100000) return +0.020   // urban: gaining
  if (county.pop >  50000) return +0.005   // suburban: stable
  if (county.pop >  20000) return -0.018   // small city: slight decline
  return -0.030                            // rural: losing providers
}

// Project a value N years forward from current
export function project(value, rate, years) {
  return +(value + rate * years).toFixed(1)
}

// Estimate 2020 baseline (3 years before 2023 data)
export function baseline2020(value, rate) {
  return +(value - rate * 3).toFixed(1)
}

// Number of residents expected to need a service in N years
export function demandProjection(county, metric, years) {
  const futureRate = parseFloat(project(county[metric], ANNUAL_TRENDS[metric] ?? 0, years))
  const popRate    = county.pop > 50000 ? 1.008 : county.pop > 10000 ? 0.998 : 0.990
  const futurePop  = Math.round(county.pop * Math.pow(popRate, years))
  return Math.round(futurePop * futureRate / 100)
}

// ─── Age × Sex Risk Multipliers ──────────────────────────────────────────────
// Derived from CDC NHANES, BRFSS, National Diabetes Statistics Report
export const AGE_MULTIPLIERS = {
  '18-34': { diabetes: 0.27, obesity: 0.84, smoking: 1.01, mentalHealth: 1.59 },
  '35-49': { diabetes: 0.71, obesity: 1.20, smoking: 1.08, mentalHealth: 1.21 },
  '50-64': { diabetes: 1.52, obesity: 1.26, smoking: 1.08, mentalHealth: 0.83 },
  '65+':   { diabetes: 2.41, obesity: 1.12, smoking: 0.74, mentalHealth: 0.53 },
}

export const SEX_MULTIPLIERS = {
  Male:   { diabetes: 1.12, obesity: 0.97, smoking: 1.15, mentalHealth: 0.68 },
  Female: { diabetes: 0.88, obesity: 1.03, smoking: 0.87, mentalHealth: 1.32 },
  'Prefer not to say': { diabetes: 1.00, obesity: 1.00, smoking: 1.00, mentalHealth: 1.00 },
}

export function personalRisk(county, ageGroup, sex) {
  const age = AGE_MULTIPLIERS[ageGroup] ?? AGE_MULTIPLIERS['35-49']
  const gen = SEX_MULTIPLIERS[sex]      ?? SEX_MULTIPLIERS['Prefer not to say']
  const metrics = ['diabetes', 'obesity', 'smoking', 'mentalHealth']
  const result = {}
  for (const m of metrics) {
    result[m] = +(county[m] * age[m] * gen[m]).toFixed(1)
  }
  return result
}

// ─── Employer / Industry Profiles ────────────────────────────────────────────
// Based on CDC NIOSH, KFF Employer Health Benefits Survey, SHRM benchmarks

export const INDUSTRIES = [
  'Manufacturing',
  'Agriculture',
  'Healthcare',
  'Education',
  'Retail / Hospitality',
  'Office / Tech',
]

export const INDUSTRY_PROFILES = {
  'Manufacturing':       { diabetes: 1.20, obesity: 1.15, smoking: 1.30, mentalHealth: 1.10, baseCost: 7800, injury: 1.50 },
  'Agriculture':         { diabetes: 1.10, obesity: 1.20, smoking: 1.25, mentalHealth: 1.15, baseCost: 7500, injury: 2.00 },
  'Healthcare':          { diabetes: 0.90, obesity: 1.05, smoking: 0.80, mentalHealth: 1.45, baseCost: 8200, injury: 1.20 },
  'Education':           { diabetes: 0.90, obesity: 0.95, smoking: 0.75, mentalHealth: 1.25, baseCost: 6800, injury: 0.80 },
  'Retail / Hospitality':{ diabetes: 1.10, obesity: 1.10, smoking: 1.20, mentalHealth: 1.20, baseCost: 6400, injury: 1.10 },
  'Office / Tech':       { diabetes: 1.00, obesity: 1.05, smoking: 0.90, mentalHealth: 1.10, baseCost: 7100, injury: 0.70 },
}

// Cost driver weights (% of total healthcare spend)
export const COST_DRIVERS = [
  { key: 'chronic',     label: 'Chronic Disease',  pct: 0.35, icon: '🩸' },
  { key: 'mental',      label: 'Mental Health',     pct: 0.18, icon: '🧠' },
  { key: 'acute',       label: 'Acute / ER',        pct: 0.20, icon: '🚑' },
  { key: 'pharmacy',    label: 'Pharmacy',           pct: 0.15, icon: '💊' },
  { key: 'preventive',  label: 'Preventive',         pct: 0.12, icon: '🔬' },
]

export function employerHealthProfile(county, industry, headcount) {
  const prof    = INDUSTRY_PROFILES[industry] ?? INDUSTRY_PROFILES['Office / Tech']
  const ia      = { diabetes: 11.2, obesity: 35.7, smoking: 14.8, mentalHealth: 13.2 }

  // Weighted risk relative to Iowa avg
  const riskScore = Math.round(
    ((county.diabetes     / ia.diabetes     * prof.diabetes     - 1) * 30 +
     (county.obesity      / ia.obesity      * prof.obesity      - 1) * 20 +
     (county.smoking      / ia.smoking      * prof.smoking      - 1) * 20 +
     (county.mentalHealth / ia.mentalHealth * prof.mentalHealth - 1) * 30) * 100 + 50
  )

  const adjustedCost = Math.round(
    prof.baseCost *
    (county.diabetes / ia.diabetes * 0.25 +
     county.obesity  / ia.obesity  * 0.20 +
     county.smoking  / ia.smoking  * 0.20 +
     county.mentalHealth / ia.mentalHealth * 0.20 +
     county.uninsured / 5.1 * 0.15)
  )

  const totalCost     = adjustedCost * headcount
  const savingsPotential = Math.round(totalCost * 0.12) // 12% reduction from evidence-based interventions

  const topConditions = [
    { label: 'Diabetes / Pre-diabetes', rate: +(county.diabetes * prof.diabetes).toFixed(1), icon: '🩸', costWeight: 0.22 },
    { label: 'Obesity / Metabolic',     rate: +(county.obesity  * prof.obesity).toFixed(1),  icon: '⚖️', costWeight: 0.18 },
    { label: 'Mental Health',           rate: +(county.mentalHealth * prof.mentalHealth).toFixed(1), icon: '🧠', costWeight: 0.18 },
    { label: 'Tobacco Use',             rate: +(county.smoking  * prof.smoking).toFixed(1),  icon: '🚬', costWeight: 0.12 },
  ].sort((a, b) => b.rate - a.rate).slice(0, 3)

  return {
    riskScore:         Math.max(0, Math.min(100, riskScore)),
    costPerEmployee:   adjustedCost,
    totalAnnualCost:   totalCost,
    savingsPotential,
    topConditions,
    uninsuredWorkers:  Math.round(headcount * county.uninsured / 100),
  }
}

// ─── System-Wide Alerts ───────────────────────────────────────────────────────
export function generateAlerts(counties) {
  const IA = { mentalHealth: 13.2, diabetes: 11.2, smoking: 14.8, uninsured: 5.1 }
  const alerts = []

  for (const c of counties) {
    if (c.mentalHealth > 15 && c.mhShortage >= 1)
      alerts.push({
        id: `mh-${c.fips}`, severity: 'critical', category: 'Mental Health',
        county: c.name, pop: c.pop, icon: '🧠', trend: 'rising',
        headline: `Mental health crisis forming — ${c.mentalHealth}% + HRSA shortage`,
        detail:   `${Math.round(c.pop * c.mentalHealth / 100).toLocaleString()} residents affected; projected ${project(c.mentalHealth, ANNUAL_TRENDS.mentalHealth, 5).toFixed(1)}% by 2028`,
      })

    if (c.providerDensity < 1.5)
      alerts.push({
        id: `pd-${c.fips}`, severity: 'critical', category: 'Provider Shortage',
        county: c.name, pop: c.pop, icon: '👨‍⚕️', trend: 'worsening',
        headline: `Critically low provider density — ${c.providerDensity.toFixed(1)}/1k`,
        detail:   `Minimum threshold for basic coverage is 2.0/1k — rural exodus accelerating`,
      })

    if (c.diabetes > 14)
      alerts.push({
        id: `db-${c.fips}`, severity: 'warning', category: 'Chronic Disease',
        county: c.name, pop: c.pop, icon: '🩸', trend: 'rising',
        headline: `Diabetes ${c.diabetes}% — ${Math.round((c.diabetes/IA.diabetes-1)*100)}% above Iowa avg`,
        detail:   `Projected ${project(c.diabetes, ANNUAL_TRENDS.diabetes, 5).toFixed(1)}% by 2028 without DPP intervention`,
      })

    if (c.uninsured > 9)
      alerts.push({
        id: `ui-${c.fips}`, severity: 'warning', category: 'Coverage Gap',
        county: c.name, pop: c.pop, icon: '📋', trend: 'stable',
        headline: `${c.uninsured}% uninsured — ${Math.round(c.pop * c.uninsured / 100).toLocaleString()} residents`,
        detail:   'High ER utilization expected; preventive care and Medicaid enrollment drive needed',
      })

    if (c.providerDensity < 3 && getProviderTrend(c) < -0.02)
      alerts.push({
        id: `pw-${c.fips}`, severity: 'warning', category: 'Provider Shortage',
        county: c.name, pop: c.pop, icon: '📉', trend: 'worsening',
        headline: `Provider shortage worsening — ${c.providerDensity.toFixed(1)}/1k and declining`,
        detail:   `Projected ${project(c.providerDensity, getProviderTrend(c), 5).toFixed(1)}/1k by 2028 at current pace`,
      })
  }

  return alerts.sort((a, b) =>
    a.severity !== b.severity ? (a.severity === 'critical' ? -1 : 1)
    : a.county.localeCompare(b.county)
  )
}
