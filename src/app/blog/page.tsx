import type { Metadata } from 'next'
import { StaticPageLayout } from '@/components/layout/StaticPageLayout'

export const metadata: Metadata = {
  title: 'Blog – AgroExchange',
  description: 'Άρθρα, νέα και ενημερώσεις από την ομάδα AgroExchange.',
}

const POSTS = [
  { title: 'Πώς να αξιοποιήσεις καλύτερα τις αγγελίες στο AgroExchange', date: 'Ιούνιος 2025', cat: 'Οδηγός', mins: 4, excerpt: 'Χρήσιμες συμβουλές για παραγωγούς που θέλουν να μεγιστοποιήσουν τις πωλήσεις τους.' },
  { title: 'Τάσεις τιμών σιτηρών: Τι να περιμένεις το 2025', date: 'Μάιος 2025', cat: 'Αγορά', mins: 6, excerpt: 'Ανάλυση των τάσεων στις τιμές σιταριού, καλαμποκιού και κριθαριού για το 2025.' },
  { title: 'ΕΣΠΑ 2025: Ποιες επιδοτήσεις αφορούν τους αγρότες', date: 'Απρίλιος 2025', cat: 'Επιδοτήσεις', mins: 8, excerpt: 'Πλήρης οδηγός για τα διαθέσιμα προγράμματα επιδότησης για αγροτικές επιχειρήσεις.' },
]

const CAT_COLORS: Record<string,string> = {
  'Οδηγός': 'bg-blue-100 text-blue-700',
  'Αγορά':  'bg-agro-100 text-agro-800',
  'Επιδοτήσεις': 'bg-amber-100 text-amber-700',
}

export default function BlogPage() {
  return (
    <StaticPageLayout title="Blog" subtitle="Άρθρα για παραγωγούς, αγοραστές και την αγροτική αγορά">
      <div className="space-y-5">
        {POSTS.map(post => (
          <div key={post.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-agro-200 hover:-translate-y-0.5 transition-all">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${CAT_COLORS[post.cat] ?? 'bg-gray-100 text-gray-600'}`}>{post.cat}</span>
              <span className="text-xs text-gray-400">{post.date}</span>
              <span className="text-xs text-gray-400">{post.mins} λεπτά ανάγνωση</span>
            </div>
            <h2 className="font-display font-bold text-gray-900 text-lg mb-2 leading-tight">{post.title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{post.excerpt}</p>
            <span className="text-sm font-semibold text-agro-700 cursor-not-allowed opacity-50">Διάβασε περισσότερα → (Σύντομα)</span>
          </div>
        ))}
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Περισσότερα άρθρα έρχονται σύντομα.</p>
        </div>
      </div>
    </StaticPageLayout>
  )
}
