'use client'
import { useState, useEffect, useRef } from 'react'
import type { WeatherData } from '@/types'
import { Card, Spinner } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { GREEK_CITIES, searchGreekCities } from '@/lib/greekCities'

// Complete searchable list of Greek cities & towns (OpenWeather-ready values).
const CITIES = GREEK_CITIES

const AGRO_TIPS = [
  { type: 'success', icon: Icons.check, text: 'Ευνοϊκές συνθήκες για άρδευση βαμβακιού' },
  { type: 'warning', icon: Icons.alert, text: 'Αποφύγετε ψεκασμούς αν ο άνεμος υπερβαίνει τα 15 km/h' },
  { type: 'info',    icon: Icons.cloud, text: 'Ελέγξτε πρόγνωση 5 ημερών πριν προγραμματίσετε συγκομιδή' },
]

// Weather-specific background imagery per condition
const WEATHER_BG: Record<string, string> = {
  sun:   'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1200&auto=format&fit=crop&q=80',
  cloud: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=1200&auto=format&fit=crop&q=80',
  rain:  'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1200&auto=format&fit=crop&q=80',
  storm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1200&auto=format&fit=crop&q=80',
  snow:  'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=1200&auto=format&fit=crop&q=80',
}

const WEATHER_GRADIENT: Record<string, string> = {
  sun:   'from-amber-500/90 to-orange-600/80',
  cloud: 'from-slate-500/90 to-gray-600/80',
  rain:  'from-blue-600/90 to-slate-700/80',
  storm: 'from-purple-700/90 to-slate-900/85',
  snow:  'from-sky-300/90 to-blue-400/80',
}

function WeatherIcon({ code, size = 28 }: { code: string; size?: number }) {
  const s = { width: size, height: size }
  if (code === 'sun')   return <Icons.sun   style={{ ...s, color: '#F59E0B' }} />
  if (code === 'cloud') return <Icons.cloud style={{ ...s, color: '#9CA3AF' }} />
  if (code === 'rain')  return <Icons.rain  style={{ ...s, color: '#60A5FA' }} />
  if (code === 'storm') return <Icons.storm style={{ ...s, color: '#A78BFA' }} />
  if (code === 'snow')  return <Icons.snow  style={{ ...s, color: '#7DD3FC' }} />
  return <Icons.cloud style={{ ...s, color: '#9CA3AF' }} />
}

export function WeatherTab() {
  const [city, setCity]       = useState(CITIES[0].value)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const [isDemo, setIsDemo]   = useState(false)

  // City selector UI
  const [search, setSearch]   = useState('')
  const [showList, setShowList] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => { load() }, [city])

  useEffect(() => {
    if (!showList) return
    const fn = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setShowList(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [showList])

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const res  = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      const json = await res.json()
      if (!json.data) throw new Error('No data')
      setWeather(json.data)
      setIsDemo(json.data.temp === 28 && json.data.location === 'Λάρισα' && !process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const currentLabel = CITIES.find(c => c.value === city)?.label ?? 'Πόλη'
  const filtered = searchGreekCities(search)
  const quickCities = CITIES.slice(0, expanded ? CITIES.length : 6)
  const bg       = weather ? (WEATHER_BG[weather.icon] ?? WEATHER_BG.cloud) : WEATHER_BG.cloud
  const gradient = weather ? (WEATHER_GRADIENT[weather.icon] ?? WEATHER_GRADIENT.cloud) : WEATHER_GRADIENT.cloud

  return (
    <div className="space-y-5">
      {/* Header + searchable dropdown */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-gray-900 text-xl tracking-tight">Καιρός & Προγνώσεις</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isDemo ? 'Demo δεδομένα — προσθέστε OpenWeatherMap API key' : 'OpenWeatherMap · Live'}
          </p>
        </div>

        {/* Searchable city dropdown */}
        <div className="relative w-full sm:w-64" ref={boxRef}>
          <button onClick={() => setShowList(p => !p)}
            className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-agro-300 transition-colors"
            aria-haspopup="listbox" aria-expanded={showList}>
            <span className="flex items-center gap-2">
              <Icons.map className="w-4 h-4 text-agro-600" />
              {currentLabel}
            </span>
            <Icons.chevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showList ? 'rotate-180' : ''}`} />
          </button>

          {showList && (
            <div className="dropdown-enter absolute right-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="p-2 border-b border-gray-50">
                <div className="relative">
                  <Icons.search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input autoFocus
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-agro-500"
                    placeholder="Αναζήτηση πόλης..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto py-1" role="listbox">
                {filtered.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400 text-center">Δεν βρέθηκε πόλη</div>
                ) : filtered.map(c => (
                  <button key={c.value} role="option" aria-selected={city === c.value}
                    onClick={() => { setCity(c.value); setShowList(false); setSearch('') }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${city === c.value ? 'bg-agro-50 text-agro-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick city chips — expandable */}
      <div className="flex gap-1.5 flex-wrap items-center">
        {quickCities.map(c => (
          <button key={c.value} onClick={() => setCity(c.value)}
            aria-pressed={city === c.value}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${city === c.value ? 'bg-agro-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-agro-300'}`}>
            {c.label}
          </button>
        ))}
        <button onClick={() => setExpanded(p => !p)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-agro-700 hover:bg-agro-50 transition-colors flex items-center gap-1">
          {expanded ? 'Λιγότερες' : `+${CITIES.length - 6} πόλεις`}
          <Icons.chevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={36} /></div>
      ) : error ? (
        <div className="text-center py-16 text-gray-400">
          <Icons.cloud className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-600">Δεν ήταν δυνατή η φόρτωση καιρού</p>
          <button onClick={load} className="mt-4 text-sm text-agro-700 font-semibold hover:underline">Δοκίμασε ξανά</button>
        </div>
      ) : weather ? (
        <>
          {/* Main weather card with condition-specific imagery */}
          <div className="relative rounded-2xl p-6 sm:p-8 text-white overflow-hidden min-h-[220px]">
            <div className="absolute inset-0">
              <img src={bg} alt="" className="w-full h-full object-cover" loading="lazy" />
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
            </div>
            <div className="relative">
              <div className="absolute right-0 top-0 opacity-90">
                <WeatherIcon code={weather.icon} size={64} />
              </div>
              <div className="text-sm opacity-80 mb-1">{weather.location} · {currentLabel}</div>
              <div className="font-display font-black leading-none tracking-tight" style={{ fontSize: 'clamp(52px,10vw,80px)' }}>
                {weather.temp}°
              </div>
              <div className="text-lg mt-2 opacity-90 font-medium">{weather.condition}</div>
              <div className="flex flex-wrap gap-4 sm:gap-6 mt-5 text-sm opacity-80">
                <span className="flex items-center gap-1.5"><Icons.drop className="w-4 h-4" />Υγρ. {weather.humidity}%</span>
                <span className="flex items-center gap-1.5"><Icons.wind className="w-4 h-4" />Άνεμ. {weather.wind_speed} km/h</span>
                <span className="flex items-center gap-1.5"><Icons.eye className="w-4 h-4" />Ορ. {weather.visibility} km</span>
                <span className="flex items-center gap-1.5"><Icons.sun className="w-4 h-4" />Αίσθ. {weather.feels_like}°</span>
              </div>
            </div>
          </div>

          {/* 5-day forecast */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {weather.forecast.map((f, i) => (
              <Card key={i} className={`p-2 sm:p-3 text-center ${i === 0 ? 'bg-agro-50 border-agro-200' : ''}`}>
                <div className="text-[10px] sm:text-xs font-bold text-gray-500 mb-1 sm:mb-2">{f.day}</div>
                <div className="flex justify-center mb-1 sm:mb-2"><WeatherIcon code={f.icon} size={20} /></div>
                <div className="font-bold text-gray-900 text-xs sm:text-sm">{f.temp_max}°</div>
                <div className="text-[10px] sm:text-xs text-gray-400">{f.temp_min}°</div>
              </Card>
            ))}
          </div>

          {/* Agro tips */}
          <Card className="p-4 sm:p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Αγροτικές Συστάσεις</h3>
            <div className="space-y-2.5">
              {AGRO_TIPS.map((t, i) => {
                const styles: Record<string, string> = {
                  success: 'bg-green-50 border-green-100 text-green-800',
                  warning: 'bg-amber-50 border-amber-100 text-amber-800',
                  info:    'bg-blue-50 border-blue-100 text-blue-800',
                }
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${styles[t.type]}`}>
                    <t.icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{t.text}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {isDemo && (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h4 className="font-bold text-gray-700 text-sm mb-2">Σύνδεση με Live Καιρό</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Πρόσθεσε <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">NEXT_PUBLIC_OPENWEATHER_API_KEY</code> στο <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">.env.local</code>.
                Τα demo δεδομένα αντικαθίστανται αυτόματα.
              </p>
              <a href="https://openweathermap.org/appid" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-agro-700 hover:underline">
                <Icons.link className="w-3 h-3" /> openweathermap.org (δωρεάν)
              </a>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
