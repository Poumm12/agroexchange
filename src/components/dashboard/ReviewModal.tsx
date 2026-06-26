'use client'
import { useState } from 'react'
import type { Transporter } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { getSupabaseClient } from '@/lib/supabase'
import { Button, StarInput } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { validateText, sanitizeInput } from '@/lib/moderation'
import toast from 'react-hot-toast'

export function ReviewModal({
  transporter,
  onClose,
  onSubmitted,
}: {
  transporter: Transporter
  onClose: () => void
  onSubmitted?: () => void
}) {
  const { user }    = useAuth()
  const supabase    = getSupabaseClient()
  const [rating, setRating]   = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user)        { toast.error('Συνδεθείτε πρώτα'); return }
    if (rating === 0) { toast.error('Επιλέξτε βαθμολογία'); return }
    const check = validateText(comment, { maxLength: 1000 })
    if (!check.ok) { toast.error(check.error!); return }
    setLoading(true)
    const { error } = await supabase.from('reviews').insert({
      reviewer_id:    user.id,
      transporter_id: transporter.id,
      rating,
      comment: sanitizeInput(comment),
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Η κριτική υποβλήθηκε!')
    onSubmitted?.()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <div>
            <div className="font-bold text-gray-900 text-lg font-display">Γράψε Κριτική</div>
            <div className="text-xs text-gray-400">{transporter.user?.full_name}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icons.x className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
              Βαθμολογία
            </label>
            <StarInput value={rating} onChange={setRating} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Σχόλιο
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-agro-500 resize-none"
              rows={3}
              placeholder="Πώς ήταν η εμπειρία σου;"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Υποβολή Κριτικής
          </Button>
        </form>
      </div>
    </div>
  )
}
