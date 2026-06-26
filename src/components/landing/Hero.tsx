'use client'
import { useState, useEffect } from 'react'
import { Icons } from '@/components/ui/Icons'
import { useLocale } from '@/context/LocaleContext'
import type { MarketPrice } from '@/types'

interface HeroProps {
  onCta: () => void
  isLoggedIn: boolean
  prices: MarketPrice[]
}

export function Hero({ onCta }: HeroProps) {
  const { t } = useLocale()
  const [vis, setVis] = useState(false)
  useEffect(() => { const id = setTimeout(() => setVis(true), 80); return () => clearTimeout(id) }, [])

  return (
    <section className="relative overflow-hidden pt-16 min-h-[600px] flex items-center">
      {/* Background: the provided wheat-field-at-sunset image (combine + tractor visible), fills the whole Hero */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-field.png"
          alt="Χωράφι σιταριού στο ηλιοβασίλεμα με θεριζοαλωνιστική και τρακτέρ"
          className="w-full h-full object-cover" loading="eager"
        />
        {/* Subtle dark overlay (~30%) for text readability — keeps field, combine & tractor visible */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Gentle left-weighted darkening so the headline reads cleanly without hiding the scene */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-5 sm:px-6 w-full py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">

          {/* LEFT — Headline + description + single CTA. RIGHT side intentionally empty. */}
          <div className={`lg:col-span-7 transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h1 className="font-display font-black leading-[1.05] tracking-tight mb-5"
              style={{ fontSize: 'clamp(34px,4.8vw,56px)' }}>
              <span className="text-white">Η αγροτική αγορά</span><br />
              <span className="text-agro-400">σε μία πλατφόρμα</span>
            </h1>

            <p className="text-white/90 leading-relaxed mb-7 max-w-md"
              style={{ fontSize: 'clamp(15px,1.6vw,18px)' }}>
              {t('hero.subtitle')}
            </p>

            <div className="flex gap-3 flex-wrap">
              <button onClick={onCta}
                className="inline-flex items-center gap-2 bg-agro-700 text-white font-bold px-7 py-3.5 rounded-2xl text-base shadow-lg hover:bg-agro-800 transition-all">
                <Icons.home className="w-4 h-4" /> {t('hero.cta_dashboard')}
              </button>
            </div>
          </div>

          {/* RIGHT — intentionally empty (clean premium banner) */}
        </div>
      </div>
    </section>
  )
}
