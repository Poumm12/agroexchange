'use client'

/**
 * AgroExchange Logo — recreated as inline SVG from the brand mark.
 * Circular emblem: a green leaf + golden wheat stalk rising over
 * rolling field furrows, enclosed in a two-tone green ring.
 *
 * Variants:
 *   mark   — just the circular emblem (for favicon / compact spots)
 *   full   — emblem + wordmark (default)
 *
 * `theme="light"` renders the wordmark in white (for dark backgrounds).
 */
interface LogoProps {
  variant?: 'mark' | 'full'
  size?: number
  theme?: 'dark' | 'light'
  showTagline?: boolean
  className?: string
}

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="agroRing" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1B5E20" />
          <stop offset="1" stopColor="#7CB342" />
        </linearGradient>
        <linearGradient id="agroLeaf" x1="20" y1="18" x2="34" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#43A047" />
          <stop offset="1" stopColor="#1B5E20" />
        </linearGradient>
        <linearGradient id="agroWheat" x1="38" y1="18" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4A017" />
          <stop offset="1" stopColor="#B8860B" />
        </linearGradient>
      </defs>

      {/* Outer ring with a small gap (open circle look) */}
      <path
        d="M32 4 A28 28 0 1 1 14 11"
        stroke="url(#agroRing)" strokeWidth="4" strokeLinecap="round" fill="none"
      />

      {/* Field furrows */}
      <path d="M16 44 Q32 36 48 44" stroke="#2E7D32" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M18 48 Q32 41 46 48" stroke="#43A047" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.7" />

      {/* Leaf */}
      <path
        d="M30 40 C20 38 19 26 27 20 C31 28 33 33 30 40 Z"
        fill="url(#agroLeaf)"
      />
      <path d="M27.5 22 C28.5 28 29 34 29.5 38" stroke="#A5D6A7" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Wheat stalk */}
      <line x1="40" y1="40" x2="40" y2="22" stroke="url(#agroWheat)" strokeWidth="1.6" strokeLinecap="round" />
      {[22, 26, 30, 34].map((y, i) => (
        <g key={i}>
          <path d={`M40 ${y} q-4 -1.5 -5 -4`} stroke="url(#agroWheat)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d={`M40 ${y} q4 -1.5 5 -4`} stroke="url(#agroWheat)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      ))}
      <circle cx="40" cy="19" r="1.6" fill="#D4A017" />
    </svg>
  )
}

export function Logo({
  variant = 'full',
  size = 32,
  theme = 'dark',
  showTagline = false,
  className = '',
}: LogoProps) {
  if (variant === 'mark') {
    return <LogoMark size={size} />
  }

  const agroColor = theme === 'light' ? '#FFFFFF' : '#1B5E20'
  const exchColor = theme === 'light' ? '#A5D6A7' : '#4CAF50'
  const taglineColor = theme === 'light' ? 'rgba(255,255,255,0.6)' : '#6B7280'

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className="flex flex-col leading-none">
        <span className="font-display font-extrabold tracking-tight" style={{ fontSize: size * 0.56 }}>
          <span style={{ color: agroColor }}>AGRO</span><span style={{ color: exchColor }}>EXCHANGE</span>
        </span>
        {showTagline && (
          <span
            className="font-medium tracking-wide mt-0.5 uppercase"
            style={{ fontSize: size * 0.18, color: taglineColor, letterSpacing: '0.08em' }}>
            Ψηφιακό Χρηματιστήριο Αγροτικών Προϊόντων
          </span>
        )}
      </span>
    </span>
  )
}
