'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button, Input } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { LogoMark } from '@/components/ui/Logo'
import toast from 'react-hot-toast'

type Mode = 'login' | 'register' | 'forgot'

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode]       = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', full_name: '',
    roles: ['farmer'] as string[],
  })

  function set(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: '' }))
  }

  function toggleRole(role: string) {
    setForm(p => {
      const has = p.roles.includes(role)
      const next = has ? p.roles.filter(r => r !== role) : [...p.roles, role]
      return { ...p, roles: next.length ? next : p.roles } // keep at least one
    })
    setErrors(p => ({ ...p, roles: '' }))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.email) e.email = 'Απαιτείται email'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Μη έγκυρο email'

    if (mode !== 'forgot') {
      if (!form.password) e.password = 'Απαιτείται κωδικός'
      else if (form.password.length < 6) e.password = 'Τουλάχιστον 6 χαρακτήρες'
    }
    if (mode === 'register') {
      if (!form.full_name.trim()) e.full_name = 'Απαιτείται ονοματεπώνυμο'
      if (form.roles.length === 0) e.roles = 'Επίλεξε τουλάχιστον έναν ρόλο'
      if (form.confirmPassword && form.password !== form.confirmPassword)
        e.confirmPassword = 'Οι κωδικοί δεν ταιριάζουν'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === 'login') {
        const err = await signIn(form.email, form.password)
        if (err) {
          toast.error(
            err.message.includes('Invalid login') || err.message.includes('invalid_credentials')
              ? 'Λάθος email ή κωδικός'
              : err.message
          )
          return
        }
        toast.success('Καλώς ήρθες!')
        onClose()

      } else if (mode === 'register') {
        const err = await signUp(form.email, form.password, form.full_name.trim(), form.roles.join(','))
        if (err) {
          if (err.message?.includes('already registered') || err.message?.includes('χρησιμοποιείται ήδη')) {
            toast.error('Το email χρησιμοποιείται ήδη από υπάρχον λογαριασμό.')
          } else {
            toast.error(err.message ?? 'Σφάλμα εγγραφής')
          }
          return
        }
        // Account is active immediately — no email confirmation needed
        toast.success(`Καλώς ήρθες, ${form.full_name.split(' ')[0]}! Ο λογαριασμός σου είναι έτοιμος.`)
        onClose()

      } else {
        const err = await resetPassword(form.email)
        if (err) { toast.error(err.message); return }
        toast.success('Στάλθηκε email επαναφοράς κωδικού!')
        setMode('login')
      }
    } finally {
      setLoading(false)
    }
  }

  const titles: Record<Mode, string> = {
    login:    'Είσοδος',
    register: 'Δημιουργία Λογαριασμού',
    forgot:   'Επαναφορά Κωδικού',
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog" aria-modal="true" aria-label={titles[mode]}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <div>
              <div className="font-display font-bold text-gray-900 text-lg">{titles[mode]}</div>
              <div className="text-xs text-gray-400">AgroExchange</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Κλείσιμο"
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <Icons.x className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>

          {/* Register-only fields */}
          {mode === 'register' && (
            <>
              <Input
                label="Ονοματεπώνυμο"
                icon={<Icons.user className="w-4 h-4" />}
                placeholder="π.χ. Γιώργος Παπαδόπουλος"
                value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                error={errors.full_name}
                autoComplete="name"
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Ρόλοι <span className="text-gray-400 normal-case font-normal">(επίλεξε έναν ή περισσότερους)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'farmer',      label: 'Παραγωγός',  emoji: '🌾' },
                    { value: 'buyer',       label: 'Αγοραστής',  emoji: '🛒' },
                    { value: 'transporter', label: 'Μεταφορέας', emoji: '🚛' },
                    { value: 'insurer',     label: 'Ασφαλιστική', emoji: '🛡️' },
                  ].map(r => {
                    const checked = form.roles.includes(r.value)
                    return (
                      <button key={r.value} type="button" onClick={() => toggleRole(r.value)}
                        aria-pressed={checked}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                          checked
                            ? 'border-agro-500 bg-agro-50 text-agro-800'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-agro-300'
                        }`}>
                        <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? 'bg-agro-700 border-agro-700' : 'border-gray-300'}`}>
                          {checked && <Icons.check className="w-3 h-3 text-white" />}
                        </span>
                        <span>{r.emoji} {r.label}</span>
                      </button>
                    )
                  })}
                </div>
                {errors.roles && <span className="text-xs text-red-500">{errors.roles}</span>}
              </div>
            </>
          )}

          <Input
            label="Email"
            type="email"
            icon={<Icons.mail className="w-4 h-4" />}
            placeholder="email@example.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />

          {mode !== 'forgot' && (
            <Input
              label="Κωδικός"
              type="password"
              icon={<Icons.lock className="w-4 h-4" />}
              placeholder="••••••••"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              error={errors.password}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          )}

          {mode === 'register' && (
            <Input
              label="Επιβεβαίωση Κωδικού"
              type="password"
              icon={<Icons.lock className="w-4 h-4" />}
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={e => set('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
          )}

          {/* Register notice — immediate activation */}
          {mode === 'register' && (
            <div className="flex items-start gap-2 bg-agro-50 rounded-xl px-3 py-2.5 border border-agro-100">
              <Icons.check className="w-4 h-4 text-agro-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-agro-800 leading-relaxed">
                Ο λογαριασμός σου θα ενεργοποιηθεί <strong>αμέσως</strong> χωρίς επιβεβαίωση email.
              </p>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full mt-1">
            {mode === 'login' ? 'Είσοδος' : mode === 'register' ? 'Δημιουργία Λογαριασμού' : 'Αποστολή Email'}
          </Button>
        </form>

        {/* Footer links */}
        <div className="mt-5 flex flex-col items-center gap-2 text-sm text-gray-500">
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('forgot')}
                className="text-agro-700 hover:underline text-xs">
                Ξέχασες τον κωδικό;
              </button>
              <span>
                Δεν έχεις λογαριασμό;{' '}
                <button onClick={() => setMode('register')}
                  className="text-agro-700 font-semibold hover:underline">
                  Εγγραφή
                </button>
              </span>
            </>
          )}
          {mode === 'register' && (
            <span>
              Έχεις λογαριασμό;{' '}
              <button onClick={() => setMode('login')}
                className="text-agro-700 font-semibold hover:underline">
                Είσοδος
              </button>
            </span>
          )}
          {mode === 'forgot' && (
            <button onClick={() => setMode('login')}
              className="text-agro-700 hover:underline">
              ← Πίσω στην είσοδο
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
