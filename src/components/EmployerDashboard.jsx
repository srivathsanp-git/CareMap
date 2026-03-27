import { useState, useMemo } from 'react'
import { Briefcase, ChevronDown } from 'lucide-react'
import { iowaCounties } from '../data/iowaCounties'
import { INDUSTRIES, COST_DRIVERS, employerHealthProfile } from '../utils/forecast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

const SORTED = [...iowaCounties].sort((a, b) => a.name.localeCompare(b.name))

const HEADCOUNT_OPTIONS = [
  { label: '< 50 employees',    value: 25   },
  { label: '50–250 employees',  value: 125  },
  { label: '251–1,000',         value: 500  },
  { label: '1,001–5,000',       value: 2500 },
  { label: '5,000+',            value: 7500 },
]

const INTERVENTIONS = {
  'Manufacturing':        [
    { name: 'Diabetes Prevention Program (DPP)',  roi: '3.1×', saving: '$900/employee/yr',  icon: '🩸' },
    { name: 'Smoking cessation + EAP bundle',     roi: '2.8×', saving: '$650/employee/yr',  icon: '🚬' },
    { name: 'On-site occupational health clinic', roi: '2.4×', saving: '$800/employee/yr',  icon: '🏥' },
  ],
  'Agriculture':          [
    { name: 'Mobile health unit + telehealth',    roi: '2.6×', saving: '$700/employee/yr',  icon: '🚐' },
    { name: 'Mental health navigator program',    roi: '2.9×', saving: '$750/employee/yr',  icon: '🧠' },
    { name: 'Diabetes + hypertension screening',  roi: '3.0×', saving: '$850/employee/yr',  icon: '🩸' },
  ],
  'Healthcare':           [
    { name: 'Burnout & resilience program',       roi: '3.5×', saving: '$1,100/employee/yr',icon: '🧠' },
    { name: 'Employee assistance program (EAP)',  roi: '3.2×', saving: '$900/employee/yr',  icon: '💼' },
    { name: 'Preventive care incentive program',  roi: '2.7×', saving: '$600/employee/yr',  icon: '🔬' },
  ],
  'Education':            [
    { name: 'Mental health first aid training',   roi: '2.8×', saving: '$650/employee/yr',  icon: '🧠' },
    { name: 'Wellness + chronic disease coaching',roi: '2.5×', saving: '$500/employee/yr',  icon: '💪' },
    { name: 'ACA navigator + Medicaid enrollment',roi: '4.0×', saving: '$1,200/employee/yr',icon: '📋' },
  ],
  'Retail / Hospitality': [
    { name: 'Obesity + metabolic health program', roi: '2.4×', saving: '$550/employee/yr',  icon: '⚖️' },
    { name: 'Smoking cessation support',          roi: '2.6×', saving: '$580/employee/yr',  icon: '🚬' },
    { name: 'Mental health telehealth access',    roi: '2.9×', saving: '$650/employee/yr',  icon: '🧠' },
  ],
  'Office / Tech':        [
    { name: 'Mental health & stress management',  roi: '3.1×', saving: '$780/employee/yr',  icon: '🧠' },
    { name: 'Sedentary risk + ergonomics',        roi: '2.2×', saving: '$400/employee/yr',  icon: '🏃' },
    { name: 'Preventive care + biometric screen', roi: '2.8×', saving: '$620/employee/yr',  icon: '🔬' },
  ],
}

function RiskGauge({ score }) {
  const c     = 2 * Math.PI * 40
  const offset = c - (score / 100) * c
  const color  = score >= 70 ? '#ef4444' : score >= 55 ? '#f97316' : score >= 40 ? '#eab308' : '#22c55e'
  const label  = score >= 70 ? 'High Risk' : score >= 55 ? 'Elevated' : score >= 40 ? 'Moderate' : 'Low Risk'
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x="50" y="45" textAnchor="middle" fontSize="20" fontWeight="800" fill="currentColor">{score}</text>
        <text x="50" y="59" textAnchor="middle" fontSize="8"  fontWeight="600" fill="hsl(var(--muted-foreground))">/100</text>
      </svg>
      <span className="text-xs font-bold mt-1" style={{ color }}>{label}</span>
    </div>
  )
}

export default function EmployerDashboard() {
  const [county,    setCounty]    = useState(null)
  const [industry,  setIndustry]  = useState('')
  const [headcount, setHeadcount] = useState(null)
  const [open,      setOpen]      = useState(false)
  const [query,     setQuery]     = useState('')

  const filtered = SORTED.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
  const canRun   = county && industry && headcount
  const profile  = useMemo(() => canRun ? employerHealthProfile(county, industry, headcount) : null, [county, industry, headcount])
  const recs     = INTERVENTIONS[industry] ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Employer / Payer Dashboard</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Workforce health risk, cost drivers, and intervention ROI. Based on CDC NIOSH, KFF, and SHRM benchmarks.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Config */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configure your workforce</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* County */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">County</p>
                <div className="relative">
                  <button onClick={() => setOpen(!open)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium hover:border-primary/50 transition-colors">
                    {county ? `${county.name} County` : 'Select county…'}
                    <ChevronDown className={['h-4 w-4 text-muted-foreground transition-transform', open ? 'rotate-180' : ''].join(' ')} />
                  </button>
                  {open && (
                    <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                      <div className="p-2 border-b border-border">
                        <Input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filtered.map(c => (
                          <button key={c.fips} onClick={() => { setCounty(c); setOpen(false); setQuery('') }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent text-foreground transition-colors">
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Industry */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Industry</p>
                <div className="space-y-1">
                  {INDUSTRIES.map(ind => (
                    <Button key={ind} variant={industry === ind ? 'default' : 'outline'} size="sm"
                      onClick={() => setIndustry(ind)} className="w-full justify-start">
                      {ind}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Headcount */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Workforce Size</p>
                <div className="space-y-1">
                  {HEADCOUNT_OPTIONS.map(opt => (
                    <Button key={opt.value} variant={headcount === opt.value ? 'default' : 'outline'} size="sm"
                      onClick={() => setHeadcount(opt.value)} className="w-full justify-start">
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!profile ? (
          <div className="text-center py-16 text-muted-foreground">
            <span className="text-5xl">🏢</span>
            <p className="mt-4 font-medium text-foreground">Select county, industry, and workforce size to generate your report</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="flex flex-col items-center justify-center py-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Workforce Health Risk</p>
                <RiskGauge score={profile.riskScore} />
                <p className="text-xs text-muted-foreground text-center mt-2">vs Iowa {industry} benchmark</p>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Estimated Annual Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold">${(profile.totalAnnualCost / 1000).toFixed(0)}k</p>
                  <p className="text-sm text-muted-foreground">Total healthcare spend</p>
                  <Separator className="my-3" />
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Per employee / yr</span><span className="font-bold">${profile.costPerEmployee.toLocaleString()}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Uninsured workers est.</span><span className="font-bold text-destructive">{profile.uninsuredWorkers}</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-700 uppercase tracking-wide">Savings Potential</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold text-green-700">${(profile.savingsPotential / 1000).toFixed(0)}k</p>
                  <p className="text-sm text-green-600">With evidence-based programs</p>
                  <p className="text-xs text-green-500 mt-2">~12% reduction via DPP, cessation, and MH programs (KFF 2023)</p>
                </CardContent>
              </Card>
            </div>

            {/* Top conditions */}
            <Card>
              <CardHeader><CardTitle className="text-base">Top Health Burden Conditions</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {profile.topConditions.map(cond => (
                    <div key={cond.label} className="text-center p-4 rounded-xl bg-muted/40 border border-border">
                      <span className="text-2xl">{cond.icon}</span>
                      <p className="text-xl font-extrabold mt-2">{cond.rate}%</p>
                      <p className="text-xs text-foreground font-medium mt-1">{cond.label}</p>
                      <p className="text-[10px] text-muted-foreground">est. workforce rate</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost drivers */}
            <Card>
              <CardHeader><CardTitle className="text-base">Cost Driver Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {COST_DRIVERS.map(d => (
                  <div key={d.key} className="flex items-center gap-3">
                    <span className="text-lg w-6 shrink-0">{d.icon}</span>
                    <span className="text-sm text-foreground w-40 shrink-0">{d.label}</span>
                    <Progress value={d.pct * 100} className="flex-1 h-2.5" />
                    <span className="text-xs font-bold text-foreground w-28 text-right shrink-0">
                      {Math.round(d.pct * 100)}% · ${Math.round(profile.costPerEmployee * d.pct).toLocaleString()}/yr
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Interventions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommended Interventions
                  <span className="ml-2 text-xs font-normal text-muted-foreground">for {industry}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recs.map((rec, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-muted/40 border border-border">
                    <span className="text-2xl shrink-0">{rec.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{rec.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Est. savings: <strong>{rec.saving}</strong></p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-green-700 font-extrabold text-lg">{rec.roi}</p>
                      <p className="text-[10px] text-muted-foreground">ROI</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-1">
                  ROI estimates based on KFF Employer Health Benefits Survey, CDC Workplace Health Model, and RAND Corporation research.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
