/**
 * units.ts — measurement unit system.
 *
 * Single source of truth for units used across listings, transport
 * requests, offers and marketplace cards. The DB stores the numeric
 * value in its existing columns (price_per_ton / quantity_tons) plus a
 * `measurement_unit` field describing what the value means — so the
 * existing data stays valid (defaults to 'ton').
 */

export type MeasurementUnit = 'kg' | 'ton' | 'g'

export interface UnitDef {
  key: MeasurementUnit
  label: string          // Greek display label (singular concept)
  short: string          // short symbol
  perLabel: string       // "ανά X" form for price labels
}

export const UNITS: UnitDef[] = [
  { key: 'kg',  label: 'Κιλά',      short: 'κιλά', perLabel: 'κιλό'      },
  { key: 'ton', label: 'Τόνοι',     short: 'τόνοι', perLabel: 'τόνο'     },
  { key: 'g',   label: 'Γραμμάρια', short: 'γρ',   perLabel: 'γραμμάριο' },
]

export const DEFAULT_UNIT: MeasurementUnit = 'ton'

const UNIT_MAP: Record<MeasurementUnit, UnitDef> = Object.fromEntries(
  UNITS.map(u => [u.key, u]),
) as Record<MeasurementUnit, UnitDef>

export function getUnit(unit?: string | null): UnitDef {
  return UNIT_MAP[(unit as MeasurementUnit)] ?? UNIT_MAP[DEFAULT_UNIT]
}

/** "€ / τόνο", "€ / κιλό", "€ / γραμμάριο" */
export function pricePerUnitLabel(unit?: string | null): string {
  return `€ / ${getUnit(unit).perLabel}`
}

/** "/τόνο", "/κιλό", "/γραμμάριο" (compact, for price rows) */
export function perUnitShort(unit?: string | null): string {
  return `/${getUnit(unit).perLabel}`
}

/** Formats a quantity with its unit, e.g. (100,'kg') → "100 κιλά". */
export function formatQuantity(value: number | string | null | undefined, unit?: string | null): string {
  const n = Number(value ?? 0)
  const def = getUnit(unit)
  const num = n.toLocaleString('el-GR', { maximumFractionDigits: 2 })
  if (def.key === 'g') return `${num} γραμμάρια`
  if (def.key === 'kg') return `${num} κιλά`
  // ton: singular/plural nicety
  return n === 1 ? `${num} τόνος` : `${num} τόνοι`
}

/** Formats a price with the per-unit label, e.g. "€265,40 / τόνο". */
export function formatPrice(value: number | string | null | undefined, unit?: string | null): string {
  const n = Number(value ?? 0)
  const num = n.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `€${num} ${pricePerUnitLabel(unit)}`
}
