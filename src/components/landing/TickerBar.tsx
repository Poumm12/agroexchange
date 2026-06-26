'use client'
import type { MarketPrice } from '@/types'
import { Icons } from '@/components/ui/Icons'

export function TickerBar({ prices }: { prices: MarketPrice[] }) {
  return (
    <div className="bg-white border-b border-gray-100 overflow-hidden">
      <div className="max-w-screen-xl mx-auto flex">
        <div className="bg-agro-800 text-white text-[11px] font-bold px-5 py-3.5 flex-shrink-0 flex items-center gap-2 tracking-widest uppercase whitespace-nowrap">
          <span className="w-1.5 h-1.5 bg-green-300 rounded-full live-dot" />LIVE · Τιμές Αγοράς
        </div>
        <div className="flex overflow-x-auto flex-1 divide-x divide-gray-100">
          {prices.map(p => (
            <div key={p.symbol} className="flex items-center gap-2.5 px-5 py-3 flex-shrink-0">
              <span className="font-semibold text-gray-800 text-sm">{p.commodity}</span>
              <span className="font-bold text-gray-900 text-sm flash">
                €{Number(p.price).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center gap-0.5 text-xs font-bold ${p.change_pct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {p.change_pct >= 0
                  ? <Icons.trendUp className="w-3 h-3" />
                  : <Icons.trendDown className="w-3 h-3" />}
                {Math.abs(p.change_pct).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
