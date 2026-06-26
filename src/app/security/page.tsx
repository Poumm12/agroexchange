import type { Metadata } from 'next'
import { StaticPageLayout } from '@/components/layout/StaticPageLayout'

export const metadata: Metadata = {
  title: 'Ασφάλεια – AgroExchange',
  description: 'Πώς η AgroExchange προστατεύει τα δεδομένα και τις συναλλαγές σου.',
}

export default function SecurityPage() {
  return (
    <StaticPageLayout title="Ασφάλεια" subtitle="Πώς προστατεύουμε τους χρήστες και τα δεδομένα τους">
      <div className="space-y-6">
        {[
          { icon: '🔒', title: 'Κρυπτογράφηση SSL/TLS', desc: 'Όλες οι επικοινωνίες κρυπτογραφούνται με SSL/TLS. Τα δεδομένα μεταφέρονται πάντα μέσω HTTPS.' },
          { icon: '🛡️', title: 'Row Level Security', desc: 'Κάθε χρήστης έχει πρόσβαση μόνο στα δικά του δεδομένα. Η πολιτική ασφάλειας επιπέδου γραμμής (RLS) εξασφαλίζει ότι κανείς δεν μπορεί να δει δεδομένα άλλου.' },
          { icon: '🔑', title: 'Ασφαλής Αυθεντικοποίηση', desc: 'Χρησιμοποιούμε Supabase Auth με bcrypt hashing κωδικών. Υποστηρίζεται επιβεβαίωση email και επαναφορά κωδικού.' },
          { icon: '⚡', title: 'Αυτόματη Ανανέωση Session', desc: 'Οι συνεδρίες ανανεώνονται αυτόματα για να παραμένεις συνδεδεμένος με ασφάλεια χωρίς να χρειάζεσαι επανεισαγωγή κωδικού.' },
          { icon: '🚨', title: 'Αναφορά Προβλήματος', desc: 'Αν εντοπίσεις ευπάθεια ασφαλείας, επικοινώνησε αμέσως στο security@agroexchange.gr. Θα απαντήσουμε εντός 24 ωρών.' },
        ].map(item => (
          <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex gap-4">
            <span className="text-2xl flex-shrink-0">{item.icon}</span>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
        <div className="bg-agro-50 rounded-2xl p-5 border border-agro-100">
          <p className="text-sm text-gray-600">
            <strong>Υπεύθυνη αποκάλυψη:</strong> Αν εντοπίσεις ευπάθεια ασφαλείας, παρακαλούμε να μας ενημερώσεις υπεύθυνα στο{' '}
            <a href="mailto:security@agroexchange.gr" className="text-agro-700 underline">security@agroexchange.gr</a>{' '}
            πριν κάνεις δημόσια αποκάλυψη.
          </p>
        </div>
      </div>
    </StaticPageLayout>
  )
}
