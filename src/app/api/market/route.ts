import { NextResponse } from 'next/server'
import { fetchMarketPrices } from '@/services/market'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const revalidate = 300 // 5 min cache

export async function GET() {
  try {
    const prices = await fetchMarketPrices()

    // Cache results in Supabase so client-side always has a fallback
    try {
      const admin = getSupabaseAdmin()
      for (const p of prices) {
        await admin.from('market_prices').upsert(
          { symbol: p.symbol, commodity: p.commodity, price: p.price,
            change_pct: p.change_pct, unit: p.unit, source: p.source,
            updated_at: new Date().toISOString() },
          { onConflict: 'symbol' }
        )
      }
    } catch (_) {
      // Non-fatal: caching failure shouldn't break the response
    }

    return NextResponse.json({ data: prices, source: prices[0]?.source ?? 'demo' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
