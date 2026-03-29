import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Activity } from 'lucide-react'
import { StateProvider, useAppState } from '@/context/StateContext'
import Sidebar from '@/components/Sidebar'
import FindCare from '@/components/FindCare'
import CountyHealth from '@/components/CountyHealth'
import HospitalQuality from '@/components/HospitalQuality'
import CountyRanking from '@/components/CountyRanking'
import AdvancedMap from '@/components/AdvancedMap'
import ForecastEngine from '@/components/ForecastEngine'
import PersonalRisk from '@/components/PersonalRisk'
import EmployerDashboard from '@/components/EmployerDashboard'
import CompareStates from '@/components/CompareStates'
import Footer from '@/components/Footer'

const NO_FOOTER = new Set(['map', 'compare'])

const PAGE_TITLES = {
  find:      'Find Care',
  county:    'County Health',
  hospitals: 'Hospitals',
  rankings:  'County Rankings',
  map:       'Map View',
  forecast:  'Forecast & Alerts',
  risk:      'My Risk Profile',
  employer:  'Employer Dashboard',
  compare:   'Compare States',
}

function AppInner() {
  const [activeTab,    setActiveTab]    = useState('find')
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const { selectedState } = useAppState()

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Activity className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm text-foreground">
              CareMap <span className="text-primary">{selectedState.abbr === 'IA' ? 'Iowa' : selectedState.abbr}</span>
            </span>
          </div>
          <span className="ml-auto text-xs font-medium text-muted-foreground">
            {PAGE_TITLES[activeTab]}
          </span>
        </header>

        {/* Page content — footer lives inside scroll so it's only visible at the bottom */}
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col min-h-full">
            <div className="flex-1">
              {activeTab === 'find'      && <FindCare />}
              {activeTab === 'county'    && <CountyHealth />}
              {activeTab === 'hospitals' && <HospitalQuality />}
              {activeTab === 'rankings'  && <CountyRanking />}
              {activeTab === 'map'       && <AdvancedMap />}
              {activeTab === 'forecast'  && <ForecastEngine />}
              {activeTab === 'risk'      && <PersonalRisk />}
              {activeTab === 'employer'  && <EmployerDashboard />}
              {activeTab === 'compare'   && <CompareStates />}
            </div>
            {!NO_FOOTER.has(activeTab) && <Footer />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StateProvider>
      <AppInner />
    </StateProvider>
  )
}
