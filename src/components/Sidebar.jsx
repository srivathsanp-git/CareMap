import { Activity, Search, BarChart2, Building2, Trophy, Map, TrendingUp, User, Briefcase, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const NAV_GROUPS = [
  {
    label: 'Care',
    items: [
      { id: 'find',      label: 'Find Care',        icon: Search      },
      { id: 'county',    label: 'County Health',    icon: BarChart2   },
      { id: 'hospitals', label: 'Hospitals',         icon: Building2   },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { id: 'rankings',  label: 'County Rankings',  icon: Trophy      },
      { id: 'map',       label: 'Map View',          icon: Map         },
      { id: 'forecast',  label: 'Forecast & Alerts', icon: TrendingUp  },
    ],
  },
  {
    label: 'Personal',
    items: [
      { id: 'risk',     label: 'My Risk Profile',   icon: User        },
      { id: 'employer', label: 'Employer Dashboard', icon: Briefcase   },
    ],
  },
]

export default function Sidebar({ activeTab, onTabChange, open, onClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-56 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-200 lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 px-4 border-b border-sidebar-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Activity className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-bold text-white">CareMap</span>
            <span className="text-sm font-bold text-primary"> Iowa</span>
          </div>
          {/* Mobile close */}
          <button onClick={onClose} className="ml-auto text-sidebar-foreground hover:text-white lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/15 text-white'
                          : 'text-sidebar-foreground hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : '')} />
                      {item.label}
                      {isActive && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
              {gi < NAV_GROUPS.length - 1 && (
                <Separator className="mt-4 bg-sidebar-border" />
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2 text-[11px] text-sidebar-foreground/60">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Live NPI Data
            <span className="ml-auto text-sidebar-foreground/40">CDC · ACS · HRSA</span>
          </div>
        </div>
      </aside>
    </>
  )
}
