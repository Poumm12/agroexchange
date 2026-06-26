import type { Metadata } from 'next'
import { StaticPageLayout } from '@/components/layout/StaticPageLayout'

export const metadata: Metadata = {
  title: 'Καριέρα – AgroExchange',
  description: 'Ανοιχτές θέσεις εργασίας στην AgroExchange.',
}

export default function CareersPage() {
  return (
    <StaticPageLayout title="Καριέρα" subtitle="Χτίσε το μέλλον της αγροτικής αγοράς μαζί μας">
      <div className="space-y-8">
        <div className="bg-agro-50 rounded-2xl p-6 border border-agro-100">
          <h2 className="font-display font-bold text-agro-900 text-lg mb-2">Γιατί να δουλέψεις στην AgroExchange;</h2>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li className="flex items-center gap-2"><span className="text-agro-600">→</span> Πραγματική επίδραση στην ελληνική αγροτική οικονομία</li>
            <li className="flex items-center gap-2"><span className="text-agro-600">→</span> Σύγχρονο tech stack (Next.js, Supabase, TypeScript)</li>
            <li className="flex items-center gap-2"><span className="text-agro-600">→</span> Ευέλικτο περιβάλλον εργασίας</li>
            <li className="flex items-center gap-2"><span className="text-agro-600">→</span> Ανταγωνιστικές αποδοχές</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display font-bold text-gray-900 text-lg mb-4">Ανοιχτές Θέσεις</h2>
          <div className="space-y-4">
            {[
              { title: 'Full-Stack Developer', type: 'Πλήρης Απασχόληση', location: 'Αθήνα / Remote', desc: 'Next.js, TypeScript, Supabase, TailwindCSS.' },
              { title: 'Growth & Marketing Manager', type: 'Πλήρης Απασχόληση', location: 'Αθήνα', desc: 'Ανάπτυξη χρηστών στον αγροτικό τομέα.' },
              { title: 'Agricultural Advisor', type: 'Σύμβαση', location: 'Remote', desc: 'Εξειδικευμένες γνώσεις αγροτικής αγοράς.' },
            ].map(job => (
              <div key={job.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-agro-200 transition-colors">
                <div className="flex flex-wrap justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900">{job.title}</h3>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs bg-agro-100 text-agro-800 rounded-full px-2.5 py-0.5 font-semibold">{job.type}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 font-semibold">{job.location}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{job.desc}</p>
                <a href="/contact" className="text-sm font-semibold text-agro-700 hover:underline">Εκδήλωση Ενδιαφέροντος →</a>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-400 text-center">Δεν βρήκες κατάλληλη θέση; Στείλε μας το CV σου στο <a href="mailto:careers@agroexchange.gr" className="text-agro-700 underline">careers@agroexchange.gr</a></p>
      </div>
    </StaticPageLayout>
  )
}
