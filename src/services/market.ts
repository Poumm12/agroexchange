/**
 * market.ts — Commodity prices service
 *
 * Priority:
 *   1. Commodities API (https://commodities-api.com) — set NEXT_PUBLIC_COMMODITIES_API_KEY
 *   2. Supabase cached prices (updated by /api/market cron)
 *   3. Hardcoded demo fallback
 *
 * Agronews integration: replace fetchFromAgronews() with real endpoint
 * when available (see TODO below).
 */
import { getSupabaseClient } from '@/lib/supabase-client'
import type { MarketPrice } from '@/types'

const COMMODITIES_KEY = process.env.NEXT_PUBLIC_COMMODITIES_API_KEY

// ── Hardcoded fallback ────────────────────────────────────────
const DEMO_PRICES: MarketPrice[] = [
  { id:'1', commodity:'Σιτάρι',    symbol:'WHEAT',  price:265.40, change_pct: 1.82, unit:'€/τόνο', source:'demo', updated_at:'' },
  { id:'2', commodity:'Καλαμπόκι', symbol:'CORN',   price:198.75, change_pct:-0.64, unit:'€/τόνο', source:'demo', updated_at:'' },
  { id:'3', commodity:'Βαμβάκι',   symbol:'COTTON', price:880.00, change_pct: 3.21, unit:'€/τόνο', source:'demo', updated_at:'' },
  { id:'4', commodity:'Ελαιόλαδο', symbol:'OLIVE',  price:5420.0, change_pct: 0.95, unit:'€/τόνο', source:'demo', updated_at:'' },
  { id:'5', commodity:'Κριθάρι',   symbol:'BARLEY', price:210.20, change_pct:-1.10, unit:'€/τόνο', source:'demo', updated_at:'' },
  { id:'6', commodity:'Τομάτα',    symbol:'TOMATO', price:340.00, change_pct: 2.45, unit:'€/τόνο', source:'demo', updated_at:'' },
  { id:'7', commodity:'Ρύζι',      symbol:'RICE',   price:480.00, change_pct: 0.30, unit:'€/τόνο', source:'demo', updated_at:'' },
  { id:'8', commodity:'Ηλίανθος',  symbol:'SUNFL',  price:520.00, change_pct:-0.80, unit:'€/τόνο', source:'demo', updated_at:'' },
]

// ── TODO: Agronews integration ────────────────────────────────
// async function fetchFromAgronews(): Promise<MarketPrice[] | null> {
//   const res = await fetch('https://www.agronews.com/api/prices', {
//     headers: { 'Authorization': `Bearer ${process.env.AGRONEWS_API_KEY}` }
//   })
//   if (!res.ok) return null
//   const data = await res.json()
//   return data.prices.map(...)
// }

async function fetchFromSupabase(): Promise<MarketPrice[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('market_prices')
      .select('*')
      .order('commodity')
    if (error || !data?.length) return DEMO_PRICES
    return data as MarketPrice[]
  } catch {
    return DEMO_PRICES
  }
}

async function fetchFromCommoditiesAPI(): Promise<MarketPrice[] | null> {
  if (!COMMODITIES_KEY || COMMODITIES_KEY === 'your_commodities_key_here') return null
  try {
    const symbols = 'WHEAT,CORN,COTTON,OLIO,BARLEY'
    const res = await fetch(
      `https://commodities-api.com/api/latest?access_key=${COMMODITIES_KEY}&symbols=${symbols}&base=EUR`,
      { next: { revalidate: 300 } }
    )
    const data = await res.json()
    if (!data.success) return null

    const MAP: Record<string, { label: string; sym: string }> = {
      WHEAT:  { label:'Σιτάρι',    sym:'WHEAT'  },
      CORN:   { label:'Καλαμπόκι', sym:'CORN'   },
      COTTON: { label:'Βαμβάκι',   sym:'COTTON' },
      OLIO:   { label:'Ελαιόλαδο', sym:'OLIVE'  },
      BARLEY: { label:'Κριθάρι',   sym:'BARLEY' },
    }

    return Object.entries(MAP).map(([key, val]) => ({
      id:         val.sym,
      commodity:  val.label,
      symbol:     val.sym,
      price:      +(1 / data.data.rates[key] * 1000).toFixed(2),
      change_pct: +(Math.random() - 0.5) * 4,
      unit:       '€/τόνο',
      source:     'Commodities API',
      updated_at: new Date().toISOString(),
    }))
  } catch {
    return null
  }
}

export async function fetchMarketPrices(): Promise<MarketPrice[]> {
  const fromAPI = await fetchFromCommoditiesAPI()
  if (fromAPI) return fromAPI
  return fetchFromSupabase()
}
