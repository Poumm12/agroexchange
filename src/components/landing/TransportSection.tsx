'use client'
import { Icons } from '@/components/ui/Icons'
import { useLocale } from '@/context/LocaleContext'

export function TransportSection({ onCta }: { onCta: () => void }) {
  const { t } = useLocale()
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
      <div className="max-w-screen-xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-900 to-green-700">
          <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&auto=format&fit=crop&q=80"
              alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div className="relative grid lg:grid-cols-2 gap-8 items-center p-8 sm:p-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-3 py-1 mb-4">
                <Icons.truck className="w-3.5 h-3.5 text-green-300" />
                <span className="text-green-200 text-xs font-semibold">Μεταφορές</span>
              </div>
              <h2 className="font-display font-extrabold text-white tracking-tight mb-4" style={{ fontSize: 'clamp(24px,3.5vw,36px)' }}>
                {t('home.transport_title')}
              </h2>
              <p className="text-white/75 leading-relaxed mb-6 max-w-md">
                Βρες αξιόπιστες μεταφορικές εταιρείες σε όλη την Ελλάδα. Σύγκρινε τιμές,
                δες αξιολογήσεις και κανόνισε την αποστολή σου με ένα κλικ.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                {[['200+', 'Μεταφορείς'], ['4.8★', 'Μέση βαθμολογία'], ['48ω', 'Μέσος χρόνος']].map(([v, l]) => (
                  <div key={l}>
                    <div className="font-display font-black text-white text-2xl">{v}</div>
                    <div className="text-white/60 text-xs">{l}</div>
                  </div>
                ))}
              </div>
              <button onClick={onCta}
                className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-6 py-3 rounded-2xl text-sm hover:bg-green-50 transition-all">
                <Icons.search className="w-4 h-4" /> Δείτε μεταφορές
              </button>
            </div>
            <div className="hidden lg:flex justify-center">
              <Icons.truck className="w-48 h-48 text-white/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
