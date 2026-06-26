'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { TransportListing, RouteRequest } from '@/types'

const PROFILE_SELECT = 'user:profiles(id,full_name,avatar_url,trust_score,rating,rating_count,verified,verified_transporter)'

/** Transport listings (services offered by transporters). */
export function useTransportListings(filters?: { from?: string; to?: string }) {
  const supabase = useRef(getSupabaseClient()).current
  const [listings, setListings] = useState<TransportListing[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('transport_listings')
      .select(`*, ${PROFILE_SELECT}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    if (filters?.from) q = q.ilike('from_location', `%${filters.from}%`)
    if (filters?.to)   q = q.ilike('to_location', `%${filters.to}%`)
    const { data } = await q
    setListings((data ?? []) as TransportListing[])
    setLoading(false)
  }, [supabase, filters?.from, filters?.to])

  useEffect(() => { load() }, [load])

  async function createListing(payload: Partial<TransportListing>) {
    const { data, error } = await supabase
      .from('transport_listings')
      .insert(payload)
      .select(`*, ${PROFILE_SELECT}`)
      .single()
    if (!error && data) setListings(prev => [data as TransportListing, ...prev])
    return { data, error }
  }

  return { listings, loading, reload: load, createListing }
}

/** Route requests (transport demand). */
export function useRouteRequests(filters?: { from?: string; to?: string }) {
  const supabase = useRef(getSupabaseClient()).current
  const [requests, setRequests] = useState<RouteRequest[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('route_requests')
      .select('*, user:profiles(id,full_name,avatar_url)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
    if (filters?.from) q = q.ilike('from_location', `%${filters.from}%`)
    if (filters?.to)   q = q.ilike('to_location', `%${filters.to}%`)
    const { data } = await q
    setRequests((data ?? []) as RouteRequest[])
    setLoading(false)
  }, [supabase, filters?.from, filters?.to])

  useEffect(() => { load() }, [load])

  async function createRequest(payload: Partial<RouteRequest>) {
    const { data, error } = await supabase
      .from('route_requests')
      .insert(payload)
      .select('*, user:profiles(id,full_name,avatar_url)')
      .single()
    if (!error && data) setRequests(prev => [data as RouteRequest, ...prev])
    return { data, error }
  }

  return { requests, loading, reload: load, createRequest }
}
