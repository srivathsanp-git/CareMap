import { useState } from 'react'
import Header from './components/Header'
import FindCare from './components/FindCare'
import CountyHealth from './components/CountyHealth'
import HospitalQuality from './components/HospitalQuality'
import CountyRanking from './components/CountyRanking'
import AdvancedMap from './components/AdvancedMap'
import Footer from './components/Footer'

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
      </main>
      {activeTab !== 'map' && <Footer />}
    </div>
  )
}
