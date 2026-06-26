'use client'
/**
 * useAuth — convenience wrapper around AuthContext.
 * All components that call useAuth() share the same auth state
 * because they all read from the single AuthProvider instance.
 *
 * No getSession/onAuthStateChange here — that runs once in AuthProvider.
 */
export { useAuthContext as useAuth } from '@/context/AuthContext'
