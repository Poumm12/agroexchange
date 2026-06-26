// SVG flag components — render identically on every OS (unlike emoji flags,
// which Windows displays as "GR"/"GB" letters instead of actual flags).

interface FlagProps { className?: string }

export function FlagGR({ className = 'w-5 h-5' }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 27 18" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ελληνικά">
      <rect width="27" height="18" rx="2" fill="#0D5EAF" />
      {/* 9 stripes */}
      <g fill="#fff">
        <rect y="2" width="27" height="2" />
        <rect y="6" width="27" height="2" />
        <rect y="10" width="27" height="2" />
        <rect y="14" width="27" height="2" />
      </g>
      {/* Blue canton */}
      <rect width="10" height="10" fill="#0D5EAF" />
      {/* Cross */}
      <g fill="#fff">
        <rect x="4" y="0" width="2" height="10" />
        <rect x="0" y="4" width="10" height="2" />
      </g>
    </svg>
  )
}

export function FlagGB({ className = 'w-5 h-5' }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="English">
      <clipPath id="ukRound"><rect width="60" height="40" rx="4" /></clipPath>
      <g clipPath="url(#ukRound)">
        <rect width="60" height="40" fill="#012169" />
        {/* White diagonals */}
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
        {/* Red diagonals */}
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4"
          clipPath="url(#ukRound)" />
        {/* White cross */}
        <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="13" />
        {/* Red cross */}
        <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="8" />
      </g>
    </svg>
  )
}

// Map locale code → flag component
export const FLAG_BY_CODE: Record<string, (p: FlagProps) => JSX.Element> = {
  el: FlagGR,
  en: FlagGB,
}
