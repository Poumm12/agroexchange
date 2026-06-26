'use client'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Card, Button, Spinner } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { formatDistanceToNow } from 'date-fns'
import { el } from 'date-fns/locale'

const TYPE_META: Record<string, { icon: any; bg: string; fg: string }> = {
  offer:     { icon: Icons.euro,     bg: 'bg-blue-100',   fg: 'text-blue-700'   },
  message:   { icon: Icons.message,  bg: 'bg-agro-100',   fg: 'text-agro-700'   },
  deal:      { icon: Icons.check,    bg: 'bg-green-100',  fg: 'text-green-700'  },
  review:    { icon: Icons.star,     bg: 'bg-amber-100',  fg: 'text-amber-700'  },
  news:      { icon: Icons.newspaper,bg: 'bg-purple-100', fg: 'text-purple-700' },
  market:    { icon: Icons.trendUp,  bg: 'bg-teal-100',   fg: 'text-teal-700'   },
  transport: { icon: Icons.truck,    bg: 'bg-orange-100', fg: 'text-orange-700' },
  system:    { icon: Icons.zap,      bg: 'bg-gray-100',   fg: 'text-gray-600'   },
}

// Demo notifications shown when DB is empty or user not logged in
const DEMO = [
  { id:'d1', type:'offer',     title:'Νέα Προσφορά',    message:'Λάβατε νέα προσφορά για το Σκληρό Σιτάρι από τον Νίκο Α.',     read: false, created_at: new Date(Date.now()-2*60000).toISOString() },
  { id:'d2', type:'market',    title:'Αγορά',           message:'Ο δείκτης ελαιολάδου ανέβηκε 3% σήμερα',                        read: false, created_at: new Date(Date.now()-15*60000).toISOString() },
  { id:'d3', type:'transport', title:'Μεταφορά',        message:'Ο μεταφορέας Παπαδόπουλος επιβεβαίωσε την παραγγελία σας',       read: true,  created_at: new Date(Date.now()-60*60000).toISOString() },
  { id:'d4', type:'news',      title:'Νέα',             message:'Νέο πρόγραμμα ΕΣΠΑ 2025 διαθέσιμο για αγρότες',               read: false, created_at: new Date(Date.now()-3*3600000).toISOString() },
  { id:'d5', type:'deal',      title:'Ολοκλήρωση Deal', message:'Η πώληση σιταριού 80 τόνων ολοκληρώθηκε επιτυχώς',             read: true,  created_at: new Date(Date.now()-24*3600000).toISOString() },
  { id:'d6', type:'system',    title:'Σύστημα',         message:'Νέος κανονισμός ΕΕ για φυτοφάρμακα ισχύει από 1/9/2025',       read: true,  created_at: new Date(Date.now()-48*3600000).toISOString() },
]

function safeFormatDistance(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: el })
  } catch {
    return ''
  }
}

export function NotificationsTab() {
  const { user }                                            = useAuth()
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications(user?.id)

  const items = notifications.length > 0 ? notifications : (DEMO as any[])
  const unread = notifications.length > 0 ? unreadCount : DEMO.filter(n => !n.read).length
  const isDemo = notifications.length === 0

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-extrabold text-gray-900 text-xl tracking-tight">Ειδοποιήσεις</h2>
          {unread > 0
            ? <p className="text-sm text-gray-500 mt-0.5">{unread} μη αναγνωσμένες</p>
            : <p className="text-sm text-gray-500 mt-0.5">Όλες αναγνωσμένες</p>
          }
        </div>
        {unread > 0 && !isDemo && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <Icons.check className="w-3.5 h-3.5" /> Σήμανση όλων ως αναγνωσμένα
          </Button>
        )}
      </div>

      {/* Demo banner */}
      {isDemo && user && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 flex items-center gap-2">
          <Icons.alert className="w-3.5 h-3.5 flex-shrink-0" />
          Δεν υπάρχουν πραγματικές ειδοποιήσεις ακόμη. Παρακάτω εμφανίζονται demo παραδείγματα.
        </div>
      )}

      {/* Notification list */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Icons.bell className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="font-semibold text-gray-600">Δεν υπάρχουν ειδοποιήσεις</p>
          <p className="text-sm mt-1">Θα ειδοποιηθείς για νέες προσφορές, deals και νέα</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(n => {
            const meta = TYPE_META[n.type] ?? TYPE_META.system
            const IconComp = meta.icon
            return (
              <div
                key={n.id}
                onClick={() => !isDemo && !n.read && markRead(n.id)}
                className={`flex gap-3 p-4 rounded-2xl border transition-all ${
                  n.read
                    ? 'bg-white border-gray-100 cursor-default'
                    : 'bg-white border-agro-200 shadow-sm cursor-pointer hover:bg-agro-50'
                }`}
                role={!isDemo && !n.read ? 'button' : undefined}
                aria-label={!n.read ? 'Σήμανση ως αναγνωσμένο' : undefined}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.fg}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${n.read ? 'font-medium text-gray-600' : 'font-bold text-gray-900'}`}>
                    {n.message}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Icons.calendar className="w-3 h-3 flex-shrink-0" />
                    {safeFormatDistance(n.created_at)}
                  </div>
                </div>
                {!n.read && (
                  <div className="w-2.5 h-2.5 bg-agro-600 rounded-full mt-1.5 flex-shrink-0" aria-hidden="true" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
