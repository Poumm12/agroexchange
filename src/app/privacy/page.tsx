import type { Metadata } from 'next'
import { StaticPageLayout } from '@/components/layout/StaticPageLayout'

export const metadata: Metadata = {
  title: 'Πολιτική Απορρήτου – AgroExchange',
  description: 'Πολιτική απορρήτου και προστασία δεδομένων AgroExchange.',
}

export default function PrivacyPage() {
  return (
    <StaticPageLayout title="Πολιτική Απορρήτου" subtitle={`Τελευταία ενημέρωση: Ιανουάριος ${new Date().getFullYear()}`}>
      <div className="space-y-8 text-gray-600 leading-relaxed">
        {[
          { title: 'Τι δεδομένα συλλέγουμε', body: 'Συλλέγουμε email, ονοματεπώνυμο, τοποθεσία και δεδομένα δραστηριότητας (αγγελίες, προσφορές, συναλλαγές) για τη λειτουργία της πλατφόρμας.' },
          { title: 'Πώς χρησιμοποιούμε τα δεδομένα', body: 'Τα δεδομένα χρησιμοποιούνται αποκλειστικά για τη λειτουργία της πλατφόρμας, τη βελτίωση των υπηρεσιών και την αποστολή ειδοποιήσεων σχετικών με τον λογαριασμό σου.' },
          { title: 'Κοινοποίηση δεδομένων', body: 'Δεν πωλούμε ούτε μοιραζόμαστε τα δεδομένα σου με τρίτους για εμπορικούς σκοπούς. Τα βασικά στοιχεία προφίλ (όνομα, τοποθεσία) εμφανίζονται σε άλλους χρήστες της πλατφόρμας.' },
          { title: 'Ασφάλεια', body: 'Χρησιμοποιούμε κρυπτογράφηση SSL, Row Level Security (Supabase) και ελέγχους πρόσβασης για την προστασία των δεδομένων σου.' },
          { title: 'Δικαιώματά σου (GDPR)', body: 'Έχεις δικαίωμα πρόσβασης, διόρθωσης και διαγραφής των δεδομένων σου. Μπορείς να διαγράψεις τον λογαριασμό σου από το Προφίλ ή να επικοινωνήσεις μαζί μας.' },
          { title: 'Cookies', body: 'Χρησιμοποιούμε μόνο απαραίτητα cookies για τη συνεδρία και την ασφάλεια. Δεν χρησιμοποιούμε cookies διαφήμισης ή παρακολούθησης.' },
        ].map(s => (
          <section key={s.title}>
            <h2 className="font-display font-bold text-gray-900 text-lg mb-3">{s.title}</h2>
            <p>{s.body}</p>
          </section>
        ))}
      </div>
    </StaticPageLayout>
  )
}
