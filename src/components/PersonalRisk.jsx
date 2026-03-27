import { useState } from 'react'
import { User, MapPin, ChevronRight, Loader2 } from 'lucide-react'
import { iowaCounties, IOWA_AVERAGES } from '../data/iowaCounties'
import { AGE_MULTIPLIERS, SEX_MULTIPLIERS, personalRisk } from '../utils/forecast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

const AGE_GROUPS  = ['18-34', '35-49', '50-64', '65+']
const SEX_OPTIONS = ['Male', 'Female', 'Prefer not to say']

const METRICS = [
  { key: 'diabetes',    label: 'Diabetes Risk',       icon: '🩸', color: '#ef4444', indicatorCls: 'bg-red-500'    },
  { key: 'obesity',     label: 'Obesity / Metabolic', icon: '⚖️', color: '#f97316', indicatorCls: 'bg-orange-500' },
  { key: 'smoking',     label: 'Tobacco Use',         icon: '🚬', color: '#64748b', indicatorCls: 'bg-slate-500'  },
  { key: 'mentalHealth',label: 'Poor Mental Health',  icon: '🧠', color: '#8b5cf6', indicatorCls: 'bg-violet-500' },
]

async function lookupCountyFromZip(zip) {
  const url  = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&countrycodes=us&format=json&addressdetails=1&limit=3`
  const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) return null
  const data = await res.json()
  const iowa = data.find(r => r.address?.state === 'Iowa' || r.address?.['ISO3166-2-lvl4'] === 'US-IA')
  if (!iowa) return null
  const name = (iowa.address?.county ?? '').replace(/\s*County\s*$/i, '').trim()
  return iowaCounties.find(c => c.name.toLowerCase() === name.toLowerCase()) ?? null
}

function riskLevel(personal, avg) {
  const r = personal / avg
  if (r >= 1.4)  return { label: 'High Risk',     variant: 'danger',   emoji: '🔴' }
  if (r >= 1.15) return { label: 'Above Average', variant: 'orange',   emoji: '🟠' }
  if (r >= 0.85) return { label: 'Average',       variant: 'warning',  emoji: '🟡' }
  return               { label: 'Below Average', variant: 'success',  emoji: '🟢' }
}

export default function PersonalRisk() {
  const [step,     setStep]     = useState(1)
  const [ageGroup, setAgeGroup] = useState('')
  const [sex,      setSex]      = useState('')
  const [zip,      setZip]      = useState('')
  const [loading,  setLoading]  = useState(false)
  const [county,   setCounty]   = useState(null)
  const [error,    setError]    = useState('')
  const [risks,    setRisks]    = useState(null)

  const canSubmit = ageGroup && sex && zip.length === 5

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const found = await lookupCountyFromZip(zip)
      if (!found) { setError('ZIP not found in Iowa. Please enter an Iowa ZIP code.'); setLoading(false); return }
      setCounty(found)
      setRisks(personalRisk(found, ageGroup, sex))
      setStep(2)
    } catch { setError('Could not look up ZIP. Please try again.') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Personal Health Risk Profile</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Compare your estimated health risks to your local county and Iowa averages using age- and sex-adjusted epidemiological multipliers.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Enter your information</CardTitle>
              <CardDescription>No data is stored. All calculations happen in your browser.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Age group */}
                <div>
                  <p className="text-sm font-semibold mb-2">Age Group</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AGE_GROUPS.map(g => (
                      <button key={g} type="button" onClick={() => setAgeGroup(g)}
                        className={['rounded-xl border-2 py-2.5 text-sm font-semibold transition-colors', ageGroup === g ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-border/80'].join(' ')}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sex */}
                <div>
                  <p className="text-sm font-semibold mb-2">Sex</p>
                  <div className="grid grid-cols-3 gap-2">
                    {SEX_OPTIONS.map(s => (
                      <button key={s} type="button" onClick={() => setSex(s)}
                        className={['rounded-xl border-2 py-2.5 text-sm font-semibold transition-colors', sex === s ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-border/80'].join(' ')}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ZIP */}
                <div>
                  <p className="text-sm font-semibold mb-2">Iowa ZIP Code</p>
                  <div className="relative w-full sm:w-48">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="text" inputMode="numeric" maxLength={5} value={zip}
                      onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="e.g. 50266" className={['pl-9', error ? 'border-destructive' : ''].join(' ')} />
                  </div>
                  {error && <Alert variant="destructive" className="mt-2"><AlertDescription>{error}</AlertDescription></Alert>}
                </div>

                <Button type="submit" disabled={!canSubmit || loading} size="lg" className="w-full sm:w-auto">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Looking up county…</> : <>Calculate My Risk <ChevronRight className="h-4 w-4" /></>}
                </Button>
              </form>

              <Separator className="my-6" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Disclaimer:</strong> Uses age- and sex-adjusted population-level multipliers (CDC NHANES, BRFSS).
                Results are statistical estimates for educational purposes only — not medical advice.
              </p>
            </CardContent>
          </Card>
        )}

        {step === 2 && county && risks && (
          <div className="space-y-5">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold">Your Risk Profile</h3>
                    <p className="text-sm text-muted-foreground mt-1">{ageGroup} · {sex} · {county.name} County (ZIP {zip})</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setStep(1); setCounty(null); setRisks(null); setError('') }}>
                    ← Start over
                  </Button>
                </div>
                <Separator className="my-3" />
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">📍 {county.name} County · {county.pop.toLocaleString()}</Badge>
                  <Badge variant="secondary">🏥 {county.providerDensity.toFixed(1)} providers/1k</Badge>
                  <Badge variant="secondary">💰 ${county.acaPremium}/mo ACA premium</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {METRICS.map(m => {
                const personal = risks[m.key], countyVal = county[m.key], iowaVal = IOWA_AVERAGES[m.key]
                const lvl = riskLevel(personal, iowaVal)
                const maxVal = Math.max(personal, countyVal, iowaVal, 5) * 1.3
                return (
                  <Card key={m.key}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span>{m.icon}</span> {m.label}
                        </CardTitle>
                        <Badge variant={lvl.variant}>{lvl.emoji} {lvl.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-extrabold mb-4" style={{ color: m.color }}>
                        {personal.toFixed(1)}<span className="text-base font-normal text-muted-foreground ml-1">%</span>
                      </p>
                      <div className="space-y-2">
                        {[
                          { label: 'Your est. risk', value: personal, bold: true },
                          { label: 'County avg',     value: countyVal },
                          { label: 'Iowa avg',       value: iowaVal,  muted: true },
                        ].map(row => (
                          <div key={row.label} className="flex items-center gap-2">
                            <span className={['text-[10px] w-20 text-right shrink-0', row.muted ? 'text-muted-foreground' : row.bold ? 'font-semibold text-foreground' : 'text-muted-foreground'].join(' ')}>
                              {row.label}
                            </span>
                            <Progress value={(row.value / maxVal) * 100} className="flex-1 h-2"
                              indicatorClassName={row.bold ? m.indicatorCls : row.muted ? 'bg-slate-300' : `${m.indicatorCls} opacity-50`} />
                            <span className={['text-xs font-bold w-10 text-right', row.bold ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>
                              {row.value.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">What this means for you</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {METRICS.map(m => {
                  const lvl = riskLevel(risks[m.key], IOWA_AVERAGES[m.key])
                  if (lvl.label === 'Below Average') return null
                  return (
                    <div key={m.key} className="flex items-start gap-3 text-sm">
                      <span className="text-lg shrink-0">{m.icon}</span>
                      <div>
                        <span className="font-semibold">{m.label}: </span>
                        <span className="text-muted-foreground">
                          {lvl.label === 'High Risk' ? 'Significantly elevated — proactive screening recommended.' :
                           lvl.label === 'Above Average' ? 'Moderately elevated — discuss with your provider.' :
                           'Near average — maintain current health habits.'}
                        </span>
                      </div>
                    </div>
                  )
                }).filter(Boolean)}
                {METRICS.every(m => riskLevel(risks[m.key], IOWA_AVERAGES[m.key]).label === 'Below Average') && (
                  <p className="text-green-700 font-medium text-sm">✅ Your risk profile is below Iowa average across all measured indicators.</p>
                )}
                <Separator />
                <p className="text-xs text-muted-foreground">Estimates use age/sex multipliers from CDC NHANES and BRFSS. Not medical advice.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
