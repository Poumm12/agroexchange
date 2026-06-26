'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { Icons } from '@/components/ui/Icons'
import { Button, Input } from '@/components/ui'
import toast from 'react-hot-toast'

function ResetPasswordForm() {
  const supabase = getSupabaseClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  // Supabase sends session via URL fragment
  useEffect(() => {
    const hash        = window.location.hash.slice(1)
    const hashParams  = new URLSearchParams(hash)
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { toast.error('Οι κωδικοί δεν ταιριάζουν'); return }
    if (password.length < 6)  { toast.error('Ο κωδικός πρέπει να είναι τουλάχιστον 6 χαρακτήρες'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    setDone(true)
    toast.success('Ο κωδικός ενημερώθηκε!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 to-green-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-agro-100 rounded-xl flex items-center justify-center text-agro-800">
            <Icons.wheat className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-extrabold text-gray-900 text-lg">AgroExchange</div>
            <div className="text-xs text-gray-400">Επαναφορά Κωδικού</div>
          </div>
        </div>

        {done ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.check className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Επιτυχία!</h3>
            <p className="text-gray-500 text-sm mb-6">Ο κωδικός σου ενημερώθηκε επιτυχώς.</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-agro-800 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-agro-900 transition-colors"
            >
              Πήγαινε στην Αρχική
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Νέος Κωδικός"
              type="password"
              icon={<Icons.lock className="w-4 h-4" />}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Input
              label="Επιβεβαίωση Κωδικού"
              type="password"
              icon={<Icons.lock className="w-4 h-4" />}
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            <Button type="submit" loading={loading} className="w-full mt-2">
              Αποθήκευση Κωδικού
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
