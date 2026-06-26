'use client'
/**
 * AuthContext — single source of truth for auth state.
 *
 * Registration flow (no email confirmation required):
 *   signUp → account active immediately → auto sign-in → welcome email via /api/welcome
 *
 * Supabase project must have "Confirm email" DISABLED:
 *   Dashboard → Authentication → Settings → "Enable email confirmations" → OFF
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { User } from '@/types'

interface AuthCtx {
  user:           User | null
  loading:        boolean
  signIn:         (email: string, password: string) => Promise<any>
  signUp:         (email: string, password: string, fullName: string, role: string) => Promise<any>
  signOut:        () => Promise<void>
  resetPassword:  (email: string) => Promise<any>
  updateProfile:  (updates: Partial<User>) => Promise<{ error: any }>
  updatePassword: (newPassword: string) => Promise<any>
  deleteAccount:  () => Promise<any>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase      = useRef(getSupabaseClient()).current
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const fetchingRef           = useRef(false)

  const fetchProfile = useCallback(async (userId: string) => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        // DB trigger may still be running — use auth metadata as fallback
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const metaRoles = (authUser.user_metadata?.roles as string | undefined)
          const rolesArr  = metaRoles
            ? metaRoles.split(',').map(r => r.trim()).filter(Boolean) as User['roles']
            : [(authUser.user_metadata?.role ?? 'farmer')] as User['roles']
          setUser({
            id:              authUser.id,
            email:           authUser.email ?? '',
            full_name:       authUser.user_metadata?.full_name ?? authUser.email?.split('@')[0] ?? '',
            role:            (rolesArr[0] ?? 'farmer') as User['role'],
            roles:           rolesArr,
            trust_score:     50,
            total_deals:     0,
            total_value:     0,
            total_sales:     0,
            total_purchases: 0,
            successful_deals: 0,
            rating:          0,
            rating_count:    0,
            verified:        false,
            show_phone:      false,
            show_email:      false,
            show_location:   true,
            created_at:      authUser.created_at ?? '',
          })
        }
      } else {
        setUser(data as User)
      }
    } catch {
      setUser(null)
    } finally {
      fetchingRef.current = false
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user) fetchProfile(session.user.id)
      else {
        fetchingRef.current = false
        setUser(null)
        setLoading(false)
      }
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [fetchProfile, supabase])

  // ── Sign In ────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }, [supabase])

  // ── Sign Up ────────────────────────────────────────────────
  // Email confirmation is DISABLED in Supabase → user is active immediately.
  // After successful registration we:
  //   1. Auto sign-in the user
  //   2. Trigger welcome email via /api/welcome (fire-and-forget)
  const signUp = useCallback(async (
    email: string, password: string, fullName: string, role: string,
  ) => {
    // `role` may be a single role or a comma-separated list (multi-role).
    const rolesCsv = role.includes(',') ? role : role
    const primaryRole = rolesCsv.split(',')[0].trim()

    // Check duplicate email
    const { data: existing } = await supabase
      .from('profiles').select('id').eq('email', email).maybeSingle()
    if (existing) {
      return { message: 'Το email χρησιμοποιείται ήδη από υπάρχον λογαριασμό.' }
    }

    // Create account (email_confirm disabled in Supabase → active immediately)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: primaryRole, roles: rolesCsv },
        // No emailRedirectTo needed — confirmation is disabled
      },
    })
    if (error) return error

    // Auto sign-in immediately (session may already exist if confirmation is off)
    if (!data.session) {
      await supabase.auth.signInWithPassword({ email, password })
    }

    // Send welcome email (non-blocking — failure doesn't affect registration)
    fetch('/api/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, full_name: fullName }),
    }).catch(() => {/* silent — welcome email is best-effort */})

    return null // null = success
  }, [supabase])

  // ── Sign Out ───────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setLoading(false)
  }, [supabase])

  // ── Reset Password ─────────────────────────────────────────
  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
    })
    return error
  }, [supabase])

  // ── Update Profile ─────────────────────────────────────────
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return { error: new Error('Not authenticated') }
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    if (!error) setUser(prev => prev ? { ...prev, ...updates } : prev)
    return { error }
  }, [supabase, user])

  // ── Update Password ────────────────────────────────────────
  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return error
  }, [supabase])

  // ── Delete Account ─────────────────────────────────────────
  const deleteAccount = useCallback(async () => {
    if (!user) return new Error('Not authenticated')
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.signOut()
    setUser(null)
    return null
  }, [supabase, user])

  return (
    <Ctx.Provider value={{
      user, loading,
      signIn, signUp, signOut, resetPassword,
      updateProfile, updatePassword, deleteAccount,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuthContext(): AuthCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuthContext must be inside <AuthProvider>')
  return ctx
}
