'use client'
import { useState, useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import { useAuth } from '@/hooks/useAuth'
import { getOrCreateConversation } from '@/hooks/useMessages'
import { Card, TrustBadge, StarRating, Button, Spinner } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { Logo } from '@/components/ui/Logo'
import { ListingCard } from '@/components/dashboard/ListingCard'
import { VerificationBadges, RoleBadges } from '@/components/profile/Badges'
import { formatDistanceToNow } from 'date-fns'
import { el } from 'date-fns/locale'
import type { User, Listing, Review } from '@/types'
import toast from 'react-hot-toast'

export function PublicProfile({ userId }: { userId: string }) {
  const supabase = useRef(getSupabaseClient()).current
  const { user: viewer } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [contacting, setContacting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (!active) return
      if (!p) { setNotFound(true); setLoading(false); return }
      setProfile(p as User)

      const [{ data: l }, { data: r }] = await Promise.all([
        supabase.from('listings')
          .select('*, user:profiles(id,full_name,location,trust_score,rating,avatar_url,verified)')
          .eq('user_id', userId).eq('status', 'active')
          .order('created_at', { ascending: false }),
        supabase.from('reviews')
          .select('*, reviewer:profiles!reviews_reviewer_id_fkey(id,full_name,avatar_url)')
          .eq('reviewed_id', userId)
          .order('created_at', { ascending: false }).limit(20),
      ])
      if (!active) return
      setListings((l ?? []) as Listing[])
      setReviews((r ?? []) as Review[])
      setLoading(false)
    })()
    return () => { active = false }
  }, [userId, supabase])

  async function handleContact() {
    if (!viewer) { window.dispatchEvent(new CustomEvent('open-auth')); return }
    if (viewer.id === userId) { toast('Αυτό είναι το προφίλ σου'); return }
    setContacting(true)
    const convId = await getOrCreateConversation(viewer.id, userId)
    setContacting(false)
    if (convId) {
      window.location.href = `/?view=messages&c=${convId}`
    } else {
      toast.error('Δεν ήταν δυνατή η έναρξη συνομιλίας')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size={36} /></div>
  }
  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <Icons.user className="w-12 h-12 text-gray-300 mb-3" />
        <h1 className="font-display font-bold text-gray-900 text-xl mb-2">Ο χρήστης δεν βρέθηκε</h1>
        <a href="/" className="text-agro-700 font-semibold hover:underline text-sm">← Επιστροφή στην αρχική</a>
      </div>
    )
  }

  const isSelf = viewer?.id === profile.id
  const avgRating = profile.rating ?? 0
  const joined = profile.created_at ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: el }) : ''

  const stats = [
    { label: 'Συνολικά Deals',   value: profile.total_deals ?? 0 },
    { label: 'Επιτυχημένα',      value: profile.successful_deals ?? profile.total_deals ?? 0 },
    { label: 'Trust Score',      value: `${profile.trust_score}/100` },
    { label: 'Αξιολόγηση',       value: avgRating > 0 ? avgRating.toFixed(1) : '—' },
    { label: 'Ενεργές Αγγελίες', value: listings.length },
    { label: 'Μέλος',            value: joined || '—' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <a href="/" aria-label="AgroExchange αρχική"><Logo size={26} theme="dark" /></a>
          <a href="/" className="text-sm text-gray-500 hover:text-agro-700">← Αρχική</a>
        </div>
      </nav>

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-24 h-24 rounded-2xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-agro-800 text-white font-bold text-3xl flex items-center justify-center flex-shrink-0">
                {profile.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
            )}

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h1 className="font-display font-extrabold text-gray-900 text-2xl tracking-tight">{profile.full_name}</h1>
                <VerificationBadges user={profile} compact />
              </div>
              {profile.username && <div className="text-sm text-gray-400">@{profile.username}</div>}

              <div className="mt-2 flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <RoleBadges roles={profile.roles ?? [profile.role]} />
              </div>

              <div className="mt-3 flex items-center gap-3 justify-center sm:justify-start flex-wrap">
                <TrustBadge score={profile.trust_score} />
                {avgRating > 0 && <StarRating rating={avgRating} size={14} />}
                {profile.show_location && profile.location && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Icons.map className="w-3.5 h-3.5" /> {profile.location}
                  </span>
                )}
              </div>

              {profile.bio && <p className="mt-3 text-sm text-gray-600 leading-relaxed">{profile.bio}</p>}

              {/* Contact info — respects privacy settings */}
              <div className="mt-3 flex flex-wrap gap-3 justify-center sm:justify-start text-sm text-gray-500">
                {profile.show_email && profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-1 hover:text-agro-700">
                    <Icons.mail className="w-3.5 h-3.5" /> {profile.email}
                  </a>
                )}
                {profile.show_phone && profile.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-1 hover:text-agro-700">
                    <Icons.zap className="w-3.5 h-3.5" /> {profile.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            {!isSelf && (
              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                <Button onClick={handleContact} loading={contacting} icon={<Icons.message className="w-4 h-4" />}>
                  Αποστολή Μηνύματος
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Stats */}
        <Card className="p-6">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Στατιστικά</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map(s => (
              <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="font-display font-black text-lg text-agro-800">{s.value}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Active listings */}
        {listings.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 text-base mb-4">Ενεργές Αγγελίες ({listings.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map(l => <ListingCard key={l.id} listing={l} currentUserId={viewer?.id} />)}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h2 className="font-bold text-gray-900 text-base mb-4">
            Αξιολογήσεις {reviews.length > 0 && `(${reviews.length})`}
          </h2>
          {reviews.length === 0 ? (
            <Card className="p-8 text-center text-gray-400 text-sm">
              <Icons.star className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Δεν υπάρχουν αξιολογήσεις ακόμη
            </Card>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {(r as any).reviewer?.avatar_url ? (
                      <img src={(r as any).reviewer.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-agro-100 text-agro-800 text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {(r as any).reviewer?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <a href={`/user/${(r as any).reviewer?.id}`} className="font-semibold text-gray-900 text-sm hover:text-agro-700 truncate">
                          {(r as any).reviewer?.full_name ?? 'Χρήστης'}
                        </a>
                        <StarRating rating={r.rating} size={12} showNum={false} />
                      </div>
                      {r.comment && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{r.comment}</p>}
                      <div className="text-[11px] text-gray-400 mt-1">
                        {r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: el }) : ''}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
