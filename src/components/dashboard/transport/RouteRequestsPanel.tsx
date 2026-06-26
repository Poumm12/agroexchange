'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouteRequests } from '@/hooks/useTransport'
import { getOrCreateConversation } from '@/hooks/useMessages'
import { Card, Button, Input, Spinner } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { validateText, sanitizeInput } from '@/lib/moderation'
import { UNITS, DEFAULT_UNIT, getUnit, formatQuantity, type MeasurementUnit } from '@/lib/units'
import { formatDistanceToNow } from 'date-fns'
import { el } from 'date-fns/locale'
import toast from 'react-hot-toast'

export function RouteRequestsPanel({ prefillFrom = '', prefillTo = '' }: { prefillFrom?: string; prefillTo?: string }) {
  const { user } = useAuth()
  const { requests, loading, createRequest } = useRouteRequests()
  const [showForm, setShowForm] = useState(Boolean(prefillFrom || prefillTo))
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    from_location: prefillFrom, to_location: prefillTo,
    product: '', quantity_tons: '', preferred_date: '', notes: '',
    measurement_unit: DEFAULT_UNIT as MeasurementUnit,
  })

  function setField(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { toast.error('Συνδεθείτε πρώτα'); return }
    if (!form.from_location.trim() || !form.to_location.trim()) {
      toast.error('Συμπλήρωσε αφετηρία και προορισμό'); return
    }
    // Moderation on free-text fields
    for (const [val, max] of [[form.product, 120], [form.notes, 1000], [form.from_location, 120], [form.to_location, 120]] as [string, number][]) {
      const check = validateText(val, { maxLength: max })
      if (!check.ok) { toast.error(check.error!); return }
    }
    setSaving(true)
    const { error } = await createRequest({
      user_id: user.id,
      from_location: sanitizeInput(form.from_location),
      to_location: sanitizeInput(form.to_location),
      product: sanitizeInput(form.product),
      quantity_tons: form.quantity_tons ? Number(form.quantity_tons) : 0,
      measurement_unit: form.measurement_unit,
      preferred_date: form.preferred_date || undefined,
      notes: sanitizeInput(form.notes),
      status: 'open',
    })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Η ζήτηση διαδρομής δημοσιεύτηκε! Οι μεταφορείς θα ειδοποιηθούν.')
    setShowForm(false)
    setForm({ from_location: '', to_location: '', product: '', quantity_tons: '', preferred_date: '', notes: '', measurement_unit: DEFAULT_UNIT })
  }

  async function handleContact(otherId: string) {
    if (!user) { window.dispatchEvent(new CustomEvent('open-auth')); return }
    if (otherId === user.id) return
    const convId = await getOrCreateConversation(user.id, otherId)
    if (convId) window.location.href = `/?view=messages&c=${convId}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Ζητήσεις μεταφοράς από χρήστες που αναζητούν μεταφορέα</p>
        <Button size="sm" onClick={() => setShowForm(p => !p)} icon={<Icons.plus className="w-4 h-4" />}>
          Ζήτηση Διαδρομής
        </Button>
      </div>

      {showForm && (
        <Card className="p-5 border-agro-200">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Νέα Ζήτηση Διαδρομής</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Από (πόλη)" icon={<Icons.map className="w-4 h-4" />}
              placeholder="π.χ. Λάρισα" value={form.from_location}
              onChange={e => setField('from_location', e.target.value)} required />
            <Input label="Προς (πόλη)" icon={<Icons.map className="w-4 h-4" />}
              placeholder="π.χ. Αθήνα" value={form.to_location}
              onChange={e => setField('to_location', e.target.value)} required />
            <Input label="Προϊόν" placeholder="π.χ. Σιτάρι"
              value={form.product} onChange={e => setField('product', e.target.value)} />
            <Input label={`Ποσότητα (${getUnit(form.measurement_unit).short})`} type="number" step="0.1" min="0"
              placeholder="π.χ. 20" value={form.quantity_tons}
              onChange={e => setField('quantity_tons', e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rr-unit" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Μονάδα μέτρησης</label>
              <select id="rr-unit"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-agro-500"
                value={form.measurement_unit}
                onChange={e => setForm(p => ({ ...p, measurement_unit: e.target.value as MeasurementUnit }))}>
                {UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
              </select>
            </div>
            <Input label="Προτιμώμενη ημερομηνία" type="date"
              value={form.preferred_date} onChange={e => setField('preferred_date', e.target.value)} />
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Σημειώσεις</label>
              <textarea rows={2} placeholder="Προαιρετικές λεπτομέρειες..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-agro-500 resize-none"
                value={form.notes} onChange={e => setField('notes', e.target.value)} />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" loading={saving}>Δημοσίευση Ζήτησης</Button>
              <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Ακύρωση</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Icons.map className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="font-semibold text-gray-600">Καμία ανοιχτή ζήτηση διαδρομής</p>
          <p className="text-sm mt-1">Δημιούργησε την πρώτη ζήτηση μεταφοράς</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <Icons.map className="w-4 h-4 text-agro-600 flex-shrink-0" />
                    {r.from_location} <Icons.chevronRight className="w-3 h-3 text-gray-300" /> {r.to_location}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1.5">
                    {r.product && <span className="flex items-center gap-1"><Icons.package className="w-3 h-3" />{r.product}</span>}
                    {r.quantity_tons ? <span>{formatQuantity(r.quantity_tons, r.measurement_unit)}</span> : null}
                    {r.preferred_date && <span className="flex items-center gap-1"><Icons.calendar className="w-3 h-3" />{r.preferred_date}</span>}
                  </div>
                  {r.notes && <p className="text-xs text-gray-500 mt-2">{r.notes}</p>}
                  <div className="text-[11px] text-gray-400 mt-2">
                    {r.user?.full_name ?? 'Χρήστης'} · {r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: el }) : ''}
                  </div>
                </div>
                {r.user?.id && r.user.id !== user?.id && (
                  <Button size="sm" variant="ghost" onClick={() => handleContact(r.user!.id)}
                    icon={<Icons.message className="w-3.5 h-3.5" />}>
                    Προσφορά
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
