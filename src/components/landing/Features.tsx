'use client'
import { Icons } from '@/components/ui/Icons'
import { useLocale } from '@/context/LocaleContext'

const BENEFITS = [
  { Icon: Icons.shield,  title: 'Ασφαλείς συναλλαγές',  desc: 'Διαφάνεια και αξιοπιστία με σύστημα Trust Score και αξιολογήσεις.' },
  { Icon: Icons.user,    title: 'Σύνδεση παντού',       desc: 'Παραγωγοί, αγοραστές και μεταφορείς σε όλη την Ελλάδα σε μία πλατφόρμα.' },
  { Icon: Icons.truck,   title: 'Μεταφορές εύκολα',     desc: 'Βρες αξιολογημένη μεταφορική για την αποστολή σου με ένα κλικ.' },
  { Icon: Icons.trendUp, title: 'Αληθινές τιμές αγοράς', desc: 'Ενημερώσου καθημερινά για τις τιμές των αγροτικών προϊόντων.' },
]

export function Features() {
  const { t } = useLocale()
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-bold tracking-widest uppercase text-agro-500 mb-3">Γιατί AgroExchange</div>
          <h2 className="font-display font-extrabold text-gray-900 tracking-tight max-w-2xl mx-auto" style={{ fontSize: 'clamp(24px,4vw,38px)' }}>
            {t('home.benefits_title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {BENEFITS.map((b, i) => (
            <div key={i}
              className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-out">
              <div className="w-12 h-12 bg-agro-50 rounded-2xl flex items-center justify-center mb-4 text-agro-700 group-hover:bg-agro-100 group-hover:scale-110 transition-all duration-300 ease-out">
                <b.Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-2">{b.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
