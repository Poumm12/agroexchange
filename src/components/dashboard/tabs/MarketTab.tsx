'use client'
import { useState, useEffect, useRef } from 'react'
import type { MarketPrice } from '@/types'
import { Card, Sparkline, SectionLabel } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'

function genSpark(seed: number, len = 24, up = true) {
  let v = seed
  const pts: number[] = []
  for (let i = 0; i < len; i++) {
    v += (Math.random() - 0.48) * (up ? 1.1 : 0.9) * 3
    pts.push(Math.max(0, v))
  }
  return pts
}

interface Props { prices: MarketPrice[] }

export function MarketTab({ prices: initialPrices }: Props) {
  const [prices, setPrices] = useState(initialPrices)
  const sparksRef = useRef<number[][]>([])

  // Generate sparklines once per price list
  useEffect(() => {
    if (initialPrices.length && !sparksRef.current.length) {
      sparksRef.current = initialPrices.map(p => genSpark(50, 24, p.change_pct >= 0))
    }
    setPrices(initialPrices)
  }, [initialPrices])

  // Live tick ONLY for demo data — real API data refreshes via /api/market
  useEffect(() => {
    const isDemo = initialPrices[0]?.source === 'demo'
    if (!isDemo || !initialPrices.length) return
    const id = setInterval(() => {
      setPrices(prev => prev.map(p => ({
        ...p,
        price:      +(p.price * (1 + (Math.random() - 0.499) * 0.003)).toFixed(2),
        change_pct: +(p.change_pct + (Math.random() - 0.5) * 0.08).toFixed(3),
      })))
    }, 2500)
    return () => clearInterval(id)
  }, [initialPrices])

  const isDemo   = prices[0]?.source === 'demo'
  const isLive   = prices[0]?.source && prices[0].source !== 'demo'
  const updatedAt = prices[0]?.updated_at
    ? new Date(prices[0].updated_at).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-gray-900 text-xl tracking-tight">Τιμές Αγοράς</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="w-2 h-2 bg-red-500 rounded-full live-dot flex-shrink-0" />
            <span className="text-xs text-gray-500">
              {isLive
                ? `Live · ${prices[0]?.source}${updatedAt ? ` · ${updatedAt}` : ''}`
                : 'Demo δεδομένα — ενημερώνονται κάθε 2.5 δεκτερόλεπτα'}
            </span>
          </div>
        </div>
        {isDemo && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 flex items-start gap-2 max-w-xs">
            <Icons.alert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Προσθέστε <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_COMMODITIES_API_KEY</code> για live τιμές</span>
          </div>
        )}
      </div>

      {/* Price cards — 2 cols mobile, 3 desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {prices.map((p, i) => (
          <Card key={p.symbol} className="p-3 sm:p-4">
            <div className="flex items-start justify-between mb-2 gap-1">
              <div className="min-w-0">
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{p.unit}</div>
                <div className="font-bold text-gray-900 text-sm sm:text-base truncate">{p.commodity}</div>
              </div>
              <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold flex-shrink-0 ${
                p.change_pct >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                {p.change_pct >= 0
                  ? <Icons.trendUp className="w-2.5 h-2.5" />
                  : <Icons.trendDown className="w-2.5 h-2.5" />}
                {Math.abs(p.change_pct).toFixed(2)}%
              </span>
            </div>
            <div className="font-display font-black text-gray-900 text-lg sm:text-2xl tracking-tight flash">
              €{Number(p.price).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 overflow-hidden">
              <Sparkline
                data={sparksRef.current[i] ?? []}
                color={p.change_pct >= 0 ? '#4CAF50' : '#EF4444'}
                width={140} height={36}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Table — horizontally scrollable on mobile */}
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">Πίνακας Τιμών</h3>
        </div>
        <div className="overflow-x-auto table-scroll">
          <table className="w-full text-sm" role="table" aria-label="Πίνακας τιμών αγροτικών προϊόντων">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Προϊόν','Τρέχουσα','Μεταβολή','Χαμηλό 24ω','Υψηλό 24ω','Άνοιγμα','Πηγή'].map((h, i) => (
                  <th key={h} scope="col"
                    className={`px-3 sm:px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap ${i <= 0 ? 'text-left' : 'text-right'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {prices.map(p => (
                <tr key={p.symbol} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{p.commodity}</td>
                  <td className="px-3 sm:px-4 py-3 text-right font-display font-bold text-gray-900 flash whitespace-nowrap">
                    €{Number(p.price).toLocaleString('el-GR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">
                    <span className={`inline-flex items-center justify-end gap-1 font-bold text-xs sm:text-sm ${p.change_pct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {p.change_pct >= 0
                        ? <Icons.trendUp className="w-3 h-3" />
                        : <Icons.trendDown className="w-3 h-3" />}
                      {Math.abs(p.change_pct).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right text-gray-500 whitespace-nowrap">€{(p.price * .972).toFixed(2)}</td>
                  <td className="px-3 sm:px-4 py-3 text-right text-gray-500 whitespace-nowrap">€{(p.price * 1.028).toFixed(2)}</td>
                  <td className="px-3 sm:px-4 py-3 text-right text-gray-500 whitespace-nowrap">€{(p.price * .996).toFixed(2)}</td>
                  <td className="px-3 sm:px-4 py-3 text-right">
                    <span className="text-xs text-gray-400 bg-gray-100 rounded-lg px-2 py-0.5 whitespace-nowrap">{p.source}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* API readiness note */}
      {isDemo && (
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <h4 className="font-bold text-gray-700 text-sm mb-2">Σύνδεση με Live API</h4>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Για πραγματικές τιμές αγοράς, προσθέσε το API key στο <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">.env.local</code>.
            Μόλις προστεθεί, τα demo δεδομένα αντικαθίστανται αυτόματα.
          </p>
          <div className="grid gap-2 text-xs">
            {[
              { name: 'Commodities API', url: 'commodities-api.com', key: 'NEXT_PUBLIC_COMMODITIES_API_KEY', free: '100 req/mo' },
              { name: 'Open Exchange Rates', url: 'openexchangerates.org', key: 'NEXT_PUBLIC_COMMODITIES_API_KEY', free: '1000 req/mo' },
            ].map(api => (
              <div key={api.name} className="flex flex-wrap gap-2 items-center bg-white rounded-xl p-3 border border-gray-100">
                <span className="font-semibold text-gray-700">{api.name}</span>
                <code className="bg-agro-50 text-agro-800 px-2 py-0.5 rounded font-mono">{api.key}</code>
                <span className="text-gray-400 ml-auto">{api.free}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
