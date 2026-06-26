'use client'
import { Icons } from '@/components/ui/Icons'
import { Logo } from '@/components/ui/Logo'

interface FooterProps {
  navigateTo: (tab: string) => void
  onCta: () => void
  isLoggedIn: boolean
}

const FOOTER_LINKS = {
  'Πλατφόρμα': [
    { label: 'Αγγελίες',     tab: 'listings'  },
    { label: 'Τιμές Αγοράς', tab: 'market'    },
    { label: 'Μεταφορές',    tab: 'transport' },
    { label: 'Ασφάλειες',    tab: 'insurance' },
    { label: 'Νέα',          tab: 'news'      },
  ],
  'Εταιρεία': [
    { label: 'Για εμάς',   href: '/about'   },
    { label: 'Καριέρα',   href: '/careers' },
    { label: 'Blog',       href: '/blog'    },
    { label: 'Επικοινωνία', href: '/contact' },
  ],
  'Υποστήριξη': [
    { label: 'Κέντρο Βοήθειας', href: '/help'     },
    { label: 'Κανόνες',         href: '/terms'    },
    { label: 'Απόρρητο',        href: '/privacy'  },
    { label: 'Ασφάλεια',        href: '/security' },
  ],
}

export function Footer({ navigateTo, onCta, isLoggedIn }: FooterProps) {
  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* CTA */}
      <div className="border-b border-white/8 py-16 sm:py-20 px-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-agro-700 to-agro-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-agro-900/30">
          <Icons.wheat className="w-8 h-8 text-green-300" />
        </div>
        {isLoggedIn ? (
          <>
            <h2 className="font-display font-extrabold text-white text-2xl sm:text-3xl tracking-tight mb-3">
              Καλωσόρισες στο AgroExchange
            </h2>
            <p className="text-gray-400 mb-8 text-sm sm:text-base">Δες τις πιο πρόσφατες αγγελίες ή δημιούργησε τη δική σου.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => navigateTo('listings')}
                className="inline-flex items-center gap-2 bg-agro-700 hover:bg-agro-800 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[.98]">
                <Icons.list className="w-4 h-4" /> Δες Αγγελίες
              </button>
              <button onClick={() => navigateTo('listings')}
                className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[.98]">
                <Icons.plus className="w-4 h-4" /> Νέα Αγγελία
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display font-extrabold text-white text-2xl sm:text-3xl tracking-tight mb-3">
              Έτοιμος να ξεκινήσεις;
            </h2>
            <p className="text-gray-400 mb-8 text-sm sm:text-base">Δωρεάν εγγραφή · Χωρίς πιστωτική κάρτα · Έτοιμο σε 2 λεπτά</p>
            <button onClick={onCta}
              className="inline-flex items-center gap-2 bg-agro-700 hover:bg-agro-800 text-white font-bold px-8 py-3.5 rounded-2xl text-base transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[.98] shadow-lg shadow-agro-900/30">
              Δημιουργία Δωρεάν Λογαριασμού →
            </button>
          </>
        )}
      </div>

      {/* Links grid */}
      <div className="max-w-screen-xl mx-auto px-6 py-10 sm:py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="col-span-2 sm:col-span-1">
          <div className="mb-4">
            <Logo size={28} theme="light" />
          </div>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Η ψηφιακή αγορά αγροτικών προϊόντων για παραγωγούς, αγοραστές και μεταφορείς.
          </p>
          <div className="text-xs text-gray-600">Αθήνα, Ελλάδα 🇬🇷</div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <div className="font-semibold text-white text-sm mb-4">{title}</div>
            {links.map(link => (
              <div key={link.label} className="mb-2.5">
                {'tab' in link ? (
                  <button
                    onClick={() => navigateTo((link as any).tab)}
                    className="text-gray-500 text-sm hover:text-green-400 transition-colors text-left">
                    {link.label}
                  </button>
                ) : (
                  <a href={(link as any).href}
                    className="text-gray-500 text-sm hover:text-green-400 transition-colors">
                    {link.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-white/6 px-6 py-4 max-w-screen-xl mx-auto flex flex-wrap justify-between gap-2 text-xs text-gray-600">
        <span>© {new Date().getFullYear()} AgroExchange. Με επιφύλαξη παντός δικαιώματος.</span>
        <div className="flex gap-4">
          <a href="/terms"   className="hover:text-gray-400 transition-colors">Όροι</a>
          <a href="/privacy" className="hover:text-gray-400 transition-colors">Απόρρητο</a>
        </div>
      </div>
    </footer>
  )
}
