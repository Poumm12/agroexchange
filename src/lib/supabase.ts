/**
 * supabase.ts — backward-compatibility re-export shim.
 *
 * Client-side code:  import { getSupabaseClient } from '@/lib/supabase'
 * Server API routes: import { getSupabaseAdmin } from '@/lib/supabase-admin'
 *
 * This file contains ZERO server-only imports.
 */
export {
  getSupabaseClient,
  getSupabaseClient as createSupabaseClient,
} from './supabase-client'
