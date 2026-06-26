'use client'
import { Icons } from '@/components/ui/Icons'
import { useLocale } from '@/context/LocaleContext'

const STEPS = [
  { Icon: Icons.list,    title: 'Δημιουργείς αγγελία',     desc: 'Δημοσίευσε το προϊόν σου με τιμή, ποσότητα και τοποθεσία σε λίγα δευτερόλεπτα.' },
  { Icon: Icons.message, title: 'Λαμβάνεις προσφορές',     desc: 'Αγοραστές από όλη την Ελλάδα στέλνουν προσφορές για το προϊόν σου.' },
  { Icon: Icons.check,   title: 'Συμφωνείς με αγοραστή',   desc: 'Διάλεξε την καλύτερη προσφορά και κλείσε τη συμφωνία απευθείας.' },
  { Icon: Icons.truck,   title: 'Κανονίζεις τη μεταφορά',  desc: 'Βρες αξιολογημένο μεταφορέα για την παράδοση σε όλη την Ελλάδα.' },
]

export function HowItWorks() {
  const { t } = useLocale()
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-bold tracking-widest uppercase text-agro-500 mb-3">Διαδικασία</div>
          <h2 className="font-display font-extrabold text-gray-900 tracking-tight" style={{ fontSize: 'clamp(24px,4vw,38px)' }}>
            {t('home.howit_title')}
          </h2>
        </div>
        <div className="relative">
          {/* Very subtle connector line behind the steps (1 ──── 2 ──── 3 ──── 4) */}
          <div className="hidden lg:block absolute left-[12.5%] right-[12.5%] top-[58px] h-px bg-gradient-to-r from-transparent via-agro-100 to-transparent" aria-hidden="true" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {STEPS.map((s, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-agro-800 text-white flex items-center justify-center flex-shrink-0">
                      <s.Icon className="w-5 h-5" />
                    </div>
                    <div className="font-display font-black text-3xl text-agro-100">{i + 1}</div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10 text-agro-300">
                    <Icons.chevronRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
