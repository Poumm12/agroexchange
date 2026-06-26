'use client'
import { Icons } from '@/components/ui/Icons'
import { useLocale } from '@/context/LocaleContext'

export function Stats() {
  const { t } = useLocale()

  const ecosystem = [
    { Icon: Icons.wheat,    key: 'eco.farmers' },
    { Icon: Icons.euro,     key: 'eco.buyers' },
    { Icon: Icons.truck,    key: 'eco.transporters' },
    { Icon: Icons.umbrella, key: 'eco.insurers' },
  ]

  const numbers = [
    ['1.250+', 'Ενεργές Αγγελίες'],
    ['850+',   'Εγγεγραμμένοι Χρήστες'],
    ['120+',   'Πόλεις σε όλη την Ελλάδα'],
    ['100%',   'Ασφαλείς Συναλλαγές'],
  ]

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-green-950 via-green-900 to-green-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/4 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-screen-xl mx-auto relative z-10">
        {/* Ecosystem */}
        <div className="text-center mb-12">
          <div className="text-xs font-bold tracking-widest uppercase text-green-400 mb-3">Το οικοσύστημα</div>
          <h2 className="font-display font-extrabold text-white tracking-tight mb-8" style={{ fontSize: 'clamp(24px,4vw,38px)' }}>
            {t('home.stats_title')}
          </h2>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {ecosystem.map(e => (
              <div key={e.key} className="flex items-center gap-2.5 bg-white/8 backdrop-blur border border-white/12 rounded-2xl px-4 sm:px-5 py-3">
                <div className="w-8 h-8 rounded-xl bg-green-400/15 flex items-center justify-center text-green-300 flex-shrink-0">
                  <e.Icon className="w-4 h-4" />
                </div>
                <span className="text-white font-semibold text-sm whitespace-nowrap">{t(e.key)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10 bg-white/8 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
          {numbers.map(([v, l], i) => (
            <div key={i} className={`py-6 sm:py-8 px-3 sm:px-6 text-center ${i % 2 === 1 ? 'bg-white/4' : ''} lg:bg-transparent`}>
              <div className="font-display font-black text-white leading-none" style={{ fontSize: 'clamp(26px,4vw,46px)' }}>{v}</div>
              <div className="text-green-300/80 text-xs sm:text-sm mt-2">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
