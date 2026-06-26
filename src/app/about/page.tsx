import type { Metadata } from 'next'
import { StaticPageLayout } from '@/components/layout/StaticPageLayout'

export const metadata: Metadata = {
  title: 'Για εμάς – AgroExchange',
  description: 'Μάθε περισσότερα για την AgroExchange και την αποστολή μας.',
}

export default function AboutPage() {
  return (
    <StaticPageLayout
      title="Για εμάς"
      subtitle="Η ιστορία και η αποστολή της AgroExchange">

      <div className="prose prose-gray max-w-none space-y-10">
        <section>
          <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Η αποστολή μας</h2>
          <p className="text-gray-600 leading-relaxed">
            Η AgroExchange δημιουργήθηκε με έναν σαφή στόχο: να απλοποιήσει τις συναλλαγές
            αγροτικών προϊόντων στην Ελλάδα. Πιστεύουμε ότι οι Έλληνες παραγωγοί αξίζουν
            σύγχρονα εργαλεία που τους επιτρέπουν να βρίσκουν αγοραστές, να συγκρίνουν τιμές
            και να διαχειρίζονται τη διανομή — όλα από ένα μέρος.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Τι προσφέρουμε</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { title: 'Ψηφιακή Αγορά', desc: 'Αγγελίες αγροτικών προϊόντων με άμεση επικοινωνία παραγωγού-αγοραστή.' },
              { title: 'Live Τιμές', desc: 'Ενημερωμένες τιμές αγοράς για σιτηρά, ελαιόλαδο, βαμβάκι και άλλα.' },
              { title: 'Δίκτυο Μεταφορών', desc: 'Έγκριτοι μεταφορείς για τη μεταφορά προϊόντων σε όλη την Ελλάδα.' },
              { title: 'Αξιοπιστία', desc: 'Σύστημα αξιολογήσεων και Trust Score για ασφαλείς συναλλαγές.' },
            ].map(item => (
              <div key={item.title} className="bg-agro-50 rounded-2xl p-5 border border-agro-100">
                <h3 className="font-bold text-agro-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Ποιους εξυπηρετούμε</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2"><span className="text-agro-600 font-bold mt-0.5">→</span><span><strong>Παραγωγοί & αγρότες</strong> — δημοσιεύουν αγγελίες και λαμβάνουν προσφορές.</span></li>
            <li className="flex items-start gap-2"><span className="text-agro-600 font-bold mt-0.5">→</span><span><strong>Αγοραστές & έμποροι</strong> — αναζητούν προϊόντα και διαπραγματεύονται τιμές.</span></li>
            <li className="flex items-start gap-2"><span className="text-agro-600 font-bold mt-0.5">→</span><span><strong>Μεταφορείς</strong> — προσφέρουν υπηρεσίες διανομής σε ολόκληρη την Ελλάδα.</span></li>
          </ul>
        </section>

        <section className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <p className="text-gray-500 text-sm">
            Η AgroExchange είναι σε φάση ανάπτυξης. Εργαζόμαστε καθημερινά για να βελτιώνουμε
            την πλατφόρμα. Για οποιαδήποτε ερώτηση ή πρόταση, επικοινώνησε μαζί μας.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  )
}
