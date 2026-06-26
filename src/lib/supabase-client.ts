/**
 * supabase-client.ts — Browser-only Supabase singleton
 * Safe for 'use client' files. No server-only imports.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Module-level singleton — created once per browser session
let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // SSR: stateless, no persistence
    return createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  if (!_client) {
    _client = createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,   // picks up #access_token from email links
        storageKey: 'agro-auth',    // named key avoids conflicts
      },
    })
  }
  return _client
}
