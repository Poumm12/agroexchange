'use client'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useOffers } from '@/hooks/useOffers'
import { Card, Badge, Button, Spinner } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { formatQuantity } from '@/lib/units'
import toast from 'react-hot-toast'

const STATUS_LABELS: Record<string, string> = {
  pending:   'Εκκρεμής',
  accepted:  'Εγκρίθηκε',
  rejected:  'Απορρίφθηκε',
  countered: 'Αντιπρόταση',
  completed: 'Ολοκληρώθηκε',
}
const STATUS_VARIANT: Record<string, 'success'|'danger'|'warning'|'info'|'default'> = {
  pending:   'warning',
  accepted:  'success',
  rejected:  'danger',
  countered: 'info',
  completed: 'default',
}

export function OffersTab() {
  const supabase = getSupabaseClient()
  const { user } = useAuth()
  const { offers, loading, updateOfferStatus } = useOffers(user?.id)

  async function handleAccept(
    id: string, listingId: string, buyerId: string,
    sellerId: string, price: number, qty: number,
  ) {
    const err = await updateOfferStatus(id, 'accepted')
    if (err) { toast.error(err.message); return }
    // Create deal record
    const { error: dealErr } = await supabase.from('deals').insert({
      offer_id:      id,
      buyer_id:      buyerId,
      seller_id:     sellerId,
      listing_id:    listingId,
      price_per_ton: price,
      quantity_tons: qty,
      total_value:   price * qty,
      status:        'active',
    })
    if (dealErr) { toast.error('Deal δεν δημιουργήθηκε: ' + dealErr.message); return }
    // Update listing status
    await supabase.from('listings').update({ status: 'sold' }).eq('id', listingId)
    toast.success('Η προσφορά εγκρίθηκε! Το deal δημιουργήθηκε.')
  }

  async function handleReject(id: string) {
    const err = await updateOfferStatus(id, 'rejected')
    if (err) toast.error(err.message)
    else toast.success('Η προσφορά απορρίφθηκε.')
  }

  const received = offers.filter(o => o.seller_id === user?.id)
  const sent     = offers.filter(o => o.buyer_id  === user?.id)

  return (
    <div className="space-y-6">
      <h2 className="font-display font-extrabold text-gray-900 text-xl tracking-tight">Προσφορές</h2>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      ) : (
        <>
          {/* Received */}
          <div>
            <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
              <Icons.bell className="w-4 h-4 text-agro-600" />
              Εισερχόμενες ({received.length})
            </h3>
            {received.length === 0 ? (
              <Card className="p-8 text-center">
                <Icons.bell className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-500 text-sm font-medium">Δεν υπάρχουν εισερχόμενες προσφορές</p>
                <p className="text-gray-400 text-xs mt-1">Δημιούργησε αγγελίες για να λάβεις προσφορές</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {received.map(o => (
                  <Card key={o.id}
                    className={`p-4 ${o.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                    <div className="flex flex-wrap gap-3 items-start">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-agro-100 flex items-center justify-center text-agro-800 font-bold text-sm flex-shrink-0">
                        {(o.buyer as any)?.full_name?.charAt(0)?.toUpperCase() ?? 'Α'}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">
                            {(o.buyer as any)?.full_name ?? '—'}
                          </span>
                          <Badge variant={STATUS_VARIANT[o.status]}>{STATUS_LABELS[o.status]}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Icons.package className="w-3 h-3" />
                          {(o.listing as any)?.title ?? '—'} · {formatQuantity(o.quantity_tons, o.measurement_unit)}
                        </div>
                        {o.message && (
                          <div className="mt-2 text-xs bg-white rounded-lg p-2 border border-gray-100 text-gray-600 italic">
                            "{o.message}"
                          </div>
                        )}
                      </div>
                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <div className="font-display font-black text-gray-900 text-lg leading-none">
                          {Number(o.price_per_ton).toLocaleString('el-GR', { minimumFractionDigits: 2 })} €
                          <span className="text-xs text-gray-400 font-normal">/τ</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Σύνολο: {Number(o.total_value).toLocaleString('el-GR', { minimumFractionDigits: 2 })} €
                        </div>
                        {/* Actions */}
                        {o.status === 'pending' && (
                          <div className="flex gap-2 mt-2 justify-end">
                            <Button
                              size="sm"
                              icon={<Icons.check className="w-3.5 h-3.5" />}
                              onClick={() => handleAccept(
                                o.id, o.listing_id, o.buyer_id,
                                o.seller_id, o.price_per_ton, o.quantity_tons,
                              )}>
                              Αποδοχή
                            </Button>
                            <Button
                              size="sm" variant="ghost"
                              icon={<Icons.x className="w-3.5 h-3.5" />}
                              onClick={() => handleReject(o.id)}>
                              Άρνηση
                            </Button>
                          </div>
                        )}
                        {o.status === 'accepted' && (
                          <div className="mt-2">
                            <span className="text-xs text-green-700 bg-green-100 rounded-lg px-2 py-1 font-semibold">
                              ✓ Deal ενεργό
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sent */}
          <div>
            <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
              <Icons.message className="w-4 h-4 text-blue-600" />
              Απεσταλμένες ({sent.length})
            </h3>
            {sent.length === 0 ? (
              <Card className="p-8 text-center">
                <Icons.message className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-500 text-sm font-medium">Δεν έχεις στείλει προσφορές ακόμη</p>
                <p className="text-gray-400 text-xs mt-1">Βρες αγγελίες και στείλε προσφορά</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {sent.map(o => (
                  <Card key={o.id} className="p-4">
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">
                          {(o.listing as any)?.title ?? '—'}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {formatQuantity(o.quantity_tons, o.measurement_unit)} × {Number(o.price_per_ton).toLocaleString('el-GR', { minimumFractionDigits: 2 })} €
                        </div>
                      </div>
                      <div className="font-display font-bold text-gray-900 text-base">
                        {Number(o.total_value).toLocaleString('el-GR')} €
                      </div>
                      <Badge variant={STATUS_VARIANT[o.status]}>{STATUS_LABELS[o.status]}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
