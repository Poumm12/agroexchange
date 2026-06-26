'use client'
import { useState } from 'react'
import type { Listing } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useOffers } from '@/hooks/useOffers'
import { Button, Input } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { validateText, sanitizeInput } from '@/lib/moderation'
import { getUnit } from '@/lib/units'
import toast from 'react-hot-toast'

export function OfferModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { user } = useAuth()
  const { createOffer } = useOffers(user?.id)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ price_per_ton: String(listing.price_per_ton), quantity_tons: String(listing.quantity_tons), message: '' })
  const unit = listing.measurement_unit

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { toast.error('Συνδεθείτε πρώτα'); return }
    const msgCheck = validateText(form.message, { maxLength: 1000 })
    if (!msgCheck.ok) { toast.error(msgCheck.error!); return }
    setLoading(true)
    const { error } = await createOffer({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.user_id,
      price_per_ton: Number(form.price_per_ton),
      quantity_tons: Number(form.quantity_tons),
      measurement_unit: unit,
      message: sanitizeInput(form.message),
      status: 'pending',
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Η προσφορά εστάλη!')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <div>
            <div className="font-bold text-gray-900 text-lg font-display">Αποστολή Προσφοράς</div>
            <div className="text-xs text-gray-400">{listing.title}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Κλείσιμο"><Icons.x className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input label={`Τιμή ανά ${getUnit(unit).perLabel} (€)`} type="number" step="0.01" value={form.price_per_ton} onChange={e => setForm(p => ({ ...p, price_per_ton: e.target.value }))} required />
          <Input label={`Ποσότητα (${getUnit(unit).short})`} type="number" step="0.1" value={form.quantity_tons} onChange={e => setForm(p => ({ ...p, quantity_tons: e.target.value }))} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Μήνυμα (προαιρετικό)</label>
            <textarea className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-agro-500 resize-none" rows={3}
              placeholder="Γράψε ένα σύντομο μήνυμα..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
          </div>
          <div className="bg-agro-50 rounded-xl p-3 text-sm text-agro-800 font-semibold">
            Συνολική αξία: €{(Number(form.price_per_ton) * Number(form.quantity_tons)).toLocaleString('el-GR', { minimumFractionDigits: 2 })}
          </div>
          <Button type="submit" loading={loading} className="w-full">Αποστολή Προσφοράς</Button>
        </form>
      </div>
    </div>
  )
}
