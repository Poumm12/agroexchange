'use client'
import { useState, useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { MapPoint } from '@/types'

export function useMapPoints() {
  const supabase = useRef(getSupabaseClient()).current
  const [points, setPoints] = useState<MapPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      const { data } = await supabase.from('map_points').select('*').order('name')
      if (!active) return
      setPoints((data ?? []) as MapPoint[])
      setLoading(false)
    })()
    return () => { active = false }
  }, [supabase])

  return { points, loading }
}
