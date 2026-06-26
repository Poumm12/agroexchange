'use client'
import { Card } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'

const PLANNED = [
  { Icon: Icons.shield,  title: 'Ασφάλιση Καλλιεργειών', desc: 'Προστασία από καιρικά φαινόμενα, ασθένειες και απώλεια παραγωγής.' },
  { Icon: Icons.truck,   title: 'Ασφάλιση Μεταφορών',    desc: 'Κάλυψη εμπορευμάτων κατά τη μεταφορά σε όλη την Ελλάδα.' },
  { Icon: Icons.package, title: 'Ασφάλιση Αποθήκευσης',  desc: 'Προστασία αποθηκευμένων προϊόντων από ζημιές και κλοπή.' },
  { Icon: Icons.euro,    title: 'Ασφάλιση Συναλλαγών',   desc: 'Εγγύηση πληρωμής και προστασία από αθέτηση συμφωνιών.' },
]

export function InsuranceTab() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-display font-extrabold text-gray-900 text-xl tracking-tight">Ασφάλειες</h2>
          <span className="text-[10px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-bold uppercase">Σύντομα</span>
        </div>
        <p className="text-sm text-gray-500">Ασφαλιστικές λύσεις σχεδιασμένες για τον αγροτικό τομέα</p>
      </div>

      {/* Hero card */}
      <div className="relative bg-gradient-to-br from-green-900 to-green-700 rounded-2xl p-6 sm:p-8 text-white overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10">
          <Icons.umbrella className="w-24 h-24" />
        </div>
        <div className="relative">
          <h3 className="font-display font-extrabold text-2xl mb-2">Έρχονται οι Ασφάλειες</h3>
          <p className="text-white/80 leading-relaxed max-w-md mb-4">
            Σύντομα θα μπορείς να συγκρίνεις και να αγοράζεις ασφαλιστικά προγράμματα
            από συνεργαζόμενες ασφαλιστικές εταιρείες, απευθείας μέσα από το AgroExchange.
          </p>
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-xl px-4 py-2 text-sm font-semibold">
            <Icons.bell className="w-4 h-4" /> Θα ειδοποιηθείς μόλις είναι διαθέσιμο
          </span>
        </div>
      </div>

      {/* Planned products */}
      <div>
        <h3 className="font-bold text-gray-700 text-sm mb-3">Τι θα προσφέρουμε</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLANNED.map(p => (
            <Card key={p.title} className="p-5">
              <div className="w-11 h-11 rounded-2xl bg-agro-50 text-agro-700 flex items-center justify-center mb-3">
                <p.Icon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-1.5">{p.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Είσαι ασφαλιστική εταιρεία και θες να συνεργαστείς;{' '}
          <a href="/contact" className="text-agro-700 font-semibold hover:underline">Επικοινώνησε μαζί μας</a>
        </p>
      </div>
    </div>
  )
}
