import { cn } from '@/lib/utils'

// Portal top nav (UI spec §2): logo left · primary links center · account
// actions right. Sticky on scroll. `onNavigate(routeId)` switches the app
// route; items without a built page yet are marked inert.
const LINKS = [
  { id: 'home',  label: 'Home',       live: true },
  { id: 'find',  label: 'Find Care',  live: true },
  { id: 'local', label: 'Local Risk', live: true },
  { id: 'resources', label: 'Resources', live: true },
  { id: 'about', label: 'About',      live: true },
]

export default function TopNav({ active = 'home', onNavigate }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-8">
        {/* Logo */}
        <button
          onClick={() => onNavigate?.('home')}
          className="font-display text-2xl font-semibold tracking-tight text-ink"
        >
          CareMap<span className="text-risk">.</span>ai
        </button>

        {/* Center links */}
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => l.live && onNavigate?.(l.id)}
              disabled={!l.live}
              className={cn(
                'relative py-1 text-[15px] transition-colors',
                l.id === active
                  ? 'font-semibold text-ink'
                  : l.live
                    ? 'text-ink2 hover:text-ink'
                    : 'cursor-default text-sand',
              )}
            >
              {l.label}
              {l.id === active && (
                <span className="absolute -bottom-[5px] left-0 right-0 h-0.5 rounded-full bg-ink" />
              )}
            </button>
          ))}
        </nav>

        {/* Account actions */}
        <div className="flex items-center gap-2">
          <button className="hidden rounded-full px-3 py-1.5 text-sm text-ink2 hover:text-ink sm:block">
            Sign in
          </button>
          <button className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper hover:bg-ink/90">
            Save my care plan
          </button>
        </div>
      </div>
    </header>
  )
}
