import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function StaticPageLayout({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-screen-lg mx-auto flex items-center gap-3">
          <Link href="/" aria-label="AgroExchange αρχική">
            <Logo size={26} theme="dark" />
          </Link>
          <span className="text-gray-300 text-sm">/</span>
          <span className="text-gray-500 text-sm">{title}</span>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-10 sm:py-14">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="font-display font-extrabold text-gray-900 text-3xl sm:text-4xl tracking-tight mb-3">{title}</h1>
          {subtitle && <p className="text-gray-500 text-base sm:text-lg max-w-2xl">{subtitle}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-lg mx-auto px-6 py-10 sm:py-14">
        {children}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-white px-6 py-6 mt-10">
        <div className="max-w-screen-lg mx-auto flex flex-wrap gap-4 justify-between items-center text-sm text-gray-400">
          <span>© {new Date().getFullYear()} AgroExchange</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-agro-700 transition-colors">Αρχική</Link>
            <Link href="/terms" className="hover:text-agro-700 transition-colors">Όροι</Link>
            <Link href="/privacy" className="hover:text-agro-700 transition-colors">Απόρρητο</Link>
            <Link href="/contact" className="hover:text-agro-700 transition-colors">Επικοινωνία</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
