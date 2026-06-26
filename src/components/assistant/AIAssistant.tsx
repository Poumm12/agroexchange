'use client'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Icons } from '@/components/ui/Icons'
import { LogoMark } from '@/components/ui/Logo'
import { validateText, sanitizeInput } from '@/lib/moderation'
import type { ChatMessage } from '@/types'
import toast from 'react-hot-toast'

const SUGGESTIONS = [
  'Βοήθεια με αγγελίες',
  'Βοήθεια με μεταφορές',
  'Πώς λειτουργεί η πλατφόρμα;',
  'Πώς βρίσκω αγοραστές;',
]

const GREETING: ChatMessage = {
  role: 'assistant',
  content: 'Γεια σου! Είμαι ο βοηθός του AgroExchange. Πώς μπορώ να σε βοηθήσω σήμερα;',
}

export function AIAssistant() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [showHandoff, setShowHandoff] = useState(false)
  const [handoff, setHandoff] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, open, showHandoff])

  // Prefill handoff from logged-in user
  useEffect(() => {
    if (user) setHandoff(h => ({ ...h, name: h.name || user.full_name, email: h.email || user.email, phone: h.phone || user.phone || '' }))
  }, [user])

  async function sendMessage(text: string) {
    const content = text.trim()
    if (!content || thinking) return
    const next = [...messages, { role: 'user' as const, content }]
    setMessages(next)
    setInput('')
    setThinking(true)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.filter(m => m.role !== 'assistant' || m !== GREETING) }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
      if (data.canHelp === false) setShowHandoff(true)
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Παρουσιάστηκε σφάλμα. Δοκίμασε ξανά ή επικοινώνησε με την υποστήριξη.' }])
      setShowHandoff(true)
    } finally {
      setThinking(false)
    }
  }

  async function submitHandoff(e: React.FormEvent) {
    e.preventDefault()
    if (!handoff.name.trim() || !handoff.email.trim() || !handoff.message.trim()) {
      toast.error('Συμπλήρωσε όνομα, email και μήνυμα')
      return
    }
    // Content moderation on user-entered handoff fields
    const nameCheck = validateText(handoff.name, { required: true, maxLength: 120 })
    if (!nameCheck.ok) { toast.error(nameCheck.error!); return }
    const msgCheck = validateText(handoff.message, { required: true, maxLength: 2000 })
    if (!msgCheck.ok) { toast.error(msgCheck.error!); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    sanitizeInput(handoff.name),
          email:   handoff.email.trim(),
          phone:   sanitizeInput(handoff.phone),
          message: sanitizeInput(handoff.message),
          user_id: user?.id ?? null,
          source: 'ai_assistant',
          ai_transcript: messages,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'error')
      toast.success('Το αίτημα στάλθηκε! Θα επικοινωνήσουμε σύντομα.')
      setShowHandoff(false)
      setMessages(m => [...m, { role: 'assistant', content: 'Ευχαριστώ! Το αίτημά σου καταχωρήθηκε και η ομάδα μας θα επικοινωνήσει μαζί σου σύντομα. 🌱' }])
    } catch {
      toast.error('Κάτι πήγε στραβά. Δοκίμασε ξανά.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Άνοιγμα βοηθού AgroExchange"
          className="fixed bottom-5 right-5 z-[200] w-14 h-14 rounded-full bg-agro-700 hover:bg-agro-800 text-white shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95">
          <Icons.sparkles className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white live-dot" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 z-[200] sm:w-[380px] sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-green-800 to-green-700 p-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <LogoMark size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm">Βοηθός AgroExchange</div>
              <div className="text-green-200 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full live-dot" /> Online
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Κλείσιμο"
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <Icons.x className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-agro-700 text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick suggestions (only at start) */}
            {messages.length === 1 && !thinking && (
              <div className="space-y-2 pt-2">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white border border-gray-100 text-sm text-gray-700 hover:border-agro-300 hover:bg-agro-50 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Admin handoff form */}
            {showHandoff && (
              <form onSubmit={submitHandoff} className="bg-white rounded-2xl border border-agro-200 p-4 space-y-2.5">
                <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <Icons.mail className="w-4 h-4 text-agro-600" /> Θέλετε να επικοινωνήσουμε μαζί σας;
                </div>
                <input className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-agro-500"
                  placeholder="Όνομα" value={handoff.name} onChange={e => setHandoff(h => ({ ...h, name: e.target.value }))} />
                <input type="email" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-agro-500"
                  placeholder="Email" value={handoff.email} onChange={e => setHandoff(h => ({ ...h, email: e.target.value }))} />
                <input type="tel" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-agro-500"
                  placeholder="Τηλέφωνο (προαιρετικό)" value={handoff.phone} onChange={e => setHandoff(h => ({ ...h, phone: e.target.value }))} />
                <textarea rows={2} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-agro-500 resize-none"
                  placeholder="Το μήνυμά σου" value={handoff.message} onChange={e => setHandoff(h => ({ ...h, message: e.target.value }))} />
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting}
                    className="flex-1 bg-agro-700 text-white font-semibold py-2 rounded-xl text-sm hover:bg-agro-800 disabled:opacity-50 transition-colors">
                    {submitting ? 'Αποστολή...' : 'Αποστολή Αιτήματος'}
                  </button>
                  <button type="button" onClick={() => setShowHandoff(false)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">
                    Άκυρο
                  </button>
                </div>
              </form>
            )}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <form onSubmit={e => { e.preventDefault(); sendMessage(input) }}
            className="p-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
            <input
              className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-agro-500"
              placeholder="Γράψε το ερώτημά σου..."
              value={input} onChange={e => setInput(e.target.value)} />
            <button type="submit" disabled={!input.trim() || thinking}
              aria-label="Αποστολή"
              className="w-10 h-10 rounded-xl bg-agro-700 text-white flex items-center justify-center hover:bg-agro-800 disabled:opacity-50 transition-colors flex-shrink-0">
              <Icons.send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
