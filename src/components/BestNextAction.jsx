import { getBestNextActions } from '../utils/healthDerived'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const PRIORITY_CONFIG = {
  0: { label: 'Urgent',   variant: 'danger',   dot: 'bg-red-500',    cardCls: 'border-red-200 bg-red-50'      },
  1: { label: 'High',     variant: 'orange',   dot: 'bg-orange-400', cardCls: 'border-orange-200 bg-orange-50'},
  2: { label: 'Moderate', variant: 'warning',  dot: 'bg-yellow-400', cardCls: 'border-yellow-200 bg-yellow-50'},
}

const CATEGORY_VARIANT = {
  'Access':              'info',
  'Mental Health':       'purple',
  'Chronic Disease':     'danger',
  'Prevention':          'success',
  'Coverage':            'info',
  'Social Determinants': 'orange',
  'Dental':              'secondary',
  'Affordability':       'warning',
}

export default function BestNextAction({ county }) {
  const actions = getBestNextActions(county)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>🧭</span> Best Next Actions
          </CardTitle>
          {actions.length > 0 && (
            <span className="text-xs text-muted-foreground">Top {actions.length} recommendations</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl">✅</span>
            <p className="font-medium mt-3">No critical gaps detected</p>
            <p className="text-sm text-muted-foreground mt-1">This county is performing near or above Iowa averages.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((a, i) => {
              const pCfg   = PRIORITY_CONFIG[a.priority] ?? PRIORITY_CONFIG[2]
              const catVar = CATEGORY_VARIANT[a.category] ?? 'secondary'
              return (
                <div key={i} className={`rounded-xl border p-4 ${pCfg.cardCls}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0 mt-0.5">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant={catVar}>{a.category}</Badge>
                        <Badge variant={pCfg.variant} className="gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />
                          {pCfg.label}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-foreground leading-snug">{a.action}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{a.rationale}</p>
                    </div>
                  </div>
                </div>
              )
            })}
            <p className="text-[11px] text-muted-foreground pt-1">
              Rule-based engine using HRSA shortage designations, CDC PLACES, ACS, and CMS data.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
