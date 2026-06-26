'use client'
import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { Offer } from '@/types'

export function useOffers(userId?: string) {
  const supabase                  = getSupabaseClient()
  const [offers, setOffers]       = useState<Offer[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => { if (userId) load() }, [userId])

  async function load() {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('offers')
      .select(`
        *,
        listing:listings(title,category,image_url),
        buyer:profiles!offers_buyer_id_fkey(full_name,avatar_url,trust_score),
        seller:profiles!offers_seller_id_fkey(full_name,avatar_url)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    setOffers((data ?? []) as Offer[])
    setLoading(false)
  }

  async function createOffer(payload: Partial<Offer>) {
    const { data, error } = await supabase
      .from('offers')
      .insert(payload)
      .select()
      .single()
    return { data, error }
  }

  async function updateOfferStatus(id: string, status: Offer['status']) {
    const { error } = await supabase
      .from('offers')
      .update({ status })
      .eq('id', id)
    if (!error) setOffers(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    return error
  }

  return { offers, loading, reload: load, createOffer, updateOfferStatus }
}
