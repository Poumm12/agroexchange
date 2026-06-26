/**
 * weather.ts — Weather service
 *
 * Uses OpenWeatherMap free tier.
 * Get key at: https://openweathermap.org/appid
 * Falls back to static demo data when key is missing.
 */
import type { WeatherData, WeatherForecast } from '@/types'

const API_KEY  = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

const DAYS_EL = ['Κυρ','Δευ','Τρί','Τετ','Πέμ','Παρ','Σάβ']

const FALLBACK: WeatherData = {
  location:   'Λάρισα',
  temp:        28,
  feels_like:  30,
  humidity:    42,
  wind_speed:  14,
  visibility:  20,
  condition:  'Ηλιόλουστα',
  icon:       'sun',
  forecast: [
    { date:'', day:'Σήμερα', temp_max:28, temp_min:16, condition:'Ηλιόλουστα', icon:'sun'   },
    { date:'', day:'Τετ',    temp_max:25, temp_min:14, condition:'Συννεφιά',   icon:'cloud' },
    { date:'', day:'Πέμ',    temp_max:19, temp_min:12, condition:'Βροχή',      icon:'rain'  },
    { date:'', day:'Παρ',    temp_max:27, temp_min:15, condition:'Ηλιόλουστα', icon:'sun'   },
    { date:'', day:'Σάβ',    temp_max:30, temp_min:17, condition:'Ηλιόλουστα', icon:'sun'   },
  ],
}

function mapIcon(code: string): string {
  if (code.startsWith('01')) return 'sun'
  if (/^0[234]/.test(code))  return 'cloud'
  if (/^(09|10)/.test(code)) return 'rain'
  if (code.startsWith('11')) return 'storm'
  if (code.startsWith('13')) return 'snow'
  return 'cloud'
}

const CONDITION_MAP: Record<string, string> = {
  'clear sky':       'Ηλιόλουστα',
  'few clouds':      'Λίγα σύννεφα',
  'scattered clouds':'Αραιά σύννεφα',
  'broken clouds':   'Συννεφιά',
  'overcast clouds': 'Πυκνή συννεφιά',
  'light rain':      'Ελαφριά βροχή',
  'moderate rain':   'Μέτρια βροχή',
  'heavy rain':      'Έντονη βροχή',
  'thunderstorm':    'Καταιγίδα',
  'snow':            'Χιόνι',
  'mist':            'Ομίχλη',
}

function mapCondition(desc: string): string {
  return CONDITION_MAP[desc.toLowerCase()] ?? desc
}

export async function fetchWeather(city = 'Larissa,GR'): Promise<WeatherData> {
  if (!API_KEY || API_KEY === 'your_openweather_key_here') return FALLBACK

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${BASE_URL}/weather?q=${city}&units=metric&lang=el&appid=${API_KEY}`,   { next: { revalidate: 1800 } }),
      fetch(`${BASE_URL}/forecast?q=${city}&units=metric&cnt=40&lang=el&appid=${API_KEY}`, { next: { revalidate: 1800 } }),
    ])

    const current  = await currentRes.json()
    const forecast = await forecastRes.json()

    if (current.cod !== 200) return FALLBACK

    // Group forecast items by calendar day
    const days = new Map<string, { temps: number[]; icon: string; desc: string }>()
    for (const item of forecast.list ?? []) {
      const d = item.dt_txt?.split(' ')[0] ?? ''
      if (!days.has(d)) days.set(d, { temps: [], icon: item.weather[0].icon, desc: item.weather[0].description })
      days.get(d)!.temps.push(item.main.temp)
    }

    const forecastArr: WeatherForecast[] = Array.from(days.entries())
      .slice(0, 5)
      .map(([date, v], i) => ({
        date,
        day:      i === 0 ? 'Σήμερα' : DAYS_EL[new Date(date).getDay()],
        temp_max: Math.round(Math.max(...v.temps)),
        temp_min: Math.round(Math.min(...v.temps)),
        condition: mapCondition(v.desc),
        icon:      mapIcon(v.icon),
      }))

    return {
      location:   current.name,
      temp:       Math.round(current.main.temp),
      feels_like: Math.round(current.main.feels_like),
      humidity:   current.main.humidity,
      wind_speed: Math.round((current.wind.speed ?? 0) * 3.6),
      visibility: Math.round((current.visibility ?? 10000) / 1000),
      condition:  mapCondition(current.weather[0].description),
      icon:       mapIcon(current.weather[0].icon),
      forecast:   forecastArr,
    }
  } catch {
    return FALLBACK
  }
}
