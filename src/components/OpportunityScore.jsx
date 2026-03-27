import { computeOpportunity, opportunityTier } from '../utils/healthDerived'
import { computeRankingScores } from '../data/iowaCounties'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function OpportunityScore({ county }) {
  const { need, access } = computeRankingScores(county)
  const score = computeOpportunity(need, access)
  const tier  = opportunityTier(score)

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  const trackColor =
    tier.color === 'red'    ? '#ef4444' :
    tier.color === 'orange' ? '#f97316' :
    tier.color === 'yellow' ? '#eab308' :
    '#22c55e'

  const badgeVariant =
    tier.color === 'red'    ? 'danger'   :
    tier.color === 'orange' ? 'orange'   :
    tier.color === 'yellow' ? 'warning'  :
    'success'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>🎯</span> Opportunity Score
          </CardTitle>
          <span className="text-xs text-muted-foreground font-mono bg-muted border border-border px-2 py-0.5 rounded-full">
            Need × (1 – Access/100)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Gauge */}
          <div className="relative shrink-0">
            <svg width="128" height="128" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
              <circle cx="64" cy="64" r="54" fill="none" stroke={trackColor} strokeWidth="12"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                transform="rotate(-90 64 64)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-foreground">{score}</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">/ 100</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <Badge variant={badgeVariant} className="text-sm px-3 py-1">
                {tier.emoji} {tier.label}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">{tier.desc}</p>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Need',        value: need,   cls: 'bg-red-400'   },
                { label: 'Access',      value: access, cls: 'bg-green-400' },
                { label: 'Opportunity', value: score,  cls: undefined      },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground w-20">{row.label}</span>
                  <Progress value={row.value} className="flex-1 h-2"
                    indicatorClassName={row.cls ?? ''} style={!row.cls ? { backgroundColor: trackColor } : {}} />
                  <span className="text-xs font-bold text-foreground w-6 text-right">{row.value}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground">
              Formula: {need} × (1 – {access}/100) = <strong className="text-foreground">{score}</strong>
              &ensp;·&ensp; Higher = more critical investment need
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
