'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { useLocale } from '@/context/LocaleContext'
import { AuthModal } from '@/components/auth/AuthModal'
import { Icons } from '@/components/ui/Icons'
import { Button } from '@/components/ui'
import { Logo } from '@/components/ui/Logo'
import { LOCALES } from '@/lib/translations'
import { FlagGR, FlagGB } from '@/components/ui/Flags'
import toast from 'react-hot-toast'

interface NavbarProps {
  view: 'landing' | 'dashboard'
  setView: React.Dispatch<React.SetStateAction<'landing' | 'dashboard'>>
  navigateTo: (tab: string) => void
}

interface NavItem {
  id: string
  tKey: string
  tab: string
  dropdown?: { tKey: string; tab: string; action?: string }[]
  badge?: 'soon'
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home',     tKey: 'nav.home',     tab: 'home' },
  { id: 'market',   tKey: 'nav.market',   tab: 'market', dropdown: [
    { tKey: 'market.all',    tab: 'market' },
    { tKey: 'market.wheat',  tab: 'market' },
    { tKey: 'market.corn',   tab: 'market' },
    { tKey: 'market.cotton', tab: 'market' },
  ]},
  { id: 'listings', tKey: 'nav.listings', tab: 'listings', dropdown: [
    { tKey: 'listings.all',    tab: 'listings' },
    { tKey: 'listings.create', tab: 'listings', action: 'create' },
    { tKey: 'listings.mine',   tab: 'listings', action: 'mine' },
  ]},
  { id: 'transport',tKey: 'nav.transport',tab: 'transport', dropdown: [
    { tKey: 'transport.search', tab: 'transport' },
    { tKey: 'transport.new',    tab: 'transport' },
    { tKey: 'transport.mine',   tab: 'transport' },
  ]},
  { id: 'map',      tKey: 'nav.map',      tab: 'map' },
  { id: 'insurance',tKey: 'nav.insurance',tab: 'insurance', badge: 'soon' },
  { id: 'weather',  tKey: 'nav.weather',  tab: 'weather' },
  { id: 'offers',   tKey: 'nav.offers',   tab: 'offers' },
  { id: 'notifs',   tKey: 'nav.notifs',   tab: 'notifs' },
  { id: 'news',     tKey: 'nav.news',     tab: 'news' },
  { id: 'ranking',  tKey: 'nav.ranking',  tab: 'ranking' },
]

export function Navbar({ view, setView, navigateTo }: NavbarProps) {
  const { user, signOut }       = useAuth()
  const { unreadCount }         = useNotifications(user?.id)
  const { locale, setLocale, t } = useLocale()
  const [scrolled, setScrolled] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showLang, setShowLang] = useState(false)
  const [openDrop, setOpenDrop] = useState<string | null>(null)
  const dropTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLanding = view === 'landing'
  const transparent = isLanding && !scrolled

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const handler = () => setShowAuth(true)
    window.addEventListener('open-auth', handler)
    return () => window.removeEventListener('open-auth', handler)
  }, [])

  useEffect(() => {
    if (!showMenu && !showLang) return
    const fn = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (!el.closest('[data-user-menu]')) setShowMenu(false)
      if (!el.closest('[data-lang-menu]')) setShowLang(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [showMenu, showLang])

  async function handleSignOut() {
    setShowMenu(false)
    await signOut()
    toast.success('Αποσυνδεθήκατε')
    setView('landing')
  }

  function goTo(tab: string) {
    if (tab === 'insurance') { toast('Οι ασφάλειες έρχονται σύντομα!', { icon: '🛡️' }); return }
    navigateTo(tab)
    setOpenDrop(null)
  }

  function enterDrop(id: string) {
    if (dropTimer.current) clearTimeout(dropTimer.current)
    setOpenDrop(id)
  }
  function leaveDrop() {
    dropTimer.current = setTimeout(() => setOpenDrop(null), 150)
  }

  const navBg = transparent
    ? 'bg-transparent border-transparent'
    : 'bg-white/96 backdrop-blur-xl border-b border-gray-100 shadow-sm'

  // Center nav only shows on the dashboard view (landing keeps a clean hero)
  // The dashboard tab navigation lives in <DashboardNav/> (rendered just
  // below the top bar). The top Navbar therefore does NOT render its own
  // center nav in dashboard view — that would duplicate DashboardNav.
  const showCenterNav = false

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-4 sm:px-6 ${navBg}`}
        role="navigation" aria-label="Κύρια πλοήγηση">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <button onClick={() => setView('landing')} className="flex-shrink-0" aria-label="AgroExchange αρχική">
            <Logo size={30} theme={transparent ? 'light' : 'dark'} />
          </button>

          {/* Center navigation (dashboard only, desktop) */}
          {showCenterNav && (
            <div className="hidden xl:flex items-center gap-0.5 flex-1 justify-center">
              {NAV_ITEMS.map(item => (
                <div key={item.id} className="relative"
                  onMouseEnter={() => item.dropdown && enterDrop(item.id)}
                  onMouseLeave={() => item.dropdown && leaveDrop()}>
                  <button
                    onClick={() => goTo(item.tab)}
                    className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-[13px] font-medium text-gray-600 hover:text-agro-800 hover:bg-agro-50 transition-colors whitespace-nowrap">
                    {t(item.tKey)}
                    {item.badge === 'soon' && (
                      <span className="text-[8px] bg-amber-100 text-amber-700 rounded px-1 py-0.5 font-bold uppercase">Σύντομα</span>
                    )}
                    {item.id === 'notifs' && unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    {item.dropdown && <Icons.chevronDown className="w-3 h-3 text-gray-400" />}
                  </button>

                  {item.dropdown && openDrop === item.id && (
                    <div className="dropdown-enter absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                      {item.dropdown.map(d => (
                        <button key={d.tKey}
                          onClick={() => goTo(d.tab)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-agro-50 hover:text-agro-800 transition-colors">
                          {t(d.tKey)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Right cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

            {/* Language selector (between notifications and profile) */}
            {user && (
              <>
                <button onClick={() => navigateTo('notifs')}
                  aria-label={`Ειδοποιήσεις${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                  className={`relative p-2 rounded-xl transition-colors xl:hidden ${transparent ? 'text-white hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <Icons.bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Language dropdown */}
            <div className="relative" data-lang-menu>
              <button onClick={() => setShowLang(p => !p)}
                aria-label="Επιλογή γλώσσας" aria-haspopup="true" aria-expanded={showLang}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-sm font-medium transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}>
                {locale === 'el'
                  ? <FlagGR className="w-5 h-[14px] rounded-sm shadow-sm" />
                  : <FlagGB className="w-5 h-[14px] rounded-sm shadow-sm" />}
                <Icons.chevronDown className={`w-3 h-3 transition-transform ${showLang ? 'rotate-180' : ''}`} />
              </button>
              {showLang && (
                <div data-lang-menu className="dropdown-enter absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                  {LOCALES.map(l => (
                    <button key={l.code}
                      onClick={() => { setLocale(l.code); setShowLang(false) }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${l.code === locale ? 'bg-agro-50 text-agro-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {l.code === 'el'
                        ? <FlagGR className="w-5 h-[14px] rounded-sm shadow-sm flex-shrink-0" />
                        : <FlagGB className="w-5 h-[14px] rounded-sm shadow-sm flex-shrink-0" />}
                      {l.label}
                      {l.code === locale && <Icons.check className="w-3.5 h-3.5 ml-auto text-agro-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="relative" data-user-menu>
                <button data-user-menu onClick={() => setShowMenu(p => !p)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-haspopup="true" aria-expanded={showMenu}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-agro-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {user.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                  <span className={`text-sm font-medium hidden sm:block ${transparent ? 'text-white' : 'text-gray-700'}`}>
                    {user.full_name?.split(' ')[0] ?? 'Χρήστης'}
                  </span>
                  <Icons.chevronDown className={`w-3 h-3 hidden sm:block transition-transform ${showMenu ? 'rotate-180' : ''} ${transparent ? 'text-white/60' : 'text-gray-400'}`} />
                </button>

                {showMenu && (
                  <div data-user-menu role="menu" className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <div className="font-semibold text-gray-900 text-sm truncate">{user.full_name}</div>
                      <div className="text-xs text-gray-400 truncate">{user.email}</div>
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] bg-agro-100 text-agro-800 rounded-full px-2 py-0.5 font-semibold">Trust {user.trust_score}/100</span>
                        {user.verified && <span className="text-[10px] bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-semibold">✓ Verified</span>}
                      </div>
                    </div>
                    {[
                      { icon: Icons.home,    label: t('nav.dashboard'), action: () => navigateTo('home')     },
                      { icon: Icons.user,    label: t('nav.profile'),   action: () => navigateTo('profile')  },
                      { icon: Icons.list,    label: t('nav.listings'),  action: () => navigateTo('listings') },
                      { icon: Icons.message, label: t('nav.messages'),  action: () => navigateTo('messages') },
                      { icon: Icons.euro,    label: t('nav.offers'),    action: () => navigateTo('offers')   },
                    ].map(item => (
                      <button key={item.label} role="menuitem"
                        onClick={() => { item.action(); setShowMenu(false) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <item.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />{item.label}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 my-1" />
                    <button role="menuitem" onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-b-2xl">
                      <Icons.logout className="w-4 h-4" />{t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm"
                  className={transparent ? '!text-white !border-white/30 hover:!bg-white/10' : ''}
                  onClick={() => setShowAuth(true)}>
                  {t('nav.login')}
                </Button>
                <Button variant="primary" size="sm" onClick={() => setShowAuth(true)}>
                  <span className="hidden sm:inline">{t('nav.register')}</span>
                  <span className="sm:hidden">{t('nav.register')}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
