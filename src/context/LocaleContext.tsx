'use client'
/**
 * LocaleContext — lightweight localization scaffolding.
 *
 * Phase A ships the architecture + selector. Greek is the active language;
 * English is registered and ready for future translation work.
 *
 * Usage:
 *   const { locale, setLocale, t } = useLocale()
 *   t('nav.market')  →  'Αγορά'  (el)  /  'Market'  (en)
 *
 * Strings live in /lib/translations.ts. Components can migrate to t()
 * incrementally — existing hardcoded Greek keeps working until then.
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { translations, type Locale } from '@/lib/translations'

interface LocaleCtx {
  locale:    Locale
  setLocale: (l: Locale) => void
  t:         (key: string, params?: Record<string, string | number>) => string
}

const Ctx = createContext<LocaleCtx | null>(null)

const STORAGE_KEY = 'agro-locale'

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? String(params[k]) : `{${k}}`))
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('el')

  // Restore saved preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (saved === 'el' || saved === 'en') setLocaleState(saved)
    } catch { /* ignore */ }
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
    // A full reload guarantees a clean translation pass: Greek (source) renders
    // pristine, then the Localizer applies English top-to-bottom. Switching back
    // to Greek restores the original strings without leftover translated nodes.
    if (typeof window !== 'undefined') {
      // Defer so localStorage is written before navigation.
      setTimeout(() => window.location.reload(), 0)
    }
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const dict = translations[locale] as Record<string, string>
    const fallback = translations.el as Record<string, string>
    return interpolate(dict[key] ?? fallback[key] ?? key, params)
  }, [locale])

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>
}

export function useLocale(): LocaleCtx {
  const ctx = useContext(Ctx)
  // Graceful fallback if provider is absent (e.g. isolated static pages)
  if (!ctx) {
    return {
      locale: 'el',
      setLocale: () => {},
      t: (k: string, params?: Record<string, string | number>) =>
        interpolate((translations.el as Record<string, string>)[k] ?? k, params),
    }
  }
  return ctx
}
