'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useConversations, useThread } from '@/hooks/useMessages'
import { Spinner } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { validateText, sanitizeInput } from '@/lib/moderation'
import { formatDistanceToNow } from 'date-fns'
import { el } from 'date-fns/locale'
import type { Conversation } from '@/types'
import toast from 'react-hot-toast'

function timeAgo(d: string) {
  try { return formatDistanceToNow(new Date(d), { addSuffix: true, locale: el }) } catch { return '' }
}

function Thread({ conversation, userId, onBack }: { conversation: Conversation; userId: string; onBack: () => void }) {
  const { messages, loading, send } = useThread(conversation.id, userId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const other = conversation.other_user

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !other) return
    const check = validateText(text, { maxLength: 2000 })
    if (!check.ok) { toast.error(check.error!); return }
    setSending(true)
    await send(other.id, sanitizeInput(text))
    setText('')
    setSending(false)
  }

  return (
    <div className="flex flex-col h-[70vh] sm:h-[600px]">
      {/* Thread header */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-100">
        <button onClick={onBack} className="sm:hidden p-1.5 rounded-lg hover:bg-gray-100" aria-label="Πίσω">
          <Icons.chevronRight className="w-5 h-5 rotate-180 text-gray-500" />
        </button>
        {other?.avatar_url ? (
          <img src={other.avatar_url} alt={other.full_name} className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-agro-700 text-white text-sm font-bold flex items-center justify-center">
            {other?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
        )}
        <div className="min-w-0">
          <a href={`/user/${other?.id}`} className="font-semibold text-gray-900 text-sm truncate hover:text-agro-700 block">
            {other?.full_name ?? 'Χρήστης'}
          </a>
          <div className="text-xs text-gray-400">Trust {other?.trust_score ?? '—'}/100</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <Icons.message className="w-10 h-10 mx-auto mb-2 opacity-30" />
            Ξεκίνα τη συζήτηση
          </div>
        ) : messages.map(m => {
          const mine = m.sender_id === userId
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                mine ? 'bg-agro-700 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                <div className="whitespace-pre-wrap break-words">{m.body}</div>
                <div className={`text-[10px] mt-1 flex items-center gap-1 ${mine ? 'text-white/60 justify-end' : 'text-gray-400'}`}>
                  {timeAgo(m.created_at)}
                  {mine && m.read && <Icons.check className="w-3 h-3" />}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2">
        <input
          className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-agro-500"
          placeholder="Γράψε μήνυμα..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit" disabled={!text.trim() || sending}
          className="px-4 py-2.5 rounded-xl bg-agro-700 text-white font-semibold text-sm hover:bg-agro-800 disabled:opacity-50 transition-colors flex items-center gap-1.5">
          {sending ? <span className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin" /> : <Icons.message className="w-4 h-4" />}
          <span className="hidden sm:inline">Αποστολή</span>
        </button>
      </form>
    </div>
  )
}

export function MessagesTab({ initialConversationId }: { initialConversationId?: string }) {
  const { user } = useAuth()
  const { conversations, loading } = useConversations(user?.id)
  const [activeId, setActiveId] = useState<string | null>(initialConversationId ?? null)

  useEffect(() => {
    if (initialConversationId) setActiveId(initialConversationId)
  }, [initialConversationId])

  const active = conversations.find(c => c.id === activeId) ?? null

  if (!user) return null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-extrabold text-gray-900 text-xl tracking-tight">Μηνύματα</h2>
        <p className="text-sm text-gray-500 mt-0.5">Επικοινωνία με άλλους χρήστες</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 sm:grid-cols-3">
        {/* Conversation list */}
        <div className={`sm:col-span-1 border-r border-gray-100 ${active ? 'hidden sm:block' : ''}`}>
          <div className="p-3 border-b border-gray-100 font-semibold text-gray-700 text-sm">
            Συνομιλίες {conversations.length > 0 && `(${conversations.length})`}
          </div>
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4 text-gray-400">
                <Icons.message className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium text-gray-500">Καμία συνομιλία</p>
                <p className="text-xs mt-1">Ξεκίνα συζήτηση από ένα προφίλ ή αγγελία</p>
              </div>
            ) : conversations.map(c => (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${activeId === c.id ? 'bg-agro-50' : ''}`}>
                {c.other_user?.avatar_url ? (
                  <img src={c.other_user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-agro-700 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {c.other_user?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900 text-sm truncate">{c.other_user?.full_name ?? 'Χρήστης'}</span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(c.last_message_at)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-500 truncate">{c.last_message || 'Νέα συνομιλία'}</span>
                    {(c.unread_count ?? 0) > 0 && (
                      <span className="bg-agro-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active thread */}
        <div className={`sm:col-span-2 ${!active ? 'hidden sm:flex sm:items-center sm:justify-center' : ''}`}>
          {active ? (
            <Thread conversation={active} userId={user.id} onBack={() => setActiveId(null)} />
          ) : (
            <div className="text-center py-20 text-gray-400">
              <Icons.message className="w-12 h-12 mx-auto mb-3 opacity-25" />
              <p className="text-sm">Επίλεξε μια συνομιλία</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
