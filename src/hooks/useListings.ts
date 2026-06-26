'use client'
import { useState, useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { Listing } from '@/types'

interface Filters {
  category?: string
  search?: string
  status?: string
}

export function useListings(filters?: Filters) {
  const supabase = useRef(getSupabaseClient()).current
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => { load() }, [filters?.category, filters?.search, filters?.status])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      let q = supabase
        .from('listings')
        .select('*, user:profiles(id,full_name,location,trust_score,rating,avatar_url,verified)')
        .eq('status', filters?.status ?? 'active')
        .order('created_at', { ascending: false })

      if (filters?.category) {
        q = q.eq('category', filters.category)
      }

      // Search across title, category AND location
      if (filters?.search) {
        const term = `%${filters.search}%`
        q = q.or(`title.ilike.${term},category.ilike.${term},location.ilike.${term}`)
      }

      const { data, error: err } = await q
      if (err) throw err
      setListings((data ?? []) as Listing[])
    } catch (e: any) {
      setError(e.message)
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  async function createListing(payload: Partial<Listing>) {
    const { data, error } = await supabase
      .from('listings')
      .insert(payload)
      .select('*, user:profiles(id,full_name,location,trust_score,rating,avatar_url,verified)')
      .single()
    if (!error) setListings(prev => [data as Listing, ...prev])
    return { data, error }
  }

  async function updateListing(id: string, updates: Partial<Listing>) {
    const { error } = await supabase.from('listings').update(updates).eq('id', id)
    if (!error) setListings(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
    return error
  }

  async function deleteListing(id: string) {
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (!error) setListings(prev => prev.filter(l => l.id !== id))
    return error
  }

  return { listings, loading, error, reload: load, createListing, updateListing, deleteListing }
}
