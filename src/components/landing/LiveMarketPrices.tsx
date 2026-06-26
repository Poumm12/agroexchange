'use client'
import type { MarketPrice } from '@/types'
import { Icons } from '@/components/ui/Icons'
import { useLocale } from '@/context/LocaleContext'

const META: Record<string, { emoji: string; tint: string }> = {
  'Σιτάρι':    { emoji: '🌾', tint: 'from-amber-50 to-yellow-50' },
  'Καλαμπόκι': { emoji: '🌽', tint: 'from-yellow-50 to-amber-50' },
  'Βαμβάκι':   { emoji: '☁️', tint: 'from-slate-50 to-gray-50' },
  'Ελαιόλαδο': { emoji: '🫒', tint: 'from-green-50 to-emerald-50' },
  'Κριθάρι':   { emoji: '🌾', tint: 'from-orange-50 to-amber-50' },
  'Τομάτα':    { emoji: '🍅', tint: 'from-red-50 to-rose-50' },
  'Ρύζι':      { emoji: '🍚', tint: 'from-stone-50 to-neutral-50' },
  'Ηλίανθος':  { emoji: '🌻', tint: 'from-yellow-50 to-orange-50' },
}

export function LiveMarketPrices({ prices, onViewAll }: { prices: MarketPrice[]; onViewAll: () => void }) {
  const { t } = useLocale()

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-red-500 rounded-full live-dot" />
              <span className="text-xs font-bold tracking-widest uppercase text-agro-500">Live</span>
            </div>
            <h2 className="font-display font-extrabold text-gray-900 tracking-tight" style={{ fontSize: 'clamp(24px,4vw,38px)' }}>
              {t('home.prices_title')}
            </h2>
          </div>
          <button onClick={onViewAll}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-agro-700 hover:text-agro-900 transition-colors">
            Δείτε αναλυτικά τις τιμές <Icons.chevronRight className="w-4 h-4" />
          </button>
        </div>

        {prices.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-5 animate-pulse h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {prices.slice(0, 5).map(p => {
              const m = META[p.commodity] ?? { emoji: '🌱', tint: 'from-gray-50 to-slate-50' }
              const up = p.change_pct >= 0
              return (
                <div key={p.symbol}
                  className={`relative rounded-2xl p-5 bg-gradient-to-br ${m.tint} border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{m.emoji}</span>
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {up ? <Icons.trendUp className="w-3 h-3" /> : <Icons.trendDown className="w-3 h-3" />}
                      {Math.abs(p.change_pct).toFixed(1)}%
                    </span>
                  </div>
                  <div className="font-medium text-gray-500 text-xs mb-1">{p.commodity}</div>
                  <div className="font-display font-black text-gray-900 text-xl tracking-tight flash">
                    €{Number(p.price).toLocaleString('el-GR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{t('unit.per_ton')}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
