import { useState } from 'react'
import Header from './components/Header'
import FindCare from './components/FindCare'
import CountyHealth from './components/CountyHealth'
import HospitalQuality from './components/HospitalQuality'
import CountyRanking from './components/CountyRanking'
import AdvancedMap from './components/AdvancedMap'
import ForecastEngine from './components/ForecastEngine'
import PersonalRisk from './components/PersonalRisk'
import EmployerDashboard from './components/EmployerDashboard'
import Footer from './components/Footer'

const NO_FOOTER = new Set(['map'])

export default function App() {
  const [activeTab, setActiveTab] = useState('find')

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1">
        {activeTab === 'find'      && <FindCare />}
        {activeTab === 'county'    && <CountyHealth />}
        {activeTab === 'hospitals' && <HospitalQuality />}
        {activeTab === 'rankings'  && <CountyRanking />}
        {activeTab === 'map'       && <AdvancedMap />}
        {activeTab === 'forecast'  && <ForecastEngine />}
        {activeTab === 'risk'      && <PersonalRisk />}
        {activeTab === 'employer'  && <EmployerDashboard />}
      </main>
      {!NO_FOOTER.has(activeTab) && <Footer />}
    </div>
  )
}
