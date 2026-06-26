'use client'
/**
 * Localizer — runtime full-app translation to English.
 *
 * When the locale is "en", this walks the rendered DOM and replaces Greek text
 * (text nodes + placeholder/title/value/aria-label attributes) using the
 * EL_TO_EN dictionary. This translates the whole application — including
 * hardcoded Greek strings in every screen — without editing each component.
 *
 * It re-runs on locale change and on DOM mutations (so dynamically-rendered
 * content, tab switches, toasts, etc. are translated too). When locale is "el"
 * it does nothing, so Greek (the source language) is always pristine.
 */
import { useEffect } from 'react'
import { useLocale } from '@/context/LocaleContext'
import { EL_TO_EN } from '@/lib/el2en'

const GREEK_RE = /[\u0370-\u03FF\u1F00-\u1FFF]/

// Precompute keys sorted longest-first for phrase-priority replacement.
const KEYS = Object.keys(EL_TO_EN).sort((a, b) => b.length - a.length)

function translatePhrase(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return text
  // 1. Exact match (fast path) — preserve surrounding whitespace
  if (EL_TO_EN[trimmed]) {
    return text.replace(trimmed, EL_TO_EN[trimmed])
  }
  // 2. Substring replacement for composite text (longest keys first)
  let out = text
  let changed = false
  for (const k of KEYS) {
    if (out.includes(k)) {
      out = out.split(k).join(EL_TO_EN[k])
      changed = true
    }
    if (!GREEK_RE.test(out)) break // fully translated
  }
  return changed ? out : text
}

const ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'value']

function translateElementAttrs(el: Element) {
  for (const attr of ATTRS) {
    const v = el.getAttribute(attr)
    if (v && GREEK_RE.test(v)) {
      const tr = translatePhrase(v)
      if (tr !== v) el.setAttribute(attr, tr)
    }
  }
  // <input> value (property, not attribute) for selects/inputs showing Greek
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'OPTION') {
    const anyEl = el as HTMLInputElement | HTMLOptionElement
    if (anyEl.value && GREEK_RE.test(anyEl.value)) {
      const tr = translatePhrase(anyEl.value)
      if (tr !== anyEl.value) anyEl.value = tr
    }
  }
}

function walk(root: Node) {
  // Text nodes
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const t = node.nodeValue
      if (!t || !GREEK_RE.test(t)) return NodeFilter.FILTER_REJECT
      const parent = (node as Text).parentElement
      if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  const textNodes: Text[] = []
  let n = tw.nextNode()
  while (n) { textNodes.push(n as Text); n = tw.nextNode() }
  for (const tn of textNodes) {
    const tr = translatePhrase(tn.nodeValue || '')
    if (tr !== tn.nodeValue) tn.nodeValue = tr
  }

  // Element attributes
  if (root instanceof Element) translateElementAttrs(root)
  const els = (root as Element).querySelectorAll?.('*')
  els?.forEach(translateElementAttrs)
}

export function Localizer() {
  const { locale } = useLocale()

  useEffect(() => {
    if (locale !== 'en') return
    if (typeof document === 'undefined') return

    // Initial pass (let the current render commit first)
    const run = () => walk(document.body)
    const raf = requestAnimationFrame(run)

    // Keep translating dynamic content
    let scheduled = false
    const observer = new MutationObserver(muts => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        for (const m of muts) {
          if (m.type === 'characterData' && m.target) walk(m.target.parentNode || m.target)
          m.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) walk(node)
          })
        }
      })
    })
    observer.observe(document.body, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATTRS,
    })

    document.documentElement.setAttribute('lang', 'en')
    return () => { cancelAnimationFrame(raf); observer.disconnect() }
  }, [locale])

  return null
}
