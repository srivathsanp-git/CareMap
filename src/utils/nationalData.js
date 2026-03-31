// Static national data per state
// Sources:
//   Life expectancy: CDC National Center for Health Statistics, 2021
//   Medicaid expansion: KFF State Health Facts, as of 2024
//   Median household income: Census ACS 2022 (1-yr estimates), in $1,000s
//   Poverty rate: Census ACS 2022

export const STATE_STATIC = {
  AL: { lifeExp: 73.2, medicaidExpanded: false, medianIncome: 54943, povertyRate: 16.4 },
  AK: { lifeExp: 75.3, medicaidExpanded: true,  medianIncome: 77790, povertyRate: 10.6 },
  AZ: { lifeExp: 75.4, medicaidExpanded: true,  medianIncome: 62055, povertyRate: 13.2 },
  AR: { lifeExp: 72.5, medicaidExpanded: true,  medianIncome: 50784, povertyRate: 16.8 },
  CA: { lifeExp: 79.2, medicaidExpanded: true,  medianIncome: 84097, povertyRate: 11.6 },
  CO: { lifeExp: 78.8, medicaidExpanded: true,  medianIncome: 77127, povertyRate: 9.4  },
  CT: { lifeExp: 78.9, medicaidExpanded: true,  medianIncome: 83572, povertyRate: 10.5 },
  DE: { lifeExp: 76.5, medicaidExpanded: true,  medianIncome: 69110, povertyRate: 11.4 },
  FL: { lifeExp: 77.1, medicaidExpanded: false, medianIncome: 59227, povertyRate: 13.6 },
  GA: { lifeExp: 74.7, medicaidExpanded: true,  medianIncome: 61980, povertyRate: 14.5 },
  HI: { lifeExp: 80.7, medicaidExpanded: true,  medianIncome: 83173, povertyRate: 9.3  },
  ID: { lifeExp: 77.2, medicaidExpanded: true,  medianIncome: 60999, povertyRate: 10.1 },
  IL: { lifeExp: 76.6, medicaidExpanded: true,  medianIncome: 72205, povertyRate: 12.0 },
  IN: { lifeExp: 74.8, medicaidExpanded: true,  medianIncome: 61944, povertyRate: 12.0 },
  IA: { lifeExp: 78.1, medicaidExpanded: true,  medianIncome: 65429, povertyRate: 10.2 },
  KS: { lifeExp: 76.8, medicaidExpanded: true,  medianIncome: 64521, povertyRate: 11.4 },
  KY: { lifeExp: 73.5, medicaidExpanded: true,  medianIncome: 55573, povertyRate: 16.0 },
  LA: { lifeExp: 73.1, medicaidExpanded: true,  medianIncome: 52087, povertyRate: 18.6 },
  ME: { lifeExp: 76.4, medicaidExpanded: true,  medianIncome: 63989, povertyRate: 10.9 },
  MD: { lifeExp: 77.9, medicaidExpanded: true,  medianIncome: 94384, povertyRate: 9.0  },
  MA: { lifeExp: 79.1, medicaidExpanded: true,  medianIncome: 89645, povertyRate: 10.4 },
  MI: { lifeExp: 75.6, medicaidExpanded: true,  medianIncome: 63202, povertyRate: 13.5 },
  MN: { lifeExp: 79.1, medicaidExpanded: true,  medianIncome: 77720, povertyRate: 9.6  },
  MS: { lifeExp: 71.9, medicaidExpanded: false, medianIncome: 48716, povertyRate: 19.1 },
  MO: { lifeExp: 75.1, medicaidExpanded: true,  medianIncome: 61043, povertyRate: 13.0 },
  MT: { lifeExp: 76.5, medicaidExpanded: true,  medianIncome: 57153, povertyRate: 12.0 },
  NE: { lifeExp: 78.2, medicaidExpanded: true,  medianIncome: 66644, povertyRate: 9.9  },
  NV: { lifeExp: 75.6, medicaidExpanded: true,  medianIncome: 62043, povertyRate: 12.9 },
  NH: { lifeExp: 78.0, medicaidExpanded: true,  medianIncome: 88465, povertyRate: 7.4  },
  NJ: { lifeExp: 77.9, medicaidExpanded: true,  medianIncome: 89296, povertyRate: 10.0 },
  NM: { lifeExp: 74.5, medicaidExpanded: true,  medianIncome: 51243, povertyRate: 18.2 },
  NY: { lifeExp: 78.5, medicaidExpanded: true,  medianIncome: 74314, povertyRate: 13.4 },
  NC: { lifeExp: 75.9, medicaidExpanded: true,  medianIncome: 60516, povertyRate: 14.0 },
  ND: { lifeExp: 78.0, medicaidExpanded: true,  medianIncome: 68131, povertyRate: 10.1 },
  OH: { lifeExp: 74.9, medicaidExpanded: true,  medianIncome: 62689, povertyRate: 13.4 },
  OK: { lifeExp: 73.2, medicaidExpanded: true,  medianIncome: 55826, povertyRate: 15.2 },
  OR: { lifeExp: 77.7, medicaidExpanded: true,  medianIncome: 67058, povertyRate: 12.1 },
  PA: { lifeExp: 76.6, medicaidExpanded: true,  medianIncome: 67587, povertyRate: 12.1 },
  RI: { lifeExp: 77.6, medicaidExpanded: true,  medianIncome: 74008, povertyRate: 11.2 },
  SC: { lifeExp: 74.8, medicaidExpanded: true,  medianIncome: 58234, povertyRate: 14.6 },
  SD: { lifeExp: 77.1, medicaidExpanded: true,  medianIncome: 62621, povertyRate: 11.4 },
  TN: { lifeExp: 73.8, medicaidExpanded: false, medianIncome: 56071, povertyRate: 15.3 },
  TX: { lifeExp: 76.0, medicaidExpanded: false, medianIncome: 64034, povertyRate: 14.2 },
  UT: { lifeExp: 79.4, medicaidExpanded: true,  medianIncome: 74197, povertyRate: 8.9  },
  VT: { lifeExp: 78.8, medicaidExpanded: true,  medianIncome: 67674, povertyRate: 10.2 },
  VA: { lifeExp: 77.5, medicaidExpanded: true,  medianIncome: 80615, povertyRate: 10.6 },
  WA: { lifeExp: 79.1, medicaidExpanded: true,  medianIncome: 82400, povertyRate: 10.5 },
  WV: { lifeExp: 72.8, medicaidExpanded: true,  medianIncome: 48037, povertyRate: 17.9 },
  WI: { lifeExp: 77.9, medicaidExpanded: true,  medianIncome: 67080, povertyRate: 10.6 },
  WY: { lifeExp: 76.8, medicaidExpanded: false, medianIncome: 65204, povertyRate: 10.1 },
}

// Lookup helpers
export function getStateStatic(abbr) {
  return STATE_STATIC[abbr] || null
}
