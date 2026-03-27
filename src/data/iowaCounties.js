// Iowa county data — all 99 counties
// Sources: CDC PLACES 2023, ACS 2022 5-year, HRSA HPSA 2023, CMS Plan Finder 2024
//
// Health metrics (% adults): diabetes, obesity, smoking, mentalHealth
// SDOH (ACS): poverty, uninsured, noVehicle (% HH no car), medianAge
// Coverage: medicaidPct (% enrolled), acaPremium (40yr SLCSP $/mo)
// HRSA Shortage: pcShortage / mhShortage / dentalShortage  0=none 1=partial 2=full
// Access: providerDensity = estimated providers per 1,000 residents

export const IOWA_AVERAGES = {
  diabetes:        11.2,
  obesity:         35.7,
  smoking:         14.8,
  mentalHealth:    13.2,
  poverty:         11.2,
  uninsured:        5.1,
  noVehicle:        5.5,
  medianAge:       38.7,
  medicaidPct:     16.0,
  acaPremium:       485,
  providerDensity:  7.2,
}

export const iowaCounties = [
  // name, fips, lat, lng, pop | diabetes,obesity,smoking,mentalHealth | poverty,uninsured,noVehicle,medianAge | medicaidPct,acaPremium | pcShortage,mhShortage,dentalShortage | providerDensity
  { name:'Adair',        fips:'19001', lat:41.331, lng:-94.471, pop:7152,
    diabetes:13.1, obesity:38.5, smoking:17.2, mentalHealth:15.1,
    poverty:13.5, uninsured:7.2, noVehicle:4.1, medianAge:46.8,
    medicaidPct:19.2, acaPremium:548,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:1.8 },

  { name:'Adams',        fips:'19003', lat:41.029, lng:-94.699, pop:3576,
    diabetes:13.8, obesity:39.2, smoking:18.1, mentalHealth:16.0,
    poverty:15.2, uninsured:8.1, noVehicle:3.8, medianAge:49.2,
    medicaidPct:22.1, acaPremium:572,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:0.8 },

  { name:'Allamakee',    fips:'19005', lat:43.284, lng:-91.378, pop:13687,
    diabetes:12.0, obesity:36.5, smoking:15.8, mentalHealth:13.8,
    poverty:14.1, uninsured:7.4, noVehicle:4.2, medianAge:45.1,
    medicaidPct:20.1, acaPremium:528,
    pcShortage:2, mhShortage:2, dentalShortage:1, providerDensity:2.4 },

  { name:'Appanoose',    fips:'19007', lat:40.743, lng:-92.868, pop:12426,
    diabetes:14.5, obesity:41.2, smoking:19.5, mentalHealth:17.2,
    poverty:17.8, uninsured:9.4, noVehicle:5.8, medianAge:47.2,
    medicaidPct:24.8, acaPremium:574,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.1 },

  { name:'Audubon',      fips:'19009', lat:41.686, lng:-94.906, pop:5572,
    diabetes:12.8, obesity:37.8, smoking:16.5, mentalHealth:14.5,
    poverty:12.4, uninsured:6.8, noVehicle:4.0, medianAge:48.2,
    medicaidPct:17.8, acaPremium:544,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:1.9 },

  { name:'Benton',       fips:'19011', lat:42.080, lng:-92.066, pop:25645,
    diabetes:11.5, obesity:35.9, smoking:14.9, mentalHealth:13.3,
    poverty:8.9,  uninsured:5.2, noVehicle:3.8, medianAge:41.2,
    medicaidPct:13.4, acaPremium:498,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.8 },

  { name:'Black Hawk',   fips:'19013', lat:42.470, lng:-92.309, pop:131228,
    diabetes:11.8, obesity:35.1, smoking:15.6, mentalHealth:13.5,
    poverty:14.2, uninsured:6.1, noVehicle:6.4, medianAge:36.8,
    medicaidPct:20.2, acaPremium:462,
    pcShortage:1, mhShortage:1, dentalShortage:0, providerDensity:8.5 },

  { name:'Boone',        fips:'19015', lat:42.036, lng:-93.931, pop:26234,
    diabetes:11.2, obesity:34.8, smoking:14.5, mentalHealth:13.0,
    poverty:9.1,  uninsured:5.0, noVehicle:4.2, medianAge:40.8,
    medicaidPct:13.8, acaPremium:488,
    pcShortage:1, mhShortage:1, dentalShortage:1, providerDensity:4.9 },

  { name:'Bremer',       fips:'19017', lat:42.774, lng:-92.318, pop:25062,
    diabetes:10.8, obesity:34.1, smoking:13.9, mentalHealth:12.5,
    poverty:7.8,  uninsured:4.8, noVehicle:3.5, medianAge:40.2,
    medicaidPct:12.2, acaPremium:482,
    pcShortage:1, mhShortage:1, dentalShortage:1, providerDensity:4.2 },

  { name:'Buchanan',     fips:'19019', lat:42.472, lng:-91.837, pop:21379,
    diabetes:11.9, obesity:36.0, smoking:15.2, mentalHealth:13.6,
    poverty:10.2, uninsured:5.8, noVehicle:4.0, medianAge:41.8,
    medicaidPct:15.4, acaPremium:510,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.2 },

  { name:'Buena Vista',  fips:'19021', lat:42.735, lng:-95.151, pop:20411,
    diabetes:11.4, obesity:35.5, smoking:14.7, mentalHealth:13.1,
    poverty:14.8, uninsured:8.2, noVehicle:4.8, medianAge:35.2,
    medicaidPct:21.4, acaPremium:518,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.5 },

  { name:'Butler',       fips:'19023', lat:42.731, lng:-92.789, pop:14439,
    diabetes:12.3, obesity:36.8, smoking:15.7, mentalHealth:14.0,
    poverty:9.8,  uninsured:5.4, noVehicle:3.8, medianAge:44.2,
    medicaidPct:15.8, acaPremium:514,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.8 },

  { name:'Calhoun',      fips:'19025', lat:42.386, lng:-94.640, pop:9780,
    diabetes:12.6, obesity:37.2, smoking:16.0, mentalHealth:14.2,
    poverty:11.3, uninsured:6.2, noVehicle:3.9, medianAge:46.8,
    medicaidPct:17.2, acaPremium:524,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.5 },

  { name:'Carroll',      fips:'19027', lat:42.036, lng:-94.867, pop:20165,
    diabetes:11.1, obesity:34.5, smoking:14.0, mentalHealth:12.8,
    poverty:8.7,  uninsured:5.1, noVehicle:3.5, medianAge:42.8,
    medicaidPct:13.2, acaPremium:505,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:4.8 },

  { name:'Cass',         fips:'19029', lat:41.331, lng:-94.927, pop:13196,
    diabetes:13.0, obesity:38.0, smoking:17.0, mentalHealth:15.0,
    poverty:12.1, uninsured:6.8, noVehicle:4.1, medianAge:45.8,
    medicaidPct:17.8, acaPremium:534,
    pcShortage:2, mhShortage:2, dentalShortage:1, providerDensity:2.9 },

  { name:'Cedar',        fips:'19031', lat:41.771, lng:-91.130, pop:18627,
    diabetes:11.0, obesity:34.2, smoking:14.1, mentalHealth:12.7,
    poverty:8.4,  uninsured:4.8, noVehicle:3.6, medianAge:42.1,
    medicaidPct:12.8, acaPremium:492,
    pcShortage:1, mhShortage:1, dentalShortage:1, providerDensity:3.6 },

  { name:'Cerro Gordo',  fips:'19033', lat:43.081, lng:-93.259, pop:42450,
    diabetes:11.6, obesity:35.4, smoking:15.1, mentalHealth:13.4,
    poverty:11.4, uninsured:5.8, noVehicle:5.1, medianAge:42.8,
    medicaidPct:17.1, acaPremium:495,
    pcShortage:0, mhShortage:1, dentalShortage:0, providerDensity:7.8 },

  { name:'Cherokee',     fips:'19035', lat:42.736, lng:-95.621, pop:11584,
    diabetes:12.2, obesity:36.5, smoking:15.5, mentalHealth:13.9,
    poverty:10.8, uninsured:5.9, noVehicle:3.9, medianAge:45.4,
    medicaidPct:16.4, acaPremium:524,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.2 },

  { name:'Chickasaw',    fips:'19037', lat:43.061, lng:-92.319, pop:11933,
    diabetes:12.1, obesity:36.2, smoking:15.3, mentalHealth:13.7,
    poverty:10.5, uninsured:5.7, noVehicle:3.7, medianAge:44.8,
    medicaidPct:15.8, acaPremium:516,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.6 },

  { name:'Clarke',       fips:'19039', lat:41.029, lng:-93.786, pop:9395,
    diabetes:13.5, obesity:39.5, smoking:17.8, mentalHealth:15.8,
    poverty:14.3, uninsured:7.8, noVehicle:4.5, medianAge:44.2,
    medicaidPct:21.4, acaPremium:548,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.2 },

  { name:'Clay',         fips:'19041', lat:43.081, lng:-95.151, pop:16016,
    diabetes:11.8, obesity:35.8, smoking:15.0, mentalHealth:13.3,
    poverty:11.2, uninsured:5.9, noVehicle:4.1, medianAge:43.8,
    medicaidPct:16.8, acaPremium:515,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:4.5 },

  { name:'Clayton',      fips:'19043', lat:42.847, lng:-91.345, pop:17549,
    diabetes:11.7, obesity:35.6, smoking:14.8, mentalHealth:13.2,
    poverty:10.9, uninsured:5.8, noVehicle:3.8, medianAge:46.2,
    medicaidPct:16.1, acaPremium:512,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.1 },

  { name:'Clinton',      fips:'19045', lat:41.898, lng:-90.532, pop:46429,
    diabetes:12.4, obesity:36.9, smoking:16.2, mentalHealth:14.1,
    poverty:13.5, uninsured:6.5, noVehicle:6.2, medianAge:41.8,
    medicaidPct:19.8, acaPremium:498,
    pcShortage:1, mhShortage:1, dentalShortage:0, providerDensity:6.2 },

  { name:'Crawford',     fips:'19047', lat:41.992, lng:-95.381, pop:17096,
    diabetes:11.9, obesity:36.3, smoking:15.4, mentalHealth:13.8,
    poverty:14.2, uninsured:8.5, noVehicle:4.2, medianAge:38.4,
    medicaidPct:21.8, acaPremium:528,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.0 },

  { name:'Dallas',       fips:'19049', lat:41.685, lng:-94.038, pop:93453,
    diabetes:9.1,  obesity:30.5, smoking:11.5, mentalHealth:10.8,
    poverty:5.2,  uninsured:3.8, noVehicle:3.1, medianAge:35.2,
    medicaidPct:9.8,  acaPremium:432,
    pcShortage:0, mhShortage:0, dentalShortage:0, providerDensity:8.0 },

  { name:'Davis',        fips:'19051', lat:40.750, lng:-92.410, pop:8884,
    diabetes:14.2, obesity:40.5, smoking:18.8, mentalHealth:16.8,
    poverty:14.8, uninsured:8.4, noVehicle:4.8, medianAge:45.8,
    medicaidPct:22.4, acaPremium:568,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:1.5 },

  { name:'Decatur',      fips:'19053', lat:40.742, lng:-93.786, pop:7870,
    diabetes:14.8, obesity:41.8, smoking:20.1, mentalHealth:17.5,
    poverty:17.1, uninsured:9.8, noVehicle:5.2, medianAge:48.4,
    medicaidPct:25.8, acaPremium:578,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:1.2 },

  { name:'Delaware',     fips:'19055', lat:42.472, lng:-91.366, pop:17011,
    diabetes:11.4, obesity:35.1, smoking:14.6, mentalHealth:13.0,
    poverty:8.9,  uninsured:5.1, noVehicle:3.6, medianAge:42.8,
    medicaidPct:13.8, acaPremium:502,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.4 },

  { name:'Des Moines',   fips:'19057', lat:40.921, lng:-91.179, pop:38967,
    diabetes:12.5, obesity:37.0, smoking:16.3, mentalHealth:14.2,
    poverty:13.8, uninsured:6.8, noVehicle:6.2, medianAge:41.2,
    medicaidPct:20.4, acaPremium:505,
    pcShortage:1, mhShortage:1, dentalShortage:0, providerDensity:6.8 },

  { name:'Dickinson',    fips:'19059', lat:43.375, lng:-95.151, pop:17258,
    diabetes:10.9, obesity:33.8, smoking:13.7, mentalHealth:12.4,
    poverty:8.5,  uninsured:5.0, noVehicle:3.4, medianAge:46.2,
    medicaidPct:12.8, acaPremium:498,
    pcShortage:1, mhShortage:1, dentalShortage:1, providerDensity:5.2 },

  { name:'Dubuque',      fips:'19061', lat:42.468, lng:-90.896, pop:97311,
    diabetes:10.5, obesity:33.2, smoking:13.5, mentalHealth:11.5,
    poverty:9.2,  uninsured:4.8, noVehicle:5.2, medianAge:39.2,
    medicaidPct:14.2, acaPremium:462,
    pcShortage:0, mhShortage:0, dentalShortage:0, providerDensity:11.0 },

  { name:'Emmet',        fips:'19063', lat:43.375, lng:-94.678, pop:9208,
    diabetes:12.7, obesity:37.5, smoking:16.2, mentalHealth:14.4,
    poverty:12.8, uninsured:6.8, noVehicle:4.2, medianAge:44.8,
    medicaidPct:19.2, acaPremium:528,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.8 },

  { name:'Fayette',      fips:'19065', lat:42.863, lng:-91.847, pop:19650,
    diabetes:12.0, obesity:36.1, smoking:15.4, mentalHealth:13.6,
    poverty:12.4, uninsured:6.2, noVehicle:4.1, medianAge:44.8,
    medicaidPct:18.2, acaPremium:515,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.2 },

  { name:'Floyd',        fips:'19067', lat:43.143, lng:-92.789, pop:15642,
    diabetes:12.3, obesity:36.7, smoking:15.8, mentalHealth:14.0,
    poverty:11.8, uninsured:6.1, noVehicle:4.0, medianAge:44.2,
    medicaidPct:17.4, acaPremium:515,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.8 },

  { name:'Franklin',     fips:'19069', lat:42.731, lng:-93.259, pop:10346,
    diabetes:12.5, obesity:37.0, smoking:16.0, mentalHealth:14.2,
    poverty:11.5, uninsured:6.2, noVehicle:3.8, medianAge:44.8,
    medicaidPct:17.2, acaPremium:521,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.6 },

  { name:'Fremont',      fips:'19071', lat:40.748, lng:-95.606, pop:6960,
    diabetes:13.2, obesity:38.8, smoking:17.5, mentalHealth:15.5,
    poverty:13.8, uninsured:7.5, noVehicle:3.9, medianAge:47.2,
    medicaidPct:20.8, acaPremium:548,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:1.8 },

  { name:'Greene',       fips:'19073', lat:42.036, lng:-94.400, pop:8888,
    diabetes:12.9, obesity:38.2, smoking:16.8, mentalHealth:14.8,
    poverty:12.9, uninsured:6.8, noVehicle:4.0, medianAge:47.8,
    medicaidPct:19.4, acaPremium:532,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.4 },

  { name:'Grundy',       fips:'19075', lat:42.402, lng:-92.789, pop:12232,
    diabetes:11.0, obesity:34.3, smoking:14.2, mentalHealth:12.8,
    poverty:8.2,  uninsured:4.9, noVehicle:3.4, medianAge:43.8,
    medicaidPct:13.2, acaPremium:498,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.5 },

  { name:'Guthrie',      fips:'19077', lat:41.685, lng:-94.500, pop:10939,
    diabetes:12.4, obesity:37.1, smoking:16.1, mentalHealth:14.3,
    poverty:9.8,  uninsured:5.5, noVehicle:3.8, medianAge:46.2,
    medicaidPct:15.2, acaPremium:522,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.8 },

  { name:'Hamilton',     fips:'19079', lat:42.386, lng:-93.710, pop:14773,
    diabetes:11.7, obesity:35.6, smoking:15.0, mentalHealth:13.3,
    poverty:9.4,  uninsured:5.2, noVehicle:4.0, medianAge:44.2,
    medicaidPct:14.8, acaPremium:508,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:4.2 },

  { name:'Hancock',      fips:'19081', lat:43.081, lng:-93.731, pop:10630,
    diabetes:12.1, obesity:36.3, smoking:15.5, mentalHealth:13.8,
    poverty:10.9, uninsured:5.8, noVehicle:3.8, medianAge:44.8,
    medicaidPct:16.4, acaPremium:518,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:3.1 },

  { name:'Hardin',       fips:'19083', lat:42.386, lng:-93.238, pop:17000,
    diabetes:11.8, obesity:35.8, smoking:15.1, mentalHealth:13.4,
    poverty:10.6, uninsured:5.6, noVehicle:4.1, medianAge:44.8,
    medicaidPct:16.2, acaPremium:512,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.8 },

  { name:'Harrison',     fips:'19085', lat:41.685, lng:-95.819, pop:14049,
    diabetes:12.6, obesity:37.4, smoking:16.3, mentalHealth:14.5,
    poverty:11.8, uninsured:6.4, noVehicle:3.9, medianAge:45.2,
    medicaidPct:17.8, acaPremium:534,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:2.9 },

  { name:'Henry',        fips:'19087', lat:41.028, lng:-91.546, pop:19114,
    diabetes:12.2, obesity:36.5, smoking:15.7, mentalHealth:13.9,
    poverty:11.9, uninsured:6.2, noVehicle:4.4, medianAge:43.8,
    medicaidPct:17.4, acaPremium:512,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.9 },

  { name:'Howard',       fips:'19089', lat:43.355, lng:-92.318, pop:9332,
    diabetes:12.0, obesity:36.0, smoking:15.3, mentalHealth:13.6,
    poverty:10.8, uninsured:5.7, noVehicle:3.8, medianAge:45.8,
    medicaidPct:16.2, acaPremium:518,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.8 },

  { name:'Humboldt',     fips:'19091', lat:42.781, lng:-94.218, pop:9638,
    diabetes:12.4, obesity:36.9, smoking:15.9, mentalHealth:14.1,
    poverty:10.4, uninsured:5.6, noVehicle:3.8, medianAge:46.2,
    medicaidPct:16.1, acaPremium:521,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:3.2 },

  { name:'Ida',          fips:'19093', lat:42.386, lng:-95.509, pop:6860,
    diabetes:12.8, obesity:37.7, smoking:16.5, mentalHealth:14.7,
    poverty:11.8, uninsured:6.4, noVehicle:3.8, medianAge:46.8,
    medicaidPct:17.8, acaPremium:536,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.1 },

  { name:'Iowa',         fips:'19095', lat:41.685, lng:-92.067, pop:16355,
    diabetes:11.3, obesity:34.8, smoking:14.5, mentalHealth:13.0,
    poverty:8.4,  uninsured:5.0, noVehicle:3.6, medianAge:43.2,
    medicaidPct:13.2, acaPremium:499,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.8 },

  { name:'Jackson',      fips:'19097', lat:42.183, lng:-90.576, pop:19521,
    diabetes:12.0, obesity:36.2, smoking:15.5, mentalHealth:13.7,
    poverty:11.5, uninsured:5.9, noVehicle:4.2, medianAge:44.2,
    medicaidPct:17.2, acaPremium:508,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.5 },

  { name:'Jasper',       fips:'19099', lat:41.685, lng:-92.996, pop:37185,
    diabetes:11.9, obesity:36.0, smoking:15.3, mentalHealth:13.5,
    poverty:10.1, uninsured:5.4, noVehicle:4.2, medianAge:43.8,
    medicaidPct:15.8, acaPremium:494,
    pcShortage:1, mhShortage:1, dentalShortage:0, providerDensity:5.2 },

  { name:'Jefferson',    fips:'19101', lat:41.028, lng:-92.181, pop:17775,
    diabetes:11.6, obesity:35.3, smoking:14.8, mentalHealth:13.2,
    poverty:14.2, uninsured:6.8, noVehicle:5.1, medianAge:36.2,
    medicaidPct:18.4, acaPremium:508,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:4.8 },

  { name:'Johnson',      fips:'19103', lat:41.671, lng:-91.589, pop:151140,
    diabetes:8.4,  obesity:27.8, smoking:11.0, mentalHealth:10.2,
    poverty:16.8, uninsured:4.2, noVehicle:7.8, medianAge:28.4,
    medicaidPct:15.2, acaPremium:445,
    pcShortage:0, mhShortage:0, dentalShortage:0, providerDensity:22.0 },

  { name:'Jones',        fips:'19105', lat:42.119, lng:-91.135, pop:20681,
    diabetes:11.2, obesity:34.9, smoking:14.6, mentalHealth:13.1,
    poverty:9.5,  uninsured:5.1, noVehicle:3.7, medianAge:42.8,
    medicaidPct:14.2, acaPremium:498,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.6 },

  { name:'Keokuk',       fips:'19107', lat:41.335, lng:-92.182, pop:10246,
    diabetes:13.4, obesity:39.0, smoking:17.6, mentalHealth:15.6,
    poverty:14.1, uninsured:7.4, noVehicle:4.5, medianAge:46.8,
    medicaidPct:21.4, acaPremium:545,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.1 },

  { name:'Kossuth',      fips:'19109', lat:43.203, lng:-94.218, pop:14813,
    diabetes:12.3, obesity:36.8, smoking:15.7, mentalHealth:14.0,
    poverty:10.9, uninsured:5.8, noVehicle:3.8, medianAge:47.2,
    medicaidPct:16.8, acaPremium:519,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.9 },

  { name:'Lee',          fips:'19111', lat:40.633, lng:-91.484, pop:33657,
    diabetes:13.5, obesity:39.2, smoking:18.0, mentalHealth:15.9,
    poverty:14.2, uninsured:7.2, noVehicle:5.8, medianAge:43.2,
    medicaidPct:21.8, acaPremium:525,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:5.4 },

  { name:'Linn',         fips:'19113', lat:42.077, lng:-91.599, pop:226706,
    diabetes:10.2, obesity:32.8, smoking:13.5, mentalHealth:11.5,
    poverty:9.5,  uninsured:4.6, noVehicle:5.8, medianAge:38.2,
    medicaidPct:15.2, acaPremium:452,
    pcShortage:0, mhShortage:0, dentalShortage:0, providerDensity:12.0 },

  { name:'Louisa',       fips:'19115', lat:41.213, lng:-91.256, pop:11035,
    diabetes:12.7, obesity:37.6, smoking:16.4, mentalHealth:14.6,
    poverty:13.8, uninsured:7.5, noVehicle:4.4, medianAge:43.8,
    medicaidPct:20.8, acaPremium:525,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.4 },

  { name:'Lucas',        fips:'19117', lat:41.029, lng:-93.323, pop:8600,
    diabetes:13.8, obesity:40.0, smoking:18.5, mentalHealth:16.5,
    poverty:16.2, uninsured:9.1, noVehicle:5.1, medianAge:46.2,
    medicaidPct:23.8, acaPremium:568,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:1.8 },

  { name:'Lyon',         fips:'19119', lat:43.375, lng:-96.213, pop:11755,
    diabetes:11.3, obesity:35.0, smoking:14.4, mentalHealth:13.0,
    poverty:9.4,  uninsured:5.2, noVehicle:3.4, medianAge:40.8,
    medicaidPct:14.4, acaPremium:515,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.8 },

  { name:'Madison',      fips:'19121', lat:41.331, lng:-94.037, pop:16338,
    diabetes:10.8, obesity:33.9, smoking:13.8, mentalHealth:12.4,
    poverty:8.2,  uninsured:4.8, noVehicle:3.4, medianAge:43.8,
    medicaidPct:12.8, acaPremium:488,
    pcShortage:1, mhShortage:1, dentalShortage:1, providerDensity:4.5 },

  { name:'Mahaska',      fips:'19123', lat:41.335, lng:-92.638, pop:22095,
    diabetes:12.0, obesity:36.2, smoking:15.4, mentalHealth:13.7,
    poverty:12.4, uninsured:6.5, noVehicle:4.5, medianAge:44.2,
    medicaidPct:18.8, acaPremium:512,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.9 },

  { name:'Marion',       fips:'19125', lat:41.335, lng:-93.100, pop:33253,
    diabetes:11.3, obesity:34.9, smoking:14.6, mentalHealth:13.1,
    poverty:9.2,  uninsured:5.0, noVehicle:4.0, medianAge:42.2,
    medicaidPct:14.2, acaPremium:488,
    pcShortage:0, mhShortage:1, dentalShortage:0, providerDensity:6.2 },

  { name:'Marshall',     fips:'19127', lat:42.036, lng:-92.996, pop:38595,
    diabetes:12.1, obesity:36.4, smoking:15.6, mentalHealth:13.9,
    poverty:13.8, uninsured:7.2, noVehicle:5.2, medianAge:39.8,
    medicaidPct:20.4, acaPremium:505,
    pcShortage:1, mhShortage:1, dentalShortage:0, providerDensity:5.8 },

  { name:'Mills',        fips:'19129', lat:41.031, lng:-95.606, pop:15109,
    diabetes:12.0, obesity:36.1, smoking:15.3, mentalHealth:13.6,
    poverty:9.8,  uninsured:5.5, noVehicle:3.8, medianAge:43.2,
    medicaidPct:14.8, acaPremium:512,
    pcShortage:1, mhShortage:1, dentalShortage:1, providerDensity:3.8 },

  { name:'Mitchell',     fips:'19131', lat:43.353, lng:-92.789, pop:10586,
    diabetes:11.9, obesity:36.0, smoking:15.2, mentalHealth:13.5,
    poverty:10.4, uninsured:5.5, noVehicle:3.7, medianAge:45.8,
    medicaidPct:15.8, acaPremium:516,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.9 },

  { name:'Monona',       fips:'19133', lat:42.058, lng:-95.901, pop:8617,
    diabetes:13.0, obesity:38.1, smoking:17.1, mentalHealth:15.2,
    poverty:13.1, uninsured:7.0, noVehicle:4.0, medianAge:48.8,
    medicaidPct:19.8, acaPremium:542,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.2 },

  { name:'Monroe',       fips:'19135', lat:41.030, lng:-92.869, pop:7707,
    diabetes:13.7, obesity:39.8, smoking:18.3, mentalHealth:16.3,
    poverty:15.2, uninsured:8.4, noVehicle:4.8, medianAge:46.8,
    medicaidPct:22.8, acaPremium:562,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:1.9 },

  { name:'Montgomery',   fips:'19137', lat:41.031, lng:-95.151, pop:10101,
    diabetes:13.3, obesity:38.9, smoking:17.7, mentalHealth:15.7,
    poverty:14.1, uninsured:7.8, noVehicle:4.5, medianAge:46.8,
    medicaidPct:21.4, acaPremium:548,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:3.2 },

  { name:'Muscatine',    fips:'19139', lat:41.482, lng:-91.043, pop:42745,
    diabetes:12.3, obesity:36.7, smoking:15.8, mentalHealth:14.0,
    poverty:12.2, uninsured:6.4, noVehicle:5.2, medianAge:39.8,
    medicaidPct:18.8, acaPremium:498,
    pcShortage:1, mhShortage:1, dentalShortage:0, providerDensity:6.5 },

  { name:"O'Brien",      fips:'19141', lat:43.081, lng:-95.622, pop:13753,
    diabetes:11.7, obesity:35.5, smoking:14.9, mentalHealth:13.3,
    poverty:9.8,  uninsured:5.2, noVehicle:3.6, medianAge:44.2,
    medicaidPct:15.2, acaPremium:518,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.8 },

  { name:'Osceola',      fips:'19143', lat:43.375, lng:-95.621, pop:5958,
    diabetes:12.4, obesity:37.0, smoking:15.9, mentalHealth:14.2,
    poverty:10.4, uninsured:5.8, noVehicle:3.6, medianAge:45.8,
    medicaidPct:16.4, acaPremium:524,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.5 },

  { name:'Page',         fips:'19145', lat:40.748, lng:-95.151, pop:15107,
    diabetes:13.5, obesity:39.3, smoking:17.9, mentalHealth:16.0,
    poverty:14.8, uninsured:8.2, noVehicle:4.8, medianAge:47.2,
    medicaidPct:22.4, acaPremium:552,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:3.5 },

  { name:'Palo Alto',    fips:'19147', lat:43.081, lng:-94.678, pop:8886,
    diabetes:12.5, obesity:37.2, smoking:16.1, mentalHealth:14.3,
    poverty:11.8, uninsured:6.2, noVehicle:3.8, medianAge:47.8,
    medicaidPct:18.2, acaPremium:528,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.8 },

  { name:'Plymouth',     fips:'19149', lat:42.736, lng:-96.213, pop:25177,
    diabetes:11.0, obesity:34.4, smoking:14.2, mentalHealth:12.8,
    poverty:8.2,  uninsured:5.0, noVehicle:3.4, medianAge:40.8,
    medicaidPct:13.2, acaPremium:508,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:4.8 },

  { name:'Pocahontas',   fips:'19151', lat:42.736, lng:-94.678, pop:6619,
    diabetes:12.7, obesity:37.5, smoking:16.3, mentalHealth:14.5,
    poverty:11.2, uninsured:6.0, noVehicle:3.8, medianAge:48.2,
    medicaidPct:17.2, acaPremium:528,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.4 },

  { name:'Polk',         fips:'19153', lat:41.685, lng:-93.573, pop:492401,
    diabetes:9.5,  obesity:32.1, smoking:13.2, mentalHealth:11.2,
    poverty:11.2, uninsured:4.5, noVehicle:6.2, medianAge:35.8,
    medicaidPct:17.2, acaPremium:442,
    pcShortage:0, mhShortage:0, dentalShortage:0, providerDensity:18.5 },

  { name:'Pottawattamie',fips:'19155', lat:41.336, lng:-95.537, pop:93523,
    diabetes:12.8, obesity:37.8, smoking:16.6, mentalHealth:14.7,
    poverty:12.8, uninsured:6.5, noVehicle:5.4, medianAge:38.8,
    medicaidPct:19.8, acaPremium:488,
    pcShortage:0, mhShortage:1, dentalShortage:0, providerDensity:8.8 },

  { name:'Poweshiek',    fips:'19157', lat:41.685, lng:-92.525, pop:18504,
    diabetes:11.0, obesity:34.3, smoking:14.2, mentalHealth:12.8,
    poverty:10.8, uninsured:5.5, noVehicle:4.5, medianAge:40.2,
    medicaidPct:15.4, acaPremium:498,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:4.8 },

  { name:'Ringgold',     fips:'19159', lat:40.742, lng:-94.243, pop:4894,
    diabetes:14.3, obesity:40.9, smoking:19.2, mentalHealth:17.0,
    poverty:17.8, uninsured:9.8, noVehicle:4.8, medianAge:51.2,
    medicaidPct:26.4, acaPremium:578,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:1.0 },

  { name:'Sac',          fips:'19161', lat:42.386, lng:-95.104, pop:9721,
    diabetes:12.6, obesity:37.3, smoking:16.2, mentalHealth:14.4,
    poverty:11.4, uninsured:6.1, noVehicle:3.8, medianAge:47.8,
    medicaidPct:17.4, acaPremium:528,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:2.9 },

  { name:'Scott',        fips:'19163', lat:41.671, lng:-90.619, pop:172943,
    diabetes:11.0, obesity:34.0, smoking:14.3, mentalHealth:12.0,
    poverty:11.5, uninsured:5.2, noVehicle:5.8, medianAge:38.2,
    medicaidPct:17.2, acaPremium:452,
    pcShortage:0, mhShortage:0, dentalShortage:0, providerDensity:11.5 },

  { name:'Shelby',       fips:'19165', lat:41.679, lng:-95.375, pop:11454,
    diabetes:12.5, obesity:37.1, smoking:16.0, mentalHealth:14.2,
    poverty:9.8,  uninsured:5.4, noVehicle:3.7, medianAge:46.2,
    medicaidPct:15.4, acaPremium:528,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.2 },

  { name:'Sioux',        fips:'19167', lat:43.080, lng:-96.173, pop:34855,
    diabetes:10.3, obesity:33.0, smoking:13.2, mentalHealth:11.8,
    poverty:8.4,  uninsured:5.2, noVehicle:3.4, medianAge:36.8,
    medicaidPct:13.8, acaPremium:498,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:5.2 },

  { name:'Story',        fips:'19169', lat:42.036, lng:-93.462, pop:97117,
    diabetes:8.8,  obesity:28.9, smoking:12.1, mentalHealth:10.5,
    poverty:18.5, uninsured:4.4, noVehicle:5.8, medianAge:25.8,
    medicaidPct:13.8, acaPremium:448,
    pcShortage:0, mhShortage:0, dentalShortage:0, providerDensity:15.0 },

  { name:'Tama',         fips:'19171', lat:42.079, lng:-92.525, pop:16854,
    diabetes:11.8, obesity:35.7, smoking:15.1, mentalHealth:13.4,
    poverty:11.8, uninsured:6.2, noVehicle:4.0, medianAge:43.8,
    medicaidPct:17.8, acaPremium:512,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.5 },

  { name:'Taylor',       fips:'19173', lat:40.742, lng:-94.700, pop:6121,
    diabetes:13.9, obesity:40.2, smoking:18.7, mentalHealth:16.7,
    poverty:14.8, uninsured:8.5, noVehicle:4.5, medianAge:50.2,
    medicaidPct:23.4, acaPremium:572,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:1.5 },

  { name:'Union',        fips:'19175', lat:41.029, lng:-94.243, pop:12241,
    diabetes:13.4, obesity:39.1, smoking:17.8, mentalHealth:15.8,
    poverty:14.2, uninsured:7.8, noVehicle:5.0, medianAge:46.2,
    medicaidPct:21.8, acaPremium:552,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:3.8 },

  { name:'Van Buren',    fips:'19177', lat:40.750, lng:-91.953, pop:6953,
    diabetes:13.6, obesity:39.7, smoking:18.2, mentalHealth:16.2,
    poverty:14.1, uninsured:7.9, noVehicle:4.5, medianAge:47.8,
    medicaidPct:22.1, acaPremium:558,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:1.8 },

  { name:'Wapello',      fips:'19179', lat:41.028, lng:-92.411, pop:34969,
    diabetes:13.2, obesity:38.7, smoking:17.4, mentalHealth:15.4,
    poverty:15.2, uninsured:7.8, noVehicle:6.1, medianAge:43.2,
    medicaidPct:23.4, acaPremium:528,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:5.8 },

  { name:'Warren',       fips:'19181', lat:41.335, lng:-93.562, pop:51466,
    diabetes:10.4, obesity:33.5, smoking:13.6, mentalHealth:12.2,
    poverty:7.2,  uninsured:4.5, noVehicle:3.5, medianAge:40.8,
    medicaidPct:12.2, acaPremium:472,
    pcShortage:0, mhShortage:1, dentalShortage:0, providerDensity:7.5 },

  { name:'Washington',   fips:'19183', lat:41.336, lng:-91.718, pop:21969,
    diabetes:11.1, obesity:34.6, smoking:14.4, mentalHealth:13.0,
    poverty:9.8,  uninsured:5.4, noVehicle:3.8, medianAge:42.8,
    medicaidPct:15.2, acaPremium:500,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:4.2 },

  { name:'Wayne',        fips:'19185', lat:40.742, lng:-93.324, pop:6440,
    diabetes:14.1, obesity:40.7, smoking:19.0, mentalHealth:16.9,
    poverty:14.8, uninsured:8.8, noVehicle:4.8, medianAge:50.8,
    medicaidPct:23.8, acaPremium:568,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:1.4 },

  { name:'Webster',      fips:'19187', lat:42.386, lng:-94.182, pop:35904,
    diabetes:12.5, obesity:37.0, smoking:16.1, mentalHealth:14.3,
    poverty:14.2, uninsured:7.0, noVehicle:5.8, medianAge:40.8,
    medicaidPct:21.8, acaPremium:515,
    pcShortage:1, mhShortage:1, dentalShortage:0, providerDensity:7.2 },

  { name:'Winnebago',    fips:'19189', lat:43.379, lng:-93.731, pop:10367,
    diabetes:11.6, obesity:35.4, smoking:14.8, mentalHealth:13.2,
    poverty:10.2, uninsured:5.4, noVehicle:3.7, medianAge:45.8,
    medicaidPct:15.8, acaPremium:518,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:3.4 },

  { name:'Winneshiek',   fips:'19191', lat:43.284, lng:-91.847, pop:19991,
    diabetes:10.7, obesity:33.5, smoking:13.6, mentalHealth:12.3,
    poverty:11.8, uninsured:5.6, noVehicle:3.8, medianAge:42.2,
    medicaidPct:16.4, acaPremium:498,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:4.8 },

  { name:'Woodbury',     fips:'19193', lat:42.388, lng:-96.049, pop:103877,
    diabetes:12.0, obesity:36.3, smoking:15.5, mentalHealth:13.9,
    poverty:16.2, uninsured:7.5, noVehicle:6.8, medianAge:34.8,
    medicaidPct:24.2, acaPremium:462,
    pcShortage:0, mhShortage:1, dentalShortage:0, providerDensity:9.2 },

  { name:'Worth',        fips:'19195', lat:43.379, lng:-93.259, pop:7381,
    diabetes:11.8, obesity:35.8, smoking:15.0, mentalHealth:13.4,
    poverty:10.4, uninsured:5.5, noVehicle:3.7, medianAge:46.8,
    medicaidPct:15.8, acaPremium:518,
    pcShortage:2, mhShortage:2, dentalShortage:2, providerDensity:3.1 },

  { name:'Wright',       fips:'19197', lat:42.731, lng:-93.731, pop:12562,
    diabetes:12.2, obesity:36.6, smoking:15.6, mentalHealth:13.9,
    poverty:11.2, uninsured:5.8, noVehicle:3.9, medianAge:45.2,
    medicaidPct:17.4, acaPremium:518,
    pcShortage:1, mhShortage:2, dentalShortage:1, providerDensity:4.1 },
]

export function getCountyByName(name) {
  return iowaCounties.find(c => c.name.toLowerCase() === name.toLowerCase())
}

// Rule-based Need vs Access score (used in county detail view)
export function computeNeedScore(county, providerCount) {
  const avg = IOWA_AVERAGES
  const diabetesZ    = (county.diabetes     - avg.diabetes)     / avg.diabetes
  const obesityZ     = (county.obesity      - avg.obesity)      / avg.obesity
  const smokingZ     = (county.smoking      - avg.smoking)      / avg.smoking
  const mentalZ      = (county.mentalHealth - avg.mentalHealth) / avg.mentalHealth
  const burden = (diabetesZ + obesityZ + smokingZ + mentalZ) / 4
  const accessScore  = providerCount >= 20 ? 1 : providerCount / 20

  if (burden > 0.1 && accessScore < 0.4)  return { level:'high',     label:'High Need',     color:'red',    desc:'Above-average disease burden with limited provider access.' }
  if (burden > 0.05 || accessScore < 0.5) return { level:'moderate', label:'Moderate Need', color:'yellow', desc:'Some gaps in care access relative to health burden.' }
  return                                          { level:'low',      label:'Well Served',   color:'green',  desc:'Relatively good provider access for the health burden.' }
}

// Composite scores used in the County Rankings dashboard (0–100)
export function computeRankingScores(county) {
  const ia = IOWA_AVERAGES

  // Need: weighted disease + SDOH burden relative to Iowa avg
  const diseaseZ = [
    (county.diabetes     / ia.diabetes     - 1) * 20,
    (county.obesity      / ia.obesity      - 1) * 15,
    (county.smoking      / ia.smoking      - 1) * 15,
    (county.mentalHealth / ia.mentalHealth - 1) * 15,
    (county.poverty      / ia.poverty      - 1) * 20,
    (county.uninsured    / ia.uninsured    - 1) * 15,
  ].reduce((a, b) => a + b, 0)
  const needScore = Math.max(0, Math.min(100, 50 + diseaseZ))

  // Access: provider density + shortage penalty
  const densityPts    = Math.min((county.providerDensity / 15) * 60, 60)
  const shortagePts   = (county.pcShortage + county.mhShortage + county.dentalShortage) * 6
  const accessScore   = Math.max(0, Math.min(100, densityPts - shortagePts + 30))

  // Opportunity: multiplicative — high need × low access = critical investment priority
  const opportunityScore = Math.round(needScore * (1 - accessScore / 100))

  return {
    need:        Math.round(needScore),
    access:      Math.round(accessScore),
    opportunity: Math.round(opportunityScore),
  }
}

export function needLabel(score) {
  if (score >= 70) return { text: 'Critical',  cls: 'bg-red-100 text-red-800' }
  if (score >= 55) return { text: 'High',      cls: 'bg-orange-100 text-orange-800' }
  if (score >= 40) return { text: 'Moderate',  cls: 'bg-yellow-100 text-yellow-800' }
  return                   { text: 'Low',       cls: 'bg-green-100 text-green-800' }
}
export function accessLabel(score) {
  if (score >= 65) return { text: 'Strong',    cls: 'bg-green-100 text-green-800' }
  if (score >= 45) return { text: 'Adequate',  cls: 'bg-blue-100 text-blue-800' }
  if (score >= 28) return { text: 'Limited',   cls: 'bg-yellow-100 text-yellow-800' }
  return                   { text: 'Poor',      cls: 'bg-red-100 text-red-800' }
}
export function opportunityLabel(score) {
  if (score >= 65) return { text: 'Top Priority',  cls: 'bg-red-100 text-red-800' }
  if (score >= 50) return { text: 'High Priority', cls: 'bg-orange-100 text-orange-800' }
  if (score >= 35) return { text: 'Moderate',      cls: 'bg-yellow-100 text-yellow-800' }
  return                   { text: 'Low Priority',  cls: 'bg-green-100 text-green-800' }
}
