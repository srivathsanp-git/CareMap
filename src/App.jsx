import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { Activity } from 'lucide-react'
import { StateProvider } from '@/context/StateContext'
import { CountyDataProvider } from '@/context/CountyDataContext'
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
import Home from '@/components/Home'
import TopNav from '@/components/TopNav'
import PortalFooter from '@/components/PortalFooter'
import FindCarePortal from '@/components/FindCarePortal'
import ProviderDetail from '@/components/ProviderDetail'
import LocalRisk from '@/components/LocalRisk'
import AboutPortal from '@/components/AboutPortal'
import Resources from '@/components/Resources'

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

function AppInner({ initialTab = 'find', onGoHome }) {
  const [activeTab,    setActiveTab]    = useState(initialTab)
  const [sidebarOpen,  setSidebarOpen]  = useState(false)

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
        onGoHome={onGoHome}
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
          <button onClick={onGoHome} className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Activity className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm text-foreground">
              CareMap <span className="text-primary">Iowa</span>
            </span>
          </button>
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

// Which top-nav link is highlighted for a given route.
const NAV_FOR_ROUTE = {
  home: 'home', find: 'find', provider: 'find', local: 'local',
  resources: 'resources', about: 'about',
}

// Routes that render full-height (their own internal scroll) → no portal footer.
const FULL_HEIGHT = new Set(['find'])

// Portal shell (UI spec §2): sticky top nav + screen + portal footer.
function PortalShell({ route, onNavigate, children }) {
  const full = FULL_HEIGHT.has(route)
  return (
    <div className="portal flex h-screen flex-col overflow-y-auto">
      <TopNav active={NAV_FOR_ROUTE[route] || 'home'} onNavigate={onNavigate} />
      <main className="flex-1">{children}</main>
      {!full && <PortalFooter />}
    </div>
  )
}

// Portal-native screens (rebuilt against the wireframes).
const PORTAL_ROUTES = new Set(['home', 'find', 'provider', 'local', 'resources', 'about'])
// Legacy sidebar dashboard tabs, still reachable from portal CTAs.
const DASHBOARD_TABS = new Set([
  'county', 'hospitals', 'rankings', 'map', 'forecast', 'risk', 'employer', 'compare',
])

function Root() {
  const initial = typeof location !== 'undefined' ? location.hash.replace('#', '') : ''
  const [route, setRoute] = useState(
    PORTAL_ROUTES.has(initial) || DASHBOARD_TABS.has(initial) ? initial : 'home',
  )
  const [county, setCounty] = useState('Polk')      // selected Local Risk county
  const [provider, setProvider] = useState(null)    // selected provider for detail

  // Reflect route in the URL hash so screens are deep-linkable / shareable.
  useEffect(() => {
    if (typeof location !== 'undefined') location.hash = route === 'home' ? '' : route
  }, [route])

  const navigate = (id) => {
    if (PORTAL_ROUTES.has(id) || DASHBOARD_TABS.has(id)) setRoute(id)
    else setRoute('home')
  }
  const openCounty = (name) => { if (name) setCounty(name); setRoute('local') }
  const openProvider = (p) => { setProvider(p); setRoute('provider') }

  if (DASHBOARD_TABS.has(route)) {
    return <AppInner initialTab={route} onGoHome={() => setRoute('home')} />
  }

  return (
    <PortalShell route={route} onNavigate={navigate}>
      {route === 'home' && <Home onNavigate={navigate} onOpenCounty={openCounty} />}
      {route === 'find' && <FindCarePortal onOpenProvider={openProvider} />}
      {route === 'provider' && <ProviderDetail provider={provider} onBack={() => setRoute('find')} onOpenCounty={openCounty} />}
      {route === 'local' && <LocalRisk countyName={county} onNavigate={navigate} onCountyChange={setCounty} />}
      {route === 'resources' && <Resources onNavigate={navigate} onOpenCounty={openCounty} />}
      {route === 'about' && <AboutPortal onNavigate={navigate} />}
    </PortalShell>
  )
}

export default function App() {
  return (
    <StateProvider>
      <CountyDataProvider>
        <Root />
      </CountyDataProvider>
    </StateProvider>
  )
}
