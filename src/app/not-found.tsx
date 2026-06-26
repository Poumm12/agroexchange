import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '404 – Σελίδα δεν βρέθηκε | AgroExchange' }

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-agro-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-agro-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4z"/>
          </svg>
        </div>
        <h1 className="font-display font-extrabold text-gray-900 text-5xl mb-2 tracking-tight">404</h1>
        <h2 className="font-display font-bold text-gray-700 text-xl mb-3">Η σελίδα δεν βρέθηκε</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Η σελίδα που ψάχνεις δεν υπάρχει ή μετακινήθηκε.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/"
            className="inline-flex items-center gap-2 bg-agro-800 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-agro-900 transition-colors">
            Αρχική Σελίδα
          </Link>
          <Link href="/help"
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            Βοήθεια
          </Link>
        </div>
      </div>
    </div>
  )
}
