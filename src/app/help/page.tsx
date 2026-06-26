import type { Metadata } from 'next'
import { StaticPageLayout } from '@/components/layout/StaticPageLayout'

export const metadata: Metadata = {
  title: 'Κέντρο Βοήθειας – AgroExchange',
  description: 'Συχνές ερωτήσεις και οδηγίες χρήσης για την AgroExchange.',
}

const FAQS = [
  { q: 'Πώς δημιουργώ αγγελία;', a: 'Συνδέσου στον λογαριασμό σου, πήγαινε στην καρτέλα "Αγγελίες" και πάτα "Νέα Αγγελία". Συμπλήρωσε τίτλο, κατηγορία, τιμή, ποσότητα και τοποθεσία.' },
  { q: 'Πώς στέλνω προσφορά;', a: 'Βρες μια αγγελία που σε ενδιαφέρει, πάτα "Αποστολή Προσφοράς" και συμπλήρωσε την τιμή και ποσότητα που θέλεις.' },
  { q: 'Πώς λειτουργεί το Trust Score;', a: 'Το Trust Score (0-100) αυξάνεται με κάθε ολοκληρωμένο deal, θετική αξιολόγηση και συνεχή δραστηριότητα στην πλατφόρμα.' },
  { q: 'Μπορώ να ανεβάσω φωτογραφία στην αγγελία;', a: 'Αυτή τη στιγμή οι αγγελίες χρησιμοποιούν αυτόματες εικόνες κατά κατηγορία. Η δυνατότητα ανεβάσματος φωτογραφίας θα προστεθεί σύντομα.' },
  { q: 'Πώς βρίσκω μεταφορέα;', a: 'Πήγαινε στην καρτέλα "Μεταφορές", συμπλήρωσε αποστολή & παραλαβή και θα δεις διαθέσιμους μεταφορείς με αξιολογήσεις.' },
  { q: 'Η εγγραφή είναι δωρεάν;', a: 'Ναι, η εγγραφή και η χρήση της βασικής πλατφόρμας είναι εντελώς δωρεάν. Δεν χρειάζεσαι πιστωτική κάρτα.' },
  { q: 'Πώς επαναφέρω τον κωδικό μου;', a: 'Στη σελίδα εισόδου πάτα "Ξέχασες τον κωδικό;" και θα σου σταλεί email με οδηγίες επαναφοράς.' },
  { q: 'Πώς διαγράφω τον λογαριασμό μου;', a: 'Πήγαινε στο Προφίλ → "Επικίνδυνη Ζώνη" → "Διαγραφή Λογαριασμού". Η ενέργεια είναι μη αναστρέψιμη.' },
]

export default function HelpPage() {
  return (
    <StaticPageLayout title="Κέντρο Βοήθειας" subtitle="Απαντήσεις στις πιο συνηθισμένες ερωτήσεις">
      <div className="space-y-8">
        <div className="grid gap-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                <span className="text-agro-600 font-black text-sm mt-0.5 flex-shrink-0">{i + 1}.</span>
                {faq.q}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed pl-5">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="bg-agro-50 rounded-2xl p-6 border border-agro-100 text-center">
          <p className="text-gray-600 mb-3">Δεν βρήκες απάντηση;</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-agro-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-agro-900 transition-colors">
            Επικοινώνησε μαζί μας
          </a>
        </div>
      </div>
    </StaticPageLayout>
  )
}
