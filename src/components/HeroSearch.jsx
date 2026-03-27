import { useState } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const SPECIALTIES = [
  { id: 'Primary Care',  icon: '🩺', desc: 'Family medicine & general practice' },
  { id: 'Pediatrics',    icon: '👶', desc: 'Child & adolescent care' },
  { id: 'Mental Health', icon: '🧠', desc: 'Psychiatry, psychology, counseling' },
  { id: 'OB/GYN',        icon: '🤱', desc: 'Obstetrics & gynecology' },
]

const EXAMPLE_ZIPS = ['50010', '50266', '52401', '52803', '51101', '52001']

export default function HeroSearch({ onSearch, loading }) {
  const [zip,       setZip]       = useState('')
  const [specialty, setSpecialty] = useState('Primary Care')
  const [zipError,  setZipError]  = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const clean = zip.trim().replace(/\D/g, '')
    if (clean.length !== 5) { setZipError('Enter a valid 5-digit ZIP code'); return }
    setZipError('')
    onSearch(clean, specialty)
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 py-14">
      <div className="max-w-2xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-5">
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white/80 backdrop-blur gap-1.5 px-3 py-1">
            <MapPin className="h-3 w-3" />
            Iowa Healthcare Data Explorer
          </Badge>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight tracking-tight">
            Find Care.<br className="sm:hidden" />
            <span className="text-blue-400"> Understand Risk.</span>
          </h1>
          <p className="text-slate-300 text-base max-w-lg mx-auto">
            Search real providers near any Iowa ZIP code using live CMS data.
            Explore county health trends and care access gaps.
          </p>
        </div>

        {/* Search card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-6 space-y-5">
          {/* Specialty picker */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Care Type
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SPECIALTIES.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSpecialty(s.id)}
                  className={[
                    'flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition-all',
                    specialty === s.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-xs font-semibold">{s.id}</span>
                  <span className="text-[10px] leading-tight text-muted-foreground hidden sm:block">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ZIP + button */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              ZIP Code
            </p>
            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  inputMode="numeric"
                  value={zip}
                  onChange={e => { setZip(e.target.value.replace(/\D/g, '').slice(0, 5)); setZipError('') }}
                  placeholder="e.g. 50266"
                  className={['pl-9 h-10 text-base', zipError ? 'border-destructive' : ''].join(' ')}
                />
              </div>
              <Button type="submit" disabled={loading} size="lg" className="px-6 shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
            {zipError && <p className="text-xs text-destructive mt-1.5 font-medium">{zipError}</p>}
          </div>

          {/* Quick ZIPs */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-muted-foreground">Try:</span>
            {EXAMPLE_ZIPS.map(z => (
              <button
                key={z}
                type="button"
                onClick={() => { setZip(z); setZipError('') }}
                className="rounded-md bg-secondary px-2.5 py-1 text-xs font-mono font-medium text-secondary-foreground hover:bg-secondary/70 transition-colors"
              >
                {z}
              </button>
            ))}
          </div>
        </form>

        <p className="text-center text-slate-500 text-xs mt-4">
          Provider data: CMS NPI Registry · Health data: CDC PLACES 2023 · Iowa HHS
        </p>
      </div>
    </div>
  )
}
