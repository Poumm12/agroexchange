'use client'
import { Icons } from '@/components/ui/Icons'
import { useNotifications } from '@/hooks/useNotifications'
import { useConversations } from '@/hooks/useMessages'
import { useAuth } from '@/hooks/useAuth'
import { useLocale } from '@/context/LocaleContext'

// Order per Phase A spec, with Messages added after Offers:
// Αρχική, Αγορά, Αγγελίες, Μεταφορές, Ασφάλειες, Καιρός, Προσφορές, Μηνύματα, Ειδοποιήσεις, Νέα, Κατάταξη
const TABS = [
  { id: 'home',      Icon: Icons.home,      tKey: 'nav.home'      },
  { id: 'market',    Icon: Icons.trendUp,   tKey: 'nav.market'    },
  { id: 'listings',  Icon: Icons.list,      tKey: 'nav.listings'  },
  { id: 'transport', Icon: Icons.truck,     tKey: 'nav.transport' },
  { id: 'map',       Icon: Icons.pin,       tKey: 'nav.map'       },
  { id: 'insurance', Icon: Icons.umbrella,  tKey: 'nav.insurance', soon: true },
  { id: 'weather',   Icon: Icons.sun,       tKey: 'nav.weather'   },
  { id: 'offers',    Icon: Icons.euro,      tKey: 'nav.offers'    },
  { id: 'messages',  Icon: Icons.message,   tKey: 'nav.messages'  },
  { id: 'notifs',    Icon: Icons.bell,      tKey: 'nav.notifs'    },
  { id: 'news',      Icon: Icons.newspaper, tKey: 'nav.news'      },
  { id: 'ranking',   Icon: Icons.trophy,    tKey: 'nav.ranking'   },
  { id: 'profile',   Icon: Icons.user,      tKey: 'nav.profile'   },
]

export function DashboardNav({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const { user }        = useAuth()
  const { unreadCount } = useNotifications(user?.id)
  const { totalUnread } = useConversations(user?.id)
  const { t }           = useLocale()

  function badgeFor(id: string): number {
    if (id === 'notifs')   return unreadCount
    if (id === 'messages') return totalUnread
    return 0
  }

  return (
    <div className="border-b border-gray-100 bg-white overflow-x-auto scrollbar-thin"
      role="tablist" aria-label="Dashboard πλοήγηση">
      <div className="max-w-screen-xl mx-auto px-2 flex min-w-max">
        {TABS.map(item => {
          const badge = badgeFor(item.id)
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-3.5 text-[13px] font-medium whitespace-nowrap transition-all border-b-2 -mb-px flex-shrink-0 ${
                tab === item.id
                  ? 'text-agro-800 border-agro-700 font-semibold'
                  : 'text-gray-500 border-transparent hover:text-agro-700 hover:border-agro-200'
              }`}>
              <item.Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{t(item.tKey)}</span>
              {item.soon && (
                <span className="text-[8px] bg-amber-100 text-amber-700 rounded px-1 py-0.5 font-bold uppercase hidden sm:inline">Σύντομα</span>
              )}
              {badge > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
