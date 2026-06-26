/**
 * supabase-admin.ts
 * ─────────────────
 * Server-only Supabase admin client.
 * Import ONLY in /app/api/* route handlers.
 * NEVER import this in 'use client' files or hooks.
 */
import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
