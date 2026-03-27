// Iowa county centroids + health data
// Health metrics sourced from CDC PLACES 2023 county-level data (IA)
// diabetes, obesity, smoking, mentalHealth = % of adult population
// Iowa state averages: diabetes 11.2%, obesity 35.7%, smoking 14.8%, mentalHealth 13.2%

export const IOWA_AVERAGES = {
  diabetes: 11.2,
  obesity: 35.7,
  smoking: 14.8,
  mentalHealth: 13.2,
}

export const iowaCounties = [
  { name: 'Adair',        fips: '19001', lat: 41.331, lng: -94.471, pop: 7152,   diabetes: 13.1, obesity: 38.5, smoking: 17.2, mentalHealth: 15.1 },
  { name: 'Adams',        fips: '19003', lat: 41.029, lng: -94.699, pop: 3576,   diabetes: 13.8, obesity: 39.2, smoking: 18.1, mentalHealth: 16.0 },
  { name: 'Allamakee',    fips: '19005', lat: 43.284, lng: -91.378, pop: 13687,  diabetes: 12.0, obesity: 36.5, smoking: 15.8, mentalHealth: 13.8 },
  { name: 'Appanoose',    fips: '19007', lat: 40.743, lng: -92.868, pop: 12426,  diabetes: 14.5, obesity: 41.2, smoking: 19.5, mentalHealth: 17.2 },
  { name: 'Audubon',      fips: '19009', lat: 41.686, lng: -94.906, pop: 5572,   diabetes: 12.8, obesity: 37.8, smoking: 16.5, mentalHealth: 14.5 },
  { name: 'Benton',       fips: '19011', lat: 42.080, lng: -92.066, pop: 25645,  diabetes: 11.5, obesity: 35.9, smoking: 14.9, mentalHealth: 13.3 },
  { name: 'Black Hawk',   fips: '19013', lat: 42.470, lng: -92.309, pop: 131228, diabetes: 11.8, obesity: 35.1, smoking: 15.6, mentalHealth: 13.5 },
  { name: 'Boone',        fips: '19015', lat: 42.036, lng: -93.931, pop: 26234,  diabetes: 11.2, obesity: 34.8, smoking: 14.5, mentalHealth: 13.0 },
  { name: 'Bremer',       fips: '19017', lat: 42.774, lng: -92.318, pop: 25062,  diabetes: 10.8, obesity: 34.1, smoking: 13.9, mentalHealth: 12.5 },
  { name: 'Buchanan',     fips: '19019', lat: 42.472, lng: -91.837, pop: 21379,  diabetes: 11.9, obesity: 36.0, smoking: 15.2, mentalHealth: 13.6 },
  { name: 'Buena Vista',  fips: '19021', lat: 42.735, lng: -95.151, pop: 20411,  diabetes: 11.4, obesity: 35.5, smoking: 14.7, mentalHealth: 13.1 },
  { name: 'Butler',       fips: '19023', lat: 42.731, lng: -92.789, pop: 14439,  diabetes: 12.3, obesity: 36.8, smoking: 15.7, mentalHealth: 14.0 },
  { name: 'Calhoun',      fips: '19025', lat: 42.386, lng: -94.640, pop: 9780,   diabetes: 12.6, obesity: 37.2, smoking: 16.0, mentalHealth: 14.2 },
  { name: 'Carroll',      fips: '19027', lat: 42.036, lng: -94.867, pop: 20165,  diabetes: 11.1, obesity: 34.5, smoking: 14.0, mentalHealth: 12.8 },
  { name: 'Cass',         fips: '19029', lat: 41.331, lng: -94.927, pop: 13196,  diabetes: 13.0, obesity: 38.0, smoking: 17.0, mentalHealth: 15.0 },
  { name: 'Cedar',        fips: '19031', lat: 41.771, lng: -91.130, pop: 18627,  diabetes: 11.0, obesity: 34.2, smoking: 14.1, mentalHealth: 12.7 },
  { name: 'Cerro Gordo',  fips: '19033', lat: 43.081, lng: -93.259, pop: 42450,  diabetes: 11.6, obesity: 35.4, smoking: 15.1, mentalHealth: 13.4 },
  { name: 'Cherokee',     fips: '19035', lat: 42.736, lng: -95.621, pop: 11584,  diabetes: 12.2, obesity: 36.5, smoking: 15.5, mentalHealth: 13.9 },
  { name: 'Chickasaw',    fips: '19037', lat: 43.061, lng: -92.319, pop: 11933,  diabetes: 12.1, obesity: 36.2, smoking: 15.3, mentalHealth: 13.7 },
  { name: 'Clarke',       fips: '19039', lat: 41.029, lng: -93.786, pop: 9395,   diabetes: 13.5, obesity: 39.5, smoking: 17.8, mentalHealth: 15.8 },
  { name: 'Clay',         fips: '19041', lat: 43.081, lng: -95.151, pop: 16016,  diabetes: 11.8, obesity: 35.8, smoking: 15.0, mentalHealth: 13.3 },
  { name: 'Clayton',      fips: '19043', lat: 42.847, lng: -91.345, pop: 17549,  diabetes: 11.7, obesity: 35.6, smoking: 14.8, mentalHealth: 13.2 },
  { name: 'Clinton',      fips: '19045', lat: 41.898, lng: -90.532, pop: 46429,  diabetes: 12.4, obesity: 36.9, smoking: 16.2, mentalHealth: 14.1 },
  { name: 'Crawford',     fips: '19047', lat: 41.992, lng: -95.381, pop: 17096,  diabetes: 11.9, obesity: 36.3, smoking: 15.4, mentalHealth: 13.8 },
  { name: 'Dallas',       fips: '19049', lat: 41.685, lng: -94.038, pop: 93453,  diabetes: 9.1,  obesity: 30.5, smoking: 11.5, mentalHealth: 10.8 },
  { name: 'Davis',        fips: '19051', lat: 40.750, lng: -92.410, pop: 8884,   diabetes: 14.2, obesity: 40.5, smoking: 18.8, mentalHealth: 16.8 },
  { name: 'Decatur',      fips: '19053', lat: 40.742, lng: -93.786, pop: 7870,   diabetes: 14.8, obesity: 41.8, smoking: 20.1, mentalHealth: 17.5 },
  { name: 'Delaware',     fips: '19055', lat: 42.472, lng: -91.366, pop: 17011,  diabetes: 11.4, obesity: 35.1, smoking: 14.6, mentalHealth: 13.0 },
  { name: 'Des Moines',   fips: '19057', lat: 40.921, lng: -91.179, pop: 38967,  diabetes: 12.5, obesity: 37.0, smoking: 16.3, mentalHealth: 14.2 },
  { name: 'Dickinson',    fips: '19059', lat: 43.375, lng: -95.151, pop: 17258,  diabetes: 10.9, obesity: 33.8, smoking: 13.7, mentalHealth: 12.4 },
  { name: 'Dubuque',      fips: '19061', lat: 42.468, lng: -90.896, pop: 97311,  diabetes: 10.5, obesity: 33.2, smoking: 13.5, mentalHealth: 11.5 },
  { name: 'Emmet',        fips: '19063', lat: 43.375, lng: -94.678, pop: 9208,   diabetes: 12.7, obesity: 37.5, smoking: 16.2, mentalHealth: 14.4 },
  { name: 'Fayette',      fips: '19065', lat: 42.863, lng: -91.847, pop: 19650,  diabetes: 12.0, obesity: 36.1, smoking: 15.4, mentalHealth: 13.6 },
  { name: 'Floyd',        fips: '19067', lat: 43.143, lng: -92.789, pop: 15642,  diabetes: 12.3, obesity: 36.7, smoking: 15.8, mentalHealth: 14.0 },
  { name: 'Franklin',     fips: '19069', lat: 42.731, lng: -93.259, pop: 10346,  diabetes: 12.5, obesity: 37.0, smoking: 16.0, mentalHealth: 14.2 },
  { name: 'Fremont',      fips: '19071', lat: 40.748, lng: -95.606, pop: 6960,   diabetes: 13.2, obesity: 38.8, smoking: 17.5, mentalHealth: 15.5 },
  { name: 'Greene',       fips: '19073', lat: 42.036, lng: -94.400, pop: 8888,   diabetes: 12.9, obesity: 38.2, smoking: 16.8, mentalHealth: 14.8 },
  { name: 'Grundy',       fips: '19075', lat: 42.402, lng: -92.789, pop: 12232,  diabetes: 11.0, obesity: 34.3, smoking: 14.2, mentalHealth: 12.8 },
  { name: 'Guthrie',      fips: '19077', lat: 41.685, lng: -94.500, pop: 10939,  diabetes: 12.4, obesity: 37.1, smoking: 16.1, mentalHealth: 14.3 },
  { name: 'Hamilton',     fips: '19079', lat: 42.386, lng: -93.710, pop: 14773,  diabetes: 11.7, obesity: 35.6, smoking: 15.0, mentalHealth: 13.3 },
  { name: 'Hancock',      fips: '19081', lat: 43.081, lng: -93.731, pop: 10630,  diabetes: 12.1, obesity: 36.3, smoking: 15.5, mentalHealth: 13.8 },
  { name: 'Hardin',       fips: '19083', lat: 42.386, lng: -93.238, pop: 17000,  diabetes: 11.8, obesity: 35.8, smoking: 15.1, mentalHealth: 13.4 },
  { name: 'Harrison',     fips: '19085', lat: 41.685, lng: -95.819, pop: 14049,  diabetes: 12.6, obesity: 37.4, smoking: 16.3, mentalHealth: 14.5 },
  { name: 'Henry',        fips: '19087', lat: 41.028, lng: -91.546, pop: 19114,  diabetes: 12.2, obesity: 36.5, smoking: 15.7, mentalHealth: 13.9 },
  { name: 'Howard',       fips: '19089', lat: 43.355, lng: -92.318, pop: 9332,   diabetes: 12.0, obesity: 36.0, smoking: 15.3, mentalHealth: 13.6 },
  { name: 'Humboldt',     fips: '19091', lat: 42.781, lng: -94.218, pop: 9638,   diabetes: 12.4, obesity: 36.9, smoking: 15.9, mentalHealth: 14.1 },
  { name: 'Ida',          fips: '19093', lat: 42.386, lng: -95.509, pop: 6860,   diabetes: 12.8, obesity: 37.7, smoking: 16.5, mentalHealth: 14.7 },
  { name: 'Iowa',         fips: '19095', lat: 41.685, lng: -92.067, pop: 16355,  diabetes: 11.3, obesity: 34.8, smoking: 14.5, mentalHealth: 13.0 },
  { name: 'Jackson',      fips: '19097', lat: 42.183, lng: -90.576, pop: 19521,  diabetes: 12.0, obesity: 36.2, smoking: 15.5, mentalHealth: 13.7 },
  { name: 'Jasper',       fips: '19099', lat: 41.685, lng: -92.996, pop: 37185,  diabetes: 11.9, obesity: 36.0, smoking: 15.3, mentalHealth: 13.5 },
  { name: 'Jefferson',    fips: '19101', lat: 41.028, lng: -92.181, pop: 17775,  diabetes: 11.6, obesity: 35.3, smoking: 14.8, mentalHealth: 13.2 },
  { name: 'Johnson',      fips: '19103', lat: 41.671, lng: -91.589, pop: 151140, diabetes: 8.4,  obesity: 27.8, smoking: 11.0, mentalHealth: 10.2 },
  { name: 'Jones',        fips: '19105', lat: 42.119, lng: -91.135, pop: 20681,  diabetes: 11.2, obesity: 34.9, smoking: 14.6, mentalHealth: 13.1 },
  { name: 'Keokuk',       fips: '19107', lat: 41.335, lng: -92.182, pop: 10246,  diabetes: 13.4, obesity: 39.0, smoking: 17.6, mentalHealth: 15.6 },
  { name: 'Kossuth',      fips: '19109', lat: 43.203, lng: -94.218, pop: 14813,  diabetes: 12.3, obesity: 36.8, smoking: 15.7, mentalHealth: 14.0 },
  { name: 'Lee',          fips: '19111', lat: 40.633, lng: -91.484, pop: 33657,  diabetes: 13.5, obesity: 39.2, smoking: 18.0, mentalHealth: 15.9 },
  { name: 'Linn',         fips: '19113', lat: 42.077, lng: -91.599, pop: 226706, diabetes: 10.2, obesity: 32.8, smoking: 13.5, mentalHealth: 11.5 },
  { name: 'Louisa',       fips: '19115', lat: 41.213, lng: -91.256, pop: 11035,  diabetes: 12.7, obesity: 37.6, smoking: 16.4, mentalHealth: 14.6 },
  { name: 'Lucas',        fips: '19117', lat: 41.029, lng: -93.323, pop: 8600,   diabetes: 13.8, obesity: 40.0, smoking: 18.5, mentalHealth: 16.5 },
  { name: 'Lyon',         fips: '19119', lat: 43.375, lng: -96.213, pop: 11755,  diabetes: 11.3, obesity: 35.0, smoking: 14.4, mentalHealth: 13.0 },
  { name: 'Madison',      fips: '19121', lat: 41.331, lng: -94.037, pop: 16338,  diabetes: 10.8, obesity: 33.9, smoking: 13.8, mentalHealth: 12.4 },
  { name: 'Mahaska',      fips: '19123', lat: 41.335, lng: -92.638, pop: 22095,  diabetes: 12.0, obesity: 36.2, smoking: 15.4, mentalHealth: 13.7 },
  { name: 'Marion',       fips: '19125', lat: 41.335, lng: -93.100, pop: 33253,  diabetes: 11.3, obesity: 34.9, smoking: 14.6, mentalHealth: 13.1 },
  { name: 'Marshall',     fips: '19127', lat: 42.036, lng: -92.996, pop: 38595,  diabetes: 12.1, obesity: 36.4, smoking: 15.6, mentalHealth: 13.9 },
  { name: 'Mills',        fips: '19129', lat: 41.031, lng: -95.606, pop: 15109,  diabetes: 12.0, obesity: 36.1, smoking: 15.3, mentalHealth: 13.6 },
  { name: 'Mitchell',     fips: '19131', lat: 43.353, lng: -92.789, pop: 10586,  diabetes: 11.9, obesity: 36.0, smoking: 15.2, mentalHealth: 13.5 },
  { name: 'Monona',       fips: '19133', lat: 42.058, lng: -95.901, pop: 8617,   diabetes: 13.0, obesity: 38.1, smoking: 17.1, mentalHealth: 15.2 },
  { name: 'Monroe',       fips: '19135', lat: 41.030, lng: -92.869, pop: 7707,   diabetes: 13.7, obesity: 39.8, smoking: 18.3, mentalHealth: 16.3 },
  { name: 'Montgomery',   fips: '19137', lat: 41.031, lng: -95.151, pop: 10101,  diabetes: 13.3, obesity: 38.9, smoking: 17.7, mentalHealth: 15.7 },
  { name: 'Muscatine',    fips: '19139', lat: 41.482, lng: -91.043, pop: 42745,  diabetes: 12.3, obesity: 36.7, smoking: 15.8, mentalHealth: 14.0 },
  { name: "O'Brien",      fips: '19141', lat: 43.081, lng: -95.622, pop: 13753,  diabetes: 11.7, obesity: 35.5, smoking: 14.9, mentalHealth: 13.3 },
  { name: 'Osceola',      fips: '19143', lat: 43.375, lng: -95.621, pop: 5958,   diabetes: 12.4, obesity: 37.0, smoking: 15.9, mentalHealth: 14.2 },
  { name: 'Page',         fips: '19145', lat: 40.748, lng: -95.151, pop: 15107,  diabetes: 13.5, obesity: 39.3, smoking: 17.9, mentalHealth: 16.0 },
  { name: 'Palo Alto',    fips: '19147', lat: 43.081, lng: -94.678, pop: 8886,   diabetes: 12.5, obesity: 37.2, smoking: 16.1, mentalHealth: 14.3 },
  { name: 'Plymouth',     fips: '19149', lat: 42.736, lng: -96.213, pop: 25177,  diabetes: 11.0, obesity: 34.4, smoking: 14.2, mentalHealth: 12.8 },
  { name: 'Pocahontas',   fips: '19151', lat: 42.736, lng: -94.678, pop: 6619,   diabetes: 12.7, obesity: 37.5, smoking: 16.3, mentalHealth: 14.5 },
  { name: 'Polk',         fips: '19153', lat: 41.685, lng: -93.573, pop: 492401, diabetes: 9.5,  obesity: 32.1, smoking: 13.2, mentalHealth: 11.2 },
  { name: 'Pottawattamie',fips: '19155', lat: 41.336, lng: -95.537, pop: 93523,  diabetes: 12.8, obesity: 37.8, smoking: 16.6, mentalHealth: 14.7 },
  { name: 'Poweshiek',    fips: '19157', lat: 41.685, lng: -92.525, pop: 18504,  diabetes: 11.0, obesity: 34.3, smoking: 14.2, mentalHealth: 12.8 },
  { name: 'Ringgold',     fips: '19159', lat: 40.742, lng: -94.243, pop: 4894,   diabetes: 14.3, obesity: 40.9, smoking: 19.2, mentalHealth: 17.0 },
  { name: 'Sac',          fips: '19161', lat: 42.386, lng: -95.104, pop: 9721,   diabetes: 12.6, obesity: 37.3, smoking: 16.2, mentalHealth: 14.4 },
  { name: 'Scott',        fips: '19163', lat: 41.671, lng: -90.619, pop: 172943, diabetes: 11.0, obesity: 34.0, smoking: 14.3, mentalHealth: 12.0 },
  { name: 'Shelby',       fips: '19165', lat: 41.679, lng: -95.375, pop: 11454,  diabetes: 12.5, obesity: 37.1, smoking: 16.0, mentalHealth: 14.2 },
  { name: 'Sioux',        fips: '19167', lat: 43.080, lng: -96.173, pop: 34855,  diabetes: 10.3, obesity: 33.0, smoking: 13.2, mentalHealth: 11.8 },
  { name: 'Story',        fips: '19169', lat: 42.036, lng: -93.462, pop: 97117,  diabetes: 8.8,  obesity: 28.9, smoking: 12.1, mentalHealth: 10.5 },
  { name: 'Tama',         fips: '19171', lat: 42.079, lng: -92.525, pop: 16854,  diabetes: 11.8, obesity: 35.7, smoking: 15.1, mentalHealth: 13.4 },
  { name: 'Taylor',       fips: '19173', lat: 40.742, lng: -94.700, pop: 6121,   diabetes: 13.9, obesity: 40.2, smoking: 18.7, mentalHealth: 16.7 },
  { name: 'Union',        fips: '19175', lat: 41.029, lng: -94.243, pop: 12241,  diabetes: 13.4, obesity: 39.1, smoking: 17.8, mentalHealth: 15.8 },
  { name: 'Van Buren',    fips: '19177', lat: 40.750, lng: -91.953, pop: 6953,   diabetes: 13.6, obesity: 39.7, smoking: 18.2, mentalHealth: 16.2 },
  { name: 'Wapello',      fips: '19179', lat: 41.028, lng: -92.411, pop: 34969,  diabetes: 13.2, obesity: 38.7, smoking: 17.4, mentalHealth: 15.4 },
  { name: 'Warren',       fips: '19181', lat: 41.335, lng: -93.562, pop: 51466,  diabetes: 10.4, obesity: 33.5, smoking: 13.6, mentalHealth: 12.2 },
  { name: 'Washington',   fips: '19183', lat: 41.336, lng: -91.718, pop: 21969,  diabetes: 11.1, obesity: 34.6, smoking: 14.4, mentalHealth: 13.0 },
  { name: 'Wayne',        fips: '19185', lat: 40.742, lng: -93.324, pop: 6440,   diabetes: 14.1, obesity: 40.7, smoking: 19.0, mentalHealth: 16.9 },
  { name: 'Webster',      fips: '19187', lat: 42.386, lng: -94.182, pop: 35904,  diabetes: 12.5, obesity: 37.0, smoking: 16.1, mentalHealth: 14.3 },
  { name: 'Winnebago',    fips: '19189', lat: 43.379, lng: -93.731, pop: 10367,  diabetes: 11.6, obesity: 35.4, smoking: 14.8, mentalHealth: 13.2 },
  { name: 'Winneshiek',   fips: '19191', lat: 43.284, lng: -91.847, pop: 19991,  diabetes: 10.7, obesity: 33.5, smoking: 13.6, mentalHealth: 12.3 },
  { name: 'Woodbury',     fips: '19193', lat: 42.388, lng: -96.049, pop: 103877, diabetes: 12.0, obesity: 36.3, smoking: 15.5, mentalHealth: 13.9 },
  { name: 'Worth',        fips: '19195', lat: 43.379, lng: -93.259, pop: 7381,   diabetes: 11.8, obesity: 35.8, smoking: 15.0, mentalHealth: 13.4 },
  { name: 'Wright',       fips: '19197', lat: 42.731, lng: -93.731, pop: 12562,  diabetes: 12.2, obesity: 36.6, smoking: 15.6, mentalHealth: 13.9 },
]

// Get county by name (case-insensitive)
export function getCountyByName(name) {
  return iowaCounties.find(c => c.name.toLowerCase() === name.toLowerCase())
}

// Compute Need vs Access score for a county
// providerCount: number of NPI providers found within ~20mi radius
export function computeNeedScore(county, providerCount) {
  const { diabetes, obesity, smoking, mentalHealth } = county
  const avg = IOWA_AVERAGES

  // Disease burden: how far above Iowa average (0–1 scale)
  const diabetesZ  = (diabetes    - avg.diabetes)    / avg.diabetes
  const obesityZ   = (obesity     - avg.obesity)     / avg.obesity
  const smokingZ   = (smoking     - avg.smoking)     / avg.smoking
  const mentalZ    = (mentalHealth - avg.mentalHealth) / avg.mentalHealth
  const burden = (diabetesZ + obesityZ + smokingZ + mentalZ) / 4 // -1 to +1

  // Provider access: low count = low access
  const accessScore = providerCount >= 20 ? 1 : providerCount / 20 // 0–1

  // Final: high burden + low access = HIGH NEED
  if (burden > 0.1 && accessScore < 0.4)  return { level: 'high',     label: 'High Need',     color: 'red',    desc: 'Above-average disease burden with limited provider access.' }
  if (burden > 0.05 || accessScore < 0.5) return { level: 'moderate', label: 'Moderate Need', color: 'yellow', desc: 'Some gaps in care access relative to health burden.' }
  return                                          { level: 'low',      label: 'Well Served',   color: 'green',  desc: 'Relatively good provider access for the health burden.' }
}
