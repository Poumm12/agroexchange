/**
 * moderation.ts — centralized content moderation & input safety.
 *
 * Single source of truth for:
 *   - validateText()      → { ok, error? }  (profanity + length checks)
 *   - containsProfanity() → boolean
 *   - sanitizeInput()     → string          (XSS-safe normalization)
 *
 * Used by every user-generated text surface (listings, transport,
 * route requests, messages, bios, comments, reviews, support tickets).
 *
 * The word lists are intentionally minimal and easy to extend — append
 * to GREEK_PROFANITY / ENGLISH_PROFANITY. Matching is case-insensitive,
 * accent-insensitive, and catches common letter substitutions / spacing.
 */

// ─── Word lists (expandable) ──────────────────────────────────
// Kept deliberately small + stem-based; matching normalizes the input so
// variations (caps, accents, leetspeak, repeated chars) are caught.
const GREEK_PROFANITY: string[] = [
  'μαλακ', 'γαμω', 'γαμη', 'πουτan', 'πουταν', 'καριολ', 'αρχιδ',
  'μουνι', 'πουστ', 'κωλο', 'σκατ', 'μπασταρδ', 'καυλ', 'βλακα',
  'ηλιθι', 'καθαρμα', 'κερατ', 'τσουλ', 'παπαρ',
]

const ENGLISH_PROFANITY: string[] = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick',
  'pussy', 'slut', 'whore', 'motherfucker', 'fag', 'retard',
  'nigger', 'nigga', 'cock', 'wanker', 'twat',
]

// Custom additions can be pushed at runtime / future admin config.
const CUSTOM_PROFANITY: string[] = []

// ─── Normalization ────────────────────────────────────────────
// Lowercase, strip Greek/Latin accents, collapse common leetspeak,
// and remove separators so "m a l a k" / "γ4μω" still match.
const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's',
}

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function normalize(text: string): string {
  let t = stripAccents(text.toLowerCase())
  t = t.replace(/[013457@$]/g, ch => LEET_MAP[ch] ?? ch)
  // collapse repeated characters: "malaaaka" → "malaka"
  t = t.replace(/(.)\1{2,}/g, '$1$1')
  // strip non-alphanumeric (spaces, dots, underscores between letters)
  t = t.replace(/[^a-z0-9α-ω]/gi, '')
  return t
}

const ALL_PROFANITY = () => [...GREEK_PROFANITY, ...ENGLISH_PROFANITY, ...CUSTOM_PROFANITY]
  .map(w => normalize(w))
  .filter(Boolean)

// ─── Public API ───────────────────────────────────────────────

/** Returns true if the text contains any blocked term (case/accent-insensitive). */
export function containsProfanity(text: string | null | undefined): boolean {
  if (!text) return false
  const normalized = normalize(text)
  if (!normalized) return false
  return ALL_PROFANITY().some(bad => bad.length >= 3 && normalized.includes(bad))
}

export interface ValidationResult {
  ok: boolean
  error?: string
}

interface ValidateOptions {
  /** Minimum length after trim (default 0). */
  minLength?: number
  /** Maximum length (default 5000). */
  maxLength?: number
  /** Field label for clearer errors (optional). */
  field?: string
  /** Require non-empty (default false). */
  required?: boolean
}

/**
 * Validates user text: required/length checks + profanity.
 * Returns a user-friendly Greek error message when invalid.
 */
export function validateText(text: string | null | undefined, opts: ValidateOptions = {}): ValidationResult {
  const { minLength = 0, maxLength = 5000, required = false } = opts
  const value = (text ?? '').trim()

  if (required && value.length === 0) {
    return { ok: false, error: 'Το πεδίο είναι υποχρεωτικό.' }
  }
  if (value.length > 0 && value.length < minLength) {
    return { ok: false, error: `Το κείμενο πρέπει να έχει τουλάχιστον ${minLength} χαρακτήρες.` }
  }
  if (value.length > maxLength) {
    return { ok: false, error: `Το κείμενο υπερβαίνει το όριο των ${maxLength} χαρακτήρων.` }
  }
  if (containsProfanity(value)) {
    return { ok: false, error: 'Το κείμενο περιέχει μη επιτρεπτή φρασεολογία.' }
  }
  return { ok: true }
}

/**
 * Sanitizes input for safe storage & rendering:
 *   - trims
 *   - removes control chars
 *   - neutralizes HTML angle brackets (XSS prevention at the data layer)
 *   - collapses excessive whitespace
 *
 * Note: React already escapes rendered text, so this is defense-in-depth
 * for any place that might use dangerouslySetInnerHTML or server contexts.
 */
export function sanitizeInput(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') // control chars
    .replace(/</g, '\u2039').replace(/>/g, '\u203A')          // ‹ › instead of < >
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

/**
 * Convenience: validate + sanitize in one call.
 * Returns sanitized value when valid, or an error.
 */
export function processText(
  text: string | null | undefined, opts: ValidateOptions = {},
): { ok: boolean; value?: string; error?: string } {
  const result = validateText(text, opts)
  if (!result.ok) return { ok: false, error: result.error }
  return { ok: true, value: sanitizeInput(text) }
}
