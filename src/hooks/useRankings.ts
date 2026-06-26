'use client'
import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { RankingEntry } from '@/types'

const VALID_SORT_COLS = new Set([
  'total_deals', 'total_value', 'total_sales',
  'total_purchases', 'trust_score', 'rating',
])

export function useRankings(sortBy = 'total_deals') {
  const supabase                      = getSupabaseClient()
  const [rankings, setRankings]       = useState<RankingEntry[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => { load(sortBy) }, [sortBy])

  async function load(sort: string) {
    setLoading(true)
    const col = VALID_SORT_COLS.has(sort) ? sort : 'total_deals'
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order(col, { ascending: false })
      .limit(20)

    setRankings(((data ?? []) as any[]).map((u, i) => ({
      rank:            i + 1,
      user:            u,
      total_deals:     u.total_deals,
      total_value:     u.total_value,
      total_sales:     u.total_sales,
      total_purchases: u.total_purchases,
      rating:          u.rating,
      trust_score:     u.trust_score,
      badge:           i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : undefined,
    })))
    setLoading(false)
  }

  return { rankings, loading, reload: load }
}
