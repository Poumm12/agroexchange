'use client'
import type { Listing } from '@/types'
import { ListingCard } from '@/components/dashboard/ListingCard'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-7 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-9 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )
}

interface Props {
  listings: Listing[]
  loading: boolean
  onCta: () => void
}

export function FeaturedListings({ listings, loading, onCta }: Props) {
  return (
    <section className="pt-10 pb-20 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-bold tracking-widest uppercase text-agro-500 mb-3">Αγγελίες</div>
          <h2 className="font-display font-extrabold text-gray-900 tracking-tight mb-3"
            style={{ fontSize: 'clamp(24px,4vw,38px)' }}>
            Πρόσφατες Αγγελίες
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
            Φρέσκες αγγελίες από παραγωγούς σε όλη την Ελλάδα
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : listings.length === 0
              ? (
                <div className="col-span-full text-center py-16 text-gray-400">
                  <div className="text-5xl mb-4">🌾</div>
                  <div className="font-semibold text-gray-600">Δεν υπάρχουν αγγελίες ακόμη</div>
                  <p className="text-sm mt-2">Γίνε ο πρώτος που θα δημιουργήσει αγγελία</p>
                  <button onClick={onCta}
                    className="mt-6 inline-flex items-center gap-2 bg-agro-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-agro-900 transition-colors">
                    Δημιουργία Αγγελίας
                  </button>
                </div>
              )
              : listings.slice(0, 8).map(l => <ListingCard key={l.id} listing={l} />)
          }
        </div>

        {!loading && listings.length > 0 && (
          <div className="text-center mt-10">
            <button onClick={onCta}
              className="inline-flex items-center gap-2 border border-agro-200 text-agro-800 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-agro-50 transition-colors">
              Δες όλες τις αγγελίες →
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
