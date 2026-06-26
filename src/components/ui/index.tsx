'use client'
import { ReactNode, useState } from 'react'
import { Icons } from './Icons'

// ─── TrustBadge ───────────────────────────────────────────────
export function TrustBadge({ score }: { score: number }) {
  const color =
    score >= 95 ? { bg: 'bg-blue-100',   text: 'text-blue-700'   } :
    score >= 85 ? { bg: 'bg-agro-100',   text: 'text-agro-800'   } :
    score >= 70 ? { bg: 'bg-amber-100',  text: 'text-amber-700'  } :
                  { bg: 'bg-gray-100',   text: 'text-gray-600'   }

  return (
    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold ${color.bg} ${color.text}`}>
      <Icons.shield className="w-3 h-3" />{score}
    </span>
  )
}

// ─── StarRating ───────────────────────────────────────────────
export function StarRating({
  rating,
  size = 12,
  showNum = true,
}: {
  rating: number
  size?: number
  showNum?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ width: size, height: size, display: 'inline-flex' }}>
          {i <= Math.round(rating) ? (
            <Icons.star style={{ width: size, height: size, color: '#F59E0B' }} />
          ) : (
            <Icons.starEmpty style={{ width: size, height: size, color: '#D1D5DB' }} />
          )}
        </span>
      ))}
      {showNum && (
        <span className="text-gray-400 font-medium ml-1" style={{ fontSize: size }}>
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
      )}
    </span>
  )
}

// ─── Badge ───────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info'
export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: BadgeVariant }) {
  const styles: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-agro-100 text-agro-800',
    danger:  'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info:    'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  )
}

// ─── Button ──────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type BtnSize    = 'sm' | 'md' | 'lg'

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: BtnSize
  loading?: boolean
  icon?: ReactNode
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className = '',
  ...rest
}: BtnProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'

  const variants: Record<BtnVariant, string> = {
    primary:   'bg-agro-800 text-white hover:bg-agro-900',
    secondary: 'bg-white text-agro-800 border border-agro-200 hover:bg-agro-50 hover:shadow-md hover:-translate-y-0.5',
    ghost:     'bg-transparent text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-agro-800 hover:border-agro-200',
    danger:    'bg-red-600 text-white hover:bg-red-700',
  }

  const sizes: Record<BtnSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  )
}

// ─── Input ───────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export function Input({ label, error, icon, className = '', ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-900
            placeholder-gray-400 outline-none transition-all duration-200 ease-out
            border-gray-200
            focus:border-agro-500 focus:ring-2 focus:ring-agro-100
            ${icon ? 'pl-9' : ''}
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
            ${className}
          `}
          {...rest}
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

// ─── Card ────────────────────────────────────────────────────
export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 ease-out
        ${hover ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// ─── Spinner ─────────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-block rounded-full border-2 border-agro-200 border-t-agro-700 animate-spin"
      style={{ width: size, height: size }}
    />
  )
}

// ─── Sparkline ───────────────────────────────────────────────
export function Sparkline({
  data,
  color = '#4CAF50',
  width = 100,
  height = 36,
}: {
  data: number[]
  color?: string
  width?: number
  height?: number
}) {
  if (!data.length) return null
  const mn  = Math.min(...data)
  const mx  = Math.max(...data)
  const r   = mx - mn || 1
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - mn) / r) * (height - 4) + 2}`)
    .join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
      />
    </svg>
  )
}

// ─── StarInput (interactive star rating) ─────────────────────
export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Icons.star
            className="w-7 h-7"
            style={{ color: i <= (hover || value) ? '#F59E0B' : '#E5E7EB' }}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Section Label ───────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs font-bold tracking-widest uppercase text-agro-500 mb-2">
      {children}
    </div>
  )
}
