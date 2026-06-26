'use client'
import { useState, useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { Notification } from '@/types'

// Monotonic counter so every hook instance gets a distinct channel topic.
// This prevents Supabase from reusing a same-named channel across the
// multiple components that mount this hook (Navbar, DashboardNav,
// NotificationsTab), which would otherwise cause:
//   "cannot add `postgres_changes` callbacks ... after `subscribe()`"
let channelSeq = 0

export function useNotifications(userId?: string) {
  const supabase                                    = getSupabaseClient()
  const [notifications, setNotifications]           = useState<Notification[]>([])
  const [unreadCount, setUnreadCount]               = useState(0)
  // Stable unique id for this hook instance (survives re-renders).
  const instanceId                                  = useRef(++channelSeq)

  useEffect(() => {
    if (!userId) return
    load()

    let cancelled = false
    // Unique topic per instance → never reuses an already-subscribed channel.
    const channel = supabase.channel(`notifications:${userId}:${instanceId.current}`)

    // Register ALL listeners BEFORE subscribe().
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      payload => {
        setNotifications(prev => {
          const incoming = payload.new as Notification
          if (prev.some(n => n.id === incoming.id)) return prev
          return [incoming, ...prev]
        })
        setUnreadCount(c => c + 1)
      }
    )

    // Subscribe once, only if this effect hasn't been torn down (Strict Mode).
    if (!cancelled) channel.subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function load() {
    if (!userId) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    const items = (data ?? []) as Notification[]
    setNotifications(items)
    setUnreadCount(items.filter(n => !n.read).length)
  }

  async function markAllRead() {
    if (!userId) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(c => Math.max(0, c - 1))
  }

  return { notifications, unreadCount, markAllRead, markRead }
}
