// Portal footer (UI spec §2): 4-column (Product / Data / Org + brand blurb)
// with a "last data refresh" line.
const COLS = [
  { head: 'Product', links: ['Find Care', 'Local Risk', 'Compare hospitals', 'County rankings'] },
  { head: 'Data',    links: ['Sources', 'Methodology', 'CSV downloads', 'API'] },
  { head: 'Org',     links: ['About', 'Press', 'Contact', 'Open source'] },
]

const LAST_REFRESH = 'Apr 28, 2026'

export default function PortalFooter() {
  return (
    <footer className="border-t border-ink/15 bg-paper2">
      <div className="mx-auto max-w-[1280px] px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand blurb */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-2xl font-semibold text-ink">
              CareMap<span className="text-risk">.</span>ia
            </div>
            <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-ink2">
              Public health data, made useful · made in Iowa. Free, public sources only.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.head}>
              <div className="font-mono text-[11px] uppercase tracking-wider text-ink">{col.head}</div>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <span className="cursor-default text-sm text-ink2 hover:text-ink">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-ink/10 pt-5 font-mono text-[11px] text-sand sm:flex-row sm:items-center">
          <span>© 2026 CareMap Iowa · Built on public U.S. government data (CDC · Census · CMS · HRSA)</span>
          <span>last data refresh: {LAST_REFRESH}</span>
        </div>
      </div>
    </footer>
  )
}
