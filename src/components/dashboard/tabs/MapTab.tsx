'use client'
import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useMapPoints } from '@/hooks/useMapPoints'
import { getOrCreateConversation } from '@/hooks/useMessages'
import { useAuth } from '@/hooks/useAuth'
import { Card, Spinner, Badge } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import type { MapCategory, MapPoint } from '@/types'
import toast from 'react-hot-toast'

// Real interactive map (Leaflet + OSM). Client-only — no SSR.
const LeafletMap = dynamic(
  () => import('@/components/dashboard/LeafletMap').then(m => m.LeafletMap),
  { ssr: false, loading: () => <div className="absolute inset-0 flex items-center justify-center bg-[#AAD3DF]"><Spinner /></div> }
)

const CATEGORIES: { key: MapCategory; label: string; Icon: any; color: string; hex: string }[] = [
  { key: 'silo',              label: 'Σιλό',              Icon: Icons.warehouse, color: 'text-amber-600 bg-amber-100',  hex: '#F59E0B' },
  { key: 'mill',              label: 'Μύλοι',             Icon: Icons.factory,   color: 'text-orange-600 bg-orange-100', hex: '#F97316' },
  { key: 'warehouse',         label: 'Αποθήκες',          Icon: Icons.building,  color: 'text-blue-600 bg-blue-100',   hex: '#3B82F6' },
  { key: 'cooperative',       label: 'Συνεταιρισμοί',     Icon: Icons.user,      color: 'text-green-600 bg-green-100', hex: '#22C55E' },
  { key: 'distribution',      label: 'Κέντρα Διανομής',   Icon: Icons.package,   color: 'text-purple-600 bg-purple-100', hex: '#A855F7' },
  { key: 'transport_company', label: 'Εταιρείες Μεταφορών', Icon: Icons.truck,   color: 'text-teal-600 bg-teal-100',   hex: '#14B8A6' },
]

const CAT_META = Object.fromEntries(CATEGORIES.map(c => [c.key, c]))

export function MapTab() {
  const { user } = useAuth()
  const { points, loading } = useMapPoints()
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<MapCategory | 'all'>('all')
  const [city, setCity] = useState('')
  const [selected, setSelected] = useState<MapPoint | null>(null)

  const cities = useMemo(
    () => Array.from(new Set(points.map(p => p.city).filter(Boolean))).sort() as string[],
    [points]
  )

  const filtered = points.filter(p => {
    const matchCat  = cat === 'all' || p.category === cat
    const matchCity = !city || p.city === city
    const matchText = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.city ?? '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchCity && matchText
  })

  async function handleContact(p: MapPoint) {
    if (!p.user_id) { toast('Δεν υπάρχει συνδεδεμένο προφίλ'); return }
    if (!user) { window.dispatchEvent(new CustomEvent('open-auth')); return }
    const convId = await getOrCreateConversation(user.id, p.user_id)
    if (convId) window.location.href = `/?view=messages&c=${convId}`
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-extrabold text-gray-900 text-xl tracking-tight">Χάρτης</h2>
        <p className="text-sm text-gray-500 mt-0.5">Αγροτικά σημεία ενδιαφέροντος σε όλη την Ελλάδα</p>
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-agro-500"
              placeholder="Αναζήτηση ονόματος ή πόλης..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-agro-500 bg-white"
            value={city} onChange={e => setCity(e.target.value)}>
            <option value="">Όλες οι πόλεις</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setCat('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${cat === 'all' ? 'bg-agro-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-agro-300'}`}>
            Όλα
          </button>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCat(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${cat === c.key ? 'bg-agro-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-agro-300'}`}>
              <c.Icon className="w-3.5 h-3.5" /> {c.label}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={36} /></div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Map visualization — real interactive Leaflet + OpenStreetMap */}
          <Card className="lg:col-span-2 p-4 overflow-hidden">
            <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 z-0" style={{ aspectRatio: '4/5', maxHeight: '560px' }}>
              <LeafletMap
                points={filtered}
                selected={selected}
                onSelect={setSelected}
                categoryLabel={(c) => CAT_META[c]?.label ?? c}
              />

              {/* Legend (overlaid, does not affect the map) */}
              <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur rounded-xl border border-gray-200 shadow-sm p-3 max-w-[180px] pointer-events-none">
                <div className="text-[11px] font-bold text-gray-700 mb-1.5">Υπόμνημα</div>
                <div className="space-y-1">
                  {CATEGORIES.map(c => (
                    <div key={c.key} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.hex }} />
                      <span className="text-[10px] text-gray-500">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {filtered.length === 0 && (
                <div className="absolute inset-0 z-[400] flex items-center justify-center text-gray-500 text-sm font-medium bg-white/60 pointer-events-none">
                  Δεν βρέθηκαν σημεία
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Χάρτης Ελλάδας · {filtered.length} σημεία · Πάτησε ένα σημείο για λεπτομέρειες
            </p>
          </Card>

          {/* List / detail */}
          <div className="space-y-3">
            {selected ? (
              <Card className="p-5">
                <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1">
                  <Icons.chevronRight className="w-3 h-3 rotate-180" /> Πίσω στη λίστα
                </button>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${CAT_META[selected.category].color}`}>
                    {(() => { const I = CAT_META[selected.category].Icon; return <I className="w-5 h-5" /> })()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{selected.name}</h3>
                      {selected.verified && <Badge variant="info">✓</Badge>}
                    </div>
                    <div className="text-xs text-gray-400">{CAT_META[selected.category].label}</div>
                  </div>
                </div>
                {selected.description && <p className="text-sm text-gray-600 mb-3">{selected.description}</p>}
                <div className="space-y-2 text-sm text-gray-500">
                  {selected.city && <div className="flex items-center gap-2"><Icons.map className="w-3.5 h-3.5" /> {selected.city}{selected.region ? `, ${selected.region}` : ''}</div>}
                  {selected.phone && <div className="flex items-center gap-2"><Icons.zap className="w-3.5 h-3.5" /> {selected.phone}</div>}
                </div>
                {selected.category === 'transport_company' && selected.user_id && (
                  <div className="flex gap-2 mt-4">
                    <a href={`/user/${selected.user_id}`}
                      className="flex-1 text-center py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                      Προφίλ
                    </a>
                    <button onClick={() => handleContact(selected)}
                      className="flex-1 py-2 rounded-xl bg-agro-700 text-white text-xs font-semibold hover:bg-agro-800 transition-colors flex items-center justify-center gap-1.5">
                      <Icons.message className="w-3.5 h-3.5" /> Επικοινωνία
                    </button>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="p-3 border-b border-gray-50 font-semibold text-gray-700 text-sm">
                  Σημεία ({filtered.length})
                </div>
                <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Δεν βρέθηκαν σημεία</div>
                  ) : filtered.map(p => {
                    const meta = CAT_META[p.category]
                    return (
                      <button key={p.id} onClick={() => setSelected(p)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                          <meta.Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate">{p.name}</div>
                          <div className="text-xs text-gray-400 truncate">{meta.label}{p.city ? ` · ${p.city}` : ''}</div>
                        </div>
                        {p.verified && <Icons.check className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs text-gray-500">
        <Icons.alert className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
        Ο χάρτης χρησιμοποιεί δείγμα δεδομένων. Η αρχιτεκτονική είναι έτοιμη για πραγματικά γεωγραφικά δεδομένα και ενσωμάτωση με υπηρεσίες χαρτών.
      </div>
    </div>
  )
}
