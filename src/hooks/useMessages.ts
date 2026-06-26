'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { Conversation, Message } from '@/types'

// Monotonic counter → unique channel topic per hook instance, so the
// same-named channel is never reused after subscribe() (which triggers
// "cannot add postgres_changes callbacks ... after subscribe()" when
// multiple components mount these hooks, e.g. DashboardNav + MessagesTab).
let msgChannelSeq = 0

/**
 * useConversations — list + realtime unread count for the current user.
 * Reuses the existing Supabase client + realtime channels.
 */
export function useConversations(userId?: string) {
  const supabase = useRef(getSupabaseClient()).current
  const instanceId = useRef(++msgChannelSeq)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [totalUnread, setTotalUnread] = useState(0)

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data: convs } = await supabase
      .from('conversations')
      .select(`*,
        a:profiles!conversations_user_a_fkey(id,full_name,avatar_url,trust_score),
        b:profiles!conversations_user_b_fkey(id,full_name,avatar_url,trust_score)`)
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order('last_message_at', { ascending: false })

    const list = (convs ?? []) as any[]

    // Unread counts per conversation
    const withMeta = await Promise.all(list.map(async (c) => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', c.id)
        .eq('recipient_id', userId)
        .eq('read', false)
      const other = c.user_a === userId ? c.b : c.a
      return { ...c, other_user: other, unread_count: count ?? 0 } as Conversation
    }))

    setConversations(withMeta)
    setTotalUnread(withMeta.reduce((s, c) => s + (c.unread_count ?? 0), 0))
    setLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    load()
    if (!userId) return
    let cancelled = false
    // Register listener BEFORE subscribe(); unique topic per instance.
    const channel = supabase.channel(`messages-inbox:${userId}:${instanceId.current}`)
    channel.on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}` },
      () => load()
    )
    if (!cancelled) channel.subscribe()
    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [userId, load, supabase])

  return { conversations, loading, totalUnread, reload: load }
}

/**
 * useThread — messages for a single conversation + send + realtime.
 */
export function useThread(conversationId?: string, userId?: string) {
  const supabase = useRef(getSupabaseClient()).current
  const instanceId = useRef(++msgChannelSeq)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!conversationId) { setMessages([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    setMessages((data ?? []) as Message[])
    setLoading(false)

    // Mark incoming as read
    if (userId) {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', userId)
        .eq('read', false)
    }
  }, [supabase, conversationId, userId])

  useEffect(() => {
    load()
    if (!conversationId) return
    let cancelled = false
    // Register listener BEFORE subscribe(); unique topic per instance.
    const channel = supabase.channel(`thread:${conversationId}:${instanceId.current}`)
    channel.on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        setMessages(prev => {
          const m = payload.new as Message
          if (prev.some(x => x.id === m.id)) return prev
          return [...prev, m]
        })
      }
    )
    if (!cancelled) channel.subscribe()
    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [conversationId, load, supabase])

  async function send(recipientId: string, body: string) {
    if (!userId || !conversationId || !body.trim()) return { error: new Error('invalid') }
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: userId, recipient_id: recipientId, body: body.trim() })
      .select()
      .single()
    if (!error && data) {
      setMessages(prev => prev.some(x => x.id === (data as Message).id) ? prev : [...prev, data as Message])
    }
    return { data, error }
  }

  return { messages, loading, send, reload: load }
}

/**
 * getOrCreateConversation — finds an existing 1:1 conversation or creates one.
 * Returns the conversation id.
 */
export async function getOrCreateConversation(
  userId: string, otherId: string, listingId?: string,
): Promise<string | null> {
  const supabase = getSupabaseClient()
  // Try find existing (either ordering)
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(user_a.eq.${userId},user_b.eq.${otherId}),and(user_a.eq.${otherId},user_b.eq.${userId})`)
    .limit(1)
    .maybeSingle()
  if (existing) return (existing as any).id

  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_a: userId, user_b: otherId, listing_id: listingId ?? null })
    .select('id')
    .single()
  if (error) return null
  return (data as any).id
}
