'use client'
import { useState, useEffect, useRef } from 'react'
import type { Transporter, Review } from '@/types'
import { getSupabaseClient } from '@/lib/supabase-client'
import { useAuth } from '@/hooks/useAuth'
import { getOrCreateConversation } from '@/hooks/useMessages'
import { Card, TrustBadge, StarRating, Button, Spinner } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { ReviewModal } from '@/components/dashboard/ReviewModal'
import { RouteRequestsPanel } from '@/components/dashboard/transport/RouteRequestsPanel'
import toast from 'react-hot-toast'

// Professional truck imagery for transporter cards — consistent premium style.
// Wide crop (16:6) so the full truck & cabin are shown without cropping the cab.
const TRUCK_PHOTOS = [
  'https://images.unsplash.com/photo-1586191582056-b7f0a04b2d5b?w=900&h=340&auto=format&fit=crop&crop=center&q=80',
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&h=340&auto=format&fit=crop&crop=center&q=80',
  'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=900&h=340&auto=format&fit=crop&crop=center&q=80',
  'https://images.unsplash.com/photo-1599256871679-6e3f3f3d8c47?w=900&h=340&auto=format&fit=crop&crop=center&q=80',
]

const DEMO_TRANSPORTERS: Transporter[] = [
  { id:'d1', user_id:'', vehicle_type:'Φορτηγό MAN 18t',  capacity_tons:20, from_location:'Λάρισα', to_location:'Θεσσαλονίκη', price_per_trip:320, available:true, rating:4.8, rating_count:48,  total_trips:142, description:'Εξειδίκευση στη μεταφορά σιτηρών και ελαιολάδου.', created_at:'', updated_at:'', user:{ id:'d1', email:'', full_name:'Γιώργος Παπαδόπουλος', role:'transporter', roles:['transporter'], trust_score:96, total_deals:142, total_value:0, total_sales:0, total_purchases:0, rating:4.8, rating_count:48,  verified:true, created_at:'' } },
  { id:'d2', user_id:'', vehicle_type:'Φορτηγό Iveco 15t', capacity_tons:15, from_location:'Πάτρα',  to_location:'Αθήνα',       price_per_trip:280, available:true, rating:4.6, rating_count:31,  total_trips:98,  description:'Εξειδίκευση σε φρούτα και λαχανικά.',           created_at:'', updated_at:'', user:{ id:'d2', email:'', full_name:'Νίκος Σταθόπουλος',    role:'transporter', roles:['transporter'], trust_score:92, total_deals:98,  total_value:0, total_sales:0, total_purchases:0, rating:4.6, rating_count:31,  verified:true, created_at:'' } },
  { id:'d3', user_id:'', vehicle_type:'Φορτηγό Volvo 25t', capacity_tons:25, from_location:'Ξάνθη',  to_location:'Θεσσαλονίκη', price_per_trip:210, available:true, rating:4.9, rating_count:72,  total_trips:211, description:'Top rated μεταφορέας Βορείου Ελλάδας.',           created_at:'', updated_at:'', user:{ id:'d3', email:'', full_name:'Ανδρέας Δημητρίου',    role:'transporter', roles:['transporter'], trust_score:98, total_deals:211, total_value:0, total_sales:0, total_purchases:0, rating:4.9, rating_count:72,  verified:true, created_at:'' } },
]

export function TransportTab() {
  const supabase = useRef(getSupabaseClient()).current
  const { user } = useAuth()
  const [subTab, setSubTab]             = useState<'transporters' | 'requests'>('transporters')
  const [transporters, setTransporters] = useState<Transporter[]>([])
  const [loading, setLoading]           = useState(true)
  const [expanded, setExpanded]         = useState<string | null>(null)
  const [reviews, setReviews]           = useState<Record<string, Review[]>>({})
  const [reviewTarget, setReviewTarget] = useState<Transporter | null>(null)
  const [booking, setBooking]           = useState<string | null>(null)
  const [fromSearch, setFromSearch]     = useState('')
  const [toSearch, setToSearch]         = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('transporters')
      .select('*, user:profiles(full_name, avatar_url, trust_score, location, verified)')
      .eq('available', true)
      .order('rating', { ascending: false })
    setTransporters((data ?? []) as Transporter[])
    setLoading(false)
  }

  async function loadReviews(id: string) {
    if (reviews[id]) return
    const { data } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name)')
      .eq('transporter_id', id)
      .order('created_at', { ascending: false })
      .limit(5)
    setReviews(prev => ({ ...prev, [id]: (data ?? []) as Review[] }))
  }

  function toggleExpand(id: string) {
    const next = expanded === id ? null : id
    setExpanded(next)
    if (next) loadReviews(next)
  }

  async function handleBook(t: Transporter) {
    if (!user) { toast.error('Συνδεθείτε πρώτα'); return }
    setBooking(t.id)
    const { error } = await supabase.from('transport_bookings').insert({
      transporter_id: t.id, user_id: user.id,
      from_location: t.from_location, to_location: t.to_location,
      cargo_tons: 10, agreed_price: t.price_per_trip, status: 'pending',
    })
    setBooking(null)
    if (error) { toast.error(error.message); return }
    toast.success('Η κράτηση υποβλήθηκε! Ο μεταφορέας θα επικοινωνήσει μαζί σας.')
  }

  async function handleMessage(t: Transporter) {
    if (!user) { toast.error('Συνδεθείτε πρώτα'); return }
    const otherId = t.user?.id
    if (!otherId || otherId === user.id) return
    const convId = await getOrCreateConversation(user.id, otherId)
    if (convId) window.location.href = `/?view=messages&c=${convId}`
    else toast.error('Δεν ήταν δυνατή η έναρξη συνομιλίας')
  }

  const baseList  = transporters.length > 0 ? transporters : DEMO_TRANSPORTERS
  const isDemo    = transporters.length === 0

  // Client-side filter when user types
  const filtered = baseList.filter(t => {
    const fromOk = !fromSearch || t.from_location.toLowerCase().includes(fromSearch.toLowerCase())
    const toOk   = !toSearch   || t.to_location.toLowerCase().includes(toSearch.toLowerCase())
    return fromOk && toOk
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-extrabold text-gray-900 text-xl tracking-tight">Μεταφορές</h2>
        <p className="text-sm text-gray-500 mt-0.5">Αγορά μεταφορών — βρες μεταφορέα ή ζήτησε διαδρομή</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button onClick={() => setSubTab('transporters')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${subTab === 'transporters' ? 'bg-white text-agro-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Μεταφορείς
        </button>
        <button onClick={() => setSubTab('requests')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${subTab === 'requests' ? 'bg-white text-agro-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Ζητήσεις Διαδρομής
        </button>
      </div>

      {subTab === 'requests' ? (
        <RouteRequestsPanel prefillFrom={fromSearch} prefillTo={toSearch} />
      ) : (
      <>
      {/* Route search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Από</label>
            <div className="relative">
              <Icons.map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-agro-500"
                placeholder="Πόλη αποστολής..."
                value={fromSearch}
                onChange={e => setFromSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Προς</label>
            <div className="relative">
              <Icons.map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-agro-500"
                placeholder="Πόλη παραλαβής..."
                value={toSearch}
                onChange={e => setToSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFromSearch(''); setToSearch('') }}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
              Καθαρισμός
            </button>
          </div>
        </div>
        {(fromSearch || toSearch) && (
          <div className="mt-2 text-xs text-gray-400">{filtered.length} αποτελέσματα</div>
        )}
      </Card>

      {isDemo && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 flex items-center gap-2">
          <Icons.alert className="w-3.5 h-3.5 flex-shrink-0" />
          Demo μεταφορείς — τρέξε <code className="font-mono">/api/seed</code> για πραγματικούς εγγεγραμμένους μεταφορείς
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Icons.truck className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="font-semibold text-gray-600">Δεν βρέθηκαν μεταφορείς</p>
          {(fromSearch || toSearch) ? (
            <>
              <p className="text-sm mt-1">Δεν υπάρχει μεταφορέας για {fromSearch || '—'} → {toSearch || '—'}</p>
              <Button className="mt-4" onClick={() => setSubTab('requests')} icon={<Icons.plus className="w-4 h-4" />}>
                Ζήτηση Διαδρομής
              </Button>
              <p className="text-xs mt-2 text-gray-400">Δημοσίευσε ζήτηση και οι μεταφορείς θα ειδοποιηθούν</p>
            </>
          ) : (
            <p className="text-sm mt-1">Δοκίμασε διαφορετική διαδρομή</p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((t, idx) => (
            <Card key={t.id} className="overflow-hidden">
              {/* Truck photo banner — consistent aspect ratio across every card */}
              <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '16 / 6' }}>
                <img
                  src={(t as any).truck_photo || TRUCK_PHOTOS[idx % TRUCK_PHOTOS.length]}
                  alt={`Φορτηγό ${t.user?.full_name ?? ''}`}
                  className="w-full h-full object-cover object-center" loading="lazy"
                  onError={e => { (e.target as HTMLImageElement).src = TRUCK_PHOTOS[0] }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-3 flex items-center gap-2">
                  <span className="text-white font-bold text-sm drop-shadow">{t.vehicle_type}</span>
                </div>
                <div className="absolute top-2 right-3 bg-white/90 backdrop-blur rounded-lg px-2 py-1 flex items-center gap-1">
                  <Icons.star className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-bold text-gray-900">{t.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap gap-3 sm:gap-4 items-start">
                  {/* Company avatar */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-agro-800 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 -mt-8 border-2 border-white shadow-md overflow-hidden">
                    {t.user?.avatar_url
                      ? <img src={t.user.avatar_url} alt="" className="w-full h-full object-cover" />
                      : (t.user?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) ?? 'ΜΤ')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-display font-bold text-gray-900 text-base sm:text-lg">{t.user?.full_name ?? 'Μεταφορέας'}</span>
                      {t.user?.verified && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-semibold">✓ Verified</span>
                      )}
                      <TrustBadge score={t.user?.trust_score ?? 80} />
                    </div>
                    {/* Route — emphasized */}
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                      <Icons.map className="w-3.5 h-3.5 text-agro-600" />{t.from_location} → {t.to_location}
                    </div>
                    {/* Secondary metadata — lighter */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400 mb-2">
                      <span className="flex items-center gap-1"><Icons.package className="w-3 h-3" />{t.capacity_tons}τ</span>
                      <span className="flex items-center gap-1"><Icons.truck className="w-3 h-3" />{t.vehicle_type}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StarRating rating={t.rating} size={12} />
                      <span className="text-[11px] text-gray-400">{t.rating_count} κριτικές · {t.total_trips} μεταφορές</span>
                    </div>
                    {t.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{t.description}</p>}
                  </div>

                  {/* Price + actions */}
                  <div className="text-right flex-shrink-0 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-0">
                    <div>
                      <div className="font-display font-black text-agro-700 text-2xl sm:text-[28px] leading-none">{t.price_per_trip} €</div>
                      <div className="text-[10px] text-gray-400 font-medium mt-1">εκτιμώμενο</div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end sm:mt-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleExpand(t.id)}>
                        <Icons.eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{expanded === t.id ? 'Κλείσιμο' : 'Κριτικές'}</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setReviewTarget(t)}>
                        <Icons.star className="w-3.5 h-3.5" />
                      </Button>
                      {t.user?.id && (
                        <Button variant="ghost" size="sm" onClick={() => handleMessage(t)}>
                          <Icons.message className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Μήνυμα</span>
                        </Button>
                      )}
                      <Button size="sm" loading={booking === t.id} onClick={() => handleBook(t)}>
                        <Icons.check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Κράτηση</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews panel */}
              {expanded === t.id && (
                <div className="border-t border-gray-50 bg-gray-50 p-4">
                  <div className="font-bold text-gray-800 text-sm mb-3">Κριτικές Χρηστών</div>
                  {(reviews[t.id] ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Δεν υπάρχουν κριτικές ακόμη. Γίνε ο πρώτος!</p>
                  ) : (
                    <div className="space-y-2.5">
                      {(reviews[t.id] ?? []).map((r, i) => (
                        <div key={i} className="bg-white rounded-xl p-3.5 border border-gray-100">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-semibold text-gray-900 text-sm">
                              {(r as any).reviewer?.full_name ?? 'Ανώνυμος'}
                            </span>
                            <StarRating rating={r.rating} size={11} showNum={false} />
                          </div>
                          {r.comment && <p className="text-xs text-gray-500 leading-relaxed">{r.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          transporter={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={load}
        />
      )}
      </>
      )}
    </div>
  )
}
