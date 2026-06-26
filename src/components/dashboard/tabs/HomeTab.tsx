'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useListings } from '@/hooks/useListings'
import { Card, Spinner } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { getProductImage } from '@/components/dashboard/ListingCard'
import { formatQuantity, perUnitShort } from '@/lib/units'
import type { MarketPrice } from '@/types'

const HOW_STEPS = [
  { Icon: Icons.list,    title: 'Δημιουργείτε', sub: 'αγγελία' },
  { Icon: Icons.user,    title: 'Λαμβάνετε',    sub: 'προσφορές' },
  { Icon: Icons.check,   title: 'Συμφωνείτε',   sub: 'με τον αγοραστή' },
  { Icon: Icons.truck,   title: 'Κανονίζετε',   sub: 'τη μεταφορά' },
]

const BENEFITS = [
  { Icon: Icons.shield,  title: 'Ασφάλεια',              desc: 'Ασφαλείς συναλλαγές και προστασία δεδομένων' },
  { Icon: Icons.trendUp, title: 'Διαφάνεια',             desc: 'Ξεκάθαρες τιμές και όλες οι πληροφορίες' },
  { Icon: Icons.pin,     title: 'Πανελλαδική κάλυψη',    desc: 'Συνδεθείτε με αγοραστές σε όλη την Ελλάδα' },
  { Icon: Icons.message, title: 'Υποστήριξη',            desc: 'Είμαστε εδώ για να σας βοηθήσουμε' },
]

export function HomeTab({ setTab, prices = [] }: { setTab: (t: string) => void; prices?: MarketPrice[] }) {
  const { user } = useAuth()
  const { listings, loading: listingsLoading } = useListings({ status: 'active' })
  const [vis, setVis] = useState(false)
  useEffect(() => { const id = setTimeout(() => setVis(true), 60); return () => clearTimeout(id) }, [])

  return (
    <div className="space-y-6">

      {/* ═══ HERO ═══ */}
      <section className="relative rounded-3xl overflow-hidden min-h-[540px] flex items-center justify-center">
        {/* Background: the provided AgroExchange agricultural image — the only Hero visual */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/dashboard-hero.jpg"
            alt="AgroExchange — αγρότης, θεριζοαλωνιστική, μεταφορά και σιλό στο ηλιοβασίλεμα"
            className="w-full h-full object-cover"
          />
          {/* Subtle dark overlay (~42%) — background more visible, text still readable */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-black/25" />
        </div>

        <div className="relative z-10 w-full px-6 sm:px-8 py-14">
          {/* Centered content: title + description + two buttons */}
          <div className={`max-w-2xl mx-auto text-center transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h1 className="font-display font-black leading-[1.05] tracking-tight mb-5"
              style={{ fontSize: 'clamp(30px,4vw,48px)', textShadow: '0 2px 16px rgba(0,0,0,0.45)' }}>
              <span className="text-white">Η αγροτική αγορά</span>{' '}
              <span className="text-agro-400">αλλάζει.</span>
            </h1>
            <p className="text-white/90 leading-relaxed mb-8 mx-auto max-w-xl"
              style={{ fontSize: 'clamp(15px,1.5vw,17px)', textShadow: '0 1px 10px rgba(0,0,0,0.4)' }}>
              Συνδέουμε παραγωγούς και εμπόρους σε όλη την Ελλάδα σε μια δίκαιη και διαφανή αγορά.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button onClick={() => setTab('listings')}
                className="inline-flex items-center gap-2 bg-agro-700 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-lg hover:bg-agro-800 transition-all">
                <Icons.plus className="w-4 h-4" /> Δημιουργία Αγγελίας
              </button>
              <button onClick={() => setTab('listings')}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl px-5 py-3 text-sm hover:bg-gray-50 transition-all shadow-sm">
                <Icons.search className="w-4 h-4" /> Δείτε Αγγελίες
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ UNDER HERO: Recent Listings (left) + How it Works / Transport (right) ═══ */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent listings */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Icons.list className="w-4 h-4 text-agro-700" /> Πρόσφατες Αγγελίες
            </h3>
          </div>

          {listingsLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Icons.list className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Δεν υπάρχουν αγγελίες ακόμη</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {listings.slice(0, 3).map(l => (
                <div key={l.id} className="flex flex-wrap items-center gap-4 py-5 first:pt-0">
                  {/* Image */}
                  <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={l.image_url || getProductImage(l.category, l.title)}
                      alt={l.title} className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = getProductImage('') }}
                    />
                  </div>
                  {/* Name + quantity + location */}
                  <div className="flex-1 min-w-[140px]">
                    <div className="font-bold text-gray-900 text-sm">{l.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatQuantity(l.quantity_tons, l.measurement_unit)}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Icons.map className="w-3 h-3" />{l.location}
                    </div>
                  </div>
                  {/* Price */}
                  <div className="min-w-[90px]">
                    <div className="text-[11px] text-gray-400">Τιμή</div>
                    <div className="font-display font-black text-agro-700 text-lg">
                      {Number(l.price_per_ton).toLocaleString('el-GR', { minimumFractionDigits: 2 })} €
                    </div>
                    <div className="text-[11px] text-gray-400">{perUnitShort(l.measurement_unit)}</div>
                  </div>
                  {/* Action */}
                  <div className="min-w-[110px]">
                    <button onClick={() => setTab('listings')}
                      className="text-xs font-semibold bg-agro-700 text-white rounded-lg px-3 py-1.5 hover:bg-agro-800 transition-colors w-full">
                      Δείτε λεπτομέρειες
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={() => setTab('listings')}
                className="w-full mt-3 py-2.5 rounded-xl border border-agro-200 text-sm font-semibold text-agro-700 hover:bg-agro-50 transition-colors">
                Δείτε όλες τις αγγελίες
              </button>
            </div>
          )}
        </Card>

        {/* Right column: How it works + Transport */}
        <div className="space-y-6">
          {/* How it works */}
          <Card className="p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.check className="w-4 h-4 text-agro-700" /> Πώς λειτουργεί
            </h3>
            <div className="flex items-center justify-between">
              {HOW_STEPS.map((s, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-9 h-9 rounded-xl bg-agro-50 text-agro-700 flex items-center justify-center mb-1.5">
                      <s.Icon className="w-4 h-4" />
                    </div>
                    <div className="text-[10px] font-bold text-gray-700 flex items-center gap-0.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-agro-700 text-white text-[8px] flex items-center justify-center">{i+1}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5 leading-tight max-w-[60px]">{s.title} {s.sub}</div>
                  </div>
                  {i < HOW_STEPS.length - 1 && <Icons.chevronRight className="w-3 h-3 text-gray-300 mx-1" />}
                </div>
              ))}
            </div>
          </Card>

          {/* Transport */}
          <Card className="overflow-hidden">
            <div className="relative w-full bg-gray-50" style={{ aspectRatio: '16 / 10' }}>
              <img src="/images/transport-truck.png"
                alt="Μεταφορές" className="w-full h-full object-contain object-center"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
            <div className="p-5 relative">
              <h3 className="font-bold text-gray-900 mb-1.5 flex items-center gap-2">
                <Icons.truck className="w-4 h-4 text-agro-700" /> Μεταφορές
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                Βρείτε αξιόπιστες μεταφορικές εταιρείες σε όλη την Ελλάδα.
              </p>
              <button onClick={() => setTab('transport')}
                className="inline-flex items-center gap-1.5 bg-agro-700 text-white text-sm font-semibold rounded-xl px-4 py-2 hover:bg-agro-800 transition-colors">
                Δείτε μεταφορές
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* ═══ BOTTOM: Benefits strip ═══ */}
      <Card className="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 divide-y sm:divide-y-0 lg:divide-x divide-gray-100">
          {BENEFITS.map((b, i) => (
            <div key={i} className={`flex items-start gap-3 ${i > 0 ? 'pt-5 sm:pt-0 lg:pl-5' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-agro-50 text-agro-700 flex items-center justify-center flex-shrink-0">
                <b.Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">{b.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed mt-0.5">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
