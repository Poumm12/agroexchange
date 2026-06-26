import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Email Επιβεβαιώθηκε – AgroExchange',
}

export default function EmailConfirmedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 to-green-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-agro-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-agro-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z"/>
            </svg>
          </div>
          <span className="font-display font-extrabold text-gray-900 text-lg tracking-tight">AGRO<span className="text-agro-700">EXCHANGE</span></span>
        </div>
        <h1 className="font-display font-extrabold text-gray-900 text-2xl mb-2">
          Η επιβεβαίωση ολοκληρώθηκε!
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-7">
          Το email σου επιβεβαιώθηκε επιτυχώς. Μπορείς τώρα να συνδεθείς και να αρχίσεις να χρησιμοποιείς το AgroExchange.
        </p>
        <Link href="/"
          className="inline-flex items-center justify-center gap-2 w-full bg-agro-800 text-white font-bold py-3 rounded-xl hover:bg-agro-900 transition-colors text-sm">
          Είσοδος στην Πλατφόρμα
        </Link>
        <p className="text-xs text-gray-400 mt-4">
          Αν δεν μπορείς να συνδεθείς, <a href="/contact" className="text-agro-700 underline">επικοινώνησε μαζί μας</a>.
        </p>
      </div>
    </div>
  )
}
