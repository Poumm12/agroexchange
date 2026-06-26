'use client'
import { useState } from 'react'
import type { Listing } from '@/types'
import { TrustBadge, Badge, Button } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { OfferModal } from './OfferModal'
import { useAuth } from '@/hooks/useAuth'
import { getOrCreateConversation } from '@/hooks/useMessages'
import { perUnitShort, formatQuantity } from '@/lib/units'
import toast from 'react-hot-toast'

// Product images — keyed by product type. Matching is category-first, then
// title. Each crop maps to a crop image; livestock images ONLY map to
// livestock keywords so a crop listing never shows animals. The default is a
// neutral farm field (never livestock).
const CATEGORY_IMAGES: Record<string, string> = {
  // ── Crops & cereals ──
  'σιτάρι':     'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80', // wheat field
  'σιτηρ':      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80', // cereals → wheat
  'καλαμπόκι':  'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80', // corn cobs
  'βαμβάκι':    'https://images.unsplash.com/photo-1591208997862-3b8f0e9c5d1f?w=600&auto=format&fit=crop&q=80', // cotton
  'κριθάρι':    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80', // barley
  'ρύζι':       'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', // rice grains
  'ηλίανθ':     'https://images.unsplash.com/photo-1470509037663-253d2d33c2b7?w=600&auto=format&fit=crop&q=80', // sunflowers
  // ── Olive / oil ──
  'ελαιόλαδο':  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', // olive grove
  'ελιά':       'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', // olive grove
  // ── Fruit ──
  'πορτοκάλι':  'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop&q=80', // oranges
  'λεμόν':      'https://images.unsplash.com/photo-1582287014914-1db836ee5d3d?w=600&auto=format&fit=crop&q=80', // lemons
  'μήλ':        'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&auto=format&fit=crop&q=80', // apples
  'αχλάδ':      'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=600&auto=format&fit=crop&q=80', // pears
  'ροδάκιν':    'https://images.unsplash.com/photo-1595743825637-cdafc8ad4173?w=600&auto=format&fit=crop&q=80', // peaches
  'κεράσ':      'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=600&auto=format&fit=crop&q=80', // cherries
  'σταφύλ':     'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&auto=format&fit=crop&q=80', // grapes
  'αμπέλ':      'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&auto=format&fit=crop&q=80', // vineyard grapes
  // ── Vegetables ──
  'τομάτ':      'https://images.unsplash.com/photo-1546094096-0df4bcaad337?w=600&auto=format&fit=crop&q=80', // tomatoes
  'πατάτ':      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80', // potatoes
  'κρεμμύδ':    'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&auto=format&fit=crop&q=80', // onions
  // ── Livestock (ONLY matches livestock terms) ──
  'πρόβατ':     'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600&auto=format&fit=crop&q=80', // sheep
  'αρνί':       'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600&auto=format&fit=crop&q=80', // lamb/sheep
  'αγελάδ':     'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop&q=80', // cows
  'βόδ':        'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop&q=80', // cattle
  'μοσχάρ':     'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop&q=80', // calf/beef
  'κατσίκ':     'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600&auto=format&fit=crop&q=80', // goat
  'γίδ':        'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600&auto=format&fit=crop&q=80', // goat
  'κοτόπουλ':   'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop&q=80', // chicken
  'χοίρ':       'https://images.unsplash.com/photo-1593179357196-ea11a2e7c119?w=600&auto=format&fit=crop&q=80', // pig
  // ── Neutral default: a farm field, NEVER livestock ──
  'default':    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80', // green field
}

// Category labels (from the create form) → canonical match keys, so the
// listing's category reliably drives the image even if the title is generic.
const CATEGORY_KEY_MAP: Record<string, string> = {
  'σιτάρι': 'σιτάρι', 'καλαμπόκι': 'καλαμπόκι', 'βαμβάκι': 'βαμβάκι',
  'ελαιόλαδο': 'ελαιόλαδο', 'κριθάρι': 'κριθάρι', 'τομάτα': 'τομάτ',
  'πορτοκάλια': 'πορτοκάλι', 'ρύζι': 'ρύζι', 'ηλίανθος': 'ηλίανθ',
}

/**
 * Resolves an image for a listing. Pass (category, title) so the category
 * is matched first (most reliable), then the title. A crop category never
 * resolves to livestock, and the default is a neutral field.
 */
export function getProductImage(categoryOrTitle: string, title?: string): string {
  const cat = (categoryOrTitle ?? '').toLowerCase().trim()

  // 1. Exact category label from the form → canonical key
  if (CATEGORY_KEY_MAP[cat]) return CATEGORY_IMAGES[CATEGORY_KEY_MAP[cat]]

  // 2. Substring match on category
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (key !== 'default' && cat.includes(key)) return url
  }

  // 3. Fall back to title keyword match
  const ttl = (title ?? '').toLowerCase()
  if (ttl) {
    for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
      if (key !== 'default' && ttl.includes(key)) return url
    }
  }

  // 4. Neutral field — never livestock
  return CATEGORY_IMAGES.default
}

const BADGE_VARIANT: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
  'Νέο': 'success', 'Δημοφιλές': 'warning', 'Επείγον': 'danger', 'Προσφορά': 'info',
}

interface Props {
  listing: Listing
  currentUserId?: string
  onEdit?: () => void
  onDelete?: () => void
}

export function ListingCard({ listing, currentUserId, onEdit, onDelete }: Props) {
  const [showOffer, setShowOffer] = useState(false)
  const [contacting, setContacting] = useState(false)
  const { user } = useAuth()
  // Priority: user-uploaded > category-matched > default
  const img     = listing.image_url || getProductImage(listing.category, listing.title)
  const isOwner = currentUserId === listing.user_id

  async function handleContactSeller() {
    if (!user) { window.dispatchEvent(new CustomEvent('open-auth')); return }
    if (!listing.user_id || listing.user_id === user.id) return
    setContacting(true)
    const convId = await getOrCreateConversation(user.id, listing.user_id, listing.id)
    setContacting(false)
    if (convId) window.location.href = `/?view=messages&c=${convId}`
    else toast.error('Δεν ήταν δυνατή η έναρξη συνομιλίας')
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col">
        {/* Image */}
        <div className="relative h-44 overflow-hidden flex-shrink-0">
          <img
            src={img} alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={e => { (e.target as HTMLImageElement).src = CATEGORY_IMAGES.default }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          {listing.badge && (
            <span className="absolute top-3 right-3">
              <Badge variant={BADGE_VARIANT[listing.badge] ?? 'default'}>{listing.badge}</Badge>
            </span>
          )}
          {listing.user && (
            <div className="absolute bottom-3 left-3">
              <TrustBadge score={listing.user.trust_score ?? 50} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 leading-snug">{listing.title}</h3>
          {listing.user && (
            <div className="text-xs text-gray-400 mb-2 truncate">{listing.user.full_name}</div>
          )}
          <div className="text-2xl font-extrabold text-agro-800 font-display mb-2">
            €{Number(listing.price_per_ton).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-normal text-gray-400 ml-0.5">{perUnitShort(listing.measurement_unit)}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
            <span className="flex items-center gap-1 min-w-0">
              <Icons.package className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{formatQuantity(listing.quantity_tons, listing.measurement_unit)}</span>
            </span>
            <span className="flex items-center gap-1 min-w-0">
              <Icons.map className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{listing.location}</span>
            </span>
          </div>
          <div className="mt-auto space-y-2">
            {isOwner ? (
              <div className="space-y-2">
                <div className="text-center py-2 px-3 bg-agro-50 rounded-xl text-xs font-semibold text-agro-700 border border-agro-100">
                  Δική σου αγγελία
                </div>
                {(onEdit || onDelete) && (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={onEdit}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                      <Icons.edit className="w-3.5 h-3.5" /> Επεξεργασία
                    </button>
                    <button onClick={onDelete}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors">
                      <Icons.trash className="w-3.5 h-3.5" /> Διαγραφή
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="primary" size="sm" className="w-full" onClick={() => setShowOffer(true)}>
                  <Icons.euro className="w-3.5 h-3.5" /> Αποστολή Προσφοράς
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  {listing.user_id && (
                    <a href={`/user/${listing.user_id}`}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                      <Icons.user className="w-3.5 h-3.5" /> Προφίλ
                    </a>
                  )}
                  <button onClick={handleContactSeller} disabled={contacting}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-agro-200 text-xs font-semibold text-agro-700 hover:bg-agro-50 transition-colors disabled:opacity-50">
                    {contacting
                      ? <span className="w-3.5 h-3.5 border-2 border-agro-600 border-r-transparent rounded-full animate-spin" />
                      : <Icons.message className="w-3.5 h-3.5" />}
                    Μήνυμα
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showOffer && <OfferModal listing={listing} onClose={() => setShowOffer(false)} />}
    </>
  )
}
