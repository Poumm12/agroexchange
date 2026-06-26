'use client'
import type { ReactNode } from 'react'
import { Icons } from '@/components/ui/Icons'
import type { User, UserRole } from '@/types'

/**
 * VerificationBadges — future-ready verification display.
 * Reads the verification flags on the profile and renders the
 * corresponding trust badges. Architecture supports adding more
 * verification types without touching consumers.
 */
const VERIFICATIONS: {
  key: keyof Pick<User, 'verified' | 'verified_transporter' | 'verified_business' | 'verified_insurer'>
  label: string
  className: string
  Icon: (p: any) => ReactNode
}[] = [
  { key: 'verified',             label: 'Επαληθευμένος Χρήστης',        className: 'bg-blue-100 text-blue-700',     Icon: Icons.check  },
  { key: 'verified_transporter', label: 'Επαληθευμένος Μεταφορέας',     className: 'bg-orange-100 text-orange-700', Icon: Icons.truck  },
  { key: 'verified_business',    label: 'Επαληθευμένη Επιχείρηση',      className: 'bg-purple-100 text-purple-700', Icon: Icons.shield },
  { key: 'verified_insurer',     label: 'Επαληθευμένη Ασφαλιστική',     className: 'bg-teal-100 text-teal-700',     Icon: Icons.umbrella },
]

export function VerificationBadges({ user, compact = false }: { user: User; compact?: boolean }) {
  const active = VERIFICATIONS.filter(v => Boolean((user as any)[v.key]))
  if (active.length === 0) return null
  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      {active.map(v => (
        <span key={v.key}
          title={v.label}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${v.className}`}>
          <v.Icon className="w-3 h-3" />
          {!compact && <span>{v.label}</span>}
        </span>
      ))}
    </span>
  )
}

const ROLE_META: Record<UserRole, { label: string; emoji: string; className: string }> = {
  farmer:      { label: 'Παραγωγός',   emoji: '🌾', className: 'bg-green-100 text-green-800'   },
  buyer:       { label: 'Αγοραστής',   emoji: '🛒', className: 'bg-blue-100 text-blue-700'     },
  transporter: { label: 'Μεταφορέας',  emoji: '🚛', className: 'bg-orange-100 text-orange-700' },
  insurer:     { label: 'Ασφαλιστική', emoji: '🛡️', className: 'bg-teal-100 text-teal-700'      },
  admin:       { label: 'Admin',       emoji: '⚙️', className: 'bg-gray-200 text-gray-700'      },
}

export function RoleBadges({ roles }: { roles: UserRole[] }) {
  const unique = Array.from(new Set(roles ?? []))
  if (unique.length === 0) return null
  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      {unique.map(r => {
        const m = ROLE_META[r] ?? ROLE_META.farmer
        return (
          <span key={r} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${m.className}`}>
            <span>{m.emoji}</span> {m.label}
          </span>
        )
      })}
    </span>
  )
}
