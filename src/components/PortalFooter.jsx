// Portal footer (UI spec §2): 4-column (Product / Data / Org + brand blurb)
// with a "last data refresh" line. Link items carry a `route` (internal portal
// navigation) or `href` (external); plain strings render as inert labels.
const REPO_URL = 'https://github.com/srivathsanp-git/CareMap'

const COLS = [
  { head: 'Product', links: [
    { label: 'Find Care',        route: 'find' },
    { label: 'Local Risk',       route: 'local' },
    { label: 'Compare hospitals', route: 'resources' },
    { label: 'County rankings',  route: 'resources' },
  ] },
  { head: 'Data', links: [
    { label: 'Sources',       route: 'about' },
    { label: 'Methodology',   route: 'about' },
    { label: 'CSV downloads', route: 'resources' },
    { label: 'Source code',   href: REPO_URL },
  ] },
  { head: 'Org', links: ['About', 'Press', 'Contact', 'Open source'] },
]

const LAST_REFRESH = 'Apr 28, 2026'

export default function PortalFooter({ onNavigate }) {
  return (
    <footer className="border-t border-ink/15 bg-paper2">
      <div className="mx-auto max-w-[1280px] px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand blurb */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-2xl font-semibold text-ink">
              CareMap<span className="text-risk">.</span>ai
            </div>
            <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-ink2">
              Public health data, made useful · made in Iowa. Free, public sources only.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.head}>
              <div className="font-mono text-[11px] uppercase tracking-wider text-ink">{col.head}</div>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => {
                  const item = typeof l === 'string' ? { label: l } : l
                  const cls = 'text-sm text-ink2 hover:text-ink'
                  return (
                    <li key={item.label}>
                      {item.route ? (
                        <button onClick={() => onNavigate?.(item.route)} className={cls}>{item.label}</button>
                      ) : item.href ? (
                        <a href={item.href} target="_blank" rel="noreferrer" className={cls}>{item.label}</a>
                      ) : (
                        <span className={`cursor-default ${cls}`}>{item.label}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-ink/10 pt-5 font-mono text-[11px] text-sand sm:flex-row sm:items-center">
          <span>© 2026 CareMap.ai · Built on public U.S. government data (CDC · Census · CMS · HRSA)</span>
          <span>last data refresh: {LAST_REFRESH}</span>
        </div>
      </div>
    </footer>
  )
}
