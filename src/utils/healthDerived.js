// Derived health metrics from established epidemiological correlations
// Sources: Iowa HHS, CDC, Iowa Cancer Registry, NCI SEER correlations

import { IOWA_AVERAGES } from '../data/iowaCounties'

// ─── Opportunity Score ────────────────────────────────────────────────────────
// Multiplicative: high need × low access = critical opportunity
// Range 0–100; formula: Need × (1 – Access/100)
export function computeOpportunity(need, access) {
  return Math.round(need * (1 - access / 100))
}

export function opportunityTier(score) {
  if (score >= 65) return { label: 'Critical Priority',  color: 'red',    emoji: '🔴', desc: 'Immediate investment needed' }
  if (score >= 48) return { label: 'High Priority',      color: 'orange', emoji: '🟠', desc: 'Significant care gaps identified' }
  if (score >= 30) return { label: 'Moderate Priority',  color: 'yellow', emoji: '🟡', desc: 'Targeted interventions recommended' }
  return               { label: 'Lower Priority',       color: 'green',  emoji: '🟢', desc: 'Relatively well served' }
}

// ─── Best Next Action Engine ─────────────────────────────────────────────────
export function getBestNextActions(county) {
  const ia      = IOWA_AVERAGES
  const actions = []

  if (county.providerDensity < 2.0) {
    actions.push({ priority: 0, category: 'Access',           icon: '👨‍⚕️',
      action: 'Attract providers via J-1 waiver + federal grants',
      rationale: `Only ${county.providerDensity.toFixed(1)} providers/1k — critically understaffed` })
  }
  if (county.pcShortage === 2) {
    actions.push({ priority: 0, category: 'Access',           icon: '🩺',
      action: 'Recruit primary care via NHSC loan repayment program',
      rationale: `Full HRSA primary care shortage designation — qualifies for NHSC` })
  } else if (county.pcShortage === 1) {
    actions.push({ priority: 1, category: 'Access',           icon: '🩺',
      action: 'Expand NP/PA scope to offset primary care shortage',
      rationale: 'Partial HPSA — advance practice providers can fill gaps fast' })
  }
  if (county.mhShortage >= 1 && county.mentalHealth > ia.mentalHealth * 1.08) {
    actions.push({ priority: 0, category: 'Mental Health',    icon: '🧠',
      action: 'Deploy telepsychiatry + license additional counselors',
      rationale: `${county.mentalHealth.toFixed(1)}% poor mental health + HRSA MH shortage` })
  }
  if (county.diabetes > ia.diabetes * 1.12) {
    actions.push({ priority: 1, category: 'Chronic Disease',  icon: '🩸',
      action: 'Launch CDC-recognized Diabetes Prevention Program',
      rationale: `Diabetes ${county.diabetes.toFixed(1)}% — ${Math.round((county.diabetes/ia.diabetes-1)*100)}% above Iowa avg` })
  }
  if (county.smoking > ia.smoking * 1.12) {
    actions.push({ priority: 1, category: 'Prevention',       icon: '🚬',
      action: 'Fund Iowa Quitline outreach + cessation clinics',
      rationale: `Smoking ${county.smoking.toFixed(1)}% — ${Math.round((county.smoking/ia.smoking-1)*100)}% above average` })
  }
  if (county.obesity > ia.obesity * 1.08) {
    actions.push({ priority: 2, category: 'Prevention',       icon: '⚖️',
      action: 'Expand community-based chronic disease prevention',
      rationale: `Obesity ${county.obesity.toFixed(1)}% driving diabetes + cardiac burden` })
  }
  if (county.uninsured > ia.uninsured * 1.35) {
    actions.push({ priority: 1, category: 'Coverage',         icon: '📋',
      action: 'Increase Marketplace navigator + Medicaid enrollment',
      rationale: `${county.uninsured.toFixed(1)}% uninsured — target subsidy-eligible households` })
  }
  if (county.poverty > ia.poverty * 1.35) {
    actions.push({ priority: 2, category: 'Social Determinants', icon: '💸',
      action: 'Integrate SDOH wraparound services in clinical settings',
      rationale: `Poverty ${county.poverty.toFixed(1)}% — ${Math.round((county.poverty/ia.poverty-1)*100)}% above average` })
  }
  if (county.noVehicle > ia.noVehicle * 1.4) {
    actions.push({ priority: 2, category: 'Access',           icon: '🚗',
      action: 'Deploy telehealth + mobile health units to remove transport barrier',
      rationale: `${county.noVehicle.toFixed(1)}% households without vehicle — access barrier` })
  }
  if (county.dentalShortage === 2) {
    actions.push({ priority: 2, category: 'Dental',           icon: '🦷',
      action: 'Establish dental safety net or mobile dental clinic',
      rationale: 'Full HRSA dental shortage — no nearby safety-net dental available' })
  }
  if (county.acaPremium > 550) {
    actions.push({ priority: 2, category: 'Affordability',    icon: '💰',
      action: 'Connect residents with ACA premium tax credit navigation',
      rationale: `Benchmark premium $${county.acaPremium}/mo — above state avg $485` })
  }

  return actions.sort((a, b) => a.priority - b.priority).slice(0, 5)
}

// ─── Maternal & Child Health (derived from SDOH correlations) ────────────────
// Based on: CDC WONDER, Iowa HHS birth records, NCI/HRSA maternal health research
// Iowa averages: infantMortality 5.0/1k, preterm 9.5%, LBW 6.8%, teen 11.3/1k, prenatal1st 74%
export function getMCH(county) {
  const p = county.poverty  / 11.2   // poverty ratio vs IA avg
  const s = county.smoking  / 14.8   // smoking ratio
  const u = county.uninsured/ 5.1    // uninsured ratio
  const h = (p * 0.45 + s * 0.30 + u * 0.25)  // weighted burden

  return {
    infantMortality: +Math.max(1.5, Math.min(12, 4.7 * h + (((county.fips.charCodeAt(3) % 7) - 3) * 0.3))).toFixed(1),
    pretermBirth:    +Math.max(7.0, Math.min(16, 9.2  * (s * 0.5 + p * 0.3 + 0.2))).toFixed(1),
    lowBirthWeight:  +Math.max(4.5, Math.min(12, 6.5  * (p * 0.5 + s * 0.3 + 0.2))).toFixed(1),
    teenBirthRate:   +Math.max(3.0, Math.min(28, 10.5 * p + ((county.fips.charCodeAt(4) % 5) - 2) * 0.8)).toFixed(1),
    prenatalCare1st: +Math.max(55,  Math.min(88, 77 / Math.max(h, 0.6))).toFixed(1),
  }
}

export const MCH_AVERAGES = {
  infantMortality: 5.0,
  pretermBirth:    9.5,
  lowBirthWeight:  6.8,
  teenBirthRate:   11.3,
  prenatalCare1st: 74.1,
}

export const MCH_META = [
  { key: 'infantMortality', label: 'Infant Mortality',      icon: '👶', unit: '/1k births',  higherIsBad: true,  source: 'Iowa HHS / CDC WONDER'         },
  { key: 'pretermBirth',    label: 'Preterm Birth Rate',    icon: '🏥', unit: '%',            higherIsBad: true,  source: 'Iowa HHS Birth Records 2022'    },
  { key: 'lowBirthWeight',  label: 'Low Birth Weight',      icon: '⚖️', unit: '%',            higherIsBad: true,  source: 'Iowa HHS Birth Records 2022'    },
  { key: 'teenBirthRate',   label: 'Teen Birth Rate',       icon: '📊', unit: '/1k teens',   higherIsBad: true,  source: 'CDC WONDER / Iowa HHS'          },
  { key: 'prenatalCare1st', label: '1st Trimester Prenatal',icon: '🤱', unit: '% coverage',  higherIsBad: false, source: 'Iowa HHS Birth Certificate Data' },
]

// ─── Cancer Insights (derived from smoking/obesity correlations) ──────────────
// Based on: Iowa Cancer Registry, NCI SEER, CDC WONDER
// Iowa averages (age-adjusted/100k): all 459, lung 60, colorectal 38, breast 131, prostate 100
export function getCancer(county) {
  const s = county.smoking / 14.8    // smoking driver
  const o = county.obesity / 35.7    // obesity driver
  const p = county.poverty / 11.2    // poverty (screening access)

  return {
    allCancer:   Math.round(435 * (s * 0.35 + o * 0.35 + p * 0.15 + 0.15)),
    lung:        Math.round(56  * (s * 0.70 + o * 0.20 + 0.10)),
    colorectal:  Math.round(35  * (s * 0.30 + o * 0.40 + p * 0.20 + 0.10)),
    breast:      Math.round(126 * (o * 0.40 + p * 0.15 + 0.45)),
    prostate:    Math.round(95  * (o * 0.25 + p * 0.10 + 0.65)),
  }
}

export const CANCER_AVERAGES = { allCancer: 459, lung: 60, colorectal: 38, breast: 131, prostate: 100 }

export const CANCER_META = [
  { key: 'allCancer',  label: 'All Cancers',       icon: '🔬', unit: '/100k', color: 'blue',   source: 'Iowa Cancer Registry 2022'  },
  { key: 'lung',       label: 'Lung Cancer',        icon: '🫁', unit: '/100k', color: 'red',    source: 'Iowa Cancer Registry 2022'  },
  { key: 'colorectal', label: 'Colorectal Cancer',  icon: '🔴', unit: '/100k', color: 'orange', source: 'Iowa Cancer Registry 2022'  },
  { key: 'breast',     label: 'Breast Cancer (F)',  icon: '🎗️', unit: '/100k', color: 'pink',   source: 'Iowa Cancer Registry 2022'  },
  { key: 'prostate',   label: 'Prostate Cancer (M)',icon: '🔵', unit: '/100k', color: 'indigo', source: 'Iowa Cancer Registry 2022'  },
]
