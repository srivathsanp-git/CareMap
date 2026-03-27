import { useState } from 'react'
import { Search, MapPin, ChevronRight } from 'lucide-react'

const SPECIALTIES = [
  { id: 'Primary Care',  icon: '🩺', desc: 'Family medicine, general practice' },
  { id: 'Pediatrics',    icon: '👶', desc: 'Child & adolescent care' },
  { id: 'Mental Health', icon: '🧠', desc: 'Psychiatry, psychology, counseling' },
  { id: 'OB/GYN',        icon: '🤱', desc: 'Obstetrics & gynecology' },
]

const EXAMPLE_ZIPS = ['50010', '50266', '52401', '52803', '51101', '52001']

export default function HeroSearch({ onSearch, loading }) {
  const [zip, setZip]               = useState('')
  const [specialty, setSpecialty]   = useState('Primary Care')
  const [zipError, setZipError]     = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const clean = zip.trim().replace(/\D/g, '')
    if (clean.length !== 5) {
      setZipError('Enter a valid 5-digit ZIP code')
      return
    }
    setZipError('')
    onSearch(clean, specialty)
  }

  function handleZipChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 5)
    setZip(val)
    if (zipError) setZipError('')
  }

  return (
    <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-teal-700 py-14 px-4">
      <div className="max-w-3xl mx-auto text-center">
        {/* Headline */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-white/20">
          <MapPin className="w-3.5 h-3.5" />
          Iowa Healthcare Data Explorer
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
          Find Care.<br className="sm:hidden" /> Understand Risk.
        </h1>
        <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-xl mx-auto">
          Search real providers near any Iowa ZIP code using live CMS data.
          Explore county health trends and care access gaps.
        </p>

        {/* Search card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl p-6 text-left"
        >
          {/* Specialty picker */}
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Care Type
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {SPECIALTIES.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSpecialty(s.id)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 text-center
                  transition-all duration-150 text-xs font-medium
                  ${specialty === s.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                <span className="text-xl">{s.icon}</span>
                <span className="font-semibold">{s.id}</span>
                <span className="text-slate-400 text-[10px] leading-tight hidden sm:block">{s.desc}</span>
              </button>
            ))}
          </div>

          {/* ZIP input + search button */}
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            ZIP Code
          </p>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                inputMode="numeric"
                value={zip}
                onChange={handleZipChange}
                placeholder="e.g. 50010"
                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl border-2 text-slate-900 font-medium
                  text-base outline-none focus:border-blue-500 transition-colors
                  ${zipError ? 'border-red-400' : 'border-slate-200'}
                `}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="
                flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800
                text-white font-semibold rounded-xl transition-colors
                disabled:opacity-60 disabled:cursor-not-allowed shadow-sm
              "
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
          {zipError && (
            <p className="text-red-500 text-xs mt-2 font-medium">{zipError}</p>
          )}

          {/* Example ZIPs */}
          <div className="flex flex-wrap gap-1.5 mt-4 items-center">
            <span className="text-xs text-slate-400 mr-1">Try:</span>
            {EXAMPLE_ZIPS.map(z => (
              <button
                key={z}
                type="button"
                onClick={() => { setZip(z); setZipError('') }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-lg font-mono font-medium transition-colors"
              >
                {z}
              </button>
            ))}
          </div>
        </form>

        {/* Footer note */}
        <p className="text-blue-200/70 text-xs mt-5">
          Provider data: CMS NPI Registry &bull; Health data: CDC PLACES 2023 &bull; Iowa HHS
        </p>
      </div>
    </div>
  )
}
