import type { Metadata } from 'next'
import { StaticPageLayout } from '@/components/layout/StaticPageLayout'

export const metadata: Metadata = {
  title: 'Επικοινωνία – AgroExchange',
  description: 'Επικοινώνησε με την ομάδα της AgroExchange.',
}

export default function ContactPage() {
  return (
    <StaticPageLayout title="Επικοινωνία" subtitle="Είμαστε εδώ για να σε βοηθήσουμε">
      <div className="grid sm:grid-cols-2 gap-10">
        {/* Contact info */}
        <div className="space-y-6">
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg mb-4">Στοιχεία Επικοινωνίας</h2>
            <div className="space-y-4">
              {[
                { label: 'Email Υποστήριξης', val: 'support@agroexchange.gr' },
                { label: 'Email Επιχειρήσεων', val: 'business@agroexchange.gr' },
                { label: 'Τοποθεσία', val: 'Αθήνα, Ελλάδα' },
                { label: 'Ώρες Υποστήριξης', val: 'Δε–Πα, 09:00–17:00' },
              ].map(item => (
                <div key={item.label}>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{item.label}</div>
                  <div className="text-gray-700 font-medium">{item.val}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-agro-50 rounded-2xl p-5 border border-agro-100">
            <h3 className="font-bold text-agro-900 text-sm mb-2">Κέντρο Βοήθειας</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Βρες απαντήσεις στις πιο συνηθισμένες ερωτήσεις στο{' '}
              <a href="/help" className="text-agro-700 underline font-medium">Κέντρο Βοήθειας</a>.
            </p>
          </div>
        </div>

        {/* Contact form - static, no action */}
        <div>
          <h2 className="font-display font-bold text-gray-900 text-lg mb-4">Αποστολή Μηνύματος</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Όνομα</label>
              <input className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-agro-500" placeholder="Το όνομά σου" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Email</label>
              <input type="email" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-agro-500" placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Θέμα</label>
              <select className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-agro-500">
                <option>Τεχνικό πρόβλημα</option>
                <option>Ερώτηση χρήσης</option>
                <option>Συνεργασία</option>
                <option>Άλλο</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Μήνυμα</label>
              <textarea className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-agro-500 resize-none" rows={5} placeholder="Περίγραψε το ερώτημά σου..." />
            </div>
            <button className="w-full bg-agro-800 text-white font-semibold py-3 rounded-xl hover:bg-agro-900 transition-colors text-sm">
              Αποστολή Μηνύματος
            </button>
            <p className="text-xs text-gray-400 text-center">Η φόρμα θα ενεργοποιηθεί σύντομα. Επικοινώνησε μέσω email αυτή τη στιγμή.</p>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  )
}
